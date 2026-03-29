const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ServiceProof = require('../models/ServiceProof');

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/trust/upload-proof
// @desc    Upload image, analyze with Gemini Vision AI, then emit real-time alert
router.post('/upload-proof', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const { partnerId, description, estimatedCost } = req.body;

    // --- GEMINI VISION AI ANALYSIS ---
    let aiAnalysis = null;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Convert image buffer to base64 for Gemini
      const imageBase64 = req.file.buffer.toString('base64');
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      };

      const prompt = `You are an AI Trust Engine for an automotive service platform called Nexus-V. 
Analyze this image uploaded by a mechanic/service partner as proof of vehicle damage or repair work.

Provide your analysis in the following JSON format ONLY (no markdown, no code fences):
{
  "isVehicleRelated": true/false,
  "confidence": 0-100,
  "damageType": "description of damage type or 'N/A'",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "estimateValid": true/false,
  "aiVerdict": "APPROVED" | "FLAGGED" | "REJECTED",
  "reasoning": "1-2 sentence explanation",
  "repairSuggestion": "brief recommended action"
}

The mechanic described the issue as: "${description || 'General repair work'}"
They estimated the cost at: ₹${estimatedCost || 'Not specified'}

Be strict but fair. If the image clearly shows vehicle damage or repair work, approve it. If it's unrelated to vehicles, reject it. If it's ambiguous, flag it for human review.`;

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      
      // Parse the JSON response
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = JSON.parse(cleaned);
      
      console.log('🤖 Gemini AI Analysis:', aiAnalysis);
    } catch (aiError) {
      console.warn('⚠️  Gemini AI analysis failed, using fallback:', aiError.message);
      aiAnalysis = {
        isVehicleRelated: true,
        confidence: 50,
        damageType: 'Unable to analyze - AI fallback',
        severity: 'MEDIUM',
        estimateValid: true,
        aiVerdict: 'FLAGGED',
        reasoning: 'AI engine temporarily unavailable. Marked for manual review.',
        repairSuggestion: 'Manual inspection recommended'
      };
    }

    // --- BUILD PROOF DATA ---
    const mockImageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const proofData = {
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      imageUrl: mockImageUrl,
      description: description || 'Repair work proof',
      estimatedCost: estimatedCost || 5000,
      status: aiAnalysis.aiVerdict === 'REJECTED' ? 'REJECTED' : 'PENDING',
      aiAnalysis: aiAnalysis,
    };

    // --- REAL-TIME ALERT ---
    if (aiAnalysis.aiVerdict === 'REJECTED') {
      // Auto-reject: don't bother the customer
      req.io.emit('proof_rejected_auto', proofData);
      return res.status(400).json({ 
        error: 'Image rejected by AI validation', 
        reason: aiAnalysis.reasoning,
        aiAnalysis 
      });
    }

    // Send to customer for approval
    req.io.emit('proof_received', proofData);

    res.json({ message: 'AI analysis complete. Proof sent to customer.', proof: proofData });
  } catch (err) {
    console.error('Trust Engine Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// @route   PATCH /api/trust/resolve-proof/:id
// @desc    User clicks "Approve" or "Reject"
router.patch('/resolve-proof/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    req.io.emit('proof_resolved', { proofId: req.params.id, status });
    
    res.json({ message: `Proof marked as ${status}` });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
