export const initApp = () => {
  console.log('App initialized')
}

export const afterLogin = (remember, userData) => {
  if (remember) {
    localStorage.setItem('user', JSON.stringify(userData))
  } else {
    sessionStorage.setItem('user', JSON.stringify(userData))
  }
}

export const getStoredUser = () => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  if (!user) return null
  
  try {
    // Kiểm tra xem có phải là JSON hợp lệ không
    if (user.startsWith('{') || user.startsWith('[')) {
      return JSON.parse(user)
    } else {
      // Nếu không phải JSON hợp lệ, xóa dữ liệu cũ
      console.warn('Invalid user data in storage, clearing...')
      clearStoredUser()
      return null
    }
  } catch (error) {
    console.warn('Error parsing stored user data:', error)
    clearStoredUser()
    return null
  }
}

export const clearStoredUser = () => {
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

export const setServerAddr = (addr) => {
  localStorage.setItem('serverAddr', addr)
}

export const getServerAddr = () => {
  return localStorage.getItem('serverAddr') || 'https://api.example.com/'
}

export const afterLogout = () => {
  clearStoredUser()
  // Có thể thêm logic khác khi logout
}