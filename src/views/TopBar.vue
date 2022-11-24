<template>
    <el-menu default-active="/festo" class="el-menu-demo" mode="horizontal" background-color="#545c64" text-color="#fff"
        active-text-color="#ffd04b" router>
        <el-menu-item index="/festo">
            Festo
        </el-menu-item>
        <el-menu-item index="/festo/monitor">
            Festo Monitor
        </el-menu-item>
        <el-menu-item index="/formula">
            Formula
        </el-menu-item>
        <el-menu-item index="/festo/export">
            Festo Export
        </el-menu-item>
        <el-menu-item v-if="isLogin != null" index="" style="margin-left: auto;" @click="handleLogout">
            Logout
        </el-menu-item>
        <el-menu-item v-else index="" style="margin-left: auto;" @click="handleLogin">
            Login
        </el-menu-item>
    </el-menu>
</template>
  
<script lang="ts" setup>
import { logout } from "../common/common";
import { useRouter, useRoute } from 'vue-router';
import { ref, watch } from 'vue'
import { useCookies } from "vue3-cookies";

const { cookies } = useCookies()
const router = useRouter()
const route = useRoute()
const isLogin = ref(cookies.get("Authorization"))

const handleLogout = () => {
    logout()
    router.push({ name: 'login' })
}

const handleLogin = () => {
    router.push({ name: 'login' })
}

watch(route, (curVal, oldVal) => {
    isLogin.value = cookies.get("Authorization")
})
</script>

<style>

</style>