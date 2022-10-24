import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'

// Set base URL
axios.defaults.baseURL = "http://127.0.0.1:5000";

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(VueAxios, axios)
app.provide('axios', app.config.globalProperties.axios)  // provide 'axios'

app.mount('#app')
