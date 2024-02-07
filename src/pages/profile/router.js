const accountRoutes = [
  {
    path: 'profile',
    name: 'profile',
    component: () => import('./account/profile/Profile.vue'),
  },
  {
    path: 'notification',
    name: 'notification',
    component: () => import('./account/Notification.vue'),
  },
  {
    path: 'security',
    name: 'security',
    component: () => import('./account/profile/Security.vue'),
  },
  {
    path: 'delegates',
    name: 'delegates',
    component: () => import('./integration/Delegates.vue'),
  },
  {
    path: 'myapp',
    name: 'myapp',
    component: () => import('./integration/MyApps.vue'),
  },
      {
        path: 'apiclient',
        name: 'apiclient',
        component: () => import('./integration/ApiClient.vue'),
      },
]

export default [
  {
    path: '/:app/account',
    name: 'account-layout',
    component: () => import('./Layout.vue'),
    children: accountRoutes,
  },
  {
    path: '/:orgSubDomain/:app/account',
    name: 'account-layout',
    component: () => import('./Layout.vue'),
    children: accountRoutes,
  },
]
