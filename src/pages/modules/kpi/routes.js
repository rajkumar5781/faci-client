import { pageTypes } from '@facilio/router'

export default [
  {
    pageType: pageTypes.NEW_READING_KPI_LIST,
    component: () => import('./KpiListWrapper.vue'),
  },
]
