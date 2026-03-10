import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
    const { addItem, items } = useCart()
    const cartItem = items.find(i => i.productId === product._id)

    return (
        <div className="card group hover:border-brand-500/40 transition-all duration-300 hover:shadow-brand-500/10 hover:shadow-xl flex flex-col">
            <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-100 h-44">
                {product.image ? (
                    <img src={product.image.startsWith('/') ? `http://localhost:5000${product.image}` : product.image}
                        alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                )}
                {!product.isAvailable && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-gray-700 font-semibold">Unavailable</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`badge text-xs ${product.category === 'Food' ? 'bg-orange-500/90 text-white' : product.category === 'Snacks' ? 'bg-yellow-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
                        {product.category}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>
                {product.vendorId?.shopName && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>🏪</span> {product.vendorId.shopName}
                    </p>
                )}
                {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xl font-bold text-brand-500">₹{product.price}</span>
                {product.isAvailable ? (
                    cartItem ? (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            In Cart ({cartItem.qty})
                        </span>
                    ) : (
                        <button onClick={() => addItem(product)} className="btn-primary text-sm py-2 px-4">
                            Add to Cart
                        </button>
                    )
                ) : (
                    <span className="text-gray-400 text-sm">Not available</span>
                )}
            </div>
        </div>
    )
}
