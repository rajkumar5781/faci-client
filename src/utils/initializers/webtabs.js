import { createApp, createRoutes, registerInitializer } from '@facilio/router'
import { constructBaseURL, getBaseURL, setBaseURL } from '../api/base-url'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import router from '../../router'
import routes from '../../routes'

function registerInitializers() {
  // Require all files from initlaizers folder
  const requireModule = require.context('./initializers', false, /\.js$/)

  // Take only 'agent' from './agent.js' as the key and exported class
  // as the value and register it
  requireModule.keys().forEach(fileName => {
    let name = fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')
    let module = requireModule(fileName)
    registerInitializer(name, module.default || module)
  })
}

function updateBaseURL(app, orgSubDomain) {
  let { linkName } = app || {}
  if (linkName) {
    setBaseURL(constructBaseURL(linkName, orgSubDomain))
  }
}

async function loadData() {
  let appNameFromUrl = window.location.pathname.slice(1).split('/')[0]
  const cacheTimeout = Infinity // dont need to refetch this call untill page refresh

  if (isEmpty(appNameFromUrl)) {
    let { data, error } = await API.get(`v2/application/fetchDefaultApp`)
    if (error) {
      console.warn(`Error while fetching defaultApp`)
      console.error(error)
    } else {
      let { appLinkName } = data

      // redirect the page to "app.facilio.com/<linkName>"
      if (!isEmpty(appLinkName)) {
        window.location.href = `/${appLinkName}`
      }
    }
  }

  let baseURL = getBaseURL()
  if (appNameFromUrl && appNameFromUrl != 'orgsetup') {
    let orgSubDomain = null

    if (window.addOrgDomainInRootPath) {
      let pathArr = window.location.pathname.slice(1).split('/')
      if (!isEmpty(pathArr)) {
        orgSubDomain = getProperty(pathArr, '0') || null
        appNameFromUrl = getProperty(pathArr, '1') || null
      }
    }

    let currentAppName = appNameFromUrl !== 'orgsetup' ? appNameFromUrl : null
    if (currentAppName || orgSubDomain) {
      baseURL = constructBaseURL(appNameFromUrl, orgSubDomain) // baseUrl that includes appLinkName from the address-bar
    }
  }
  return API.get(
    `/v2/application/fetchDetails`,
    { considerRole: true },
    { cacheTimeout },
    { baseURL }
  )
}

function getAvaiableTabGroups(webTabGroups, currentUserRole) {
  let { roleId, isPrevileged } = currentUserRole || {}

  if (isEmpty(currentUserRole) || isPrevileged) {
    return webTabGroups || []
  } else {
    let availableTabGroups = []

    if (!isEmpty(webTabGroups)) {
      webTabGroups.forEach(group => {
        let { webTabs = [] } = group
        let availableTabs = []

        webTabs.forEach(tab => {
          let { permissions } = tab

          if (!isEmpty(permissions)) {
            let enabledRoleIds = permissions.map(perm => perm.roleId)
            if (enabledRoleIds.includes(roleId)) {
              availableTabs.push(tab)
            }
          }
        })

        if (!isEmpty(availableTabs)) {
          availableTabGroups.push({ ...group, webTabs: availableTabs })
        }
      })
    }

    return availableTabGroups
  }
}

function getLayoutTabGroup(data) {
  let { application, currentUserRole, orgSubDomain } = data || {}
  let { layouts } = application || {}

  if (!isEmpty(layouts)) {
    let { appLayoutType, webTabGroupList } = getProperty(layouts, '0', {})
    application = {
      ...application,
      layoutType: appLayoutType,
      webTabGroups: getAvaiableTabGroups(webTabGroupList, currentUserRole),
    }
    data = { ...data, application, orgSubDomain }
  }

  return data
}

function canSkipFetch() {
  // For apps like auth and error we dont need fetchDetails since it will return 401
  const skippedApps = [
    'auth',
    'error',
    'webview',
    'link',
    'pdf',
    'tv',
    'profile',
  ]
  const appNameFromUrl = window.location.pathname.slice(1).split('/')[0]

  return skippedApps.includes(appNameFromUrl)
}

export default function () {
  return new Promise(resolve => {
    if (canSkipFetch()) return resolve()
    loadData().then(({ data, error }) => {
      if (error) {
        console.warn(`Error while loading web-tabs`)
        console.error(error)
        resolve()
      } else {
        // Change the baseURL to the form "app.facilio.com/<linkName>/api"
        let { application: app, orgSubDomain } = data
        updateBaseURL(app, orgSubDomain)

        // Initialize app and genetare routes
        let currentRoleAppData = getLayoutTabGroup(data)
        createApp(currentRoleAppData)
        createRoutes(router, routes)

        resolve()
      }
    })
  })
}
