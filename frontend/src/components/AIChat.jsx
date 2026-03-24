import { useState, useRef, useEffect } from 'react'

const RESPONSES = [
    // Greetings
    { k: ['hello', 'hi', 'hey', 'hola', 'howdy', 'sup'], r: 'Hello! 👋 Welcome to ORDERXA! I can help you with orders, tracking, payments, delivery, and more. What do you need?' },
    { k: ['good morning', 'good evening', 'good afternoon'], r: "Hello there! 😊 Hope you're having a great day! How can I help you with ORDERXA today?" },

    // Orders
    { k: ['place order', 'how to order', 'how do i order', 'make order'], r: 'To place an order:\n1. Browse shops on the Home page\n2. Add items to your cart 🛒\n3. Choose delivery address\n4. Select payment method (COD or UPI)\n5. Confirm your order! 🎉' },
    { k: ['track', 'tracking', 'where is my order', 'order status'], r: 'Track your order in **My Orders** → tap any active order → "Track Order". You\'ll see live status updates from the vendor and delivery partner! 📍' },
    { k: ['cancel', 'cancell', 'cancel order'], r: 'Orders can only be cancelled **before the vendor starts preparing**. Go to My Orders → select order → Cancel. Once status is "Preparing", contact the vendor directly.' },
    { k: ['order not received', 'order missing', 'did not get', 'not delivered'], r: 'Sorry to hear that! 😔 Please:\n1. Check "My Orders" for the latest status\n2. Contact the delivery partner\n3. Email support@orderxa.com with your Order ID' },
    { k: ['order rejected', 'vendor rejected'], r: 'If your order was rejected, the vendor was likely unavailable or out of stock. A refund (for UPI) will be processed within 3–5 business days. You can re-order from another shop! 🔄' },
    { k: ['how long', 'delivery time', 'eta', 'estimated time', 'when will'], r: 'Estimated delivery time is **30–60 minutes** depending on the shop and your distance. Track live progress on the Order Tracking page! 🛵' },

    // Payment
    { k: ['pay', 'payment', 'upi', 'gpay', 'phonepe', 'paytm'], r: 'We support:\n• **UPI** – Google Pay, PhonePe, Paytm etc. (instant confirmation)\n• **Cash on Delivery (COD)** – pay when delivered 💵\n\nSelect your preferred method at checkout!' },
    { k: ['cod', 'cash on delivery'], r: 'Yes! Cash on Delivery is available ✅. Select COD at checkout and pay the delivery partner when your order arrives.' },
    { k: ['failed payment', 'payment failed', 'payment not working'], r: 'If payment failed:\n1. Check your UPI app for pending requests\n2. Try a different UPI app\n3. Switch to Cash on Delivery\n4. Contact support if money was deducted but order failed.' },
    { k: ['refund', 'return', 'money back', 'reimbursement'], r: 'Refunds for UPI payments are processed within **3–5 business days** to the original payment method. Email support@orderxa.com with your Order ID to raise a refund request.' },

    // Account / Auth
    { k: ['login', 'sign in', 'signin'], r: 'To login:\n• **Customer** – Email+Password, Mobile OTP, or Google\n• **Vendor** – Phone/Email + OTP\n• **Delivery Partner** – Phone + OTP\n\nVisit the Login page and select your role! 🔐' },
    { k: ['signup', 'register', 'create account', 'new account'], r: 'Sign up is quick!\n1. Go to the Login page → "Register"\n2. Choose your role (Customer / Vendor / Delivery)\n3. Verify via OTP\n4. Fill in your details — done! 🎉' },
    { k: ['otp', 'otp not received', 'didnt get otp', 'resend otp', 'verification code'], r: 'If you did not receive OTP:\n1. Wait 30 seconds and tap "Resend"\n2. Check your SMS inbox and spam folder\n3. Make sure the phone number/email is correct\n4. Contact support@orderxa.com if issue persists.' },
    { k: ['forgot password', 'reset password', 'change password'], r: 'Use "Login with OTP" on the login page with your registered phone/email to get back into your account without a password! 📱' },
    { k: ['google login', 'google signin', 'login with google'], r: 'Yes! Sign in with Google 🔵 is supported. Click "Continue with Google" on the login page. Available for Customer accounts.' },
    { k: ['delete account', 'deactivate account', 'remove account'], r: 'To deactivate your account, email support@orderxa.com with your registered phone/email. We can also reactivate it anytime you want!' },

    // Vendors / Shops
    { k: ['shop', 'vendor', 'restaurant', 'store', 'browse', 'food', 'snack', 'beverage'], r: 'Browse shops on the **Home** or **Products** page! Filter by:\n• Category (Food 🍱, Snacks 🍟, Beverages ☕)\n• District / Location\n• Search by name or dish' },
    { k: ['vendor registration', 'open shop', 'become vendor', 'register shop'], r: 'Open your shop on ORDERXA:\n1. Login page → Register as Vendor\n2. Enter shop details and verify via OTP\n3. Add products and set opening hours\n4. Start receiving orders! 🏪' },
    { k: ['shop closed', 'vendor offline', 'shop not open', 'closed'], r: 'If a shop shows as closed, the vendor has set their status to Offline or it is outside their operating hours. Try another shop or check back later! ⏰' },

    // Delivery
    { k: ['delivery partner', 'become delivery', 'delivery job', 'delivery registration', 'join delivery'], r: 'Join as a Delivery Partner:\n1. Register as "Delivery Partner" on the Login page\n2. Submit Aadhar, vehicle details, verify OTP\n3. Once admin-verified, start accepting deliveries! 🏍️' },
    { k: ['delivery charge', 'delivery fee', 'shipping cost'], r: 'Delivery charges depend on the vendor and your location. The exact fee is shown at checkout before you confirm. 💰' },
    { k: ['delivery area', 'do you deliver', 'which area', 'district'], r: 'ORDERXA delivers within supported districts. If vendors appear on the Home page near you, we deliver there! 📍' },

    // Products
    { k: ['menu', 'what can i order', 'list of items'], r: 'Browse all products on the **Products** page. Filter by Food 🍱, Snacks 🍟, or Beverages ☕, or search for a specific dish!' },
    { k: ['price', 'how much', 'cost', 'rate'], r: 'Product prices are shown in Indian Rupees (₹) on each listing. Total including delivery fee is shown clearly at checkout.' },
    { k: ['out of stock', 'unavailable', 'not available', 'item not found'], r: 'If an item is unavailable, it will not show in listings. Try a similar item from the same shop or browse other vendors!' },

    // Technical
    { k: ['not working', 'error', 'bug', 'issue', 'problem', 'crash', 'broken'], r: 'Sorry for the trouble! 😔 Try:\n1. Refresh the page\n2. Clear browser cache\n3. Try a different browser\n4. Email support@orderxa.com with details.' },
    { k: ['slow', 'loading', 'not loading', 'stuck'], r: 'If the app is slow:\n1. Check your internet connection\n2. Refresh the page\n3. If it persists, email support@orderxa.com' },

    // Support
    { k: ['contact', 'support', 'email', 'help desk', 'customer care'], r: 'Reach us at:\n📧 support@orderxa.com\n\nWe typically respond within 24 hours on business days!' },

    // Politeness
    { k: ['thank', 'thanks', 'thank you', 'thx', 'ty'], r: "You're welcome! 😊 Happy eating with ORDERXA! Anything else I can help with?" },
    { k: ['bye', 'goodbye', 'see you', 'later', 'cya'], r: 'Goodbye! 👋 Come back anytime. Happy ordering! 🍱' },
    { k: ['help', 'assist', 'what can you do'], r: 'I can help with:\n• Placing & tracking orders 📦\n• Payments & refunds 💳\n• Account & OTP issues 🔐\n• Vendor & delivery info 🏪\n• Technical problems 🔧\n\nJust type your question!' },
]

const QUICK_REPLIES = [
    'Track my order 📍',
    'Payment methods 💳',
    'How to register?',
    'Delivery time ⏱️',
    'Refund policy 💰',
]

const getReply = (msg) => {
    const lower = msg.toLowerCase().trim()
    for (const { k, r } of RESPONSES) {
        if (k.some(word => lower.includes(word))) return r
    }
    const words = lower.split(/\s+/)
    for (const { k, r } of RESPONSES) {
        if (k.some(kw => words.some(w => kw.includes(w) && w.length > 3))) return r
    }
    return "I'm not sure about that. 🤔 Try:\n• Rephrasing your question\n• Typing \"help\" to see topics I cover\n• Emailing support@orderxa.com for direct help!"
}

const formatText = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/)
        return (
            <span key={i}>
                {parts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                )}
                {i < lines.length - 1 && <br />}
            </span>
        )
    })
}

export default function AIChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! I'm the ORDERXA Assistant 🤖\n\nI can help with orders, tracking, payments, delivery and more. How can I help you today?" }
    ])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const bottomRef = useRef()

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }, [messages, open, typing])

    const send = (text) => {
        const msg = text || input
        if (!msg.trim()) return
        setMessages(m => [...m, { role: 'user', text: msg }])
        setInput('')
        setTyping(true)
        setTimeout(() => {
            setMessages(m => [...m, { role: 'bot', text: getReply(msg) }])
            setTyping(false)
        }, 700)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {open && (
                <div className="mb-4 w-80 sm:w-96 glass-card p-0 overflow-hidden animate-slide-up shadow-2xl border border-brand-500/30 flex flex-col" style={{ maxHeight: '520px' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                            <div>
                                <p className="font-bold text-white text-sm">ORDERXA Assistant</p>
                                <p className="text-xs text-brand-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                                    Online – Always here to help
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900" style={{ minHeight: 0 }}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'bot' && (
                                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs mr-2 shrink-0 mt-1">🤖</div>
                                )}
                                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}>
                                    {formatText(m.text)}
                                </div>
                            </div>
                        ))}
                        {typing && (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs shrink-0">🤖</div>
                                <div className="bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick replies — show only at the start */}
                    {messages.length <= 2 && !typing && (
                        <div className="px-3 py-2 bg-gray-900 border-t border-gray-800 flex flex-wrap gap-1.5">
                            {QUICK_REPLIES.map(q => (
                                <button key={q} onClick={() => send(q)}
                                    className="text-xs bg-gray-800 hover:bg-brand-600 text-gray-300 hover:text-white px-2.5 py-1 rounded-full border border-gray-700 hover:border-brand-500 transition-all duration-150">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2 shrink-0">
                        <input className="input-field flex-1 py-2 text-sm" placeholder="Ask me anything..."
                            value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()} />
                        <button onClick={() => send()} className="btn-primary px-4 py-2 text-sm">Send</button>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button onClick={() => setOpen(!open)}
                className="w-14 h-14 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 hover:shadow-brand-500/60 transition-all duration-200 hover:scale-110 active:scale-95 relative">
                <span className="text-2xl">{open ? '✕' : '🤖'}</span>
                {!open && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></span>
                )}
            </button>
        </div>
    )
}
