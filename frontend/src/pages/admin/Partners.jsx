import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function AdminPartners() {
    const [partners, setPartners] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const load = () => api.get('/api/admin/partners').then(r => setPartners(r.data)).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [])

    const verifyPartner = async (id, isVerified) => {
        try { await api.put(`/api/admin/partners/${id}/verify`, { isVerified }); load() }
        catch (e) { alert('Failed to update') }
    }

    const toggle = async (id, isActive) => {
        try { await api.put(`/api/admin/accounts/delivery/${id}/deactivate`, { isActive: !isActive }); load() }
        catch (e) { alert('Failed to update') }
    }

    const filtered = partners.filter(p => filter === 'all' || (filter === 'pending' && !p.isVerified) || (filter === 'verified' && p.isVerified))

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Delivery Partners 🛵</h1>

                <div className="flex gap-2 mb-6">
                    {[['all', 'All'], ['pending', 'Pending Verification'], ['verified', 'Verified']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilter(val)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === val ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? <div className="card h-40 animate-pulse bg-gray-100" /> : (
                    <div className="space-y-3">
                        {filtered.map(p => (
                            <div key={p._id} className="card flex flex-wrap gap-4 items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl">🛵</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900">{p.fullName}</p>
                                            <span className={`badge text-xs ${p.isVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'} border`}>
                                                {p.isVerified ? '✓ Verified' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">📞 {p.phone} • {p.district}</p>
                                        <p className="text-xs text-gray-400">{p.vehicleType} • {p.vehicleNumber}</p>
                                        <p className="text-xs text-gray-400">Aadhar: {p.aadharNumber?.slice(0, 4)}...{p.aadharNumber?.slice(-4)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {!p.isVerified && (
                                        <div className="flex gap-2">
                                            <button onClick={() => verifyPartner(p._id, true)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors">
                                                ✅ Verify
                                            </button>
                                            <button onClick={() => toggle(p._id, p.isActive)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {p.isVerified && (
                                        <button onClick={() => toggle(p._id, p.isActive)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${p.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}>
                                            {p.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-5xl mb-3">📭</div><p>No delivery partners found</p></div>}
                    </div>
                )}
            </div>
        </div>
    )
}
