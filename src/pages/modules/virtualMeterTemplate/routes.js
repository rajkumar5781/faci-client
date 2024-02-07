import { pageTypes } from '@facilio/router'
const { LIST, OVERVIEW, CREATE, EDIT } = pageTypes

export default [
  {
    pageType: CREATE,
    moduleName: 'virtualMeterTemplate',
    component: () => import('./VirtualMeterTemplateForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'virtualMeterTemplate',
    component: () => import('./VirtualMeterTemplateForm.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'virtualMeterTemplate',
    component: () => import('./VirtualMeterTemplateList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'virtualMeterTemplate',
    component: () => import('./VirtualMeterTemplateList.vue'),
    children: [
      {
        path: '',
        component: () => import('./VirtualMeterTemplateSummary.vue'),
      },
    ],
  },
]
