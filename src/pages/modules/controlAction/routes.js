import { pageTypes } from '@facilio/router'
const { CREATE, EDIT, LIST, OVERVIEW } = pageTypes
const moduleName = 'controlAction'
export default [
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./ControlActionForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./ControlActionForm.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('./ControlActionList.vue'),
    children: [
      {
        path: '',
        component: () => import('./ControlActionSummary.vue'),
      },
    ],
  },
  {
    pageType: LIST,
    moduleName,
    component: () => import('./ControlActionList.vue'),
  },
]
