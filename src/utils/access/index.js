import Vue from 'vue'
import home from '../../store/home'
import webtabs from '../../store/webtabs'
import { andOperatorOnLong } from '../helpers/index'
import { isEmpty } from '@facilio/utils/validation'

const homeStore = home()

const isLicenseEnabled = (module, mobileLicense) => {
  if (module.split(',').length > 1) {
    let moduleList = module.split(',')
    for (let mod of moduleList) {
      if (isLicenseEnabled(mod, mobileLicense)) {
        return true
      }
    }
    return false
  }

  if (Vue.prototype.$mobile && !mobileLicense) {
    return true
  } else {
    let { features } = homeStore || {}
    return (features || {})[module.toUpperCase()]
  }
}

const hasPermission = function (permissionListStr, tabId) {
  let permissionList = []
  let webtabsStore = webtabs()
  let isModuleIncluded = permissionListStr.includes(':')
  if (isModuleIncluded) {
    let permissionValues = permissionListStr.split(':')
    permissionList = permissionValues[1]
  } else {
    permissionList = permissionListStr
  }
  permissionList = permissionList.split(',')
  let tab = null

  if (!isEmpty(tabId)) {
    tab = webtabsStore.getTabByTabId(tabId)
  }

  return permissionList.some(permName =>
    webtabsStore.tabHasPermission(permName, tab)
  )
}

export default { isLicenseEnabled, hasPermission }
