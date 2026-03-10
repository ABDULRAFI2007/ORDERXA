import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Auth
import Login from './pages/auth/Login'
import CustomerSignup from './pages/auth/CustomerSignup'
import VendorSignup from './pages/auth/VendorSignup'
import DeliverySignup from './pages/auth/DeliverySignup'
import AuthCallback from './pages/auth/AuthCallback'

// Customer
import CustomerHome from './pages/customer/Home'
import ProductList from './pages/customer/ProductList'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import OrderHistory from './pages/customer/OrderHistory'
import OrderTracking from './pages/customer/OrderTracking'

// Vendor
import VendorDashboard from './pages/vendor/Dashboard'
import VendorProducts from './pages/vendor/Products'
import VendorOrders from './pages/vendor/Orders'
import VendorSettings from './pages/vendor/Settings'

// Delivery
import DeliveryDashboard from './pages/delivery/Dashboard'
import DeliveryOrderDetail from './pages/delivery/OrderDetail'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminVendors from './pages/admin/Vendors'
import AdminPartners from './pages/admin/Partners'
import AdminOrders from './pages/admin/Orders'
import AdminAnalytics from './pages/admin/Analytics'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />
    return children
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/customer" element={<CustomerSignup />} />
            <Route path="/signup/vendor" element={<VendorSignup />} />
            <Route path="/signup/delivery" element={<DeliverySignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Customer */}
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><CustomerHome /></ProtectedRoute>} />
            <Route path="/customer/products" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><ProductList /></ProtectedRoute>} />
            <Route path="/customer/cart" element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
            <Route path="/customer/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
            <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['customer']}><OrderHistory /></ProtectedRoute>} />
            <Route path="/customer/orders/:id/track" element={<ProtectedRoute allowedRoles={['customer']}><OrderTracking /></ProtectedRoute>} />

            {/* Vendor */}
            <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
            <Route path="/vendor/products" element={<ProtectedRoute allowedRoles={['vendor']}><VendorProducts /></ProtectedRoute>} />
            <Route path="/vendor/orders" element={<ProtectedRoute allowedRoles={['vendor']}><VendorOrders /></ProtectedRoute>} />
            <Route path="/vendor/settings" element={<ProtectedRoute allowedRoles={['vendor']}><VendorSettings /></ProtectedRoute>} />

            {/* Delivery */}
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>} />
            <Route path="/delivery/orders/:id" element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryOrderDetail /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/vendors" element={<ProtectedRoute allowedRoles={['admin']}><AdminVendors /></ProtectedRoute>} />
            <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['admin']}><AdminPartners /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
