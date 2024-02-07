<template>
  <FContainer>
    <portal :to="`header-${widget.id}-${widget.name}`">
      <FContainer
        padding="containerLarge"
        display="flex"
        justifyContent="space-between"
        width="100%"
        alignItems="center"
      >
        <FContainer>
          <FText
            appearance="headingMed14"
            color="backgroundNeutralInverseHovered"
          >
            {{ widget.displayName }}</FText
          >
        </FContainer>
        <FContainer display="flex">
          <FContainer marginRight="containerLarge">
            <AdvancedSearch
              v-show="true"
              :key="`filter-inventoryrequest`"
              moduleName="inventoryrequestlineitems"
              :moduleDisplayName="moduleDisplayName"
              :hideQuery="true"
              :onSave="setAppliedfilter"
            >
              <template #icon>
                <FIcon group="default" name="filter-outline" size="16"></FIcon>
              </template>
            </AdvancedSearch>
          </FContainer>
          <LineItemsAddition
            ref="inventory-request-line-items"
            :moduleName="moduleName"
            currentModuleName="inventoryrequest"
            :moduleDisplayName="lineItemDisplayName"
            :additionalParams="additionalParams"
            :config="formConfig"
            @saveForm="reloadSummary"
            @clickedActionBtn="btnValue"
          >
            <template #buttons>
              <FContainer
                v-for="button in actionButtonList"
                :key="`actionBtn ${button.label}`"
                marginLeft="containerLarge"
              >
                <FButton
                  appearance="secondary"
                  size="medium"
                  iconPosition="prefix"
                  @click="lineItemsBtnClick(button)"
                >
                  <FText appearance="captionMed12" color="textDefault">{{
                    button.label
                  }}</FText>
                </FButton>
              </FContainer></template
            >
          </LineItemsAddition>
        </FContainer>
      </FContainer>
    </portal>
    <FContainer
      v-if="loading"
      padding="containerXxLarge"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FSpinner :size="30"></FSpinner>
    </FContainer>
    <FContainer
      v-if="!loading && isEmpty(lineItems)"
      height="100%"
      alignItems="center"
    >
      <FEmptyState
        :illustration="'no-data'"
        :size="'S'"
        :title="
          $t('inventory.inventory_request.no_items_associated', {
            ns: 'inventory',
          })
        "
        :vertical="true"
      />
    </FContainer>
    <div v-if="!loading && !isEmpty(lineItems)">
      <InventoryRequestItemsAndTools
        :line-items="lineItems"
        :widget="widget"
        @selectedList="getSelectedList"
        :selectedBulkList="selectedBulkList"
        :details="details"
        @reloadPage="reloadSummary"
        @reseveLineItem="reseveLineItem"
      />
    </div>

    <FContainer
      display="flex"
      justifyContent="center"
      position="sticky"
      bottom="20px"
      z-index="100"
      v-if="showBulkToolBar"
    >
      <FBulkToolbar
        @close="closeBulkToolBar"
        :recordCount="bulkRecordCount"
        :close="closeBulkToolBar"
      >
        <FContainer marginRight="containerXxLarge">
          <FButton
            appearance="secondary"
            iconGroup="files"
            iconName="edit-list"
            :iconButton="true"
            iconPosition="prefix"
            @click="openReservationSummary()"
          >
            <FText
              marginLeft="containerMedium"
              appearance="headingMed14"
              color="textDefault"
            >
              {{
                $t('inventory.inventory_request.reserve', { ns: 'inventory' })
              }}
            </FText>
          </FButton>
        </FContainer>
        <FContainer marginRight="containerXxLarge">
          <FButton
            appearance="secondary"
            iconGroup="action"
            iconName="delete"
            :iconButton="true"
            iconPosition="prefix"
          >
            <FText
              marginLeft="containerMedium"
              appearance="headingMed14"
              color="textDefault"
            >
              {{
                $t('inventory.inventory_request.delete', { ns: 'inventory' })
              }}
            </FText>
          </FButton>
        </FContainer>
        <FDivider height="20px"></FDivider>
      </FBulkToolbar>
    </FContainer>
    <div v-if="canShowReservationSummary">
      <reservation-summary
        :bulkList="bulkList"
        :showPopup="canShowReservationSummary"
        @closeReservationSummary="closeReservationSummary"
        @save="reloadSummary"
        :details="details"
      />
    </div>

    <portal
      :to="`footer-${widget.id}-${widget.name}`"
      v-if="!loading && !isEmpty(lineItems)"
    >
      <FContainer padding="containerLarge">
        <FPagination
          :pageSize="pageSize"
          :total="getTotalRecords"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FSpinner,
  FButton,
  FPagination,
  FEmptyState,
  FBulkToolbar,
  FDivider,
  FModal,
  FTags,
  FAvatar,
  FTooltip,
  ftoast,
} from '@facilio/design-system'
import AdvancedSearch from '../../../../../components/search/AdvancedSearch.vue'
import InventoryRequestItemsAndTools from './InventoryRequestItemsAndTools.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import ReservationSummary from './ReservationSummary.vue'
import { CustomModuleData } from '../../../../../data/CustomModuleData'
import LineItemsAddition from '/src/pages/modules/inventory/components/lineitems/LineItemsAddition.vue'
import module from '../../../../../store/module'

const moduleStore = module()

export default {
  props: ['details', 'widget', 'reloadSummary'],
  components: {
    FContainer,
    FText,
    FSpinner,
    AdvancedSearch,
    FButton,
    InventoryRequestItemsAndTools,
    FPagination,
    FEmptyState,
    FBulkToolbar,
    FDivider,
    FModal,
    FTags,
    FAvatar,
    FTooltip,
    ReservationSummary,
    ftoast,
    LineItemsAddition,
  },
  data() {
    return {
      appliedFilter: {},
      pageSize: 4,
      currentPage: 1,
      disabled: false,
      loading: false,
      lineItems: [],
      showBulkToolBar: false,
      bulkRecordCount: 0,
      selectedBulkList: [],
      canShowReservationSummary: false,
      actionButtonValue: null,
      bulkList: [],
      reservableLineItems: [],
      reservingLineItems: [],
    }
  },
  created() {
    this.loadInventoryRequestLineItems()
  },
  computed: {
    getTotalRecords() {
      let { details } = this
      let { inventoryrequestlineitems = [] } = details || {}
      return inventoryrequestlineitems.length
    },
    moduleDisplayName() {
      return 'Inventory Request'
    },
    lineItemDisplayName() {
      let { actionButtonValue } = this
      let { lookupModuleName } = actionButtonValue || {}
      if (isEmpty(lookupModuleName)) {
        return 'Inventory Request Line Item'
      }
      if (lookupModuleName === 'itemTypes') {
        return 'Item Type'
      } else {
        return 'Tool Type'
      }
    },
    actionButtonList() {
      let { moduleName } = this
      let canEditOrDelete = !this.isRecordLocked() && !this.isRequestedState()
      let hasEditPermission = this.$access.hasPermission(
        `${moduleName}:EDIT,UPDATE`
      )
      if (canEditOrDelete && hasEditPermission) {
        return [
          {
            identifier: 'inventoryRequestSelectItems',
            label: this.$t('inventory.inventory_request.select_item', {
              ns: 'inventory',
            }),
            value: {
              lookupModuleName: 'itemTypes',
              lookupModuleDisplayName: this.$t('inventory.item_types', {
                ns: 'inventory',
              }),
              getRecordDetails: async payload => {
                let { id, moduleName } = payload || {}
                let inventoryRequestLineItems = {
                  itemType: {
                    id: id,
                  },
                }
                return new CustomModuleData({
                  ...inventoryRequestLineItems,
                  moduleName,
                })
              },
            },
          },
          {
            identifier: 'inventoryRequestSelectTools',
            label: this.$t('inventory.inventory_request.select_tool', {
              ns: 'inventory',
            }),
            value: {
              lookupModuleName: 'toolTypes',
              lookupModuleDisplayName: this.$t('inventory.tool_types', {
                ns: 'inventory',
              }),
              getRecordDetails: async payload => {
                let { id, moduleName } = payload || {}
                let inventoryRequestLineItems = {
                  toolType: {
                    id: id,
                  },
                }
                return new CustomModuleData({
                  ...inventoryRequestLineItems,
                  moduleName,
                })
              },
            },
          },
        ]
      }
      return []
    },
    moduleName() {
      return 'inventoryrequestlineitems'
    },
    formConfig() {
      let { actionButtonValue } = this
      let { lookupModuleName } = actionButtonValue || {}
      let isItemType = lookupModuleName === 'itemTypes'
      let isToolType = lookupModuleName === 'toolTypes'

      return {
        formType: 'POP_UP_FORM',

        modifyFieldPropsHook: field => {
          let { name } = field || {}
          if (name === 'itemType') {
            return {
              ...field,
              hideField: !isItemType,
              isDisabled: isItemType,
              required: isItemType,
            }
          }
          if (name === 'toolType') {
            return {
              ...field,
              hideField: !isToolType,
              isDisabled: isToolType,
              required: isToolType,
            }
          }
        },
      }
    },

    additionalParams() {
      let { id, storeRoom } = this.details || {}
      let { actionButtonValue } = this
      let { lookupModuleName } = actionButtonValue || {}
      return {
        inventoryRequestId: {
          id: id,
        },
        storeRoom: {
          id: storeRoom?.id,
        },
        inventoryType: lookupModuleName === 'itemTypes' ? 1 : 2,
      }
    },
  },
  methods: {
    isEmpty,
    lineItemsBtnClick(actionBtn) {
      let { value } = actionBtn || {}
      this.$refs['inventory-request-line-items'].handleClickActionBtn(value)
    },

    loadInventoryRequestLineItems() {
      this.loading = true
      let { currentPage, pageSize, details } = this

      let list = getProperty(details, 'inventoryrequestlineitems', [])

      list =
        list.slice((currentPage - 1) * pageSize, currentPage * pageSize) || []

      this.lineItems = list.map(item => {
        let lineitem = item
        let {
          itemType = {},
          toolType = {},
          storeRoom = {},
          isReserved,
        } = item || {}
        if (!isEmpty(itemType)) {
          let { name, description, quantity } = itemType
          lineitem.name = name
          lineitem.description = description
          lineitem.availableQuantity = quantity
        } else if (!isEmpty(toolType)) {
          let { name, description, quantity } = toolType
          lineitem.name = name
          lineitem.description = description
          lineitem.availableQuantity = quantity
        }
        if (isReserved) {
          lineitem.checkBoxdisable = true
        }

        let { name } = storeRoom
        lineitem.storeRoomName = name
        return { ...item, lineitem }
      })

      this.loading = false
    },
    btnValue(value) {
      this.actionButtonValue = value
    },

    isRecordLocked() {
      let { moduleState } = this.details || {}
      let hasState = getProperty(moduleState, 'id')
      return (
        hasState && moduleStore.isStatusLocked(hasState, 'inventoryrequest')
      )
    },

    isRequestedState() {
      let { approvalStatus } = this.details || {}

      if (!isEmpty(approvalStatus)) {
        let statusObj = moduleStore.getApprovalStatus(approvalStatus.id)
        return getProperty(statusObj, 'requestedState', false)
      }
      return false
    },

    setAppliedfilter({ filters }) {
      this.appliedFilter = filters || {}
      this.loadInventoryRequestLineItems()
    },
    currentChange(page) {
      this.currentPage = page
      this.loadInventoryRequestLineItems()
    },
    closeBulkToolBar() {
      this.showBulkToolBar = false
      this.bulkList = []
      this.selectedBulkList = []
    },
    getSelectedList(data = []) {
      if (!isEmpty(data)) {
        this.bulkList = data
        this.bulkRecordCount = data.length
        this.showBulkToolBar = true
      }
    },

    openReservationSummary() {
      this.canShowReservationSummary = true
    },
    closeReservationSummary() {
      this.canShowReservationSummary = false
      this.closeBulkToolBar()
    },
    reseveLineItem(row) {
      this.selectedBulkList = []
      this.bulkList = []
      this.bulkList.push(row)
      this.selectedBulkList.push(row)
      this.openReservationSummary()
    },
  },
}
</script>
