const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { generateOTP, verifyOTP } = require('../services/otpService');

const signToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { phone, email } = req.body;
        const identifier = email || phone;
        if (!identifier) return res.status(400).json({ message: 'Email or Phone required' });
        const otp = await generateOTP(identifier);
        // In dev mode return OTP in response for testing
        const devOtp = process.env.NODE_ENV === 'development' ? otp : undefined;
        res.json({ message: 'OTP sent successfully', otp: devOtp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/verify-otp  (login via OTP)
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp, email } = req.body;
        const identifier = email || phone;
        const result = verifyOTP(identifier, otp);
        if (!result.valid) return res.status(400).json({ message: result.message });

        let user = await User.findOne(email ? { email } : { phone });
        if (!user) {
            // Create account with phone or email
            const newUser = { name: 'Customer', role: 'customer' };
            if (email) newUser.email = email;
            if (phone) newUser.phone = phone;
            user = await User.create(newUser);
        }
        const token = signToken(user._id, user.role);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/register  (email+password signup for customer)
router.post('/register', async (req, res) => {
    try {
        const { name, phone, otp, email, password, district, address } = req.body;
        if (!name || (!phone && !email) || !otp || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const identifier = email || phone;
        const result = verifyOTP(identifier, otp);
        if (!result.valid) return res.status(400).json({ message: result.message });

        const existing = await User.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(409).json({ message: 'Account with this email or phone already exists' });

        const user = await User.create({ name, phone, email, passwordHash: password, district, address, role: 'customer' });
        const token = signToken(user._id, user.role);
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login  (email+password login for customer)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

        const match = await user.comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = signToken(user._id, user.role);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }), (req, res) => {
    const token = signToken(req.user._id, req.user.role);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&role=${req.user.role}`);
});

// POST /api/auth/admin-seed  (create default admin, dev only)
router.post('/admin-seed', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') return res.status(403).json({ message: 'Not allowed' });
    try {
        let admin = await User.findOne({ role: 'admin' });
        if (admin) return res.json({ message: 'Admin already exists', email: admin.email });
        admin = await User.create({ name: 'Admin', email: 'admin@orderxa.com', passwordHash: 'Admin@123', role: 'admin', district: 'Chennai' });
        res.status(201).json({ message: 'Admin created', email: 'admin@orderxa.com', password: 'Admin@123' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
