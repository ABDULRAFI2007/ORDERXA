const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(auth, requireRole('admin'));

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/vendors
router.get('/vendors', async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(vendors);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/partners
router.get('/partners', async (req, res) => {
    try {
        const partners = await DeliveryPartner.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(partners);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/partners/:id/verify
router.put('/partners/:id/verify', async (req, res) => {
    try {
        const { isVerified } = req.body;
        const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, { isVerified }, { new: true }).select('-passwordHash');
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.json(partner);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/accounts/:type/:id/deactivate
router.put('/accounts/:type/:id/deactivate', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { isActive } = req.body;
        let doc;
        if (type === 'user') doc = await User.findByIdAndUpdate(id, { isActive }, { new: true });
        else if (type === 'vendor') doc = await Vendor.findByIdAndUpdate(id, { isActive }, { new: true });
        else if (type === 'delivery') doc = await DeliveryPartner.findByIdAndUpdate(id, { isActive }, { new: true });
        else return res.status(400).json({ message: 'Invalid account type' });
        if (!doc) return res.status(404).json({ message: 'Account not found' });
        res.json({ message: `Account ${isActive ? 'activated' : 'deactivated'}`, doc });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name phone')
            .populate('vendorId', 'shopName')
            .populate('deliveryPartnerId', 'fullName')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalVendors = await Vendor.countDocuments();
        const totalPartners = await DeliveryPartner.countDocuments();
        const pendingPartners = await DeliveryPartner.countDocuments({ isVerified: false });
        const ordersByStatus = await Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]);
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('vendorId', 'shopName');

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalCustomers,
            totalVendors,
            totalPartners,
            pendingPartners,
            ordersByStatus,
            recentOrders,
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
