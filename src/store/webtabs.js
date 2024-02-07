import { defineStore } from 'pinia'
import { getApp, isWebTabsEnabled } from '@facilio/router'
import { isEmpty, isNull } from '@facilio/utils/validation'
import getProperty from 'dlv'
import find from 'lodash/find'
import useHome from './home.js'
import access from '../utils/access/index.js'
import { andOperatorOnLong } from '../utils/helpers/index.js'
const webtabs = defineStore('webtabs', {
  state: () => ({
    selectedTabGroup: null,
    selectedTab: null,
  }),
  getters: {
    getTabGroups: () => () => {
      let { webTabGroups } = getApp()

      return !isEmpty(webTabGroups) ? webTabGroups : []
    },
    getTabGroupById: () => groupId => {
      let { webTabGroups } = getApp()

      let group = find(webTabGroups, ['id', groupId])
      return !isEmpty(group) ? group : null
    },
    getTabs: () => groupId => {
      let { webTabGroups } = getApp()

      let group = find(webTabGroups, ['id', groupId])
      return !isEmpty(group) ? group.webTabs : []
    },
    getTabByTabId: () => tabId => {
      let { webTabGroups } = getApp()
      let selectedTab = null

      webTabGroups.forEach(group => {
        let { webTabs = [] } = group
        let tab = webTabs.find(tab => tab.id === tabId)

        if (!isEmpty(tab)) selectedTab = tab
      })

      return selectedTab
    },
    isAppPrefEnabled: () => preference => {
      let { configJSON } = getApp()
      let config = getProperty(configJSON, preference, false)
      return config
    },
    tabHasPermission: state => (permissionName, tab) => {
      let homeStore = useHome()
      let account = homeStore.account
      let { role } = (account || {}).user || {}
      let { roleId, isPrevileged } = role || {}

      if (isPrevileged) {
        return true
      } else {
        if (access.isLicenseEnabled('NEW_TAB_PERMISSIONS')) {
          if (isEmpty(tab)) {
            tab = state.selectedTab
          }
          if (isWebTabsEnabled() && !isEmpty(tab)) {
            let { permission: permissionList } = tab
            return permissionList.some(perm => {
              let { enabled, actionName, permissions: childPermissions } = perm
              if (!isEmpty(actionName)) {
                let hasPerm = permissionName === actionName && enabled
                return hasPerm
              } else {
                if (!isEmpty(childPermissions)) {
                  let { enabled } =
                    childPermissions.find(
                      p => p.actionName === permissionName
                    ) || {}
                  return enabled
                } else {
                  return false
                }
              }
            })
          } else {
            return true
          }
        } else {
          if (isEmpty(tab)) {
            tab = state.selectedTab
          }
          if (isWebTabsEnabled() && !isEmpty(tab)) {
            let {
              permission: permissionList,
              permissions: permissionsForRole,
            } = tab
            let permissionVal = 0

            if (!isEmpty(permissionsForRole)) {
              permissionVal =
                (permissionsForRole.find(p => p.roleId === roleId) || {})
                  .permission || 0
            }

            return permissionList.some(perm => {
              let { actionName, permissions: subPermissions } = perm
              let permVal = andOperatorOnLong(perm.value, permissionVal)

              if (!isEmpty(actionName)) {
                let hasPerm = permissionName === actionName && perm.enabled

                return hasPerm
              } else {
                if (!isEmpty(subPermissions)) {
                  let { enabled = false } =
                    subPermissions.find(p => p.actionName === permissionName) ||
                    {}

                  return enabled
                } else {
                  return false
                }
              }
            })
          } else {
            return true
          }
        }
      }
    },
  },
  actions: {
    setTabGroup(groupId) {
      let tabGroups = this.getTabGroups() || []
      let { selectedTabGroup } = this || {}

      if (isEmpty(groupId) && !isNull(groupId)) {
        // Check if groupId is intentionally left out and not null
        groupId = !isEmpty(tabGroups[0]) ? tabGroups[0].id : null
      }

      let group = groupId ? tabGroups.find(({ id }) => id === groupId) : null

      if (isEmpty(group)) {
        this.clearTab()
      } else {
        let selectedGroupId = selectedTabGroup && selectedTabGroup.id

        if (!selectedGroupId || selectedGroupId !== groupId) {
          this.selectedTabGroup = group
        }
      }
    },
    setTab(tabId) {
      let { webTabs: tabs } = this.selectedTabGroup || {}

      if (!isEmpty(tabs)) {
        if (isEmpty(tabId) && !isNull(tabId)) {
          tabId = !isEmpty(tabs[0]) ? tabs[0].id : null
        }

        let tab = tabId ? tabs.find(({ id }) => id === tabId) : null

        this.selectedTab = tab
        window.selectedTab = tab
      }
    },
    clearTab() {
      this.selectedTab = null
      window.selectedTab = null
      this.selectedTabGroup = []
    },
  },
})

export default webtabs
