import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('orderxa_cart')) || []
        } catch { return [] }
    })

    useEffect(() => {
        localStorage.setItem('orderxa_cart', JSON.stringify(items))
    }, [items])

    const addItem = (product, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === product._id)
            if (existing) {
                return prev.map(i => i.productId === product._id ? { ...i, qty: i.qty + qty } : i)
            }
            return [...prev, {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                vendorId: product.vendorId?._id || product.vendorId,
                vendorName: product.vendorId?.shopName || '',
                qty,
            }]
        })
    }

    const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId))

    const updateQty = (productId, qty) => {
        if (qty < 1) return removeItem(productId)
        setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i))
    }

    const clearCart = () => setItems([])

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const count = items.reduce((sum, i) => sum + i.qty, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
