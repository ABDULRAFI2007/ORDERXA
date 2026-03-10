import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function AdminAnalytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/admin/analytics').then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

    const STATUS_COLORS = {
        'Placed': 'bg-blue-500', 'Accepted': 'bg-green-500', 'Preparing': 'bg-yellow-500', 'Ready': 'bg-purple-500',
        'Picked Up': 'bg-orange-500', 'Out for Delivery': 'bg-brand-500', 'Delivered': 'bg-emerald-500', 'Rejected': 'bg-red-500',
    }

    const totalByStatus = data?.ordersByStatus?.reduce((s, x) => s + x.count, 0) || 1

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Platform Analytics 📊</h1>

                {/* Key metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Orders', value: data?.totalOrders || 0, icon: '📦', color: 'text-blue-600' },
                        { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toFixed(0)}`, icon: '💰', color: 'text-brand-500' },
                        { label: 'Customers', value: data?.totalCustomers || 0, icon: '👤', color: 'text-green-600' },
                        { label: 'Vendors', value: data?.totalVendors || 0, icon: '🏪', color: 'text-purple-600' },
                    ].map(s => (
                        <div key={s.label} className="card">
                            <div className="text-2xl mb-2">{s.icon}</div>
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Order status breakdown */}
                <div className="card mb-8">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Orders by Status</h3>
                    <div className="space-y-3">
                        {(data?.ordersByStatus || []).map(({ _id: status, count }) => (
                            <div key={status} className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 w-32 flex-shrink-0">{status}</span>
                                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${STATUS_COLORS[status] || 'bg-gray-400'} transition-all duration-500`}
                                        style={{ width: `${Math.round((count / totalByStatus) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-gray-900 font-bold text-sm w-12 text-right">{count}</span>
                                <span className="text-gray-400 text-xs w-10">{Math.round((count / totalByStatus) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Partner stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-3">Delivery Partners</h3>
                        <p className="text-3xl font-black text-brand-500">{data?.totalPartners || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Total Partners</p>
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-700 text-sm font-medium">⏳ {data?.pendingPartners || 0} pending verification</p>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-3">Revenue Overview</h3>
                        <p className="text-3xl font-black text-green-600">₹{(data?.totalRevenue || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-1">Total platform revenue</p>
                        <p className="text-xs text-gray-400 mt-3">
                            Avg per order: ₹{data?.totalOrders ? ((data.totalRevenue || 0) / data.totalOrders).toFixed(2) : '0'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
