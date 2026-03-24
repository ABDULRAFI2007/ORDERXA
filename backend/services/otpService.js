const nodemailer = require('nodemailer');
const axios = require('axios');

// In-memory OTP store: { identifier: { otp, expiry } }
const otpStore = new Map();


// Fast2SMS API key (set FAST2SMS_API_KEY in .env)

let transporter;

const getTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        console.log('[OTP Service] No SMTP credentials found. Creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log('[OTP Service] Ethereal test account ready.');
    }
    return transporter;
};

const sendEmailOTP = async (email, otp) => {
    try {
        const mailer = await getTransporter();
        const info = await mailer.sendMail({
            from: `"ORDERXA" <${process.env.SMTP_USER || 'admin@orderxa.com'}>`,
            to: email,
            subject: "Your OTP for ORDERXA",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
            html: `<b>Your OTP is ${otp}</b>. It will expire in 5 minutes.`
        });
        console.log(`[OTP Service] Email sent to: ${email} | MessageId: ${info.messageId}`);
        if (!process.env.SMTP_USER) {
            console.log(`[OTP Service] ✉️ Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error(`[OTP Service] Error sending email to ${email}:`, err.message);
    }
};

const sendSmsOTP = async (phone, otp) => {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
        console.log(`[OTP Service] FAST2SMS_API_KEY not set. Skipping SMS to ${phone}. OTP: ${otp}`);
        return;
    }
    try {
        // Strip country code if present — Fast2SMS expects 10-digit Indian number
        const number = phone.replace(/^\+91/, '').replace(/\s/g, '');
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: apiKey,
                variables_values: otp,
                route: 'otp',
                numbers: number,
            },
            headers: { 'cache-control': 'no-cache' },
        });
        if (response.data?.return === true) {
            console.log(`[OTP Service] SMS sent to: ${phone}`);
        } else {
            console.error(`[OTP Service] Fast2SMS error:`, response.data?.message || response.data);
        }
    } catch (err) {
        console.error(`[OTP Service] Error sending SMS to ${phone}:`, err.response?.data || err.message);
    }
};

const generateOTP = async (identifier) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(identifier, { otp, expiry });

    console.log(`[OTP Service] Generated OTP for: ${identifier} | OTP: ${otp} | Expires: ${new Date(expiry).toISOString()}`);

    if (identifier.includes('@')) {
        await sendEmailOTP(identifier, otp);
    } else {
        await sendSmsOTP(identifier, otp);
    }

    return otp;
};

const verifyOTP = (identifier, otp) => {
    const entry = otpStore.get(identifier);
    if (!entry) return { valid: false, message: 'OTP not found or expired' };
    if (Date.now() > entry.expiry) {
        otpStore.delete(identifier);
        return { valid: false, message: 'OTP expired' };
    }
    if (entry.otp !== otp) return { valid: false, message: 'Invalid OTP' };
    otpStore.delete(identifier);
    return { valid: true };
};

module.exports = { generateOTP, verifyOTP };
