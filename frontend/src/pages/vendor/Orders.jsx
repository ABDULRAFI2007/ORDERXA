import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/axios'

const STATUS_OPTIONS = ['Accepted', 'Rejected', 'Preparing', 'Ready']

export default function VendorOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')

    const load = () => api.get('/api/vendor/orders').then(r => setOrders(r.data)).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [])

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/api/vendor/orders/${id}/status`, { orderStatus: status })
            load()
        } catch (e) { alert(e.response?.data?.message || 'Failed to update status') }
    }

    const FILTERS = ['All', 'Placed', 'Accepted', 'Preparing', 'Ready', 'Rejected']
    const filtered = filter === 'All' ? orders : orders.filter(o => o.orderStatus === filter)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Manage Orders 📋</h1>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${filter === f ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="card h-36 animate-pulse bg-gray-100" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">📭</div><p>No orders found</p></div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(order => (
                            <div key={order._id} className="card">
                                <div className="flex flex-wrap gap-4 items-start justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                                        <p className="font-bold text-gray-900">{order.userId?.name || 'Customer'}</p>
                                        <p className="text-xs text-gray-500">📞 {order.userId?.phone} • {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusBadge status={order.orderStatus} />
                                        <p className="text-brand-500 font-bold">₹{order.totalPrice}</p>
                                        <span className="text-xs text-gray-500">{order.paymentMethod === 'COD' ? '💵 COD' : '📱 UPI'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {order.items.map((item, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-lg px-3 py-1">{item.name} × {item.qty}</span>
                                    ))}
                                </div>

                                {order.orderStatus === 'Placed' && (
                                    <div className="flex gap-3 border-t border-gray-100 pt-3">
                                        <button onClick={() => updateStatus(order._id, 'Accepted')} className="btn-primary flex-1 text-sm py-2">✅ Accept</button>
                                        <button onClick={() => updateStatus(order._id, 'Rejected')} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-semibold transition-colors">❌ Reject</button>
                                    </div>
                                )}
                                {order.orderStatus === 'Accepted' && (
                                    <div className="border-t border-gray-100 pt-3 flex gap-2">
                                        <button onClick={() => updateStatus(order._id, 'Preparing')} className="btn-primary text-sm py-2 px-4">🍳 Mark Preparing</button>
                                    </div>
                                )}
                                {order.orderStatus === 'Preparing' && (
                                    <div className="border-t border-gray-100 pt-3">
                                        <button onClick={() => updateStatus(order._id, 'Ready')} className="btn-primary text-sm py-2 px-4">✅ Mark Ready</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
