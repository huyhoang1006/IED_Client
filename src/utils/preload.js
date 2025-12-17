import { getCurrentInstance } from 'vue'

let loader = null

function loaderStart() {
    try {
        const app = getCurrentInstance()?.appContext?.app
        if (app && app.config.globalProperties.$loading) {
            loader = app.config.globalProperties.$loading.show({
                loader: 'spinner',
                color: '#5D00FF',
                zIndex: 999,
                canCancel: true
            })
        }
    } catch (error) {
    }
}

function loaderEnd() {
    try {
        if (loader) {
            loader.hide()
            loader = null
        }
    } catch (error) {
    }
}

function loaderContainerStart() {
    try {
        const app = getCurrentInstance()?.appContext?.app
        if (app && app.config.globalProperties.$loading) {
            loader = app.config.globalProperties.$loading.show({
                loader: 'spinner',
                color: '#5D00FF',
                zIndex: 999,
                canCancel: true,
                isFullPage: false
            })
        }
    } catch (error) {
    }
}

export default {loaderStart, loaderEnd, loaderContainerStart}
