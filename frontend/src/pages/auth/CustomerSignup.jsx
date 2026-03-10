import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Erode', 'Tiruppur', 'Trichy', 'Vellore', 'Tirunelveli', 'Dindigul', 'Other']

export default function CustomerSignup() {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({ name: '', phone: '', otp: '', email: '', password: '', confirm: '', address: '', district: '' })
    const [otpSent, setOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const sendOTP = async () => {
        setError(''); setLoading(true)
        try {
            await api.post('/api/auth/send-otp', { phone: form.phone })
            setOtpSent(true)
        } catch (e) { setError(e.response?.data?.message || 'Failed to send OTP') }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true)
        if (form.password !== form.confirm) { setError('Passwords do not match'); setLoading(false); return }
        try {
            const res = await api.post('/api/auth/register', {
                name: form.name, phone: form.phone, otp: form.otp,
                email: form.email, password: form.password,
                district: form.district, address: form.address,
            })
            login(res.data.token, res.data.user)
            navigate('/customer')
        } catch (e) { setError(e.response?.data?.message || 'Registration failed') }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">🍱</div>
                    <h1 className="text-2xl font-black gradient-text">Create Account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join ORDERXA as a Customer</p>
                </div>

                {/* Progress */}
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
                                <h2 className="font-semibold text-gray-900 text-lg mb-4">Personal Details</h2>
                                <div><label className="label">Full Name</label><input className="input-field" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
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
                                        <p className="text-xs text-gray-400 mt-1">Check backend console for OTP (dev mode)</p>
                                    </div>
                                )}
                                <button type="button" disabled={!otpSent || !form.otp || !form.name} onClick={() => setStep(2)} className="btn-primary w-full mt-2">Next →</button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-4">Account Credentials</h2>
                                <div><label className="label">Email Address</label><input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                                <div><label className="label">Password</label><input className="input-field" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
                                <div><label className="label">Confirm Password</label><input className="input-field" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required /></div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                                    <button type="button" disabled={!form.email || !form.password || !form.confirm} onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="font-semibold text-gray-900 text-lg mb-4">Delivery Address</h2>
                                <div>
                                    <label className="label">District</label>
                                    <select className="input-field" value={form.district} onChange={e => set('district', e.target.value)} required>
                                        <option value="">Select District</option>
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div><label className="label">Full Address</label><textarea className="input-field resize-none h-24" placeholder="Door no, Street, Area, City..." value={form.address} onChange={e => set('address', e.target.value)} /></div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                                    <button type="submit" disabled={loading || !form.district} className="btn-primary flex-1">{loading ? 'Creating...' : '🎉 Create Account'}</button>
                                </div>
                            </>
                        )}
                    </form>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
