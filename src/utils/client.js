import axios from 'axios'
import store from '@/store'
import {afterLogout} from './helper'

const client = axios.create({
    withCredentials: false
})

client.interceptors.request.use(
    function (config) {
        // Chỉ kiểm tra serverAddr nếu không phải là Electron app
        if (typeof window !== 'undefined' && window.electronAPI) {
            // Đang chạy trong Electron, không cần serverAddr
            return config
        }
        
        // Chỉ kiểm tra serverAddr nếu đang gọi API HTTP
        if (!store.state.serverAddr && config.url && !config.url.startsWith('data:')) {
            console.warn('Server address not configured, but making HTTP request to:', config.url)
            // Không reject, chỉ warning
        }
        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

client.interceptors.response.use(
    function (response) {
        if (!response.data.success) {
            console.error(response.data.message)
            return Promise.reject(new Error(response.data.message))
        }
        return response.data.data
    },
    function (error) {
        if (error.response) {
            // Token hết hạn
            if (error.response.status === 401) {
                afterLogout()
                // Import router dynamically để tránh circular dependency
                import('@/router').then(({ default: router }) => {
                    router.push({ name: 'login' })
                })
            }

            // Lỗi code backend
            if (error.response.data?.message) {
                console.error(error.response.data.message)
                return Promise.reject(new Error(error.response.data.message))
            }
        }
        return Promise.reject(error)
    }
)

export default client
