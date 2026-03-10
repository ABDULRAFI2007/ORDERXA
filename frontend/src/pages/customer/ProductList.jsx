import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import ProductCard from '../../components/ProductCard'
import api from '../../api/axios'

const CATEGORIES = ['All', 'Food', 'Snacks', 'Beverages']

export default function ProductList() {
    const [params] = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState(params.get('category') || 'All')

    const fetchProducts = async (q = '') => {
        setLoading(true)
        try {
            const p = new URLSearchParams()
            if (category && category !== 'All') p.set('category', category)
            if (q) p.set('search', q)
            if (params.get('vendorId')) p.set('vendorId', params.get('vendorId'))
            const res = await api.get(`/api/products?${p}`)
            setProducts(res.data)
        } catch (e) { } finally { setLoading(false) }
    }

    useEffect(() => { fetchProducts(search) }, [category, params.get('vendorId')])

    const handleSearch = (e) => { e.preventDefault(); fetchProducts(search) }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Browse Menu</h1>
                    <p className="text-gray-500">Find your favourite food from local shops</p>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                    <input className="input-field flex-1" placeholder="Search for biryani, dosa, burger..." value={search} onChange={e => setSearch(e.target.value)} />
                    <button type="submit" className="btn-primary px-6">🔍 Search</button>
                </form>

                {/* Category tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${category === c ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}>
                            {c === 'All' ? '🍱 All' : c === 'Food' ? '🍽️ Food' : c === 'Snacks' ? '🧆 Snacks' : '☕ Beverages'}
                        </button>
                    ))}
                </div>

                {/* Products grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="card h-72 animate-pulse bg-gray-100" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-6xl mb-4">🍳</div>
                        <p className="text-xl font-medium mb-2">No items found</p>
                        <p className="text-sm">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
