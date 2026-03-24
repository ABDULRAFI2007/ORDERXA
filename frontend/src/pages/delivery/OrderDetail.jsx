import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LiveMap from '../../components/LiveMap'
import api from '../../api/axios'

const STATUS_OPTIONS = ['Picked Up', 'Out for Delivery', 'Delivered']

export default function DeliveryOrderDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [locationSharing, setLocationSharing] = useState(false)
    const [myLocation, setMyLocation] = useState(null)
    const watchIdRef = useRef(null)
    const locationIntervalRef = useRef(null)

    useEffect(() => {
        api.get(`/api/orders/${id}`).then(r => setOrder(r.data)).catch(() => { }).finally(() => setLoading(false))
    }, [id])

    // Auto-location sharing
    useEffect(() => {
        if (!order || order.orderStatus === 'Delivered') return

        const startLocationSharing = () => {
            if (!navigator.geolocation) {
                console.warn('Geolocation not supported')
                return
            }

            setLocationSharing(true)

            // Watch position for real-time updates
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    setMyLocation(loc)
                },
                (err) => console.warn('Geolocation error:', err.message),
                { enableHighAccuracy: true, maximumAge: 10000 }
            )

            // Send location to server every 30 seconds
            const sendLocation = () => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                        setMyLocation(loc)
                        api.put('/api/delivery/location', loc).catch(() => { })
                    },
                    () => { },
                    { enableHighAccuracy: true }
                )
            }
            sendLocation() // Send immediately
            locationIntervalRef.current = setInterval(sendLocation, 30000)
        }

        startLocationSharing()

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current)
            setLocationSharing(false)
        }
    }, [order?.orderStatus])

    const updateStatus = async (status) => {
        setUpdating(true)
        try {
            await api.put(`/api/delivery/orders/${id}/status`, { orderStatus: status })
            const r = await api.get(`/api/orders/${id}`)
            setOrder(r.data)
            if (status === 'Delivered') {
                // Stop location sharing on delivery
                if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
                if (locationIntervalRef.current) clearInterval(locationIntervalRef.current)
                navigate('/delivery')
            }
        } catch (e) { alert(e.response?.data?.message || 'Failed to update status') }
        setUpdating(false)
    }

    const openMaps = (destination) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
        window.open(url, '_blank')
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
    if (!order) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex items-center justify-center h-96 text-gray-400"><p>Order not found</p></div></div>

    // Build map markers
    const mapMarkers = []
    const vendorLoc = order.vendorId?.location
    if (vendorLoc?.lat && vendorLoc?.lng) {
        mapMarkers.push({ lat: vendorLoc.lat, lng: vendorLoc.lng, label: order.vendorId?.shopName || 'Pickup', type: 'vendor' })
    }
    if (myLocation?.lat && myLocation?.lng) {
        mapMarkers.push({ lat: myLocation.lat, lng: myLocation.lng, label: 'You', type: 'delivery' })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/delivery')} className="text-gray-400 hover:text-gray-700 transition-colors">← Back</button>
                    <h1 className="text-2xl font-black text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <StatusBadge status={order.orderStatus} />
                    <span className="text-gray-500 text-sm">₹{order.totalPrice} • {order.paymentMethod}</span>
                    {locationSharing && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full ml-auto">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Location Sharing
                        </span>
                    )}
                </div>

                {/* Embedded Map */}
                <div className="card mb-4">
                    <h3 className="font-bold text-gray-900 mb-3">🗺️ Route Map</h3>
                    <LiveMap markers={mapMarkers} className="h-56 rounded-xl overflow-hidden" zoom={mapMarkers.length > 1 ? 13 : 15} />
                    {mapMarkers.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                            {mapMarkers.map((m, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    <span className={`w-3 h-3 rounded-full ${m.type === 'vendor' ? 'bg-amber-400' : m.type === 'delivery' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                    {m.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pickup location */}
                <div className="card mb-4">
                    <h3 className="font-bold text-gray-900 mb-3">🏪 Pickup Location</h3>
                    <p className="text-gray-800 font-medium">{order.vendorId?.shopName}</p>
                    <p className="text-gray-500 text-sm mt-1">{order.vendorId?.shopAddress}</p>
                    <button onClick={() => openMaps(order.vendorId?.shopAddress)} className="btn-secondary text-sm py-2 px-4 mt-3 flex items-center gap-2">
                        <span>🗺️</span> Navigate to Shop (Google Maps)
                    </button>
                </div>

                {/* Delivery location */}
                <div className="card mb-4">
                    <h3 className="font-bold text-gray-900 mb-3">📍 Delivery Location</h3>
                    <p className="text-gray-500 text-sm">{order.deliveryAddress}</p>
                    <p className="text-gray-500 text-sm mt-1">Customer: {order.userId?.name} • {order.userId?.phone}</p>
                    <button onClick={() => openMaps(order.deliveryAddress)} className="btn-primary text-sm py-2 px-4 mt-3 flex items-center gap-2">
                        <span>🗺️</span> Navigate to Customer
                    </button>
                </div>

                {/* Order items */}
                <div className="card mb-4">
                    <h3 className="font-bold text-gray-900 mb-3">📦 Order Items</h3>
                    <div className="space-y-2">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{item.name} × {item.qty}</span>
                                <span className="text-gray-900 font-medium">₹{item.price * item.qty}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status update */}
                <div className="card">
                    <h3 className="font-bold text-gray-900 mb-4">Update Status</h3>
                    <div className="grid gap-3">
                        {STATUS_OPTIONS.map(s => {
                            const currentIdx = STATUS_OPTIONS.indexOf(order.orderStatus)
                            const sIdx = STATUS_OPTIONS.indexOf(s)
                            const isDone = currentIdx >= sIdx
                            const isNext = sIdx === currentIdx + 1 || (currentIdx === -1 && sIdx === 0)
                            return (
                                <button key={s} onClick={() => updateStatus(s)} disabled={updating || isDone || (!isNext && currentIdx === -1)}
                                    className={`p-3 rounded-xl border-2 text-left font-medium text-sm transition-all ${isDone ? 'border-brand-500/50 bg-brand-500/5 text-brand-600' : isNext ? 'border-gray-200 hover:border-brand-500 hover:bg-brand-500/5 text-gray-700 hover:text-gray-900' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                                    {isDone ? '✅ ' : isNext ? '→ ' : '○ '}{s}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
