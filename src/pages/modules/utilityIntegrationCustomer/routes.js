import { pageTypes } from '@facilio/router'

const { LIST, OVERVIEW, CREATE } = pageTypes

export default [
  //Utility customer
  {
    pageType: CREATE,
    moduleName: 'utilityIntegrationCustomer',
    component: () => import('./AddUtilityApiAccount.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'utilityIntegrationCustomer',
    component: () => import('./UtilityIntegrationCustomerList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'utilityIntegrationCustomer',
    component: () => import('./UtilityIntegrationCustomerList.vue'),
    children: [
      {
        path: '',
        component: () => import('../../summary/ModuleSummary.vue'),
      },
    ],
  },
]
