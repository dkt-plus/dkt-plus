import { createApp } from 'vue'
import App from './App.vue'
import DktPlus from '@dkt-plus/dkt-plus'
import * as DktPlusIconsVue from '@dkt-plus/icons-vue'
// import * as DktPlusIconsVue from '@element-plus/icons-vue'
// import DktPlus from '../lib/dkt-plus.es.js'
// import '../lib/style.css'
console.log(DktPlusIconsVue)
const app = createApp(App)
app.use(DktPlus)
for (const [key, component] of Object.entries(DktPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
