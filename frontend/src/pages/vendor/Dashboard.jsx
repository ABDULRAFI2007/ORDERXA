import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function VendorDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ total: 0, pending: 0, today: 0, revenue: 0 })
    const [orders, setOrders] = useState([])
    const [shopOpen, setShopOpen] = useState(true)
    const [togglingShop, setTogglingShop] = useState(false)

    useEffect(() => {
        api.get('/api/vendor/profile').then(r => setShopOpen(r.data.isOpen)).catch(() => { })
        api.get('/api/vendor/orders').then(r => {
            const o = r.data
            setOrders(o.slice(0, 5))
            const today = new Date().toDateString()
            const todayOrders = o.filter(x => new Date(x.createdAt).toDateString() === today)
            setStats({
                total: o.length,
                pending: o.filter(x => x.orderStatus === 'Placed').length,
                today: todayOrders.length,
                revenue: o.reduce((s, x) => s + x.totalPrice, 0),
            })
        }).catch(() => { })
    }, [])

    const toggleShop = async () => {
        setTogglingShop(true)
        try {
            await api.put('/api/vendor/settings', { isOpen: !shopOpen })
            setShopOpen(!shopOpen)
        } catch (e) { }
        setTogglingShop(false)
    }

    const stat_items = [
        { label: 'Total Orders', value: stats.total, icon: '📦', color: 'text-blue-600' },
        { label: 'Pending', value: stats.pending, icon: '⏳', color: 'text-yellow-600' },
        { label: "Today's Orders", value: stats.today, icon: '📅', color: 'text-green-600' },
        { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: '💰', color: 'text-brand-500' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-wrap gap-4 items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Vendor Dashboard 🏪</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.name || user?.shopName}!</p>
                    </div>
                    <button onClick={toggleShop} disabled={togglingShop}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${shopOpen ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' : 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'}`}>
                        <div className={`w-3 h-3 rounded-full ${shopOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {togglingShop ? 'Updating...' : shopOpen ? 'Shop is Open' : 'Shop is Closed'}
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stat_items.map(s => (
                        <div key={s.label} className="card">
                            <div className="text-2xl mb-2">{s.icon}</div>
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { to: '/vendor/products', icon: '🧆', label: 'Manage Products', desc: 'Add, edit, delete menu items' },
                        { to: '/vendor/orders', icon: '📋', label: 'View Orders', desc: 'Accept, reject, update orders' },
                        { to: '/vendor/settings', icon: '⚙️', label: 'Shop Settings', desc: 'Update hours and info' },
                    ].map(link => (
                        <a key={link.to} href={link.to}
                            className="card hover:border-brand-500/40 transition-all duration-300 hover:shadow-brand-500/10 hover:shadow-xl group">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{link.icon}</div>
                            <p className="font-bold text-gray-900">{link.label}</p>
                            <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
                        </a>
                    ))}
                </div>

                {/* Recent orders */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Recent Orders</h3>
                        <a href="/vendor/orders" className="text-brand-500 text-sm hover:text-brand-600">View all →</a>
                    </div>
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-400"><div className="text-4xl mb-2">📭</div><p>No orders yet</p></div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(o => (
                                <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-gray-900 font-medium text-sm">#{o._id.slice(-6).toUpperCase()} – {o.userId?.name || 'Customer'}</p>
                                        <p className="text-xs text-gray-500">{o.items.length} items • ₹{o.totalPrice}</p>
                                    </div>
                                    <StatusBadge status={o.orderStatus} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

