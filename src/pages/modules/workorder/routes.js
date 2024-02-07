import { pageTypes } from '@facilio/router'
const { OVERVIEW, LIST, EDIT } = pageTypes
const moduleName = 'workorder'
export default [
    {
        pageType: OVERVIEW,
        moduleName: 'workorder',
        component: () => import('../../list/ModuleList.vue'),
        children: [
          {
            path: '',
            component: () =>
              import('./WorkOrderSummary.vue'),
          },
        ],
    },
    {
        pageType: EDIT,
        moduleName: 'workorder',
        component: () => import('./workorderForm.vue'),
      },
      {
        pageType: LIST,
        moduleName: 'workorder',
        component: () => import('./WorkorderList.vue'),
      },
]
