import { pageTypes, tabTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes

export default [
  {
    tabType: tabTypes.SHIFT_PLANNER,
    component: () => import('./shift-planner/ShiftPlanner.vue'),
    children: [
      {
        path: '*',
        component: () => import('./shift-planner/ShiftPlanner.vue'),
      },
    ],
  },
]
