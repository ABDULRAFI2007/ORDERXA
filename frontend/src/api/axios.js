import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 15000,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('orderxa_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('orderxa_token')
            localStorage.removeItem('orderxa_user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
