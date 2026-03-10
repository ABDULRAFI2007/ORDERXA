import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Erode', 'Tiruppur', 'Trichy', 'Vellore', 'Tirunelveli', 'Dindigul', 'Other']
const VEHICLE_TYPES = ['Bike', 'Scooter', 'Bicycle', 'Car']

export default function DeliverySignup() {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        fullName: '', phone: '', otp: '', email: '', password: '', confirm: '',
        aadharNumber: '', aadharOtp: '', district: '', address: '',
        vehicleType: 'Bike', vehicleNumber: '',
    })
    const [otpSent, setOtpSent] = useState(false)
    const [aadharOtpSent, setAadharOtpSent] = useState(false)
    const [aadharVerified, setAadharVerified] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const sendOTP = async () => {
        setError(''); setLoading(true)
        try { await api.post('/api/delivery/send-otp', { phone: form.phone }); setOtpSent(true) }
        catch (e) { setError(e.response?.data?.message || 'Failed to send OTP') }
        setLoading(false)
    }

    const sendAadharOTP = () => {
        setAadharOtpSent(true)
        alert('Aadhar OTP sent (simulated): Use any 6-digit number')
    }

    const verifyAadharOTP = async () => {
        setError(''); setLoading(true)
        try {
            const res = await api.post('/api/delivery/verify-aadhar-otp', { aadharNumber: form.aadharNumber, otp: form.aadharOtp })
            if (res.data.valid) setAadharVerified(true)
            else setError('Invalid Aadhar OTP')
        } catch (e) { setError(e.response?.data?.message || 'Aadhar verification failed') }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true)
        if (form.password !== form.confirm) { setError('Passwords do not match'); setLoading(false); return }
        try {
            const res = await api.post('/api/delivery/register', {
                fullName: form.fullName, phone: form.phone, otp: form.otp,
                email: form.email, password: form.password,
                aadharNumber: form.aadharNumber, district: form.district,
                address: form.address, vehicleType: form.vehicleType, vehicleNumber: form.vehicleNumber,
            })
            login(res.data.token, { ...res.data.partner, role: 'delivery' })
            navigate('/delivery')
        } catch (e) { setError(e.response?.data?.message || 'Registration failed') }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
            </div>
            <div className="w-full max-w-lg relative">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🛵</div>
                    <h1 className="text-2xl font-black gradient-text">Join as Delivery Partner</h1>
                    <p className="text-gray-500 text-sm">Earn by delivering food with ORDERXA</p>
                </div>

                <div className="flex items-center mb-6 gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-brand-500' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-2">Personal & Account Info</h2>
                                <div><label className="label">Full Name</label><input className="input-field" placeholder="Your full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} required /></div>
                                <div>
                                    <label className="label">Mobile Number</label>
                                    <div className="flex gap-2">
                                        <input className="input-field flex-1" type="tel" placeholder="10-digit mobile" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                                        <button type="button" onClick={sendOTP} disabled={loading || !form.phone} className="btn-outline text-sm px-4 whitespace-nowrap">{otpSent ? 'Resend' : 'Send OTP'}</button>
                                    </div>
                                </div>
                                {otpSent && (
                                    <div>
                                        <label className="label">OTP</label>
                                        <input className="input-field text-center tracking-widest font-bold text-xl" maxLength={6} placeholder="• • • • • •" value={form.otp} onChange={e => set('otp', e.target.value)} required />
                                        <p className="text-xs text-gray-400 mt-1">Check backend console for OTP</p>
                                    </div>
                                )}
                                <div><label className="label">Email ID</label><input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Password</label><input className="input-field" type="password" placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
                                    <div><label className="label">Confirm</label><input className="input-field" type="password" placeholder="Confirm" value={form.confirm} onChange={e => set('confirm', e.target.value)} required /></div>
                                </div>
                                <button type="button" disabled={!otpSent || !form.otp || !form.fullName || !form.email || !form.password} onClick={() => setStep(2)} className="btn-primary w-full">Next →</button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-2">Identity Verification</h2>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                                    ⚠️ Aadhar verification is required for delivery partners
                                </div>
                                <div><label className="label">Aadhar Number</label><input className="input-field" type="text" maxLength={12} placeholder="12-digit Aadhar number" value={form.aadharNumber} onChange={e => set('aadharNumber', e.target.value)} required /></div>
                                {!aadharVerified && (
                                    <div>
                                        <div className="flex gap-2">
                                            <input className="input-field flex-1 text-center tracking-widest font-bold" maxLength={6} placeholder="Aadhar OTP" value={form.aadharOtp} onChange={e => set('aadharOtp', e.target.value)} />
                                            <button type="button" onClick={sendAadharOTP} className="btn-outline text-sm px-4 whitespace-nowrap">Send OTP</button>
                                        </div>
                                        {aadharOtpSent && (
                                            <button type="button" onClick={verifyAadharOTP} disabled={loading || !form.aadharOtp} className="btn-primary w-full mt-2 text-sm">
                                                {loading ? 'Verifying...' : 'Verify Aadhar'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {aadharVerified && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                                        <span>✅</span> Aadhar verified successfully!
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                                    <button type="button" disabled={!aadharVerified} onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-2">Vehicle & Location</h2>
                                <div>
                                    <label className="label">District</label>
                                    <select className="input-field" value={form.district} onChange={e => set('district', e.target.value)} required>
                                        <option value="">Select District</option>
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div><label className="label">Address</label><textarea className="input-field resize-none h-16" placeholder="Your address" value={form.address} onChange={e => set('address', e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Vehicle Type</label>
                                        <select className="input-field" value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}>
                                            {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="label">Vehicle Number</label><input className="input-field" placeholder="TN01AB1234" value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value)} required /></div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                                    <button type="submit" disabled={loading || !form.district || !form.vehicleNumber} className="btn-primary flex-1">{loading ? 'Registering...' : '🛵 Join ORDERXA'}</button>
                                </div>
                            </>
                        )}
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Already registered? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
