import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/axios'

export default function OrderHistory() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/orders/my').then(r => setOrders(r.data)).catch(() => { }).finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders 📦</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-xl font-medium mb-2">No orders yet</p>
                        <p className="text-sm mb-6">Start ordering your favourite food!</p>
                        <Link to="/customer/products" className="btn-primary">Browse Menu</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="card hover:border-brand-500/30 transition-all duration-300">
                                <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                                        <p className="font-semibold text-gray-900">{order.vendorId?.shopName || 'Multiple Vendors'}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-right flex flex-col gap-2 items-end">
                                        <StatusBadge status={order.orderStatus} />
                                        <StatusBadge status={order.paymentStatus} />
                                        <p className="text-brand-500 font-bold">₹{order.totalPrice}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {order.items.slice(0, 3).map((item, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-lg px-3 py-1">
                                            {item.name} × {item.qty}
                                        </span>
                                    ))}
                                    {order.items.length > 3 && (
                                        <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '📱 UPI'}
                                    </span>
                                    {['Accepted', 'Preparing', 'Ready', 'Picked Up', 'Out for Delivery'].includes(order.orderStatus) && (
                                        <Link to={`/customer/orders/${order._id}/track`} className="text-brand-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1">
                                            📍 Track Order →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
