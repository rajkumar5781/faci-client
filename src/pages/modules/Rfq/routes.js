import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE, EDIT } = pageTypes
const moduleName = 'requestForQuotation'
export default [
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./RfqForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./RfqForm.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./RfqSummary.vue'),
      },
    ],
  },
]
