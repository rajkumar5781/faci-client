import { pageTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes
const serviceModule = 'service'
const itemtypeModule = 'itemTypes'
const tooltypeModule = 'toolTypes'

export default [
  {
    pageType: OVERVIEW,
    moduleName: serviceModule,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./service/ServiceModuleSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: itemtypeModule,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./itemandtooltypes/ItemtypeSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: tooltypeModule,
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./itemandtooltypes/TooltypeSummary.vue'),
      },
    ],
  },
]
