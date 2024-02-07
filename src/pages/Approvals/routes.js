import { pageTypes } from '@facilio/router'

export default [
  {
    pageType: pageTypes.APPROVAL_ACTIVITY,
    component: () => import('./ApprovalAndActivitiesWrapper.vue'),
  },
  {
    pageType: pageTypes.APPROVAL_LIST,
    component: () => import('./ApprovalAndActivitiesWrapper.vue'),
  },
]
