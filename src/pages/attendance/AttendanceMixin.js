const statusNameMap = {
  ABSENT: 'Absent',
  PRESENT: 'Present',
  WEEKLY_OFF: 'Weekly Off',
  LEAVE: 'Leave',
}

const transitionNameMap = {
  CHECK_IN: 'Check-In',
  CHECK_OUT: 'Check-Out',
  RESUME_WORK: 'Resume Work',
  BREAK: 'Break',
}

const statusBgColor = {
  ABSENT: 'backgroundSemanticRedSubtle',
  PRESENT: 'backgroundSemanticGreenLight',
  WEEKLY_OFF: 'backgroundNeutralGrey01Light',
  LEAVE: 'backgroundNeutralGrey01Light',
}

const statusTagColor = {
  ABSENT: 'red',
  PRESENT: 'green',
  WEEKLY_OFF: 'grey',
  LEAVE: 'blue',
}

const statusIconMap = {
  ABSENT: { group: 'action', name: 'crossbox' },
  PRESENT: { group: 'action', name: 'tick-circle-filled' },
  WEEKLY_OFF: { group: 'dispatcher-console', name: 'vacation' },
  LEAVE: { group: 'dispatcher-console', name: 'vacation' },
}

export function getDisplayNameForTransition(name) {
  return transitionNameMap[name] || '---'
}
export function getDisplayNameForStatus(name) {
  return statusNameMap[name] || '---'
}
export function getBgForStatus(name) {
  return statusBgColor[name] || 'backgroundNeutralGrey01Light'
}

export function getAccentTagForStatus(name) {
  return statusTagColor[name] || 'grey'
}

export function getIconForStatus(name) {
  return statusIconMap[name] || {}
}
