import { pageTypes } from '@facilio/router'
const { LIST } = pageTypes
const moduleName = 'serviceRequest'
export default [
  {
    pageType: LIST,
    moduleName,
    component: () => import('./ServiceRequestList.vue'),
  },
]
