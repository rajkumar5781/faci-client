import { pageTypes } from '@facilio/router'
const { LIST, OVERVIEW, CREATE, EDIT } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'tool',
    component: () => import('/src/pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('/src/pages/modules/inventory/tool/ToolSummary.vue'),
      },
    ],
  },
]
