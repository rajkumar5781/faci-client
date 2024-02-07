import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'client',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./ClientOverView.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'clientcontact',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./ClientContactOverView.vue'),
      },
    ],
  },
]
