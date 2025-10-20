export const simulateLoading = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 1000)
  })
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('vi-VN')
}
