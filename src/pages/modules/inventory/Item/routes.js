import { pageTypes } from '@facilio/router'
const { LIST, OVERVIEW, CREATE, EDIT } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'item',
    component: () => import('/src/pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('/src/pages/modules/inventory/Item/ItemSummary.vue'),
      },
    ],
  },
]
