import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { logout } from "./common/common";

// Set base URL
axios.defaults.baseURL = "http://127.0.0.1:5000";
// Set 401
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status === 401) {
        //place your reentry code
        logout()
        router.push({ name: 'login' })
    }
    return Promise.reject(error);
});

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(VueAxios, axios)
app.provide('axios', app.config.globalProperties.axios)  // provide 'axios'

app.mount('#app')
