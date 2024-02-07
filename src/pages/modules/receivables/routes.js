import { pageTypes } from '@facilio/router'
const { OVERVIEW, LIST } = pageTypes
const moduleName = 'receivable'
export default [
  {
    pageType: LIST,
    moduleName,
    component: () => import('./ReceivableList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('./ReceivableList.vue'),
    children: [
      {
        path: '',
        component: () => import('./ReceivableSummary.vue'),
      },
    ],
  },
]
