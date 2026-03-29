const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/wallet/balance
// @desc    Get current wallet balance and recent transactions
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance transactions name');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      balance: user.walletBalance || 5000,
      transactions: (user.transactions || []).slice(-10).reverse(), // Last 10 transactions
      name: user.name
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/wallet/top-up
// @desc    Add funds to wallet (mock - always succeeds)
// @access  Private
router.post('/top-up', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > 50000) {
      return res.status(400).json({ error: 'Invalid amount (₹1 - ₹50,000)' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.walletBalance = (user.walletBalance || 0) + amount;
    user.transactions = user.transactions || [];
    user.transactions.push({
      type: 'TOP_UP',
      amount: amount,
      description: `Wallet top-up via UPI Mock`,
    });

    await user.save();

    res.json({
      message: `₹${amount} added successfully`,
      newBalance: user.walletBalance,
      transaction: user.transactions[user.transactions.length - 1]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/wallet/pay
// @desc    Make a payment for a service
// @access  Private
router.post('/pay', auth, async (req, res) => {
  try {
    const { amount, serviceType, description } = req.body;
    // serviceType: 'WASH_PAYMENT', 'EV_PAYMENT', 'REPAIR_PAYMENT'

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    if (!['WASH_PAYMENT', 'EV_PAYMENT', 'REPAIR_PAYMENT'].includes(serviceType)) {
      return res.status(400).json({ error: 'Invalid service type' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ 
        error: 'Insufficient balance', 
        currentBalance: user.walletBalance,
        required: amount 
      });
    }

    user.walletBalance -= amount;
    user.transactions = user.transactions || [];
    user.transactions.push({
      type: serviceType,
      amount: -amount,
      description: description || `${serviceType.replace('_', ' ')} payment`,
    });

    await user.save();

    // Emit payment event via Socket.io
    req.io.emit('payment_completed', {
      userId: user.id,
      serviceType,
      amount,
      newBalance: user.walletBalance
    });

    res.json({
      message: `Payment of ₹${amount} successful`,
      newBalance: user.walletBalance,
      transaction: user.transactions[user.transactions.length - 1]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
