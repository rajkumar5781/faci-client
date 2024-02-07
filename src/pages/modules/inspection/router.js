import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE, MODULE_CUSTOM } = pageTypes

export default [
  {
    pageType: CREATE,
    moduleName: 'inspectionTemplate',
    component: () => import('./inspectionTemplate/inspectionTemplateForm.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'inspectionTemplate',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('./inspectionTemplate/inspectionTemplateOverview.vue'),
      },
    ],
  },
  {
    pageType: MODULE_CUSTOM,
    moduleName: 'inspectionTemplate',
    component: () => import('./Layout.vue'),
    children: [
      {
        path: 'builder/:viewname/:id',
        name: 'inspection-builder',
        component: () =>
          import(
            '../inspection/inspectionTemplate/components/QAndABuilder.vue'
          ),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'inspectionResponse',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../inspection/inspectionResponse/InspectionResponseOverview.vue'
          ),
      },
    ],
  },
  {
    pageType: MODULE_CUSTOM,
    moduleName: 'inspectionResponse',
    component: () => import('./Layout.vue'),
    children: [
      {
        path: ':id/liveForm',
        name: 'inspection-live-form',
        component: () =>
          import(
            '../inspection/inspectionResponse/components/QAndALiveForm.vue'
          ),
      },
    ],
  },
]
