import { pageTypes } from '@facilio/router'
const { CREATE, EDIT } = pageTypes

export default [
  {
    pageType: CREATE,
    moduleName: 'inventoryrequest',
    component: () => import('./InventoryRequestForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'inventoryRequest',
    component: () => import('./InventoryRequestForm.vue'),
  },
]
