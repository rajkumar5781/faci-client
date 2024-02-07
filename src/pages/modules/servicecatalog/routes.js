import { tabTypes } from '@facilio/router'
const { SERVICE_CATALOG } = tabTypes

export default [
  {
    tabType: SERVICE_CATALOG,
    config: {
      type: 'serviceCatalog',
    },
    component: () => import('./ServiceCatalogList.vue'),
  },
]
