import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import simplebar from 'simplebar-vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 引入tdesign-vue-next组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css'
import 'virtual:uno.css'
import './style/index.css'
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'animate.css'
import 'simplebar-vue/dist/simplebar.min.css'

const app = createApp(App)

// 滚动条组件 类似于 el-scrollbar
app.component('ScrollBar', simplebar)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.mount('#app')
