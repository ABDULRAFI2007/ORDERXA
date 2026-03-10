import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import AIChat from '../../components/AIChat'
import api from '../../api/axios'

const CATEGORIES = [
    { id: 'Rice-Dishes', label: 'Rice Dishes', icon: '🍚' },
    { id: 'Tiffin', label: 'Tiffin', icon: '🥘' },
    { id: 'Meals', label: 'Meals', icon: '🍽️' },
    { id: 'Fast-Food', label: 'Fast Food', icon: '🍔' },
    { id: 'Non-Veg', label: 'Non-Veg', icon: '🍗' },
    { id: 'Snacks', label: 'Snacks', icon: '🧆' },
    { id: 'Beverages', label: 'Beverages', icon: '☕' },
]

export default function CustomerHome() {
    const { user } = useAuth()
    const [vendors, setVendors] = useState([])
    const [loadingVendors, setLoadingVendors] = useState(true)

    useEffect(() => {
        api.get('/api/products/vendors/list').then(r => setVendors(r.data)).catch(() => { }).finally(() => setLoadingVendors(false))
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
                    <div className="text-center animate-slide-up">
                        <p className="text-brand-500 font-semibold text-sm uppercase mb-3">Welcome back, {user?.name || 'Foodie'}! 👋</p>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
                            Delicious Food,<br />
                            <span className="gradient-text">Delivered Fast</span>
                        </h1>
                        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">Order from hundreds of restaurants and shops. Fresh food delivered to your doorstep.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/customer/products" className="btn-primary text-lg px-8 py-4">🍱 Browse Menu</Link>
                            <Link to="/customer/orders" className="btn-secondary text-lg px-8 py-4">📦 My Orders</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Categories */}
                <div className="mb-12">
                    <h2 className="section-title">Browse by Category</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
                        {CATEGORIES.map(cat => (
                            <Link key={cat.id} to={`/customer/products?subCategory=${cat.id}`}
                                className="card text-center p-4 hover:border-brand-500/50 hover:shadow-brand-500/10 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                                <p className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors font-medium">{cat.label}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Shops/Vendors */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-title mb-0">Shops Near You</h2>
                        <Link to="/customer/products" className="text-brand-500 hover:text-brand-600 text-sm font-medium">View all →</Link>
                    </div>

                    {loadingVendors ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="card h-44 animate-pulse bg-gray-100" />)}
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-5xl mb-3">🏪</div>
                            <p>No shops available yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vendors.map(vendor => (
                                <Link key={vendor._id} to={`/customer/products?vendorId=${vendor._id}`}
                                    className="card group hover:border-brand-500/50 transition-all duration-300 hover:shadow-brand-500/10 hover:shadow-xl">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">🏪</div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{vendor.shopName}</h3>
                                            <p className="text-sm text-gray-500">{vendor.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 text-gray-500">
                                            <span>📍</span> {vendor.district}
                                        </span>
                                        <span className={`badge ${vendor.isOpen ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                                            {vendor.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">⏰ {vendor.openingTime} - {vendor.closingTime}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <AIChat />
        </div>
    )
}
