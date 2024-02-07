import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'vendorcontact',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./VendorContactSummary.vue'),
      },
    ],
  },
]
