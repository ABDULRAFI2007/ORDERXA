const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const DeliveryPartner = require('../models/DeliveryPartner');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Attach full user object based on role
        if (decoded.role === 'customer' || decoded.role === 'admin') {
            const user = await User.findById(decoded.id).select('-passwordHash');
            if (!user || !user.isActive) return res.status(401).json({ message: 'Account not found or deactivated' });
            req.userDoc = user;
        } else if (decoded.role === 'vendor') {
            const vendor = await Vendor.findById(decoded.id).select('-passwordHash');
            if (!vendor || !vendor.isActive) return res.status(401).json({ message: 'Account not found or deactivated' });
            req.userDoc = vendor;
        } else if (decoded.role === 'delivery') {
            const partner = await DeliveryPartner.findById(decoded.id).select('-passwordHash');
            if (!partner || !partner.isActive) return res.status(401).json({ message: 'Account not found or deactivated' });
            req.userDoc = partner;
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { auth, requireRole };
