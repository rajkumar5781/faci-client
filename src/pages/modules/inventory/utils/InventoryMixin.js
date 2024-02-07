import { isWebTabsEnabled, findTab, tabTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import webtabs from '../../../../store/webtabs'
import module from '../../../../store/module'

const webtabsStore = webtabs()
export default {
  methods: {
    checkStoreRoomPermission() {
      let targetModuleName = 'storeRoom'
      let canCreate = false
      let canUpdate = false
      if (isWebTabsEnabled()) {
        let { tabId } = findTab(tabTypes.MODULE, {
          moduleName: targetModuleName,
        })
        if (!isEmpty(tabId)) {
          let webTabObj = webtabsStore.getTabByTabId(tabId)
          canCreate = webtabsStore.tabHasPermission('CREATE', webTabObj)
          canUpdate = webtabsStore.tabHasPermission('UPDATE', webTabObj)
        }
      } else {
        canCreate = this.$access.hasPermission('inventory:CREATE')
        canUpdate = this.$access.hasPermission('inventory:UPDATE,UPDATE_OWN')
      }
      return canCreate && canUpdate
    },
    checkWoManageInventoryPermission() {
      let targetModuleName = 'workorder'
      if (isWebTabsEnabled()) {
        let { tabId } = findTab(tabTypes.MODULE, {
          moduleName: targetModuleName,
        })
        if (!isEmpty(tabId)) {
          let webTabObj = webtabsStore.getTabByTabId(tabId)
          return (
            webtabsStore.tabHasPermission('MANAGE_INVENTORY', webTabObj) ||
            this.checkStoreRoomPermission()
          )
        }
      } else {
        return (
          this.$access.hasPermission('workorder:MANAGE_INVENTORY') ||
          this.checkStoreRoomPermission()
        )
      }
      return false
    },
    checkReserveInventoryPermission() {
      let targetModuleName = 'inventoryrequest'
      if (isWebTabsEnabled()) {
        let { tabId } = findTab(tabTypes.MODULE, {
          moduleName: targetModuleName,
        })
        if (!isEmpty(tabId)) {
          let webTabObj = webtabsStore.getTabByTabId(tabId)
          return webtabsStore.tabHasPermission('RESERVE_INVENTORY', webTabObj)
        }
      } else {
        return this.$access.hasPermission('inventoryrequest:RESERVE_INVENTORY')
      }
      return false
    },
  },
}
