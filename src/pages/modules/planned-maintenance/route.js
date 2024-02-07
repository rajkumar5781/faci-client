import { pageTypes } from '@facilio/router'

const { OVERVIEW, CREATE, EDIT, LIST } = pageTypes
export default [
  {
    pageType: LIST,
    moduleName: 'plannedmaintenance',
    component: () =>
      import('../planned-maintenance/PlannedMaintenanceList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'plannedmaintenance',
    component: () => import('../../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('../planned-maintenance/PlannedMaintenanceSummary.vue'),
      },
    ],
  },
  {
    pageType: CREATE,
    moduleName: 'plannedmaintenance',
    component: () =>
      import('../planned-maintenance/creation/PlannedMaintenanceCreation.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'plannedmaintenance',
    component: () =>
      import('../planned-maintenance/creation/PlannedMaintenanceCreation.vue'),
  },
]
