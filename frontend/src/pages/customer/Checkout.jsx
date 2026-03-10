import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function Checkout() {
    const { items, total, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [address, setAddress] = useState(user?.address || '')
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [order, setOrder] = useState(null)
    const [upiLink, setUpiLink] = useState('')

    const handlePlaceOrder = async (e) => {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const res = await api.post('/api/orders', {
                items: items.map(i => ({ productId: i.productId, qty: i.qty })),
                deliveryAddress: address,
                paymentMethod,
            })
            setOrder(res.data.order)
            if (res.data.upiLink) setUpiLink(res.data.upiLink)
            if (paymentMethod === 'COD') { clearCart(); navigate(`/customer/orders`) }
        } catch (e) { setError(e.response?.data?.message || 'Failed to place order') }
        setLoading(false)
    }

    const handlePaymentDone = async () => {
        try {
            await api.put(`/api/orders/${order._id}/payment`, { upiTransactionId: 'UPI_' + Date.now() })
            clearCart()
            navigate(`/customer/orders`)
        } catch (e) { setError('Failed to confirm payment') }
    }

    if (!items.length && !order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="text-7xl mb-4">🛒</div>
                    <p className="text-gray-500 mb-4">Cart is empty</p>
                    <button onClick={() => navigate('/customer/products')} className="btn-primary">Browse Menu</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout 🧾</h1>

                {/* UPI modal */}
                {upiLink && order && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full text-center p-8">
                            <div className="text-5xl mb-4">💳</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">UPI Payment</h3>
                            <p className="text-gray-500 text-sm mb-4">Amount: <span className="text-brand-500 font-bold text-lg">₹{order.totalPrice}</span></p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                                <p className="text-gray-900 font-mono text-sm">abdulrafi.n2007@okicici</p>
                            </div>
                            <a href={upiLink} className="btn-primary w-full block mb-3" target="_blank" rel="noreferrer">
                                📱 Open in UPI App (Google Pay)
                            </a>
                            <p className="text-xs text-gray-400 mb-4">After payment, click below to confirm</p>
                            <button onClick={handlePaymentDone} className="btn-primary w-full bg-green-600 hover:bg-green-700 from-green-600 to-green-700">
                                ✅ I've Paid - Confirm Order
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <form onSubmit={handlePlaceOrder} className="space-y-6">
                            <div className="card">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">📍 Delivery Address</h3>
                                <textarea className="input-field resize-none h-24" placeholder="Enter your full delivery address..."
                                    value={address} onChange={e => setAddress(e.target.value)} required />
                            </div>

                            <div className="card">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">💳 Payment Method</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setPaymentMethod('COD')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${paymentMethod === 'COD' ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="text-3xl mb-2">💵</div>
                                        <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                                        <p className="text-xs text-gray-400 mt-1">Pay when order arrives</p>
                                    </button>
                                    <button type="button" onClick={() => setPaymentMethod('UPI')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${paymentMethod === 'UPI' ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="text-3xl mb-2">📱</div>
                                        <p className="font-semibold text-gray-900 text-sm">UPI / Google Pay</p>
                                        <p className="text-xs text-gray-400 mt-1">Instant online payment</p>
                                    </button>
                                </div>
                            </div>

                            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>}
                            <button type="submit" disabled={loading || !address} className="btn-primary w-full text-lg py-4">
                                {loading ? 'Placing Order...' : `🎉 Place Order – ₹${total}`}
                            </button>
                        </form>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-20">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.productId} className="flex justify-between text-sm">
                                        <span className="text-gray-500 truncate flex-1 mr-2">{item.name} × {item.qty}</span>
                                        <span className="text-gray-900 font-medium">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-brand-500 text-xl">₹{total}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <span>🚴</span> Free delivery on this order
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
