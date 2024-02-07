import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE } = pageTypes
const moduleName = 'quote'
export default [
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./QuoteSummary.vue'),
      },
    ],
  },
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./QuoteForm.vue'),
  },
]
