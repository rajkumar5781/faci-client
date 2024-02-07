import { tabTypes } from '@facilio/router'

export default [
  {
    tabType: tabTypes.DASHBOARD,
    component: () => import('../dashboard/Dashboard.vue'),
    children: [
      {
        path: '*',
        component: () => import('../dashboard/Dashboard.vue'),
      },
    ],
  },
]
