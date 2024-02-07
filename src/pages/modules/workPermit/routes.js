import { pageTypes } from '@facilio/router'
const { OVERVIEW, EDIT } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'workpermit',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./WorkPermitSummary.vue'),
      },
    ],
  },
  {
    pageType: EDIT,
    moduleName: 'workpermit',
    component: () => import('./WorkPermitForm.vue'),
  },
]
