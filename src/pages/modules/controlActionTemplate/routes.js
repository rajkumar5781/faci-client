import { pageTypes } from '@facilio/router'
const { CREATE, EDIT, LIST, OVERVIEW } = pageTypes
const moduleName = 'controlActionTemplate'
export default [
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./ControlActionTempleteForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./ControlActionTempleteForm.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('./ControlActionTemplateList.vue'),
    children: [
      {
        path: '',
        component: () => import('./ControlActionTemplateSummary.vue'),
      },
    ],
  },
  {
    pageType: LIST,
    moduleName,
    component: () => import('./ControlActionTemplateList.vue'),
  },
]
