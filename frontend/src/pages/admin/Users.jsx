import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const load = () => api.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [])

    const toggle = async (id, isActive) => {
        try {
            await api.put(`/api/admin/accounts/user/${id}/deactivate`, { isActive: !isActive })
            load()
        } catch (e) { alert('Failed to update') }
    }

    const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search))

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Manage Customers 👤</h1>
                <input className="input-field mb-6 max-w-sm" placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />

                {loading ? <div className="card h-40 animate-pulse bg-gray-100" /> : (
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left">
                                    <th className="pb-3 pr-4 text-gray-500 font-medium">Name</th>
                                    <th className="pb-3 pr-4 text-gray-500 font-medium">Email</th>
                                    <th className="pb-3 pr-4 text-gray-500 font-medium">Phone</th>
                                    <th className="pb-3 pr-4 text-gray-500 font-medium">District</th>
                                    <th className="pb-3 pr-4 text-gray-500 font-medium">Joined</th>
                                    <th className="pb-3 text-gray-500 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pr-4 text-gray-900 font-medium">{u.name}</td>
                                        <td className="py-3 pr-4 text-gray-500">{u.email || '–'}</td>
                                        <td className="py-3 pr-4 text-gray-500">{u.phone || '–'}</td>
                                        <td className="py-3 pr-4 text-gray-500">{u.district || '–'}</td>
                                        <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="py-3">
                                            <button onClick={() => toggle(u._id, u.isActive)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}>
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="text-center py-8 text-gray-400">No customers found</div>}
                    </div>
                )}
            </div>
        </div>
    )
}
