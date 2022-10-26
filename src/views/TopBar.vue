<template>
    <el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" background-color="#545c64"
        text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="2">
            <RouterLink to="/festo">Festo</RouterLink>
        </el-menu-item>
        <el-menu-item index="3">
            <RouterLink to="/festo/monitor">Festo Monitor</RouterLink>
        </el-menu-item>
        <el-menu-item index="4">
            <RouterLink to="/formula">Formula</RouterLink>
        </el-menu-item>
    </el-menu>
</template>
  
<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const activeIndex2 = ref('2')
</script>