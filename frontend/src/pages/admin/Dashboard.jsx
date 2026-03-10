import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/admin/analytics').then(r => setAnalytics(r.data)).catch(() => { }).finally(() => setLoading(false))
    }, [])

    const stats = analytics ? [
        { label: 'Total Orders', value: analytics.totalOrders, icon: '📦', color: 'text-blue-600', to: '/admin/orders' },
        { label: 'Total Revenue', value: `₹${analytics.totalRevenue?.toFixed(0) || 0}`, icon: '💰', color: 'text-brand-500', to: '/admin/analytics' },
        { label: 'Customers', value: analytics.totalCustomers, icon: '👤', color: 'text-green-600', to: '/admin/users' },
        { label: 'Vendors', value: analytics.totalVendors, icon: '🏪', color: 'text-purple-600', to: '/admin/vendors' },
        { label: 'Delivery Partners', value: analytics.totalPartners, icon: '🛵', color: 'text-yellow-600', to: '/admin/partners' },
        { label: 'Pending Verification', value: analytics.pendingPartners, icon: '⏳', color: 'text-red-600', to: '/admin/partners' },
    ] : []

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Admin Dashboard 🛡️</h1>
                    <p className="text-gray-500 mt-1">Platform overview and management</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}</div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {stats.map(s => (
                            <Link key={s.label} to={s.to} className="card hover:border-brand-500/30 transition-all group">
                                <div className="text-2xl mb-2">{s.icon}</div>
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Quick nav */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {[
                        { to: '/admin/users', icon: '👤', label: 'Customers' },
                        { to: '/admin/vendors', icon: '🏪', label: 'Vendors' },
                        { to: '/admin/partners', icon: '🛵', label: 'Partners' },
                        { to: '/admin/orders', icon: '📦', label: 'Orders' },
                        { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
                    ].map(link => (
                        <Link key={link.to} to={link.to}
                            className="card text-center py-6 hover:border-brand-500/50 transition-all group">
                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</div>
                            <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{link.label}</p>
                        </Link>
                    ))}
                </div>

                {/* Recent orders */}
                {analytics?.recentOrders && analytics.recentOrders.length > 0 && (
                    <div className="card">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Orders</h3>
                        <div className="space-y-3">
                            {analytics.recentOrders.map(o => (
                                <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-gray-900 text-sm font-medium">#{o._id.slice(-6).toUpperCase()} – {o.userId?.name}</p>
                                        <p className="text-xs text-gray-500">{o.vendorId?.shopName} • ₹{o.totalPrice}</p>
                                    </div>
                                    <span className={`badge text-xs ${o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} border border-current/20`}>{o.orderStatus}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

