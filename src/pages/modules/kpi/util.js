import getProperty from 'dlv'

export const KPI_TYPES = {
  live: 1,
  scheduled: 2,
  realtime: 3,
}
export const RESOURCE_TYPES = [
  { label: 'Asset', value: 1 },
  { label: 'Space', value: 2 },
  { label: 'Meter', value: 3 },
  { label: 'Site', value: 4 },
]

export const RESOURCE_TYPE_MODULE_NAME_MAP = {
  0: 'resource',
  1: 'asset',
  2: 'space',
  3: 'meter',
  4: 'site',
}

export const RESOURCE_TYPE_MAP = {
  0: 'Resource',
  1: 'Asset',
  2: 'Space',
  3: 'Meter',
  4: 'Site',
}

export const TAB_INFO = {
  kpi: {
    name: 'KPI',
    moduleName: 'readingkpi',
    moduleDisplayName: 'ReadingKpi',
  },
  asset: {
    name: 'Asset',
    moduleName: 'asset',
    moduleDisplayName: 'Asset',
  },
  meter: {
    name: 'Meter',
    moduleName: 'meter',
    moduleDisplayName: ' Meter',
  },
  site: {
    name: 'Site',
    moduleName: 'site',
    moduleDisplayName: ' Site',
  },
}
export const getFromTabInfo = function (currentTab, key) {
  return getProperty(TAB_INFO, `${currentTab}.${key}`)
}
