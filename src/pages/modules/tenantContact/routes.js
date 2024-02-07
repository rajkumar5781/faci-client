import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'tenantcontact',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./TenantContactSummary.vue'),
      },
    ],
  },
]
