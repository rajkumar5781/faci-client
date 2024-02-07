import { pageTypes } from '@facilio/router'
const { OVERVIEW, EDIT  } = pageTypes
export default [
  {
    pageType: OVERVIEW,
    moduleName: 'termsandconditions',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../../../pages/modules/termsAndConditions/TermsAndConditionsSummary.vue'
          ),
      },
    ],
  },
  {
    pageType: EDIT,
    moduleName: 'termsandconditions',
    component: () => import('./TermsAndConditionForm.vue'),
  },
]
