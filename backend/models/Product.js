const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ['Food', 'Snacks', 'Beverages'],
        required: true,
    },
    subCategory: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
