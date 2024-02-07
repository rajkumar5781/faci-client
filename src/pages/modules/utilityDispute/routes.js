import { pageTypes } from '@facilio/router'

const { LIST, OVERVIEW } = pageTypes

export default [
  //Utility Dispute
  {
    pageType: LIST,
    moduleName: 'utilityDispute',
    name: 'utilityDisputeList',
    component: () => import('./UtilityDisputeList.vue'),
  },

  {
    pageType: OVERVIEW,
    moduleName: 'utilityDispute',
    component: () => import('./UtilityDisputeList.vue'),
    children: [
      {
        path: '',
        component: () => import('./UtilityDisputeSummary.vue'),
      },
    ],
  },
]
