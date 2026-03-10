export default function StatusBadge({ status }) {
    const map = {
        'Placed': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        'Accepted': 'bg-green-500/20 text-green-400 border border-green-500/30',
        'Rejected': 'bg-red-500/20 text-red-400 border border-red-500/30',
        'Preparing': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        'Ready': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        'Picked Up': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
        'Out for Delivery': 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
        'Delivered': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        'Pending': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
        'Paid': 'bg-green-500/20 text-green-400 border border-green-500/30',
        'Failed': 'bg-red-500/20 text-red-400 border border-red-500/30',
        'Open': 'bg-green-500/20 text-green-400 border border-green-500/30',
        'Closed': 'bg-red-500/20 text-red-400 border border-red-500/30',
    }
    const cls = map[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    return <span className={`badge ${cls}`}>{status}</span>
}
