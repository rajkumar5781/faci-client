import { tabTypes } from '@facilio/router'

export default [
  {
    tabType: tabTypes.ANALYTICS,
    component: () => import('./Analytics.vue'),
    children: [
      {
        path: '*',
        component: () => import('./Analytics.vue'),
      },
    ],
  },
]
