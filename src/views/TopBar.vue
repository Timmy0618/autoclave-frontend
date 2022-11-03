<template>
    <el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" background-color="#545c64"
        text-color="#fff" active-text-color="#ffd04b" router>
        <el-menu-item index="/festo">
            Festo
        </el-menu-item>
        <el-menu-item index="/festo/monitor">
            Festo Monitor
        </el-menu-item>
        <el-menu-item index="/formula">
            Formula
        </el-menu-item>
    </el-menu>
</template>
  
<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const activeIndex2 = ref('2')
</script>