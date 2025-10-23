import store from '@/store'
import client from './client'

let interceptorAuthenticate = null

// Helper function để tạo authentication interceptor
const createAuthInterceptor = (token) => {
    return client.interceptors.request.use(
        function (config) {
            config.headers.Authorization = `Bearer ${token}`
            return config
        },
        function (err) {
            return Promise.reject(err)
        }
    )
}

// Helper function để cleanup interceptor cũ
const cleanupAuthInterceptor = () => {
    if (interceptorAuthenticate !== null) {
        client.interceptors.request.eject(interceptorAuthenticate)
        interceptorAuthenticate = null
    }
}

export const initApp = () => {
    // server address
    const serverAddr = localStorage.getItem('SERVER_ADDR')
    if (serverAddr) {
        store.dispatch('setServerAddr', serverAddr)
        client.defaults.baseURL = serverAddr
    }

    // xác thực
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (userStr && token) {
        try {
            const user = JSON.parse(userStr)
            store.dispatch('setUser', user)
            store.dispatch('setToken', token)
            store.dispatch('setRole', role)
            store.dispatch('setIsAuthenticated', true)

            // Cleanup interceptor cũ trước khi tạo mới
            cleanupAuthInterceptor()
            interceptorAuthenticate = createAuthInterceptor(token)
        } catch (error) {
            console.error('Error parsing user data:', error)
            // Clear invalid data
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            store.dispatch('setIsAuthenticated', false)
        }
    } else {
        store.dispatch('setIsAuthenticated', false)
    }
}

export const afterLogin = (remember, user) => {
    const userStr = JSON.stringify(user)
    const token = user.access_token
    const role = user.role

    if (remember) {
        localStorage.setItem('user', userStr)
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
    }

    store.dispatch('setUser', user)
    store.dispatch('setToken', token)
    store.dispatch('setRole', role)
    store.dispatch('setIsAuthenticated', true)

    // Cleanup interceptor cũ và tạo mới
    cleanupAuthInterceptor()
    interceptorAuthenticate = createAuthInterceptor(token)
}

export const afterLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('role')

    // Sử dụng action logout thay vì dispatch từng action riêng lẻ
    store.dispatch('logout')

    // Cleanup interceptor
    cleanupAuthInterceptor()
}

export const setServerAddr = (domain) => {
    localStorage.setItem('SERVER_ADDR', domain)
    store.dispatch('setServerAddr', domain)
    client.defaults.baseURL = domain
}

export const getStoredUser = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
        try {
            return JSON.parse(userStr)
        } catch (error) {
            console.error('Error parsing stored user data:', error)
            localStorage.removeItem('user')
            return null
        }
    }
    return null
}
