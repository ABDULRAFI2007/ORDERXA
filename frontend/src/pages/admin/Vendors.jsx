import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function AdminVendors() {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const load = () => api.get('/api/admin/vendors').then(r => setVendors(r.data)).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [])

    const toggle = async (id, isActive) => {
        try { await api.put(`/api/admin/accounts/vendor/${id}/deactivate`, { isActive: !isActive }); load() }
        catch (e) { alert('Failed to update') }
    }

    const filtered = vendors.filter(v => !search || v.shopName?.toLowerCase().includes(search.toLowerCase()) || v.ownerName?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Manage Vendors 🏪</h1>
                <input className="input-field mb-6 max-w-sm" placeholder="Search shops..." value={search} onChange={e => setSearch(e.target.value)} />

                {loading ? <div className="card h-40 animate-pulse bg-gray-100" /> : (
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    {['Shop Name', 'Owner', 'District', 'Category', 'Status', 'Joined', 'Action'].map(h => (
                                        <th key={h} className="pb-3 pr-4 text-gray-500 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(v => (
                                    <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pr-4 text-gray-900 font-medium">{v.shopName}</td>
                                        <td className="py-3 pr-4 text-gray-500">{v.ownerName}</td>
                                        <td className="py-3 pr-4 text-gray-500">{v.district}</td>
                                        <td className="py-3 pr-4 text-gray-500">{v.category}</td>
                                        <td className="py-3 pr-4">
                                            <span className={`badge ${v.isOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'} border`}>{v.isOpen ? 'Open' : 'Closed'}</span>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(v.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="py-3">
                                            <button onClick={() => toggle(v._id, v.isActive)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${v.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}>
                                                {v.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="text-center py-8 text-gray-400">No vendors found</div>}
                    </div>
                )}
            </div>
        </div>
    )
}
