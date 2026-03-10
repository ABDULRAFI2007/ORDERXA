const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const { search, category, vendorId, subCategory } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        if (vendorId) filter.vendorId = vendorId;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const products = await Product.find(filter).populate('vendorId', 'shopName district isOpen');
        res.json(products);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendorId', 'shopName shopAddress district location isOpen openingTime closingTime');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/vendors/list - get all vendors (for browsing shops)
router.get('/vendors/list', async (req, res) => {
    try {
        const { district } = req.query;
        const filter = { isActive: true };
        if (district) filter.district = district;
        const vendors = await Vendor.find(filter).select('-passwordHash');
        res.json(vendors);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
