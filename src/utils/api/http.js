import Vue from 'vue'
import { constructBaseURL } from './base-url'
import axios from 'axios'
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { fDialog } from '@facilio/design-system'
import dlv from 'dlv'
import { logout } from '../helpers/index.js'
import router from '../../router'
import { ftoast } from '@facilio/design-system'

const appVersion = window.webpackPublicPath
  ? window.webpackPublicPath.substring(
      window.webpackPublicPath.lastIndexOf('/') + 1,
      window.webpackPublicPath.length
    )
  : 'None'

const isMobile =
  window.location.pathname.indexOf('newmobiledashboard') > -1 ||
  window.location.pathname.indexOf('/webview/mobiledashboard') > -1 // temp fix it will be removed after this method works

const exportUrls = [
  '/v2/report/export',
  '/exportModule',
  '/v2/report/exportModuleReport',
  '/import/',
  '/v2/integ/pdf/create',
]
axios.defaults.baseURL = constructBaseURL()

export const skipLoginRedirection = api => {
  let { hostname, pathname } = window.location

  if (hostname.startsWith('tv.') || pathname.startsWith('/tv')) {
    return true
  }

  const skippedRoutes = [
    '/auth/login',
    '/app/login',
    '/app/logout',
    '/app/signup',
    '/app/entry',
    '/app/mobile/entry',
    '/app/mobile/login',
    '/app/mobile/service/login',
  ]
  if (skippedRoutes.some(url => pathname.includes(url))) {
    return true
  }

  let excludedAPIs = []
  if (excludedAPIs.some(url => api.includes(url))) {
    return true
  }
}
export const forbiddenApi = api => {
  // we have to check unauthorize only for some base apis like fetchDetails,fetchAccount
  if (api.includes('fetchDetails')) {
    return true
  }
  return false
}

const http = axios.create({
  withCredentials: true,
  headers: {
    'X-Device-Type': isMobile ? 'android' : 'Web',
    'X-App-Version': appVersion,
  },
})

http.interceptors.request.use(
  function (config) {
    if (window.loggerLevel) {
      config.url +=
        (!config.url.includes('?') ? '?' : '&') +
        `loggerLevel=${window.loggerLevel}`
    }
    if (window.fetchTrace) {
      config.url +=
        (!config.url.includes('?') ? '?' : '&') +
        `fetchStackTrace=${window.fetchTrace}`
    }
    if (!config.headers) {
      config.headers = {}
    }

    let currLocation = window.location
    let { pathname } = currLocation || {}
    config.headers['X-current-site'] = Vue.cookie.get('fc.currentSite') || -1

    let cookieValue = Vue.cookie.get('fc.switchValue') || null

    if (!isEmpty(cookieValue)) {
      let { linkName } = getApp() || {}

      if (!isEmpty(linkName)) {
        let switchValue = JSON.parse(atob(cookieValue))
        let { [linkName]: encodedSwitchValue } = switchValue || {}

        config.headers['X-switch-value'] = encodedSwitchValue || ''
      }
    }

    if (currLocation && pathname && pathname.startsWith('/app/setup')) {
      config.headers['X-current-site'] = -1
      config.headers['X-switch-value'] = ''
    }

    if (currLocation && pathname && pathname.startsWith('/link/')) {
      let tokenProps = /token=(\S*)&?/.exec(window.location.href)
      let token = tokenProps ? tokenProps[1] : null
      if (token) config.headers['X-Permalink-Token'] = token
    }

    let { orgId, orgGroupName, selectedTab } = window

    if (selectedTab) config.headers['X-Tab-Id'] = selectedTab.id
    if (orgId) config.headers['X-Org-Id'] = orgId
    if (orgGroupName) config.headers['X-Org-Group'] = orgGroupName

    let csrf = Vue.cookie.get('fc.csrfToken')
    if (!isEmpty(csrf)) {
      config.headers['X-CSRF-Token'] = csrf
    }

    let isExportUrl = exportUrls.some(url => config.url.startsWith(url))
    if (isExportUrl) {
      config.headers['X-Is-Export'] = true
    }

    if (config?.removeCurrentSiteFilter) {
      config.headers['X-current-site'] = -1
    }

    if (config?.removeSwitchFilter) {
      config.headers['X-switch-value'] = ''
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  function (response) {
    if (
      response?.status === 202 &&
      window.location.href.indexOf('orgsetup') == -1
    ) {
      // org signup still in progress
      return new Promise((_, reject) => {
        router
          .replace({
            name: 'orgsetup',
          })
          .finally(() => {
            return reject(response)
          })
      })
    }
    return response
  },
  function (error) {
    let app = window.location.pathname.slice(1).split('/')[0]
    let response = dlv(error, 'response')
    let config = dlv(response, 'config') || {}
    let api = dlv(config, 'url', null)
    let headers = dlv(response, 'headers')
    let status = dlv(response, 'status')
    let currentRoute = dlv(window, 'location.href', '')
    let isForbiddenApi = false
    // if no response, directly send error back to callee
    if (isEmpty(response)) response = error
    if (!isEmpty(api)) isForbiddenApi = forbiddenApi(api)

    let dialogue = dlv(Vue, 'prototype.$dialog', null)
    let isDialogueAvailable = !isEmpty(dialogue)
    if (
      headers &&
      headers['x-redirect-to'] &&
      headers['x-redirect-to'] !== window.location.href &&
      window.location.pathname !== '/app/samllogout'
    ) {
      window.location.href = headers['x-redirect-to']
    }

    let errMessage = null
    if (!isEmpty(response)) {
      let { data } = response || {}
      let { errorMessage } = data || {}
      errMessage = errorMessage
    }
    if (status === 401 && !skipLoginRedirection(api)) {
      return new Promise(() => {
        logout(window.location.pathname, true)
      })
    } else if (status === 440 || status === 408) {
      if (isForbiddenApi) {
        // if fetchDetails api failed with session timeout
        return new Promise(() => {
          logout(window.location.pathname, true)
        })
      }
      let htmlMessage = 'Your Session has expired.'
      if (status === 408) {
        htmlMessage =
          'You have been logged out due to inactivity. Please login again.'
      }
      let dialogObj = {
        title: 'Session Expired',
        htmlMessage: htmlMessage,
      }
      if (!dialogueShown) {
        if (isDialogueAvailable) {
          dialogueShown = true
          return fDialog(dialogObj).then(() => {
            logout(window.location.pathname, true)
          })
        } else {
          return new Promise(() => {
            logout(window.location.pathname, true)
          })
        }
      }
    } else if (status === 503) {
      console.warn('Scheduled Maintenance. Server is down.')
      return new Promise((_, reject) => {
        router
          .replace({
            name: 'scheduledmaintenance',
            params: { app, errMessage },
          })
          .finally(() => {
            return reject(response)
          })
      })
    } else if (status === 403 || status == 409) {
      console.warn(
        'Unauthorized. Current user does not have permission for any tab.'
      )
      return new Promise((_, reject) => {
        router
          .replace({
            name: 'nopermission',
            query: { app, errMessage, prevRoute: currentRoute },
          })
          .finally(() => {
            return reject(response)
          })
      })
    } else if (status === 404) {
      console.warn('Page not found.')

      return new Promise((_, reject) => {
        router
          .replace({
            name: 'pagenotfound',
            query: { app, errMessage, prevRoute: currentRoute },
          })
          .finally(() => {
            return reject(response)
          })
      })
    } else if (status === 429) {
      console.warn('To many Requests')

      return new Promise((_, reject) => {
        router
          .replace({
            name: 'toManyRequests',
            query: { app, errMessage, prevRoute: currentRoute },
          })
          .finally(() => {
            return reject(response)
          })
      })
    } else if (status === 430) {
      let { errorMessage = 'Permission is not handled' } = response.data || {}

      console.warn(errorMessage)
      ftoast.critical(errorMessage)
    } else {
      return Promise.reject(response)
    }
  }
)

// have to handle stores and http response redirection
export default http
