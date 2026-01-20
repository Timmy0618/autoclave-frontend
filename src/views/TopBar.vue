<template>
  <div class="topbar-container">
    <el-menu
      :default-active="$route.path"
      class="topbar-menu"
      mode="horizontal"
      background-color="#2c3e50"
      text-color="#ecf0f1"
      active-text-color="#3498db"
      router
    >
      <!-- Logo/Brand Section -->
      <div class="menu-brand">
        <el-icon size="24" class="brand-icon">
          <Setting />
        </el-icon>
        <span class="brand-text">Autoclave System</span>
      </div>

      <!-- Navigation Items -->
      <el-menu-item index="/festo" class="nav-item">
        <el-icon><Monitor /></el-icon>
        <span>Festo</span>
      </el-menu-item>

      <el-menu-item index="/festo/monitor" class="nav-item">
        <el-icon><View /></el-icon>
        <span>Monitor</span>
      </el-menu-item>

      <el-menu-item index="/formula" class="nav-item">
        <el-icon><DocumentCopy /></el-icon>
        <span>Formula</span>
      </el-menu-item>

      <el-menu-item index="/festo/export" class="nav-item">
        <el-icon><Download /></el-icon>
        <span>Export</span>
      </el-menu-item>

      <!-- Spacer to push auth buttons to the right -->
      <div class="menu-spacer"></div>

      <!-- Logout Button -->
      <el-menu-item
        v-if="isLogin != null"
        index=""
        class="auth-item logout-item"
        @click="handleLogout"
      >
        <el-icon><SwitchButton /></el-icon>
        <span>登出</span>
      </el-menu-item>

      <!-- Login Button -->
      <el-menu-item
        v-else
        index=""
        class="auth-item login-item"
        @click="handleLogin"
      >
        <el-icon><User /></el-icon>
        <span>Login</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>
  
<script lang="ts" setup>
import { logout } from "../common/common";
import { useRouter, useRoute } from 'vue-router';
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useCookies } from "vue3-cookies";
import {
  Setting,
  Monitor,
  View,
  DocumentCopy,
  Download,
  SwitchButton
} from "@element-plus/icons-vue";

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

<style scoped>
.topbar-container {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.topbar-menu {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin: 0;
  border-bottom: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.menu-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 40px;
  padding: 16px 0;
}

.brand-icon {
  color: #3498db;
}

.brand-text {
  font-weight: 600;
  font-size: 18px;
  color: #ecf0f1;
  letter-spacing: 0.5px;
}

.nav-item {
  margin: 0 4px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.nav-item.is-active {
  background-color: rgba(52, 152, 219, 0.2);
  border-bottom: 3px solid #3498db;
}

.menu-spacer {
  flex: 1;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-item {
  margin: 0 4px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.auth-item:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.logout-item:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.login-item:hover {
  background-color: rgba(46, 204, 113, 0.1);
}

.logout-btn {
  margin: 0 4px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.user-dropdown {
  margin: 0 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #ecf0f1;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-icon {
  color: #3498db;
}

.arrow-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .arrow-icon {
  transform: rotate(180deg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .topbar-menu {
    padding: 0 16px;
  }

  .menu-brand {
    margin-right: 20px;
  }

  .brand-text {
    display: none;
  }

  .nav-item span {
    display: none;
  }

  .auth-item span {
    display: none;
  }

  .logout-btn span {
    display: none;
  }

  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .menu-brand {
    margin-right: 12px;
  }

  .auth-section {
    gap: 4px;
  }
}

/* Element Plus overrides */
:deep(.el-menu-item) {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-menu-item:focus),
:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(52, 152, 219, 0.15);
}

:deep(.el-menu--horizontal .el-menu-item:not(.is-disabled):hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-menu--horizontal .el-menu-item:not(.is-disabled):focus) {
  background-color: rgba(52, 152, 219, 0.1);
}

:deep(.el-icon) {
  transition: transform 0.2s ease;
}

:deep(.el-menu-item:hover .el-icon) {
  transform: scale(1.1);
}

/* Smooth transitions */
* {
  transition: all 0.3s ease;
}
</style>