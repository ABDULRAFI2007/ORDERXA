// In-memory OTP store: { phone: { otp, expiry } }
const otpStore = new Map();

const generateOTP = (phone) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(phone, { otp, expiry });

    // In production: send SMS via Twilio/MSG91
    console.log(`[OTP Service] Phone: ${phone} | OTP: ${otp} | Expires: ${new Date(expiry).toISOString()}`);

    return otp;
};

const verifyOTP = (phone, otp) => {
    const entry = otpStore.get(phone);
    if (!entry) return { valid: false, message: 'OTP not found or expired' };
    if (Date.now() > entry.expiry) {
        otpStore.delete(phone);
        return { valid: false, message: 'OTP expired' };
    }
    if (entry.otp !== otp) return { valid: false, message: 'Invalid OTP' };
    otpStore.delete(phone);
    return { valid: true };
};

module.exports = { generateOTP, verifyOTP };
