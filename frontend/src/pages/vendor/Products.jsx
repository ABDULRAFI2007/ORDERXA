import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const CATEGORIES = ['Food', 'Snacks', 'Beverages']
const SUB_CATS = {
    Food: ['Rice Dishes', 'Tiffin', 'Meals', 'Fast Food', 'Non-Veg'],
    Snacks: ['Samosa', 'Vada', 'Bajji', 'Pakoda', 'Chips', 'Murukku', 'Biscuits'],
    Beverages: ['Tea', 'Coffee', 'Fruit Juice', 'Milkshake', 'Soft Drinks'],
}
const EMPTY_FORM = { name: '', category: 'Food', subCategory: 'Rice Dishes', price: '', description: '', isAvailable: true, image: null }

export default function VendorProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const load = () => api.get('/api/vendor/products').then(r => setProducts(r.data)).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); setError('') }
    const openEdit = (p) => {
        setForm({ name: p.name, category: p.category, subCategory: p.subCategory, price: p.price, description: p.description, isAvailable: p.isAvailable, image: null })
        setEditingId(p._id); setShowModal(true); setError('')
    }

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError('')
        try {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => { if (v !== null && k !== 'image') fd.append(k, v) })
            if (form.image) fd.append('image', form.image)
            if (editingId) await api.put(`/api/vendor/products/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            else await api.post('/api/vendor/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            setShowModal(false); load()
        } catch (e) { setError(e.response?.data?.message || 'Failed to save product') }
        setSaving(false)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return
        await api.delete(`/api/vendor/products/${id}`)
        load()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-gray-900">My Products 🧆</h1>
                    <button onClick={openAdd} className="btn-primary">+ Add Product</button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="card h-60 animate-pulse bg-gray-100" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="text-5xl mb-3">🍽️</div>
                        <p className="text-lg font-medium mb-2">No products yet</p>
                        <button onClick={openAdd} className="btn-primary mt-2">Add your first product</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(p => (
                            <div key={p._id} className="card group hover:border-brand-500/30 transition-all duration-300">
                                <div className="relative h-40 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                                    {p.image ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>}
                                    <span className={`absolute top-2 right-2 badge ${p.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {p.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900">{p.name}</h3>
                                <p className="text-xs text-gray-500">{p.category} • {p.subCategory}</p>
                                <p className="text-brand-500 font-bold text-lg mt-1">₹{p.price}</p>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => openEdit(p)} className="btn-secondary flex-1 text-sm py-2">✏️ Edit</button>
                                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-50">🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-xl">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
                        </div>
                        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>}
                        <form onSubmit={handleSave} className="space-y-4">
                            <div><label className="label">Product Name</label><input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Chicken Biryani" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Category</label>
                                    <select className="input-field" value={form.category} onChange={e => { set('category', e.target.value); set('subCategory', SUB_CATS[e.target.value][0]) }}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Sub Category</label>
                                    <select className="input-field" value={form.subCategory} onChange={e => set('subCategory', e.target.value)}>
                                        {(SUB_CATS[form.category] || []).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div><label className="label">Price (₹)</label><input className="input-field" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} required /></div>
                            <div><label className="label">Description</label><textarea className="input-field resize-none h-16" value={form.description} onChange={e => set('description', e.target.value)} /></div>
                            <div>
                                <label className="label">Product Image</label>
                                <input type="file" accept="image/*" className="input-field text-gray-500" onChange={e => set('image', e.target.files[0])} />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} className="w-4 h-4 accent-brand-500" />
                                <label htmlFor="avail" className="text-gray-700 text-sm">Available for order</label>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
