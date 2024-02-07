import { pageTypes } from '@facilio/router'
const { OVERVIEW , LIST} = pageTypes
const moduleName = 'purchaserequest'
export default [
  {
    pageType: LIST,
    moduleName,
    component: () => import('./PurchaseRequestList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('./PurchaseRequestList.vue'),
    children: [
      {
        path: '',
        component: () => import('./PurchaseRequestSummary.vue'),
      },
    ],
  },
]
