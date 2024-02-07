import { pageTypes } from '@facilio/router'
const { LIST, CREATE, EDIT, OVERVIEW } = pageTypes

export default [
  {
    pageType: CREATE,
    moduleName: 'meter',
    component: () => import('./MeterForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'meter',
    component: () => import('./MeterForm.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'meter',
    component: () => import('./MeterList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'meter',
    component: () => import('./MeterList.vue'),
    children: [
      {
        path: '',
        component: () => import('./MeterSummary.vue'),
      },
    ],
  },
]
