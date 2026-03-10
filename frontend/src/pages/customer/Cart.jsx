import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'

export default function Cart() {
    const { items, updateQty, removeItem, clearCart, total } = useCart()

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                    <div className="text-7xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add some delicious food to get started</p>
                    <Link to="/customer/products" className="btn-primary">Browse Menu</Link>
                </div>
            </div>
        )
    }

    const byVendor = items.reduce((acc, item) => {
        const vid = item.vendorId || 'unknown'
        if (!acc[vid]) acc[vid] = { vendorName: item.vendorName, items: [] }
        acc[vid].items.push(item)
        return acc
    }, {})

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Your Cart 🛒</h1>
                    <button onClick={clearCart} className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
                        🗑 Clear Cart
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Cart items */}
                    <div className="lg:col-span-2 space-y-6">
                        {Object.entries(byVendor).map(([vid, group]) => (
                            <div key={vid} className="card">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                    <span className="text-lg">🏪</span>
                                    <h3 className="font-semibold text-gray-900">{group.vendorName || 'Shop'}</h3>
                                </div>
                                <div className="space-y-3">
                                    {group.items.map(item => (
                                        <div key={item.productId} className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.image ? <img src={item.image.startsWith('/') ? `http://localhost:5000${item.image}` : item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    : <span className="text-xl">🍽️</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                <p className="text-brand-500 text-sm font-semibold">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQty(item.productId, item.qty - 1)}
                                                    className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold transition-colors">−</button>
                                                <span className="w-6 text-center font-semibold text-gray-900">{item.qty}</span>
                                                <button onClick={() => updateQty(item.productId, item.qty + 1)}
                                                    className="w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center text-white font-bold transition-colors">+</button>
                                            </div>
                                            <div className="w-16 text-right">
                                                <p className="font-bold text-gray-900">₹{item.price * item.qty}</p>
                                            </div>
                                            <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-20">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4">
                                {items.map(item => (
                                    <div key={item.productId} className="flex justify-between text-sm text-gray-500">
                                        <span className="truncate flex-1 mr-2">{item.name} × {item.qty}</span>
                                        <span className="text-gray-900 font-medium">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-4 mb-6">
                                <div className="flex justify-between font-bold text-gray-900 text-lg">
                                    <span>Total</span>
                                    <span className="text-brand-500">₹{total}</span>
                                </div>
                            </div>
                            <Link to="/customer/checkout" className="btn-primary w-full text-center block">
                                Proceed to Checkout →
                            </Link>
                            <Link to="/customer/products" className="btn-secondary w-full text-center block mt-3 text-sm">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
