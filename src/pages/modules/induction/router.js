import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE, MODULE_CUSTOM } = pageTypes

export default [
  {
    pageType: CREATE,
    moduleName: 'inductionTemplate',
    component: () => import('./inductionTemplate/inductionTemplateForm.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'inductionTemplate',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('./inductionTemplate/InductionTemplateOverview.vue'),
      },
    ],
  },
  {
    pageType: MODULE_CUSTOM,
    moduleName: 'inductionTemplate',
    component: () => import('./Layout.vue'),
    children: [
      {
        path: 'builder/:viewname/:id',
        name: 'induction-builder',
        component: () =>
          import(
            '../inspection/inspectionTemplate/components/QAndABuilder.vue'
          ),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'inductionResponse',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../induction/inductionResponse/InductionResponseOverview.vue'
          ),
      },
    ],
  },
  {
    pageType: MODULE_CUSTOM,
    moduleName: 'inductionResponse',
    component: () => import('./Layout.vue'),
    children: [
      {
        path: ':id/liveForm',
        name: 'induction-live-form',
        component: () =>
          import(
            '../inspection/inspectionResponse/components/QAndALiveForm.vue'
          ),
      },
    ],
  },
]
