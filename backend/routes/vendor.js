const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const upload = require('../middleware/upload');
const { auth, requireRole } = require('../middleware/auth');
const { generateOTP, verifyOTP } = require('../services/otpService');

const signToken = (id) => jwt.sign({ id, role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/vendor/send-otp
router.post('/send-otp', async (req, res) => {
    const { phone, email } = req.body;
    const identifier = email || phone;
    if (!identifier) return res.status(400).json({ message: 'Email or Phone required' });
    const otp = await generateOTP(identifier);
    res.json({ message: 'OTP sent', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
});

// POST /api/vendor/register
router.post('/register', async (req, res) => {
    try {
        const { ownerName, phone, otp, email, password, shopName, shopAddress, district, location, openingTime, closingTime, category } = req.body;
        const identifier = email || phone;
        const result = verifyOTP(identifier, otp);
        if (!result.valid) return res.status(400).json({ message: result.message });
        const existing = await Vendor.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(409).json({ message: 'Vendor already exists' });
        const vendor = await Vendor.create({ ownerName, phone, email, passwordHash: password, shopName, shopAddress, district, location, openingTime, closingTime, category });
        const token = signToken(vendor._id);
        res.status(201).json({ token, vendor: { id: vendor._id, shopName: vendor.shopName, role: 'vendor' } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/vendor/login
router.post('/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        if (!password || (!email && !phone)) return res.status(400).json({ message: 'Email or phone and password required' });
        const query = email ? { email } : { phone };
        const vendor = await Vendor.findOne(query);
        if (!vendor) return res.status(401).json({ message: 'Invalid credentials' });
        if (!vendor.isActive) return res.status(403).json({ message: 'Account deactivated' });
        const match = await vendor.comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });
        const token = signToken(vendor._id);
        res.json({ token, vendor: { id: vendor._id, shopName: vendor.shopName, ownerName: vendor.ownerName, role: 'vendor' } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/vendor/profile
router.get('/profile', auth, requireRole('vendor'), async (req, res) => {
    try {
        res.json(req.userDoc);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/vendor/settings
router.put('/settings', auth, requireRole('vendor'), async (req, res) => {
    try {
        const { openingTime, closingTime, isOpen, category, shopAddress, location } = req.body;
        const vendor = await Vendor.findByIdAndUpdate(req.user.id, { openingTime, closingTime, isOpen, category, shopAddress, location }, { new: true });
        res.json(vendor);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/vendor/products
router.get('/products', auth, requireRole('vendor'), async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user.id });
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/vendor/products
router.post('/products', auth, requireRole('vendor'), upload.single('image'), async (req, res) => {
    try {
        const { name, category, subCategory, price, description, isAvailable } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        const product = await Product.create({ name, category, subCategory, price: Number(price), description, image, vendorId: req.user.id, isAvailable: isAvailable !== 'false' });
        res.status(201).json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/vendor/products/:id
router.put('/products/:id', auth, requireRole('vendor'), upload.single('image'), async (req, res) => {
    try {
        const { name, category, subCategory, price, description, isAvailable } = req.body;
        const update = { name, category, subCategory, price: Number(price), description, isAvailable: isAvailable !== 'false' };
        if (req.file) update.image = `/uploads/${req.file.filename}`;
        const product = await Product.findOneAndUpdate({ _id: req.params.id, vendorId: req.user.id }, update, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/vendor/products/:id
router.delete('/products/:id', auth, requireRole('vendor'), async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, vendorId: req.user.id });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/vendor/orders
router.get('/orders', auth, requireRole('vendor'), async (req, res) => {
    try {
        const orders = await Order.find({ vendorId: req.user.id }).populate('userId', 'name phone').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/vendor/orders/:id/status
router.put('/orders/:id/status', auth, requireRole('vendor'), async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const allowed = ['Accepted', 'Rejected', 'Preparing', 'Ready'];
        if (!allowed.includes(orderStatus)) return res.status(400).json({ message: 'Invalid status' });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.vendorId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your order' });
        order.orderStatus = orderStatus;
        await order.save();
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
