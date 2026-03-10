const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { auth, requireRole } = require('../middleware/auth');
const { generateUPILink } = require('../services/upiService');

// POST /api/orders  - place order
router.post('/', auth, requireRole('customer'), async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod } = req.body;
        if (!items || !items.length || !deliveryAddress || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Calculate total and get vendorId from first item
        let totalPrice = 0;
        const enrichedItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId).populate('vendorId');
            if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
            totalPrice += product.price * item.qty;
            enrichedItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                qty: item.qty,
                vendorId: product.vendorId._id,
                vendorName: product.vendorId.shopName,
            });
        }

        // Use vendorId from first item (for single-vendor simplification; multi-vendor supported via items)
        const vendorId = enrichedItems[0].vendorId;

        const order = await Order.create({
            userId: req.user.id,
            items: enrichedItems,
            totalPrice,
            deliveryAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
            orderStatus: 'Placed',
            vendorId,
        });

        let upiLink = null;
        if (paymentMethod === 'UPI') {
            upiLink = generateUPILink(totalPrice, `Order #${order._id}`);
        }

        res.status(201).json({ order, upiLink });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/my - customer's own orders
router.get('/my', auth, requireRole('customer'), async (req, res) => {
    const orders = await Order.find({ userId: req.user.id })
        .populate('vendorId', 'shopName shopAddress location')
        .populate('deliveryPartnerId', 'fullName phone currentLocation')
        .sort({ createdAt: -1 });
    res.json(orders);
});

// GET /api/orders/:id - order detail (customer, vendor or delivery can access)
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name phone address')
            .populate('vendorId', 'shopName shopAddress location')
            .populate('deliveryPartnerId', 'fullName phone currentLocation vehicleType');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Access control
        const uid = req.user.id;
        const role = req.user.role;
        if (role === 'customer' && order.userId._id.toString() !== uid) return res.status(403).json({ message: 'Access denied' });
        if (role === 'vendor' && order.vendorId._id.toString() !== uid) return res.status(403).json({ message: 'Access denied' });
        if (role === 'delivery' && order.deliveryPartnerId?._id.toString() !== uid) return res.status(403).json({ message: 'Access denied' });

        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/payment - mark UPI as paid
router.put('/:id/payment', auth, requireRole('customer'), async (req, res) => {
    try {
        const { upiTransactionId } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { paymentStatus: 'Paid', upiTransactionId },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
