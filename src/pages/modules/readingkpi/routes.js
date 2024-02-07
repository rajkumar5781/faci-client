import { pageTypes } from '@facilio/router'
const { CREATE, LIST, EDIT } = pageTypes
export default [
  {
    pageType: LIST,
    moduleName: 'readingkpi',
    component: () => import('./ReadingKpiList.vue'),
  },
  {
    pageType: CREATE,
    moduleName: 'readingkpi',
    component: () => import('./KPICreationForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'readingkpi',
    component: () => import('./KPICreationForm.vue'),
  },
]
