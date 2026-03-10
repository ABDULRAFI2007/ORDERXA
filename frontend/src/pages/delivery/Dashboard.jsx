import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function DeliveryDashboard() {
    const { user } = useAuth()
    const [myOrders, setMyOrders] = useState([])
    const [availOrders, setAvailOrders] = useState([])
    const [tab, setTab] = useState('assigned')
    const [loading, setLoading] = useState(true)

    const loadData = async () => {
        try {
            const [my, avail] = await Promise.all([
                api.get('/api/delivery/orders'),
                api.get('/api/delivery/available-orders'),
            ])
            setMyOrders(my.data)
            setAvailOrders(avail.data)
        } catch (e) { }
        setLoading(false)
    }

    useEffect(() => { loadData() }, [])

    const acceptOrder = async (id) => {
        try {
            await api.put(`/api/delivery/orders/${id}/accept`)
            loadData()
        } catch (e) { alert(e.response?.data?.message || 'Failed to accept order') }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">Delivery Dashboard 🛵</h1>
                    <p className="text-gray-500 mt-1">Welcome, {user?.fullName || user?.name}!</p>
                    {user && !user.isVerified && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
                            ⏳ Your account is pending admin verification. You'll be able to accept orders once verified.
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setTab('assigned')} className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${tab === 'assigned' ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}>
                        My Deliveries ({myOrders.length})
                    </button>
                    <button onClick={() => setTab('available')} className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${tab === 'available' ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}>
                        Available Orders ({availOrders.length})
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}</div>
                ) : (
                    <>
                        {tab === 'assigned' && (
                            <div className="space-y-4">
                                {myOrders.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">📭</div><p>No deliveries assigned yet</p></div>
                                ) : myOrders.map(order => (
                                    <div key={order._id} className="card hover:border-brand-500/30 transition-all">
                                        <div className="flex flex-wrap gap-4 justify-between mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                                                <p className="font-bold text-gray-900">{order.vendorId?.shopName || 'Shop'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">📍 Pick: {order.vendorId?.shopAddress}</p>
                                                <p className="text-xs text-gray-500">📦 Deliver: {order.deliveryAddress}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <StatusBadge status={order.orderStatus} />
                                                <p className="text-brand-500 font-bold">₹{order.totalPrice}</p>
                                            </div>
                                        </div>
                                        <Link to={`/delivery/orders/${order._id}`} className="btn-primary text-sm py-2 inline-block">
                                            📍 Navigate & Update Status
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {tab === 'available' && (
                            <div className="space-y-4">
                                {availOrders.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🎉</div><p>No available orders right now</p><p className="text-sm mt-1">Check back soon!</p></div>
                                ) : availOrders.map(order => (
                                    <div key={order._id} className="card hover:border-green-500/30 transition-all">
                                        <div className="flex justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-gray-900">{order.vendorId?.shopName}</p>
                                                <p className="text-xs text-gray-500">📍 {order.vendorId?.district} → {order.deliveryAddress?.substring(0, 40)}...</p>
                                                <p className="text-xs text-gray-400 mt-1">{order.items.length} items • ₹{order.totalPrice}</p>
                                            </div>
                                            <p className="text-brand-500 font-bold">₹{order.totalPrice}</p>
                                        </div>
                                        <button onClick={() => acceptOrder(order._id)} className="btn-primary text-sm py-2">
                                            ✅ Accept Delivery
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
