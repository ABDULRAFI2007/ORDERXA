import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useMemo } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const containerStyle = { width: '100%', height: '100%', borderRadius: '12px' }

const MARKER_COLORS = {
    vendor: '#f59e0b',
    delivery: '#3b82f6',
    customer: '#10b981',
}

const MARKER_LABELS = {
    vendor: '🏪',
    delivery: '🛵',
    customer: '📍',
}

// Fallback placeholder when no API key is available
function MapFallback({ markers }) {
    return (
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center">
            <div className="text-5xl mb-3 animate-bounce">🗺️</div>
            <p className="text-sm font-semibold text-blue-700">Live Map Tracking</p>
            <p className="text-xs text-blue-500 mt-1 max-w-[220px] text-center">
                Add <code className="bg-blue-100 text-blue-700 px-1 rounded text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> to enable Google Maps
            </p>
            {markers && markers.length > 0 && (
                <div className="mt-4 space-y-1.5">
                    {markers.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-blue-600 bg-white/70 px-3 py-1.5 rounded-lg">
                            <span>{MARKER_LABELS[m.type] || '📌'}</span>
                            <span className="font-medium">{m.label}</span>
                            {m.lat && m.lng && (
                                <span className="text-blue-400 text-[10px]">({m.lat.toFixed(4)}, {m.lng.toFixed(4)})</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * LiveMap component
 * @param {Object} props
 * @param {Array} props.markers - [{lat, lng, label, type: 'vendor'|'delivery'|'customer'}]
 * @param {{lat: number, lng: number}} props.center - Map center
 * @param {number} props.zoom - Zoom level (default 14)
 * @param {string} props.className - Container className
 */
export default function LiveMap({ markers = [], center, zoom = 14, className = 'h-64' }) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY || '',
        id: 'orderxa-maps',
    })

    // Calculate center from markers if not provided
    const mapCenter = useMemo(() => {
        if (center?.lat && center?.lng) return center
        const validMarkers = markers.filter(m => m.lat && m.lng)
        if (validMarkers.length === 0) return { lat: 10.8505, lng: 76.2711 } // Default: Kerala, India
        const avgLat = validMarkers.reduce((sum, m) => sum + m.lat, 0) / validMarkers.length
        const avgLng = validMarkers.reduce((sum, m) => sum + m.lng, 0) / validMarkers.length
        return { lat: avgLat, lng: avgLng }
    }, [center, markers])

    if (!API_KEY) return <div className={className}><MapFallback markers={markers} /></div>
    if (!isLoaded) return (
        <div className={className + ' rounded-xl bg-gray-100 flex items-center justify-center'}>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className={className}>
            <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={zoom} options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                styles: [
                    { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
                    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
                ],
            }}>
                {markers.filter(m => m.lat && m.lng).map((marker, idx) => (
                    <Marker
                        key={idx}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        label={{
                            text: MARKER_LABELS[marker.type] || '📌',
                            fontSize: '20px',
                        }}
                        title={marker.label || marker.type}
                    />
                ))}
            </GoogleMap>
        </div>
    )
}
