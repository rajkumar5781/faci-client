<script>
import { eventBus } from '../../../../components/page-builder/event-bus'
import Vue from 'vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import getProperty from 'dlv'
import { findTab, tabTypes } from '@facilio/router'
import webtabs from '../../../../store/webtabs'
import { ftoast } from '@facilio/design-system'
import InventoryMixin from '../../inventory/utils/InventoryMixin'
import { findRouteForModule, pageTypes } from '@facilio/router'

import {
  getTimeZone,
  getDateFormat,
  getTimeFormat,
} from '../../../../utils/formatter'

const webtabsStore = webtabs()

export default {
  mixins: [InventoryMixin],

  props: ['widget', 'details', 'resizeWidget'],
  data() {
    return {
      inventoryReservationId: null,
      requestedLineItem: null,
      remainingQuantity: null,
      itemTransactionId: null,
      actionButtonValue: null,
      isServiceDurationBased: false,
      isItemTypeRotating: null,
    }
  },
  computed: {
    workorder() {
      let { details } = this || {}
      let { workorder } = details || {}
      return workorder
    },
    siteId() {
      let { workorder } = this
      let { siteId } = workorder || {}
      return siteId
    },
    invReqModuleName() {
      return 'inventoryrequest'
    },
    additionalParams() {
      let {
        workorder,
        inventoryReservationId,
        itemTransactionId,
        remainingQuantity,
        requestedLineItem,
        actionButtonValue,
      } = this
      let { id } = workorder || {}
      let { lookupModuleName } = actionButtonValue || {}
      if (
        !isEmpty(inventoryReservationId) &&
        lookupModuleName === 'inventoryReservation'
      ) {
        return {
          parentId: id,
          inventoryReservation: { id: inventoryReservationId },
        }
      }
      if (!isEmpty(itemTransactionId)) {
        return {
          parentId: id,
          parentTransactionId: itemTransactionId,
          remainingQuantity: remainingQuantity,
          requestedLineItem: requestedLineItem || null,
        }
      }
      return {
        parentId: id,
      }
    },
    filters() {
      let { workorder } = this || {}
      let { id } = workorder || {}
      let filter = {
        parentId: {
          operatorId: 9,
          value: [`${id}`],
        },
      }
      return filter
    },
    editConfig() {
      let { moduleName } = this
      return {
        canHideEdit: moduleName === 'workorderItem',
      }
    },
    deleteConfig() {
      return {
        canHideDelete: true,
      }
    },
    searchAndFilterConfig() {
      return { canHideSearch: false, canHideFilter: false }
    },
    formConfig() {
      let { actionButtonValue } = this
      let { lookupModuleName } = actionButtonValue || {}
      let { moduleName } = this

      return {
        formType: 'POP_UP_FORM',
        modifyFieldPropsHook: field => {
          let { name } = field || {}

          if (
            ['item', 'tool', 'service', 'storeRoom', 'workorder'].includes(name)
          ) {
            return { ...field, isDisabled: true }
          }
          if (name === 'asset') {
            return !this.isItemTypeRotating
              ? { ...field, hideField: true }
              : { ...field, required: true }
          }
          if (name === 'quantity' && this.isItemTypeRotating) {
            return { ...field, isDisabled: true }
          }
          let addIssuedItems = lookupModuleName === 'itemTransactions'
          if (addIssuedItems && name === 'bin') {
            return { ...field, isDisabled: true }
          }
        },
      }
    },
    quickCreateConfig() {
      return {
        canHideAddBtn: false,
      }
    },
    columnCustomConfig() {
      return { canHideColumnConfig: true }
    },
    listConfiguration() {
      let {
        filters,
        editConfig,
        deleteConfig,
        searchAndFilterConfig,
        columnCustomConfig,
        formConfig,
        quickCreateConfig,
        tableSlotList,
        disableActionableUIElements,
      } = this
      return {
        hideListSelect: true,
        filters,
        canHideFooter: false,
        ...(editConfig || {}),
        ...(deleteConfig || {}),
        ...(columnCustomConfig || {}),
        ...(quickCreateConfig || {}),
        ...(searchAndFilterConfig || {}),
        ...(formConfig || {}),
        tableSlotList: tableSlotList || [],
        mainfieldAction: () => {},
        timezone: getTimeZone(),
        timeformat: getTimeFormat(),
        dateformat: getDateFormat(),
        disableActionableUIElements: disableActionableUIElements,
      }
    },

    emptyStateBtnList() {
      let { moduleName, siteId, workorder } = this
      let workOrderId = getProperty(workorder, 'id')

      let emptyStateBtnList = []
      // if (this.checkWoManageInventoryPermission())
      if (moduleName === 'workorderItem') {
        if (this.checkWoManageInventoryPermission()) {
          emptyStateBtnList = [
            {
              label: this.$t('inventory.select_item', 'Select Item', {
                ns: 'workorder',
              }),
              value: {
                lookupModuleName: 'item',
                lookupModuleDisplayName: this.$t('inventory.item', 'Item', {
                  ns: 'workorder',
                }),
                additionalParams: {
                  siteId,
                  includeServingSite: true,
                },
                additionalFilters: {
                  quantity: {
                    operatorId: 13,
                    value: ['0'],
                  },
                },
                getRecordDetails: async payload => {
                  let { id, moduleName } = payload || {}

                  let queryParam = {
                    itemId: id,
                    workOrderId,
                  }
                  let { data, error } = await API.get(
                    '/v3/workOrderItem/workorder/getWorkorderItem',
                    queryParam
                  )
                  if (error) {
                    this.$message.error(
                      error.message || this.$t('error_occured')
                    )
                  } else {
                    let { workorderItem } = data || {}
                    let { itemType } = workorderItem || {}
                    let { isRotating } = itemType || {}
                    this.isItemTypeRotating = isRotating
                    return new CustomModuleData({
                      ...workorderItem,
                      moduleName,
                    })
                  }
                },
              },
            },
            {
              label: this.$t(
                'inventory.select_reserved_items',
                'Select Reserved Item',
                {
                  ns: 'workorder',
                }
              ),
              value: {
                lookupModuleName: 'inventoryReservation',
                lookupModuleDisplayName: this.$t(
                  'inventory.reserved_items',
                  'Reserved Item',
                  { ns: 'workorder' }
                ),
                additionalFilters: {
                  workOrder: {
                    operatorId: 9,
                    value: [`${workOrderId}`],
                  },
                  reservationStatus: {
                    operatorId: 10,
                    value: [`${3}`],
                  },
                  itemType: {
                    operatorId: 2,
                  },
                },
                getRecordDetails: async payload => {
                  let { id, moduleName } = payload || {}
                  this.inventoryReservationId = !isEmpty(id) ? id : null
                  let queryParam = {
                    reservationId: id,
                  }
                  let { data, error } = await API.get(
                    '/v3/workOrderItem/workorder/getWorkorderItemFromReservation',
                    queryParam
                  )
                  if (error) {
                    this.$message.error(
                      error.message || this.$t('error_occured')
                    )
                  } else {
                    let { workorderItem } = data || {}
                    let { itemType } = workorderItem || {}
                    let { isRotating } = itemType || {}
                    this.isItemTypeRotating = isRotating
                    return new CustomModuleData({
                      ...workorderItem,
                      moduleName,
                    })
                  }
                },
              },
            },
          ]
        }
        emptyStateBtnList.push({
          label: this.$t('inventory.select_issued_item', 'Select Issued Item', {
            ns: 'workorder',
          }),
          value: {
            lookupModuleName: 'itemTransactions',
            lookupModuleDisplayName: this.$t(
              'inventory.issued_items',
              'Issued Item',
              { ns: 'workorder' }
            ),
            viewname: 'issued-items',
            additionalParams: {
              siteId,
              showItemsForIssue: true,
            },
            getRecordDetails: async payload => {
              let { id, moduleName } = payload || {}
              this.parentTransactionId = !isEmpty(id) ? id : null
              let { workorder } = this
              let queryParam = {
                itemTransactionId: id,
                workOrderId: workorder?.id,
              }
              let { data, error } = await API.get(
                '/v3/workOrderItem/workorder/getWorkOrderItemFromIssuedItem',
                queryParam
              )
              if (error) {
                ftoast.critical(error.message || this.$t('error_occured'))
              } else {
                let { workorderItem } = data || {}
                let { requestedLineItem, remainingQuantity } =
                  workorderItem || {}
                this.requestedLineItem = requestedLineItem
                this.remainingQuantity = remainingQuantity
                return new CustomModuleData({
                  ...workorderItem,
                  moduleName,
                })
              }
            },
          },
        })
      } else if (moduleName === 'workorderTools') {
        if (this.checkWoManageInventoryPermission()) {
          emptyStateBtnList = [
            {
              label: this.$t('inventory.select_tool', 'Select Tool', {
                ns: 'workorder',
              }),
              value: {
                lookupModuleName: 'tool',
                lookupModuleDisplayName: this.$t('inventory._tools', 'Tools', {
                  ns: 'workorder',
                }),
                additionalParams: {
                  siteId,
                  includeServingSite: true,
                },
                additionalFilters: {
                  quantity: {
                    operatorId: 13,
                    value: ['0'],
                  },
                },
                getRecordDetails: async payload => {
                  let { id, moduleName } = payload || {}
                  let queryParam = {
                    toolId: id,
                    workOrderId,
                  }
                  let { data, error } = await API.get(
                    '/v3/workorderTools/workorder/getWorkorderTool',
                    queryParam
                  )
                  if (error) {
                    ftoast.critical(error.message || this.$t('error_occured'))
                  } else {
                    let { workorderTools } = data || {}
                    return new CustomModuleData({
                      ...workorderTools,
                      moduleName,
                    })
                  }
                },
              },
            },
            {
              label: this.$t('select_reserved_tools', 'Select Reserved Tool', {
                ns: 'workorder',
              }),
              value: {
                lookupModuleName: 'inventoryReservation',
                viewname: 'all-tools',
                lookupModuleDisplayName: this.$t(
                  'header.reserved_tools',
                  'Reserved Tools',
                  { ns: 'workorder' }
                ),
                additionalFilters: {
                  workOrder: {
                    operatorId: 9,
                    value: [`${workOrderId}`],
                  },
                  reservationStatus: {
                    operatorId: 10,
                    value: [`${3}`],
                  },
                  toolType: {
                    operatorId: 2,
                  },
                },
                getRecordDetails: async payload => {
                  let { id, moduleName } = payload || {}
                  this.inventoryReservationId = !isEmpty(id) ? id : null
                  let queryParam = {
                    reservationId: id,
                  }
                  let { data, error } = await API.get(
                    '/v3/workorderTools/getWorkorderToolFromReservation',
                    queryParam
                  )
                  if (error) {
                    ftoast.critical(error.message || this.$t('error_occured'))
                  } else {
                    let { workorderTools } = data || {}
                    let { toolType } = workorderTools || {}
                    let { isRotating } = toolType || {}
                    this.isItemTypeRotating = isRotating
                    return new CustomModuleData({
                      ...workorderTools,
                      moduleName,
                    })
                  }
                },
              },
            },
          ]
        }
        emptyStateBtnList.push({
          label: this.$t('inventory.select_issued_tool', 'Select Issued Tool', {
            ns: 'workorder',
          }),
          value: {
            lookupModuleName: 'toolTransactions',
            lookupModuleDisplayName: this.$t(
              'inventory.issued_tools',
              'Issued Tools',
              { ns: 'workorder' }
            ),
            viewname: 'issued-tools',
            additionalParams: {
              siteId,
              showToolsForIssue: true,
            },
            getRecordDetails: async payload => {
              let { id, moduleName } = payload || {}
              this.parentTransactionId = !isEmpty(id) ? id : null
              let { workorder } = this
              let queryParam = {
                toolTransactionId: id,
                workOrderId: workorder?.id,
              }
              let { data, error } = await API.get(
                '/v3/workorderTools/getWorkOrderToolFromIssuedTool',
                queryParam
              )
              if (error) {
                ftoast.critical(error.message || this.$t('error_occured'))
              } else {
                let { workorderTools } = data || {}
                let { requestedLineItem, remainingQuantity } =
                  workorderTools || {}
                this.requestedLineItem = requestedLineItem
                this.remainingQuantity = remainingQuantity
                return new CustomModuleData({
                  ...workorderTools,
                  moduleName,
                })
              }
            },
          },
        })
      } else if (moduleName === 'workorderService') {
        if (this.checkWoManageInventoryPermission()) {
          emptyStateBtnList = [
            {
              label: this.$t('inventory.select_service', 'Select Service', {
                ns: 'workorder',
              }),
              value: {
                lookupModuleName: 'service',
                lookupModuleDisplayName: this.$t(
                  'inventory._services',
                  'Services',
                  { ns: 'workorder' }
                ),
                getRecordDetails: async payload => {
                  let { id, moduleName } = payload || {}
                  let { workorder } = this
                  let workOrderId = getProperty(workorder, 'id')
                  let queryParam = {
                    serviceId: id,
                    workOrderId,
                  }
                  let { data, error } = await API.get(
                    '/v3/workorderService/getWorkorderService',
                    queryParam
                  )
                  if (error) {
                    ftoast.critical(error.message || this.$t('error_occured'))
                  } else {
                    let { workorderService } = data || {}
                    let { service } = workorderService || {}
                    let { paymentTypeEnum } = service || {}
                    if (paymentTypeEnum === 'DURATION_BASED') {
                      this.isServiceDurationBased = true
                    }
                    return new CustomModuleData({
                      ...workorderService,
                      moduleName,
                    })
                  }
                },
              },
            },
            {
              label: this.$t(
                'inventory.select_planned_services',
                'Select Planned Service',
                { ns: 'workorder' }
              ),
              value: {
                lookupModuleName: 'workOrderPlannedServices',
                lookupModuleDisplayName: this.$t(
                  'header.planned_services',
                  'Planned Services',
                  { ns: 'workorder' }
                ),
                additionalFilters: {
                  workOrder: {
                    operatorId: 9,
                    value: [`${workOrderId}`],
                  },
                },
                getRecordDetails: async payload => {
                  let { id, moduleName } = payload || {}
                  let queryParam = {
                    plannedServiceId: id,
                  }
                  let { data, error } = await API.get(
                    '/v3/workOrderPlannedServices/forActuals',
                    queryParam
                  )
                  if (error) {
                    ftoast.critical(error.message || this.$t('error_occured'))
                  } else {
                    let { workorderService } = data || {}
                    return new CustomModuleData({
                      ...workorderService,
                      moduleName,
                    })
                  }
                },
              },
            },
          ]
        }
      }
      return emptyStateBtnList
    },
    workOrderSettings() {
      let { details } = this
      let { workOrderSettings = {} } = details || {}
      return workOrderSettings
    },
    disableActionableUIElements() {
      let { workOrderSettings } = this
      let { inventoryActuals } = workOrderSettings || {}
      let { allowed: canDoActionsOnActuals = true } = inventoryActuals || {}
      return !canDoActionsOnActuals
    },
  },
  methods: {
    btnValue(value) {
      this.resetData()
      this.actionButtonValue = value
    },
    resetData() {
      this.inventoryReservationId = null
      this.requestedLineItem = null
      this.remainingQuantity = null
      this.itemTransactionId = null
      this.actionButtonValue = null
      this.isServiceDurationBased = false
    },
    refreshData() {
      eventBus.$emit('reloadWorkorderActualsCost')
    },
    getNonRotatingItems(items) {
      let nonRotatingItems = (items || {}).filter(item => {
        let { itemType } = item || {}
        let { rotating } = itemType || {}
        return !rotating
      })
      return nonRotatingItems
    },
    checkStoreRoomPermission() {
      let targetModuleName = 'storeRoom'
      let canCreate = false
      let canUpdate = false
      let { tabId } = findTab(tabTypes.MODULE, {
        moduleName: targetModuleName,
      })
      if (!isEmpty(tabId)) {
        let webTabObj = webtabsStore.getTabByTabId(tabId)
        canCreate = webtabsStore.tabHasPermission('CREATE', webTabObj)
        canUpdate = webtabsStore.tabHasPermission('UPDATE', webTabObj)
      }
      return canCreate && canUpdate
    },
    options() {
      return [
        {
          label: this.$t(
            'inventory.inventory_request.create_inventory_request',
            {
              ns: 'inventory',
            }
          ),
          value: 'create_inventory_request',
        },
        {
          label: this.$t('inventory.inventory_request.view_inventory_request', {
            ns: 'inventory',
          }),
          value: 'view_inventory_request',
        },
      ]
    },
    dropDownProps() {
      return {
        appearance: 'secondary',
        size: 'small',
      }
    },
    inventoryRequestDropdownAction(btn = {}) {
      let { value } = btn
      if (value === 'create_inventory_request') {
        this.redirectToFormCreation()
      } else if (value === 'view_inventory_request') {
        this.openList()
      }
    },
    redirectToFormCreation() {
      let { invReqModuleName, $router, workorder } = this
      let { id, localId } = workorder || {}
      let route
      let { name } =
        findRouteForModule(invReqModuleName, pageTypes.CREATE) || {}
      if (name) {
        route = $router.resolve({
          name,
          query: {
            requestedFromWorkOrder: true,
            woId: JSON.stringify(id),
            woLocalId: JSON.stringify(localId),
          },
        })
        route = route.href || {}
        route && window.open(route, '_blank')
      }
    },
    openList() {
      let { viewName: viewname, invReqModuleName, $router } = this
      let { workorder } = this
      let { id } = workorder || {}
      let filters = {
        workorder: { operatorId: 36, value: [`${id}`] },
      }
      let query = {
        includeParentFilter: 'true',
        search: JSON.stringify(filters),
      }
      let route
      let { name } = findRouteForModule(invReqModuleName, pageTypes.LIST) || {}
      if (name) {
        route = $router.resolve({
          name,
          params: {
            viewname,
          },
          query,
        })
      }
      route = route.href || {}
      route && window.open(route, '_blank')
    },
  },
}
</script>
