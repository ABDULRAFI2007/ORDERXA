import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/axios'

const STATUS_STEPS = ['Placed', 'Accepted', 'Preparing', 'Ready', 'Picked Up', 'Out for Delivery', 'Delivered']

export default function OrderTracking() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = () => api.get(`/api/orders/${id}`).then(r => setOrder(r.data)).catch(() => { })
        fetchOrder()
        setLoading(false)
        const interval = setInterval(fetchOrder, 15000)
        return () => clearInterval(interval)
    }, [id])

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

    if (!order) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <div className="text-5xl mb-4">❌</div>
                <p>Order not found</p>
            </div>
        </div>
    )

    const currentStep = STATUS_STEPS.indexOf(order.orderStatus)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Track Order 📍</h1>
                    <p className="text-gray-500 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                </div>

                {/* Status stepper */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Order Status</h3>
                        <StatusBadge status={order.orderStatus} />
                    </div>
                    <div className="space-y-0">
                        {STATUS_STEPS.map((step, idx) => {
                            const done = idx <= currentStep
                            const active = idx === currentStep
                            return (
                                <div key={step} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${active ? 'bg-brand-500 ring-4 ring-brand-500/20 animate-pulse' : done ? 'bg-brand-500' : 'bg-gray-200'}`}>
                                            {done ? <span className="text-white text-xs font-bold">✓</span> : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                                        </div>
                                        {idx < STATUS_STEPS.length - 1 && (
                                            <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-brand-500' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <p className={`font-medium text-sm ${active ? 'text-brand-600' : done ? 'text-gray-900' : 'text-gray-400'}`}>{step}</p>
                                        {active && <p className="text-xs text-gray-400 mt-0.5">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Order details */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-3">🏪 Shop Details</h3>
                        <p className="text-gray-800 font-medium">{order.vendorId?.shopName}</p>
                        <p className="text-gray-500 text-sm mt-1">{order.vendorId?.shopAddress}</p>
                    </div>
                    {order.deliveryPartnerId && (
                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-3">🛵 Delivery Partner</h3>
                            <p className="text-gray-800 font-medium">{order.deliveryPartnerId.fullName}</p>
                            <p className="text-gray-500 text-sm mt-1">📞 {order.deliveryPartnerId.phone}</p>
                        </div>
                    )}
                </div>

                <div className="card mt-4">
                    <h3 className="font-bold text-gray-900 mb-3">🗺️ Live Tracking</h3>
                    <div className="bg-gray-50 rounded-xl h-56 flex items-center justify-center border-2 border-dashed border-gray-200">
                        <div className="text-center text-gray-400">
                            <div className="text-4xl mb-2">🗺️</div>
                            <p className="text-sm font-medium">Google Maps Live Tracking</p>
                            <p className="text-xs mt-1">Add <code className="bg-gray-100 text-gray-600 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to enable</p>
                        </div>
                    </div>
                </div>

                <div className="card mt-4">
                    <h3 className="font-bold text-gray-900 mb-2">📍 Delivery Address</h3>
                    <p className="text-gray-500 text-sm">{order.deliveryAddress}</p>
                </div>
            </div>
        </div>
    )
}
