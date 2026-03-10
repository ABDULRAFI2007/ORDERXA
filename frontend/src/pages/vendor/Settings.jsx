import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const CATEGORIES = ['Food', 'Snacks', 'Beverages', 'Mixed']

export default function VendorSettings() {
    const [form, setForm] = useState({ openingTime: '09:00', closingTime: '22:00', isOpen: true, category: 'Mixed', shopAddress: '', lat: '', lng: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/api/vendor/profile').then(r => {
            const v = r.data
            setForm({ openingTime: v.openingTime || '09:00', closingTime: v.closingTime || '22:00', isOpen: v.isOpen, category: v.category || 'Mixed', shopAddress: v.shopAddress || '', lat: v.location?.lat || '', lng: v.location?.lng || '' })
        }).catch(() => { }).finally(() => setLoading(false))
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError(''); setSuccess('')
        try {
            await api.put('/api/vendor/settings', {
                openingTime: form.openingTime, closingTime: form.closingTime, isOpen: form.isOpen,
                category: form.category, shopAddress: form.shopAddress,
                location: { lat: parseFloat(form.lat) || 0, lng: parseFloat(form.lng) || 0 },
            })
            setSuccess('Settings saved successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (e) { setError(e.response?.data?.message || 'Failed to save settings') }
        setSaving(false)
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8">Shop Settings ⚙️</h1>

                {success && <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-green-700">{success}</div>}
                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-red-600">{error}</div>}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4">Shop Status</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-900 font-medium">Shop Open / Closed</p>
                                <p className="text-gray-500 text-sm">Toggle to control your shop availability</p>
                            </div>
                            <button type="button" onClick={() => set('isOpen', !form.isOpen)}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${form.isOpen ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.isOpen ? 'left-8' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4">Operating Hours</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Opening Time</label><input className="input-field" type="time" value={form.openingTime} onChange={e => set('openingTime', e.target.value)} /></div>
                            <div><label className="label">Closing Time</label><input className="input-field" type="time" value={form.closingTime} onChange={e => set('closingTime', e.target.value)} /></div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4">Shop Category & Location</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Category</label>
                                <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><label className="label">Shop Address</label><textarea className="input-field resize-none h-20" value={form.shopAddress} onChange={e => set('shopAddress', e.target.value)} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="label">Latitude</label><input className="input-field" type="number" step="any" placeholder="e.g. 13.0827" value={form.lat} onChange={e => set('lat', e.target.value)} /></div>
                                <div><label className="label">Longitude</label><input className="input-field" type="number" step="any" placeholder="e.g. 80.2707" value={form.lng} onChange={e => set('lng', e.target.value)} /></div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary w-full py-4">
                        {saving ? 'Saving...' : '💾 Save Settings'}
                    </button>
                </form>
            </div>
        </div>
    )
}
