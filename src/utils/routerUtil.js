import {
  findRouteForModule as findRouteforCurrentModule,
  updateParentModuleName,
  getParentModuleName,
} from '@facilio/router'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty, isUndefined } from '@facilio/utils/validation'

function getModuleNameHash(moduleObj) {
  if (isEmpty(moduleObj)) return {}

  let moduleHash = {}
  let { name, extendModule, hideFromParents } = moduleObj

  if (!hideFromParents && !isEmpty(extendModule)) {
    let { name: extendModuleName, extendModule: extendedParentModule } =
      extendModule || {}

    if (extendModuleName) moduleHash[name] = extendModuleName

    if (extendedParentModule) {
      let nestedMapping = getModuleNameHash(extendModule)
      Object.assign(moduleHash, nestedMapping)
    } else {
      moduleHash[extendModuleName] = null
    }
  } else {
    moduleHash[name] = null
  }
  return moduleHash
}

async function getMeta(moduleName) {
  try {
    let { data, error } = await API.get('module/meta', { moduleName })

    if (error) return null
    else {
      return getModuleNameHash(getProperty(data, 'meta.module'))
    }
  } catch (e) {
    return null //API error handling
  }
}

export async function findRouteForModule(moduleName, pageType, moduleObj) {
  if (!isEmpty(moduleObj)) {
    let parentModuleNameHash = getModuleNameHash(moduleObj)

    if (!isEmpty(parentModuleNameHash))
      updateParentModuleName(parentModuleNameHash)
  }

  let route = findRouteforCurrentModule(moduleName, pageType)
  let hideFromParent = !isUndefined(getParentModuleName(moduleName))

  if (route || hideFromParent) return route
  else {
    let parentModuleNameHash = await getMeta(moduleName)

    if (!isEmpty(parentModuleNameHash)) {
      updateParentModuleName(parentModuleNameHash)

      let parentModuleName = parentModuleNameHash[moduleName]
      return await findRouteForModule(parentModuleName, pageType)
    } else {
      updateParentModuleName({ [moduleName]: null })
      return null
    }
  }
}
