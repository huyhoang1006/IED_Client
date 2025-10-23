export const simulateLoading = (time = 800) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}

export function randomStr(length = 6) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}
