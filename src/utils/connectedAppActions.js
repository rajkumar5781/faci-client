import router from '../router'
import { findRouteForModule, pageTypes } from '@facilio/router'

export const handleInterfaceAction = (instance, eventName, params) => {
  return new Promise((resolve, reject) => {
    if (eventName === 'navigateTo') {
      if (!params.path) {
        reject('Invalid path.')
        return
      }
      params.query = params.query || {}

      router
        .push({
          path: params.path,
          query: params.query,
        })
        .then(() => {
          resolve(true)
        })
        .catch(err => {
          reject(err)
        })
    } else if (eventName === 'openSummary') {
      if (!params.module || !params.id) {
        reject('Invalid module or id.')
        return
      }

      let { name } = findRouteForModule(params.module, pageTypes.OVERVIEW) || {}

      if (name) {
        let routePath = router.resolve({
          name,
          params: {
            viewname: 'all',
            id: params.id,
          },
        }).href

        if (params.newtab) {
          window.open(routePath, '_blank')
          resolve(true)
        } else {
          router
            .push({ path: routePath })
            .then(() => {
              resolve(true)
            })
            .catch(err => {
              reject(err)
            })
        }
      } else {
        reject('Unsupported module.')
        return
      }
    } else if (eventName === 'openListView') {
      if (!params.module) {
        reject('Invalid module.')
        return
      }
      if (params.filters && typeof params.filters !== 'object') {
        reject('Filters should be json object.')
        return
      }

      params.view = params.view || 'all'
      params.filters = params.filters || {}

      let query = {}
      if (Object.keys(params.filters).length) {
        query.search = JSON.stringify(params.filters)
        query.includeParentFilter = true
      }

      let { name } = findRouteForModule(params.module, pageTypes.LIST)

      if (name) {
        let routhPath = router.resolve({
          name,
          params: { viewname: params.view },
          query,
        }).href

        if (params.newtab) {
          window.open(routhPath, '_blank')
          resolve(true)
        } else {
          router
            .push({ path: routhPath })
            .then(() => {
              resolve(true)
            })
            .catch(err => {
              reject(err)
            })
        }
      } else {
        reject('Unsupported module.')
      }
    }
  })
}
