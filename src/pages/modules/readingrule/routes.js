import { pageTypes } from '@facilio/router'
const { LIST, OVERVIEW, CREATE, EDIT, MODULE_CUSTOM } = pageTypes
export default [
  {
    pageType: LIST,
    moduleName: 'newreadingrules',
    component: () => import('./ReadingRulesList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'newreadingrules',
    component: () => import('./ReadingRulesList.vue'),
    children: [
      {
        path: '',
        component: () => import('./RuleSummary.vue'),
      },
    ],
  },
  {
    pageType: CREATE,
    moduleName: 'newreadingrules',
    component: () => import('./RuleCreationForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'newreadingrules',
    component: () => import('./RuleCreationForm.vue'),
  },
  {
    pageType: MODULE_CUSTOM,
    moduleName: 'newreadingrules',
    component: () => import('./RuleWorkOrderForm.vue'),
  },
]
