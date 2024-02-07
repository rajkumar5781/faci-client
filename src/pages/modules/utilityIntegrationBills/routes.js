import { pageTypes } from '@facilio/router'

const { LIST, OVERVIEW } = pageTypes

export default [
  {
    pageType: LIST,
    moduleName: 'utilityIntegrationBills',
    name: 'utilityIntegrationBillList',
    component: () => import('./UtilityIntegrationBillList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'utilityIntegrationBills',
    component: () => import('./UtilityIntegrationBillList.vue'),

    children: [
      {
        path: '',
        component: () => import('./UtilityIntegrationBillSummary.vue'),
      },
    ],
  },
]
