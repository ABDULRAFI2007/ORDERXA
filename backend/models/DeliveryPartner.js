const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryPartnerSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Bicycle', 'Car'], required: true },
    vehicleNumber: { type: String, required: true },
    licensePath: { type: String },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
    },
}, { timestamps: true });

deliveryPartnerSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash') && this.passwordHash) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    next();
});

deliveryPartnerSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
