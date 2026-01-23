import { createPinia } from 'pinia'
import simplebar from 'simplebar-vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'virtual:uno.css'
import './style/index.css'
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'animate.css'
import 'simplebar-vue/dist/simplebar.min.css'

const app = createApp(App)

// 滚动条组件 类似于 el-scrollbar
app.component('ScrollBar', simplebar)

app.use(createPinia())
app.use(router)

app.mount('#app')
