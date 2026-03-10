import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/axios'

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        api.get('/api/admin/orders').then(r => setOrders(r.data)).catch(() => { }).finally(() => setLoading(false))
    }, [])

    const statuses = ['All', 'Placed', 'Accepted', 'Preparing', 'Ready', 'Picked Up', 'Out for Delivery', 'Delivered', 'Rejected']
    const filtered = orders.filter(o => {
        const matchStatus = filter === 'All' || o.orderStatus === filter
        const matchSearch = !search || o._id.toLowerCase().includes(search.toLowerCase()) || o.userId?.name?.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-6">All Orders 📦</h1>

                <div className="flex flex-wrap gap-3 mb-6">
                    <input className="input-field max-w-sm" placeholder="Search by ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
                    {statuses.map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>

                {loading ? <div className="card h-40 animate-pulse bg-gray-100" /> : (
                    <div className="space-y-3">
                        {filtered.map(o => (
                            <div key={o._id} className="card flex flex-wrap gap-4 items-start justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">#{o._id.slice(-8).toUpperCase()}</p>
                                    <p className="font-bold text-gray-900">{o.userId?.name || 'Customer'} → {o.vendorId?.shopName}</p>
                                    <p className="text-xs text-gray-500">{o.items.length} items • {new Date(o.createdAt).toLocaleString('en-IN')}</p>
                                    {o.deliveryPartnerId && <p className="text-xs text-gray-400">🛵 {o.deliveryPartnerId.fullName}</p>}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={o.orderStatus} />
                                    <div className="flex gap-2 items-center">
                                        <StatusBadge status={o.paymentStatus} />
                                        <span className="text-brand-500 font-bold">₹{o.totalPrice}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{o.paymentMethod}</span>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-5xl mb-3">📭</div><p>No orders found</p></div>}
                    </div>
                )}
            </div>
        </div>
    )
}
