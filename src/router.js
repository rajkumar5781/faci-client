import Vue from 'vue'
import VueRouter from 'vue-router'
import ProfileRoutes from './pages/profile/router.js'
import ErrorRoutes from './pages/error/router.js'
import NProgress from 'accessible-nprogress'
import UtilityAuthRoutes from './utilityApi/router.js'
import PdfPreViewerRoutes from './pdfPreviewLayout/router.js'
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./pages/auth/Login.vue'),
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('./pages/auth/Logout.vue'),
  },
  ...ProfileRoutes,
  ...ErrorRoutes,
  ...UtilityAuthRoutes,
  ...PdfPreViewerRoutes,
  {
    path: '/orgsetup',
    name: 'orgsetup',
    component: () => import('./pages/auth/OrgSetup.vue'),
  },
]

const router = new VueRouter({
  linkActiveClass: 'active',
  mode: 'history',
  routes,
})

router.beforeEach((to, from, next) => {
  const hasPathChanged = to.path !== from.path
  if (hasPathChanged) {
    NProgress.start()
  }

  next()
})

router.afterEach(to => {
  NProgress.done()
})

export default router
