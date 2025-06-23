// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'

import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
// app.use(ElementPlus)
app.use(ElementPlus, {
    locale: zhCn,
})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(pinia)
app.mount('#app')
