import { useCookies } from "vue3-cookies";
import axios from 'axios'

const { cookies } = useCookies()

export const logout = () => { 
    cookies.set("Authorization", "")
    axios.defaults.headers.common['Authorization'] = ""
}