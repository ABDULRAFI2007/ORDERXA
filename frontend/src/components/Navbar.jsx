import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function Navbar() {
    const { user, role, logout } = useAuth()
    const { count } = useCart()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => { logout(); navigate('/login') }

    const navLinks = {
        customer: [
            { to: '/customer', label: 'Home' },
            { to: '/customer/products', label: 'Browse' },
            { to: '/customer/orders', label: 'My Orders' },
        ],
        vendor: [
            { to: '/vendor', label: 'Dashboard' },
            { to: '/vendor/products', label: 'Products' },
            { to: '/vendor/orders', label: 'Orders' },
            { to: '/vendor/settings', label: 'Settings' },
        ],
        delivery: [
            { to: '/delivery', label: 'Dashboard' },
        ],
        admin: [
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/users', label: 'Users' },
            { to: '/admin/vendors', label: 'Vendors' },
            { to: '/admin/partners', label: 'Partners' },
            { to: '/admin/orders', label: 'Orders' },
            { to: '/admin/analytics', label: 'Analytics' },
        ],
    }

    const links = role ? navLinks[role] || [] : []

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={role ? `/${role}` : '/login'} className="flex items-center gap-2">
                        <span className="text-2xl">🍱</span>
                        <span className="text-xl font-black gradient-text">ORDERXA</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(l => (
                            <Link key={l.to} to={l.to} className="nav-link px-4 py-2 rounded-lg hover:bg-gray-100">{l.label}</Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {role === 'customer' && (
                            <Link to="/customer/cart" className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex items-center gap-2">
                                    <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {(user.name || user.fullName || user.shopName || 'U')[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-700">{user.name || user.fullName || user.shopName}</span>
                                </div>
                                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary text-sm py-2 px-4">Login</Link>
                        )}

                        {/* Mobile hamburger */}
                        <button className="md:hidden p-2 text-gray-500 hover:text-gray-900" onClick={() => setMenuOpen(!menuOpen)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 space-y-1 border-t border-gray-100 mt-2 pt-2">
                        {links.map(l => (
                            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">{l.label}</Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
