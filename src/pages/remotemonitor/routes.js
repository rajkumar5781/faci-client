import { pageTypes } from '@facilio/router'

const { LIST, OVERVIEW, CREATE, EDIT } = pageTypes

export default [
  {
    pageType: CREATE,
    moduleName: 'alarmCorrelationRule',
    component: () =>
      import(
        './forms/filtered-alarm-condition/components/AlarmFilterRuleForm.vue'
      ),
  },
  {
    pageType: EDIT,
    moduleName: 'alarmCorrelationRule',
    component: () =>
      import(
        './forms/filtered-alarm-condition/components/AlarmFilterRuleForm.vue'
      ),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'alarmCorrelationRule',
    component: () =>
      import(
        './forms/filtered-alarm-condition/components/AlarmFilterRuleForm.vue'
      ),
  },
  {
    pageType: CREATE,
    moduleName: 'flaggedAlarmProcess',
    component: () =>
      import(
        './forms/flagged-event-conditon/components/FlaggedEventRuleForm.vue'
      ),
  },
  {
    pageType: EDIT,
    moduleName: 'flaggedAlarmProcess',
    component: () =>
      import(
        './forms/flagged-event-conditon/components/FlaggedEventRuleForm.vue'
      ),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'flaggedAlarmProcess',
    component: () =>
      import(
        './forms/flagged-event-conditon/components/FlaggedEventRuleForm.vue'
      ),
  },
  {
    pageType: OVERVIEW,
    moduleName: 'flaggedAlarm',
    component: () => import('./list/flagged-event/FlaggedEventList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import('./summary/flagged-event/FlaggedEventSummary.vue'),
      },
    ],
  },
  {
    pageType: LIST,
    moduleName: 'alarmCorrelationRule',
    component: () => import('./list/alarm-filter-rule/AlarmFilterRuleList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'filteredAlarm',
    component: () => import('./list/filtered-alarm/FilteredAlarmList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'flaggedAlarm',
    component: () => import('./list/flagged-event/FlaggedEventList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'flaggedAlarmProcess',
    component: () =>
      import('./list/flagged-event-rule/FlaggedEventRuleList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'alarmEvent',
    component: () => import('./list/raw-alarm/RawAlarmList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'controller',
    component: () => import('./list/controller/ControllerList.vue'),
  },
]
