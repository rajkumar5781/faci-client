import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
const moduleName = 'safetyPlan'
export default [
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./SafetyPlanSummary.vue'),
      },
    ],
  },
]
