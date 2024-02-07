import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
const moduleName = 'facilitybooking'
export default [
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./BookingSummary.vue'),
      },
    ],
  },
]
