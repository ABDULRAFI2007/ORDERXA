import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthCallback() {
    const [params] = useSearchParams()
    const { login } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const token = params.get('token')
        const role = params.get('role')
        if (token) {
            // Decode user info from token (or fetch profile)
            const payload = JSON.parse(atob(token.split('.')[1]))
            login(token, { id: payload.id, role: role || payload.role, name: 'Google User' })
            navigate('/customer')
        } else {
            navigate('/login?error=oauth_failed')
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Completing login...</p>
            </div>
        </div>
    )
}
