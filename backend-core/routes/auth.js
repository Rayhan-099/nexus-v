const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Partner = require('../models/Partner');

const generateToken = (payload, res) => {
  jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: 360000 },
    (err, token) => {
      if (err) throw err;
      res.json({ token, role: payload.user.role, id: payload.user.id });
    }
  );
};

// @route   POST api/auth/register/user
// @desc    Register a user
// @access  Public
router.post('/register/user', async (req, res) => {
  const { name, email, password, phone, vehicleType } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, phone, vehicleType });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    generateToken({ user: { id: user.id, role: 'USER' } }, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/register/partner
// @desc    Register a partner
// @access  Public
router.post('/register/partner', async (req, res) => {
  const { businessName, email, password, type, location } = req.body;

  try {
    let partner = await Partner.findOne({ email });
    if (partner) return res.status(400).json({ msg: 'Partner already exists' });

    partner = new Partner({ businessName, email, password, type, location: location || {lat:0, lng:0} });

    const salt = await bcrypt.genSalt(10);
    partner.password = await bcrypt.hash(password, salt);

    await partner.save();
    generateToken({ user: { id: partner.id, role: 'PARTNER' } }, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (checks both User and Partner collections)
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let account = await User.findOne({ email });
    let role = 'USER';

    if (!account) {
      account = await Partner.findOne({ email });
      role = 'PARTNER';
    }

    if (!account) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    generateToken({ user: { id: account.id, role } }, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get logged in user details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let account = null;
    if (req.user.role === 'USER') {
      account = await User.findById(req.user.id).select('-password');
    } else {
      account = await Partner.findById(req.user.id).select('-password');
    }
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
