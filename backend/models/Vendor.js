const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
    ownerName: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    shopAddress: { type: String, required: true },
    district: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },
    openingTime: { type: String, default: '09:00' },
    closingTime: { type: String, default: '22:00' },
    category: { type: String, enum: ['Food', 'Snacks', 'Beverages', 'Mixed'], default: 'Mixed' },
    isOpen: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

vendorSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash') && this.passwordHash) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    next();
});

vendorSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('Vendor', vendorSchema);
