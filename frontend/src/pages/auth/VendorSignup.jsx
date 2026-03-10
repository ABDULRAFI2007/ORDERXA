import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Erode', 'Tiruppur', 'Trichy', 'Vellore', 'Tirunelveli', 'Dindigul', 'Other']
const CATEGORIES = ['Food', 'Snacks', 'Beverages', 'Mixed']

export default function VendorSignup() {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        ownerName: '', phone: '', otp: '', email: '', password: '', confirm: '',
        shopName: '', shopAddress: '', district: '', lat: '', lng: '',
        openingTime: '09:00', closingTime: '22:00', category: 'Mixed',
    })
    const [otpSent, setOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const sendOTP = async () => {
        setError(''); setLoading(true)
        try { await api.post('/api/vendor/send-otp', { phone: form.phone }); setOtpSent(true) }
        catch (e) { setError(e.response?.data?.message || 'Failed to send OTP') }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true)
        if (form.password !== form.confirm) { setError('Passwords do not match'); setLoading(false); return }
        try {
            const res = await api.post('/api/vendor/register', {
                ownerName: form.ownerName, phone: form.phone, otp: form.otp,
                email: form.email, password: form.password,
                shopName: form.shopName, shopAddress: form.shopAddress, district: form.district,
                location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
                openingTime: form.openingTime, closingTime: form.closingTime, category: form.category,
            })
            login(res.data.token, { ...res.data.vendor, role: 'vendor' })
            navigate('/vendor')
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
                    <div className="text-4xl mb-2">🏪</div>
                    <h1 className="text-2xl font-black gradient-text">Register Your Shop</h1>
                    <p className="text-gray-500 text-sm">Join ORDERXA as a Shop Owner</p>
                </div>

                <div className="flex items-center mb-6 gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-brand-500' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-2">Owner Details</h2>
                                <div><label className="label">Owner Name</label><input className="input-field" placeholder="Your full name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} required /></div>
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
                                <div><label className="label">Email</label><input className="input-field" type="email" placeholder="owner@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Password</label><input className="input-field" type="password" placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
                                    <div><label className="label">Confirm</label><input className="input-field" type="password" placeholder="Confirm" value={form.confirm} onChange={e => set('confirm', e.target.value)} required /></div>
                                </div>
                                <button type="button" disabled={!otpSent || !form.otp || !form.ownerName || !form.email || !form.password} onClick={() => setStep(2)} className="btn-primary w-full">Next →</button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-2">Shop Details</h2>
                                <div><label className="label">Shop Name</label><input className="input-field" placeholder="e.g. Raja Biryani House" value={form.shopName} onChange={e => set('shopName', e.target.value)} required /></div>
                                <div>
                                    <label className="label">Shop Category</label>
                                    <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">District</label>
                                    <select className="input-field" value={form.district} onChange={e => set('district', e.target.value)} required>
                                        <option value="">Select District</option>
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div><label className="label">Shop Address</label><textarea className="input-field resize-none h-20" placeholder="Door no, Street, Area..." value={form.shopAddress} onChange={e => set('shopAddress', e.target.value)} required /></div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                                    <button type="button" disabled={!form.shopName || !form.district} onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-2">Location & Hours</h2>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 mb-3">
                                    📍 Enter your shop's coordinates (find them on Google Maps by right-clicking your location)
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Latitude</label><input className="input-field" type="number" step="any" placeholder="e.g. 13.0827" value={form.lat} onChange={e => set('lat', e.target.value)} /></div>
                                    <div><label className="label">Longitude</label><input className="input-field" type="number" step="any" placeholder="e.g. 80.2707" value={form.lng} onChange={e => set('lng', e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Opening Time</label><input className="input-field" type="time" value={form.openingTime} onChange={e => set('openingTime', e.target.value)} /></div>
                                    <div><label className="label">Closing Time</label><input className="input-field" type="time" value={form.closingTime} onChange={e => set('closingTime', e.target.value)} /></div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                                    <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Registering...' : '🏪 Register Shop'}</button>
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
