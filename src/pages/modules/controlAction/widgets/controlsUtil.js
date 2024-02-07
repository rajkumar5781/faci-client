import getProperty from 'dlv'
export const STATUS_MAP = [
  {
    text: 'UnPublished',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'UNPUBLISHED',
  },
  {
    text: 'Published',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'PUBLISHED',
  },
  {
    text: 'Waiting For First Level Approval',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'yellow',
    enum: 'WAITING_FOR_FIRST_LEVEL_APPROVAL',
  },
  {
    text: 'First Level Approved',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'FIRST_LEVEL_APPROVED',
  },
  {
    text: 'Waiting For Second Level Approval',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'yellow',
    enum: 'WAITING_FOR_SECOND_LEVEL_APPROVAL',
  },
  {
    text: 'Second Level Approved',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'SECOND_LEVEL_APPROVED',
  },
  {
    text: 'Command Generated',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'COMMAND_GENERATED',
  },
  {
    text: 'Schedule Action Scheduled',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'SCHEDULE_ACTION_SCHEDULED',
  },
  {
    text: 'Schedule Action In Progress',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'yellow',
    enum: 'SCHEDULE_ACTION_IN_PROGRESS',
  },
  {
    text: 'Schedule Action Success',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'SCHEDULE_ACTION_SUCCESS',
  },
  {
    text: 'Schedule Action Failed',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'SCHEDULE_ACTION_FAILED',
  },
  {
    text: 'Schedule Action Completed with Error',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'SCHEDULE_ACTION_COMPLETED_WITH_ERROR',
  },
  {
    text: 'Revert Action Scheduled',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'REVERT_ACTION_SCHEDULED',
  },
  {
    text: 'Revert Action In Progress',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'yellow',
    enum: 'REVERT_ACTION_IN_PROGRESS',
  },
  {
    text: 'Revert Action Success',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'REVERT_ACTION_SUCCESS',
  },
  {
    text: 'Revert Action Failed',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'REVERT_ACTION_FAILED',
  },
  {
    text: 'Revert Action Completed with Error',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'REVERT_ACTION_COMPLETED_WITH_ERROR',
  },
  {
    text: 'Rejected',
    appearance: 'accent',
    accentLevel: 'L2',
    statusType: 'red',
    enum: 'REJECTED',
  },
]
export const CONTROL_ACTION_TEMPLATE_STATUS_MAP = [
  {
    text: 'UnPublished',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'IN_ACTIVE',
  },
  {
    text: 'Published',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'ACTIVE',
  },
]
export const COMMAND_STATUS_MAP = [
  {
    text: 'Point Not Commissioned',
    appearance: 'status',
    statusType: 'warning',
    enum: 'POINT_NOT_COMMISSIONED',
  },
  {
    text: 'Success',
    appearance: 'status',
    statusType: 'success',
    enum: 'SUCCESS',
  },
  {
    text: 'Failed',
    appearance: 'status',
    statusType: 'danger',
    enum: 'FAILED',
  },
  {
    text: 'In Progess',
    appearance: 'status',
    statusType: 'information',
    enum: 'IN_PROGRESS',
  },
  {
    text: 'Canceled',
    appearance: 'status',
    statusType: 'danger',
    enum: 'CANCELED',
  },
  {
    text: 'Not Scheduled',
    appearance: 'status',
    statusType: 'warning',
    enum: 'NOT_SCHEDULED',
  },
  {
    text: 'Scheduled',
    appearance: 'status',
    statusType: 'success',
    enum: 'SCHEDULED',
  },
]
export const CONTROL_ACTION_EXECUTION_TYPE_MAP = {
  1: 'ACTUAL',
  2: 'SIMULATION'
}
export const CONTROL_ACTION_EXECUTION_VALUE_MAP = {
  'ACTUAL' : 1,
  'SIMULATION' : 2
}

export const TEMPLATE_TYPE_LIST = {
  1: 'UnScheduled',
  2: 'Scheduled',
  3: 'Flagged Events'
}
export function isScheduledTemplateType(type) {
  let templateType = getProperty(TEMPLATE_TYPE_LIST, `${type}`, null)
  return templateType  === 'Scheduled'
}
export function isSimulationExecutionType(type) {
  let executionType = getProperty(CONTROL_ACTION_EXECUTION_TYPE_MAP, `${type}`, null)
  return executionType === 'SIMULATION'
}
export function getExecutionType(type) {
  return getProperty(CONTROL_ACTION_EXECUTION_VALUE_MAP, type, 1)
}