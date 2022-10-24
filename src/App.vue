<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopBar from './views/TopBar.vue'
</script>

<template>

  <div class="common-layout">
    <TopBar />
    <el-container>
      <!-- <el-header>
      </el-header> -->
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </div>

  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->

</template>