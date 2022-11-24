import { createRouter, createWebHistory } from 'vue-router'
import { useCookies } from "vue3-cookies";
import { ElMessage } from 'element-plus'

const { cookies } = useCookies()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'festo',
      meta: { title: 'Festo' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Festo/Festo.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: { title: 'Login' },
      component: () => import('../views/Login.vue')
    },
    {
      path: '/festo',
      name: 'festo',
      meta: { title: 'Festo' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Festo/Festo.vue')
    },
    {
      path: '/festo/edit/:id',
      name: 'festoEdit',
      meta: { title: 'Festo 編輯' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Festo/Edit.vue')
    },
    {
      path: '/festo/monitor',
      name: 'festoMonitor',
      meta: { title: 'Festo 監控' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Festo/Monitor.vue')
    },
    {
      path: '/festo/export',
      name: 'festoExport',
      meta: { title: 'Festo 輸出' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Festo/Export.vue')
    },
    {
      path: '/formula',
      name: 'formula',
      meta: { title: 'Formula' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/formula/Formula.vue')
    },
    {
      path: '/formula/edit/:id',
      name: 'formulaEdit',
      meta: { title: 'Formula 編輯' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/formula/Edit.vue')
    },
    {
      path: '/formula/add',
      name: 'formulaAdd',
      meta: { title: 'Formula 新增' },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/formula/Add.vue')
    }

  ]
})

router.beforeEach((to, from, next) => {
  const isLogin = cookies.get("Authorization")

  if (isLogin) {
    if (to.path == '/login') {
      alert('已登入')
      next('/festo')
    } else {
      window.document.title = to.meta.title;
      next()
    }
  } else {
    if (to.path !== '/login') {
      ElMessage({
        message: "Plz login",
        type: 'warning',
      })
      next("/login")
    } else {
      next()
    }
  }
})

export default router
