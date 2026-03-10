const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const { auth, requireRole } = require('../middleware/auth');
const { generateOTP, verifyOTP } = require('../services/otpService');

const signToken = (id) => jwt.sign({ id, role: 'delivery' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/delivery/send-otp
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone required' });
    const otp = generateOTP(phone);
    res.json({ message: 'OTP sent', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
});

// POST /api/delivery/verify-aadhar-otp (simulate aadhar OTP)
router.post('/verify-aadhar-otp', async (req, res) => {
    const { aadharNumber, otp } = req.body;
    // Simulate verification: any 6-digit OTP is accepted in dev
    if (otp && otp.length === 6) {
        res.json({ valid: true, message: 'Aadhar verified successfully' });
    } else {
        res.status(400).json({ valid: false, message: 'Invalid Aadhar OTP' });
    }
});

// POST /api/delivery/register
router.post('/register', async (req, res) => {
    try {
        const { fullName, phone, otp, email, password, aadharNumber, district, address, vehicleType, vehicleNumber } = req.body;
        const result = verifyOTP(phone, otp);
        if (!result.valid) return res.status(400).json({ message: result.message });
        const existing = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(409).json({ message: 'Account already exists' });
        const partner = await DeliveryPartner.create({ fullName, phone, email, passwordHash: password, aadharNumber, district, address, vehicleType, vehicleNumber });
        const token = signToken(partner._id);
        res.status(201).json({ token, partner: { id: partner._id, fullName: partner.fullName, role: 'delivery', isVerified: partner.isVerified } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/delivery/login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const partner = await DeliveryPartner.findOne({ phone });
        if (!partner) return res.status(401).json({ message: 'Invalid credentials' });
        if (!partner.isActive) return res.status(403).json({ message: 'Account deactivated' });
        const match = await partner.comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });
        const token = signToken(partner._id);
        res.json({ token, partner: { id: partner._id, fullName: partner.fullName, role: 'delivery', isVerified: partner.isVerified } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/delivery/profile
router.get('/profile', auth, requireRole('delivery'), (req, res) => res.json(req.userDoc));

// GET /api/delivery/orders
router.get('/orders', auth, requireRole('delivery'), async (req, res) => {
    const orders = await Order.find({ deliveryPartnerId: req.user.id })
        .populate('userId', 'name phone')
        .populate('vendorId', 'shopName shopAddress location')
        .sort({ createdAt: -1 });
    res.json(orders);
});

// GET /api/delivery/available-orders (orders ready for pickup, not yet assigned)
router.get('/available-orders', auth, requireRole('delivery'), async (req, res) => {
    const partner = req.userDoc;
    const orders = await Order.find({ orderStatus: 'Ready', deliveryPartnerId: null })
        .populate('userId', 'name phone')
        .populate('vendorId', 'shopName shopAddress location district')
        .sort({ createdAt: -1 });
    res.json(orders);
});

// PUT /api/delivery/orders/:id/accept
router.put('/orders/:id/accept', auth, requireRole('delivery'), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id,
            { deliveryPartnerId: req.user.id, orderStatus: 'Picked Up' }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/delivery/orders/:id/status
router.put('/orders/:id/status', auth, requireRole('delivery'), async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const allowed = ['Picked Up', 'Out for Delivery', 'Delivered'];
        if (!allowed.includes(orderStatus)) return res.status(400).json({ message: 'Invalid status' });
        const order = await Order.findOneAndUpdate({ _id: req.params.id, deliveryPartnerId: req.user.id }, { orderStatus }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/delivery/location
router.put('/location', auth, requireRole('delivery'), async (req, res) => {
    try {
        const { lat, lng } = req.body;
        await DeliveryPartner.findByIdAndUpdate(req.user.id, { currentLocation: { lat, lng } });
        res.json({ message: 'Location updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
