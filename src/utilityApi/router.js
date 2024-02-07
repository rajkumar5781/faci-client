export default [
  {
    name: 'utilityApiResponse',
    path: '/:appName/utilityCustomer',
    props: true,
    meta: {
      requiresAuth: true,
    },
    component: () => import('./pages/Layout.vue'),
    children: [
      {
        name: 'authenticateUtilityCustomer',
        path: 'authenticate',
        props: true,
        component: () => import('./pages/UtilityAuthentication.vue'),
      },
    ],
  },
]
