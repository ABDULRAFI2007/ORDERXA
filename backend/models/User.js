const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, sparse: true },
    email: { type: String, sparse: true, lowercase: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    district: { type: String },
    address: { type: String },
    googleId: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash') && this.passwordHash) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
