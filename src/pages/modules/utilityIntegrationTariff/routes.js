import { pageTypes } from '@facilio/router'

const { LIST, CREATE, EDIT } = pageTypes

export default [
  //utility Integration Tariff
  {
    pageType: CREATE,
    moduleName: 'utilityIntegrationTariff',
    name: 'utilityTariffCreate',
    component: () => import('./UtilityIntegrationTariffForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'utilityIntegrationTariff',
    name: 'utilityTariffEdit',
    component: () => import('./UtilityIntegrationTariffForm.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'utilityIntegrationTariff',
    name: 'utilityTariffList',
    component: () => import('./UtilityIntegrationTariffList.vue'),
  },
]
