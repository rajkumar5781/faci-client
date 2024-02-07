import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'vendorQuotes',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./VendorQuoteSummary.vue'),
      },
    ],
  },
]
