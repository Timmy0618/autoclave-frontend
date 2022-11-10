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
        <el-menu-item index="" style="margin-left: auto;" @click="handleLogout">
            Logout
        </el-menu-item>
    </el-menu>
</template>
  
<script lang="ts" setup>
import { logout } from "../common/common";
import { useRouter } from 'vue-router';

const router = useRouter()
const handleLogout = () => {
    logout()
    router.push({ name: 'login' })
}
</script>

<style>

</style>