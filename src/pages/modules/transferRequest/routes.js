import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE, EDIT, LIST } = pageTypes
const moduleName = 'transferrequest'
export default [
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./TransferRequestForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./TransferRequestForm.vue'),
  },
  {
    pageType: LIST,
    moduleName,
    component: () => import('../../../pages/list/ModuleList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./TransferRequestSummary.vue'),
      },
    ],
  },
]
