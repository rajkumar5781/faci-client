import { pageTypes, tabTypes } from '@facilio/router'
const { OVERVIEW } = pageTypes

export default [
  {
    pageType: OVERVIEW,
    moduleName: 'serviceOrder',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./serviceorder/ServiceOrderSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'serviceAppointment',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('./service-appointment/ServiceAppointmentSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'timeSheet',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./timesheet/TimesheetSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'trip',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./timesheet/TimesheetSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'servicePlannedMaintenance',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./servicePM/ServicePMSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'servicePMTemplate',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./pmTemplate/ServicePMTemplateSummary.vue'),
      },
    ],
  },
  {
    tabType: tabTypes.DISPATCHER_CONSOLE,
    component: () => import('./dispatcher/DispatcherConsole.vue'),
    children: [
      {
        path: '*',
        component: () => import('./dispatcher/DispatcherConsole.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'employee',
    component: () => import('../list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./employee/EmployeeSummary.vue'),
      },
    ],
  },
]
