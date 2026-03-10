import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('orderxa_token')
        const storedUser = localStorage.getItem('orderxa_user')
        if (storedToken && storedUser) {
            setToken(storedToken)
            const u = JSON.parse(storedUser)
            setUser(u)
            setRole(u.role)
        }
        setLoading(false)
    }, [])

    const login = (tokenVal, userData) => {
        localStorage.setItem('orderxa_token', tokenVal)
        localStorage.setItem('orderxa_user', JSON.stringify(userData))
        setToken(tokenVal)
        setUser(userData)
        setRole(userData.role)
    }

    const logout = () => {
        localStorage.removeItem('orderxa_token')
        localStorage.removeItem('orderxa_user')
        localStorage.removeItem('orderxa_cart')
        setToken(null)
        setUser(null)
        setRole(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, role, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
