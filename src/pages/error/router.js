export default [
  {
    name: 'unauthorized',
    path: '/error/unauthorized',
    props: true,
    component: () => import('./Error409.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'scheduledmaintenance',
    path: '/error/scheduledmaintenance',
    props: true,
    component: () => import('./Error503.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'notsupported',
    path: '/error/notsupported',
    component: () => import('./NotSupported.vue'),
  },
  {
    name: 'nopermission',
    path: '/error/nopermission',
    props: true,
    component: () => import('./Error403.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'pagenotfound',
    path: '/error/pagenotfound',
    props: true,
    component: () => import('./Error404.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'toManyRequests',
    path: '/error/tomanyrequests',
    props: true,
    component: () => import('./Error429.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'fetchdetailserror',
    path: '/error/fetchdetailserror',
    props: true,
    component: () => import('./FetchDetailsError.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'webviewerror',
    path: '/error/webview',
    props: true,
    component: () => import('./WebviewError.vue'),
    meta: {
      requiresAuth: false,
    },
  },
]
