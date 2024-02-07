import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE, EDIT } = pageTypes
const moduleName = 'purchaseorder'
export default [
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./PurchaseOrderForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./PurchaseOrderForm.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./PurchaseOrderSummary.vue'),
      },
    ],
  },
]
