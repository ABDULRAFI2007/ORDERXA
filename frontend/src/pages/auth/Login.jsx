import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function Login() {
    const [roleTab, setRoleTab] = useState('customer')
    const [loginTab, setLoginTab] = useState('email')
    const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' })
    const [otpSent, setOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const roleRoutes = { customer: '/customer', vendor: '/vendor', delivery: '/delivery', admin: '/customer' }

    const handleSendOTP = async () => {
        setError(''); setLoading(true)
        try {
            const endpoint = roleTab === 'vendor' ? '/api/vendor/send-otp' : roleTab === 'delivery' ? '/api/delivery/send-otp' : '/api/auth/send-otp'
            await api.post(endpoint, { phone: form.phone })
            setOtpSent(true)
        } catch (e) { setError(e.response?.data?.message || 'Failed to send OTP') }
        setLoading(false)
    }

    const handleEmailLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true)
        try {
            let res
            if (roleTab === 'vendor') res = await api.post('/api/vendor/login', { phone: form.phone, password: form.password })
            else if (roleTab === 'delivery') res = await api.post('/api/delivery/login', { phone: form.phone, password: form.password })
            else res = await api.post('/api/auth/login', { email: form.email, password: form.password })
            const user = res.data.user || res.data.vendor || res.data.partner
            login(res.data.token, { ...user, role: roleTab === 'admin' ? 'admin' : roleTab })
            navigate(roleRoutes[user.role] || roleRoutes[roleTab])
        } catch (e) { setError(e.response?.data?.message || 'Login failed') }
        setLoading(false)
    }

    const handleOTPLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true)
        try {
            const res = await api.post('/api/auth/verify-otp', { phone: form.phone, otp: form.otp })
            login(res.data.token, res.data.user)
            navigate('/customer')
        } catch (e) { setError(e.response?.data?.message || 'OTP verification failed') }
        setLoading(false)
    }

    const googleLogin = useGoogleLogin({
        onSuccess: async () => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google` },
        flow: 'redirect',
    })

    const roleTabs = [
        { id: 'customer', label: 'Customer', icon: '👤' },
        { id: 'vendor', label: 'Shop Owner', icon: '🏪' },
        { id: 'delivery', label: 'Delivery Partner', icon: '🛵' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🍱</div>
                    <h1 className="text-3xl font-black gradient-text">ORDERXA</h1>
                    <p className="text-gray-500 mt-1 text-sm">Food & Snacks, Delivered Fast</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    {/* Role Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
                        {roleTabs.map(r => (
                            <button key={r.id} onClick={() => { setRoleTab(r.id); setLoginTab(r.id === 'customer' ? 'email' : 'phone'); setError('') }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${roleTab === r.id ? 'bg-brand-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
                                <span>{r.icon}</span> <span className="hidden sm:inline">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Login sub-tabs for customer */}
                    {roleTab === 'customer' && (
                        <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-6">
                            {['email', 'otp'].map(tab => (
                                <button key={tab} onClick={() => { setLoginTab(tab); setError(''); setOtpSent(false) }}
                                    className={`flex-1 py-2 text-sm font-medium transition-colors ${loginTab === tab ? 'bg-brand-500/10 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {tab === 'email' ? '📧 Email' : '📱 OTP'}
                                </button>
                            ))}
                        </div>
                    )}

                    {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>}

                    {/* Email/Password form */}
                    {(loginTab === 'email' || roleTab === 'vendor' || roleTab === 'delivery') && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            {(roleTab === 'vendor' || roleTab === 'delivery') ? (
                                <div><label className="label">📱 Mobile Number</label><input className="input-field" type="tel" placeholder="Enter mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
                            ) : (
                                <div><label className="label">📧 Email Address</label><input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                            )}
                            <div><label className="label">🔒 Password</label><input className="input-field" type="password" placeholder="Enter password" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Signing in...' : `Sign in as ${roleTab === 'vendor' ? 'Shop Owner' : roleTab === 'delivery' ? 'Delivery Partner' : 'Customer'}`}
                            </button>
                        </form>
                    )}

                    {/* OTP form */}
                    {loginTab === 'otp' && roleTab === 'customer' && (
                        <form onSubmit={handleOTPLogin} className="space-y-4">
                            <div>
                                <label className="label">📱 Mobile Number</label>
                                <div className="flex gap-2">
                                    <input className="input-field flex-1" type="tel" placeholder="Enter mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                                    <button type="button" onClick={handleSendOTP} disabled={loading || !form.phone} className="btn-outline text-sm whitespace-nowrap px-4">
                                        {otpSent ? 'Resend' : 'Send OTP'}
                                    </button>
                                </div>
                            </div>
                            {otpSent && (
                                <div>
                                    <label className="label">🔢 Enter OTP</label>
                                    <input className="input-field tracking-widest text-center text-xl font-bold" type="text" placeholder="• • • • • •" maxLength={6} value={form.otp} onChange={e => set('otp', e.target.value)} required />
                                    <p className="text-xs text-gray-400 mt-1">Check the backend console for OTP in dev mode</p>
                                </div>
                            )}
                            <button type="submit" disabled={loading || !otpSent} className="btn-primary w-full">
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </form>
                    )}

                    {/* Google Login */}
                    {roleTab === 'customer' && (
                        <div className="mt-4">
                            <div className="relative flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-gray-400 text-xs">or continue with</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <button onClick={() => googleLogin()} className="w-full flex items-center justify-center gap-3 btn-secondary">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    )}

                    {/* Signup links */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        {roleTab === 'customer' && <p>New customer? <Link to="/signup/customer" className="text-brand-500 hover:text-brand-600 font-medium">Create account</Link></p>}
                        {roleTab === 'vendor' && <p>New shop? <Link to="/signup/vendor" className="text-brand-500 hover:text-brand-600 font-medium">Register your shop</Link></p>}
                        {roleTab === 'delivery' && <p>Want to deliver? <Link to="/signup/delivery" className="text-brand-500 hover:text-brand-600 font-medium">Join as partner</Link></p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
