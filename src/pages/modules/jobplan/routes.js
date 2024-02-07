import { pageTypes } from '@facilio/router'
const { LIST, OVERVIEW, CREATE, EDIT } = pageTypes
export default [
  {
    pageType: LIST,
    moduleName: 'jobplan',
    component: () => import('./JobPlanListPage.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'jobplan',
    component: () => import('./JobPlanListPage.vue'),
    children: [
      {
        path: '',
        component: () => import('./JobPlanSummary.vue'),
      },
    ],
  },
  {
    pageType: CREATE,
    moduleName: 'jobplan',
    component: () => import('./JobPlanForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'jobplan',
    component: () => import('./JobPlanForm.vue'),
  },
]
