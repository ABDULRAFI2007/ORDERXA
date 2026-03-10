const generateUPILink = (amount, note = 'ORDERXA Order') => {
    const upiId = 'abdulrafi.n2007@okicici';
    const payeeName = 'ORDERXA';
    const encoded = encodeURIComponent(note);
    return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${encoded}`;
};

module.exports = { generateUPILink };
