import { pageTypes } from '@facilio/router'
const { LIST, OVERVIEW } = pageTypes
export default [
  {
    pageType: LIST,
    moduleName: 'newreadingalarm',
    component: () => import('./FaultList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'newreadingalarm',
    component: () => import('./FaultList.vue'),
    children: [
      {
        path: '',
        component: () => import('./FaultSummary.vue'),
      },
    ],
  },
  {
    pageType: LIST,
    moduleName: 'bmsalarm',
    component: () => import('./BMSAlarmList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'bmsalarm',
    component: () => import('./BMSAlarmList.vue'),
    children: [
      {
        path: '',
        component: () => import('./BMSAlarmSummary.vue'),
      },
    ],
  },
  {
    pageType: LIST,
    moduleName: 'sensorrollupalarm',
    component: () => import('./SensorAlarmList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'sensorrollupalarm',
    component: () => import('./SensorAlarmList.vue'),
    children: [
      {
        path: '',
        component: () => import('./SensorAlarmSummary.vue'),
      },
    ],
  },
]
