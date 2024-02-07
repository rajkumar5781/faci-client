import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { defineStore } from 'pinia'

const views = defineStore('views', {
  state: () => ({
    views: [],
    groupViews: [],
    currentViewDetail: {},
    metaInfo: {},
    metaLoading: false,
    isLoading: false,
    detailLoading: false,
    promiseCache: {
      metaInfo: {},
      currentViewDetail: {},
    },
  }),
  getters: {
    getViewsFolderList: () => () => {
      let { groupViews } = this
      let foldersList = []
      if (!isEmpty(groupViews)) {
        foldersList = groupViews.map(group => {
          if (!isEmpty(group.views)) {
            group.views.forEach(view => {
              view.criteria = null
            })
          }
          return group
        })
      }
      return foldersList
    },
    getCurrentViewDetail: () => () => {
      let { currentViewDetail } = this
      return currentViewDetail
    },
  },
  actions: {
    clearViews() {
      this.views = []
      this.groupViews = []
      this.currentViewDetail = {}
    },
    loadViews(moduleName) {
      if (!isEmpty(moduleName)) {
        return new Promise((resolve, reject) => {
          API.get('/view', { moduleName }).then(({ data, error }) => {
            if (!error) {
              this.views = data.views || []
              resolve({ data, error })
            } else {
              reject({ error })
            }
          })
        }).catch(() => {})
      } else {
        return Promise.resolve()
      }
    },
    loadGroupViews(payload) {
      if (!payload.moduleName) {
        return Promise.resolve({
          data: null,
          error: { message: 'ModuleName is not defined' },
        })
      }
      return new Promise((resolve, reject) => {
        this.isLoading = true
        let {
          moduleName,
          status = null,
          appId,
          restrictPermissions,
          groupType = 1,
          viewType = 1,
          fromBuilder,
        } = payload
        let params = { moduleName, groupStatus: status, groupType, viewType }
        if (!isEmpty(appId)) {
          params.appId = appId
        }
        if (!isEmpty(fromBuilder)) {
          params.fromBuilder = true
        }
        if (!isEmpty(restrictPermissions)) {
          params.restrictPermissions = true
        }
        API.get(`/v2/views/${moduleName}/viewList`, params, {
          uniqueKey: 'GROUP_VIEW_LIST',
        })
          .then(({ data, error }) => {
            if (!error) {
              this.groupViews = data.groupViews || data.views
              resolve({ data, error })
              this.isLoading = false
            } else {
              let { isCancelled } = error || {}
              !isCancelled && reject({ error })
            }
          })
          .catch(() => {
            console.warn(
              `Fetching /v2/views/${moduleName}/viewList cancelled for ${moduleName}`
            )
            this.isLoading = false
          })
      }).catch(() => {})
    },
    loadViewDetail(payload) {
      if (!payload.viewName || !payload.moduleName) {
        return
      }

      let { moduleName, viewName, appId, parentView } = payload
      let { fetch } = payload || false
      let cache = this.promiseCache.currentViewDetail
      let {
        promise,
        moduleName: existingModuleName,
        viewName: existingViewName,
      } = cache
      if (
        existingModuleName === moduleName &&
        existingViewName === viewName &&
        promise
      ) {
        return promise
      } else if (
        existingModuleName === moduleName &&
        existingViewName === viewName &&
        !isEmpty(this.currentViewDetail) &&
        !fetch
      ) {
        return Promise.resolve(this.currentViewDetail)
      } else {
        if (!isEmpty(existingModuleName) && existingModuleName !== moduleName) {
          try {
            API.cancel({ uniqueKey: `${existingModuleName}_VIEW_DETAIL` })
          } catch (error) {
            console.warn(
              `Failed to cancel previous module (${existingModuleName}) view details fetch api`
            )
          }
        }

        cache = {
          moduleName,
          viewName,
          promise: new Promise((resolve, reject) => {
            this.detailLoading = true

            let url = `/v2/views/${moduleName}/${viewName}`
            let params = {
              moduleName,
              appId: !isEmpty(appId) ? appId : null,
              parentView: !isEmpty(parentView) ? parentView : null,
            }

            // Passing moduleName as uniqueKey to cancel any view pending requests

            API.get(url, params, { uniqueKey: `${moduleName}_VIEW_DETAIL` })
              .then(({ error, data }) => {
                if (!error) {
                  this.currentViewDetail = data.viewDetail
                  resolve(data.viewDetail)
                  this.detailLoading = false
                } else {
                  let { isCancelled } = error || {}
                  !isCancelled && reject(error)
                }
              })
              .catch(error => {
                console.warn(
                  `Fetching view details failed for ${moduleName} - ${viewName}`
                )
                this.detailLoading = false
                reject(error)
              })
              .finally(() => {
                cache.promise = null
              })
          }).catch(() =>
            console.warn(
              `Fetching /v2/views/${moduleName}/${viewName} cancelled for ${moduleName}`
            )
          ),
        }
        this.promiseCache.currentViewDetail = cache

        return cache.promise
      }
    },
    loadModuleMeta(moduleName) {
      let cache = this.promiseCache.metaInfo
      let { promise, moduleName: existingModuleName } = cache

      if (existingModuleName === moduleName && promise) {
        return promise
      } else if (existingModuleName === moduleName && !isEmpty(this.metaInfo)) {
        return Promise.resolve(this.metaInfo)
      } else if (moduleName) {
        if (existingModuleName) {
          // Cancel any pending requests
          try {
            API.cancel({ uniqueKey: `${existingModuleName}_META_INFO` })
          } catch (error) {
            console.warn(
              `Failed to cancel previous module (${existingModuleName}) meta fetch api`
            )
          }
        }

        this.metaInfo = {}
        cache = {
          moduleName,
          promise: new Promise((resolve, reject) => {
            this.metaLoading = true
            let url = '/module/meta'
            let params = { moduleName }

            // Passing moduleName as uniqueKey to cancel any metaInfo pending requests
            API.get(url, params, { uniqueKey: `${moduleName}_META_INFO` })
              .then(({ error, data }) => {
                if (!error) {
                  this.metaInfo = data.meta
                  resolve(data.meta)
                } else {
                  reject()
                }
              })
              .catch(error => {
                console.warn(`Fetching /module/meta failed for ${moduleName}`)
                reject(error)
              })
              .finally(() => {
                cache.promise = null
                this.metaLoading = false
              })
          })
            .catch(() =>
              console.warn(`Fetching /module/meta cancelled for ${moduleName}`)
            )
            .finally(() => {
              this.metaLoading = false
            }),
        }
        this.promiseCache.metaInfo = cache

        return cache.promise
      }
    },
    async customizeColumns(payload) {
      return new Promise((resolve, reject) => {
        API.post('/view/customizeColumns', payload).then(({ error, data }) => {
          if (!error && data) {
            let { currentViewDetail } = this || {}
            this.currentViewDetail = {
              ...currentViewDetail,
              fields: data.fields,
            }
            resolve(data)
          } else {
            reject(error)
          }
        })
      })
    },
  },
})

export default views
