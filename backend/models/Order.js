const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    vendorName: { type: String },
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    paymentMethod: { type: String, enum: ['COD', 'UPI'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Accepted', 'Rejected', 'Preparing', 'Ready', 'Picked Up', 'Out for Delivery', 'Delivered'],
        default: 'Placed',
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    upiTransactionId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
