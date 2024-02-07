import { tabTypes } from '@facilio/router'

export default [
  {
    tabType: tabTypes.ATTENDANCE,
    component: () => import('./Attendance.vue'),
    props: () => ({
      isAdmin: true,
    }),
  },
  {
    tabType: tabTypes.MY_ATTENDANCE,
    component: () => import('./Attendance.vue'),
    props: () => ({
      isAdmin: false,
    }),
  },
]
