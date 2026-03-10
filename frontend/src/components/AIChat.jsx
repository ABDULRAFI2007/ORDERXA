import { useState, useRef, useEffect } from 'react'

const RESPONSES = [
    { k: ['hello', 'hi', 'hey'], r: 'Hello! 👋 Welcome to ORDERXA! How can I help you today?' },
    { k: ['order', 'track', 'tracking'], r: 'You can track your orders in **My Orders** section. Click "Track Order" next to any active order! 📍' },
    { k: ['pay', 'payment', 'upi', 'gpay', 'cash'], r: 'We support Cash on Delivery 💵 and UPI payments via Google Pay 📱. Select your preferred method at checkout.' },
    { k: ['cancel', 'cancell'], r: 'To cancel an order, please contact the shop owner or wait for the vendor to update the status. Orders can only be cancelled before preparation.' },
    { k: ['deliver', 'delivery', 'time'], r: 'Delivery time depends on the shop and your location. Estimated delivery is usually 30-60 minutes. You can track real-time on the tracking page! 🛵' },
    { k: ['shop', 'vendor', 'restaurant'], r: 'You can browse shops on the Home page or Products page. Filter by category or search for your favourite dishes!' },
    { k: ['login', 'signup', 'account'], r: 'Visit the Login page and select your role: Customer, Shop Owner, or Delivery Partner. You can login via Email, Mobile OTP, or Google! 🔐' },
    { k: ['refund', 'return'], r: 'For refund requests, please contact our support at support@orderxa.com. We process refunds within 3-5 business days.' },
    { k: ['thank', 'thanks'], r: 'You\'re welcome! Happy eating! 🍱 Is there anything else I can help you with?' },
]

const getReply = (msg) => {
    const lower = msg.toLowerCase()
    for (const { k, r } of RESPONSES) {
        if (k.some(word => lower.includes(word))) return r
    }
    return 'I\'m not sure about that. Please contact our support at support@orderxa.com or try asking in a different way! 😊'
}

export default function AIChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I\'m ORDERXA Assistant 🤖. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const bottomRef = useRef()

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }, [messages, open])

    const send = () => {
        if (!input.trim()) return
        const userMsg = { role: 'user', text: input }
        const botMsg = { role: 'bot', text: getReply(input) }
        setMessages(m => [...m, userMsg, botMsg])
        setInput('')
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat window */}
            {open && (
                <div className="mb-4 w-80 sm:w-96 glass-card p-0 overflow-hidden animate-slide-up shadow-2xl border border-brand-500/30">
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                            <div>
                                <p className="font-bold text-white text-sm">ORDERXA Assistant</p>
                                <p className="text-xs text-brand-100">Always here to help</p>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">✕</button>
                    </div>

                    <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-900">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
                        <input className="input-field flex-1 py-2 text-sm" placeholder="Ask me anything..."
                            value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()} />
                        <button onClick={send} className="btn-primary px-3 py-2 text-sm">Send</button>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button onClick={() => setOpen(!open)}
                className="w-14 h-14 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 hover:shadow-brand-500/60 transition-all duration-200 hover:scale-110 active:scale-95">
                <span className="text-2xl">{open ? '✕' : '🤖'}</span>
            </button>
        </div>
    )
}
