import { useCookies } from "vue3-cookies";
import axios from 'axios'
import { ElMessage } from 'element-plus'

const { cookies } = useCookies()

export const logout = () => {
    cookies.set("Authorization", "")
    axios.defaults.headers.common['Authorization'] = ""
    ElMessage({
        message: "Logout",
        type: 'success',
    })
}