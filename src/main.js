import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// Import helper và common utilities
import * as helper from '@/utils/helper'
import * as common from '@/utils/common'
import constant from '@/utils/constant'

// Tạo app Vue
const app = createApp(App)

// Đăng ký toàn bộ icons Element Plus
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// Inject helper, common và constant vào Vue instance
app.config.globalProperties.$helper = helper
app.config.globalProperties.$common = common
app.config.globalProperties.$constant = constant

// Sử dụng plugin & mount
app.use(router)
app.use(store)
app.use(ElementPlus)

app.mount('#app')

helper.initApp()
