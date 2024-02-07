import { tabTypes } from '@facilio/router'

export default [
  {
    tabType: tabTypes.CONNECTED_APPS,
    component: () => import('./ConnectedAppWebTab.vue'),
  },
]
