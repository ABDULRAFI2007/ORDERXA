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
    const { phone, email } = req.body;
    const identifier = email || phone;
    if (!identifier) return res.status(400).json({ message: 'Email or Phone required' });
    const otp = await generateOTP(identifier);
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
        // OTP was sent to phone, so verify against phone (not email)
        const result = verifyOTP(phone, otp);
        if (!result.valid) return res.status(400).json({ message: result.message });
        const existing = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(409).json({ message: 'Account already exists' });
        const partner = await DeliveryPartner.create({ fullName, phone, email, passwordHash: password, aadharNumber, district, address, vehicleType, vehicleNumber });
        const token = signToken(partner._id);
        res.status(201).json({ token, partner: { id: partner._id, fullName: partner.fullName, role: 'delivery', isVerified: partner.isVerified } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/delivery/login  — Step 1: credentials → send OTP to Aadhaar-linked phone
router.post('/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        if (!password || (!email && !phone)) return res.status(400).json({ message: 'Email or phone and password required' });
        const query = email ? { email } : { phone };
        const partner = await DeliveryPartner.findOne(query);
        if (!partner) return res.status(401).json({ message: 'Invalid credentials' });
        if (!partner.isActive) return res.status(403).json({ message: 'Account deactivated' });
        const match = await partner.comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        // Send OTP to Aadhaar-linked phone stored in profile
        const otp = await generateOTP(partner.phone);
        const devOtp = process.env.NODE_ENV === 'development' ? otp : undefined;

        // Mask the phone for display: show last 4 digits only
        const masked = partner.phone.replace(/\d(?=\d{4})/g, '*');

        res.json({
            step: 'otp',
            partnerId: partner._id,
            maskedPhone: masked,
            message: `OTP sent to your Aadhaar-linked number ${masked}`,
            otp: devOtp,
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/delivery/verify-login-otp  — Step 2: verify OTP → issue token
router.post('/verify-login-otp', async (req, res) => {
    try {
        const { partnerId, otp } = req.body;
        if (!partnerId || !otp) return res.status(400).json({ message: 'Partner ID and OTP required' });

        const partner = await DeliveryPartner.findById(partnerId);
        if (!partner) return res.status(404).json({ message: 'Partner not found' });

        const result = verifyOTP(partner.phone, otp);
        if (!result.valid) return res.status(400).json({ message: result.message });

        const token = signToken(partner._id);
        res.json({ token, partner: { id: partner._id, fullName: partner.fullName, role: 'delivery', isVerified: partner.isVerified } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// GET /api/delivery/profile
router.get('/profile', auth, requireRole('delivery'), async (req, res) => {
    try {
        res.json(req.userDoc);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/delivery/orders
router.get('/orders', auth, requireRole('delivery'), async (req, res) => {
    try {
        const orders = await Order.find({ deliveryPartnerId: req.user.id })
            .populate('userId', 'name phone')
            .populate('vendorId', 'shopName shopAddress location')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/delivery/available-orders (orders ready for pickup, not yet assigned)
router.get('/available-orders', auth, requireRole('delivery'), async (req, res) => {
    try {
        const orders = await Order.find({ orderStatus: 'Ready', deliveryPartnerId: null })
            .populate('userId', 'name phone')
            .populate('vendorId', 'shopName shopAddress location district')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/delivery/orders/:id/accept
router.put('/orders/:id/accept', auth, requireRole('delivery'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.orderStatus !== 'Ready') return res.status(400).json({ message: 'Order is not ready for pickup' });
        if (order.deliveryPartnerId) return res.status(400).json({ message: 'Order already assigned to another partner' });
        order.deliveryPartnerId = req.user.id;
        order.orderStatus = 'Picked Up';
        await order.save();
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/delivery/orders/:id/status
router.put('/orders/:id/status', auth, requireRole('delivery'), async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const allowed = ['Picked Up', 'Out for Delivery', 'Delivered'];
        if (!allowed.includes(orderStatus)) return res.status(400).json({ message: 'Invalid status' });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.deliveryPartnerId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your delivery' });
        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') order.paymentStatus = 'Paid';
        await order.save();
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/delivery/location
router.put('/location', auth, requireRole('delivery'), async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (lat == null || lng == null) return res.status(400).json({ message: 'lat and lng required' });
        await DeliveryPartner.findByIdAndUpdate(req.user.id, { currentLocation: { lat, lng } });
        // Also update deliveryLocation on all active orders for this partner
        await Order.updateMany(
            { deliveryPartnerId: req.user.id, orderStatus: { $nin: ['Delivered', 'Rejected'] } },
            { deliveryLocation: { lat, lng } }
        );
        res.json({ message: 'Location updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
