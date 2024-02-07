<template>
  <FContainer>
    <FTable
      :columns="column"
      :data="lineItems"
      :rounded="false"
      selectType="bulk"
      :hideBorder="false"
      :selectedList="selectedBulkList"
      @recordSelected="handleSelection"
      key="inventory-request-bulk-action"
    >
      <template #[`cell.type`]="{ row }">
        <div v-if="getToolIcon(row)">
          <FTooltip placement="top">
            <template slot="title">
              {{ $t('inventory.inventory_request.tool', { ns: 'inventory' }) }}
            </template>
            <FIcon
              group="action"
              name="spanner"
              key="tool"
              :pressable="true"
              size="16"
            ></FIcon>
          </FTooltip>
        </div>
        <div v-else>
          <FTooltip placement="top">
            <template slot="title">
              {{ $t('inventory.inventory_request.item', { ns: 'inventory' }) }}
            </template>
            <FIcon
              group="action"
              name="timeline"
              key="item"
              :pressable="true"
              size="16"
            ></FIcon>
          </FTooltip>
        </div>
      </template>
      <template #[`cell.defaultAction`]="{ row }">
        <FContainer display="flex" marginRight="containerMedium">
          <FContainer marginRight="containerLarge" v-if="isReserved(row)">
            <FButton appearance="secondary" @click="reserveLineItems(row)">
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
          <FContainer
            v-if="!isReserved(row)"
            display="flex"
            alignItems="center"
          >
            <FTags
              appearance="accent"
              :text="
                $t('inventory.inventory_request.reserved', { ns: 'inventory' })
              "
              :disabled="false"
              accentColor="green"
              accentLevel="L2"
            />
          </FContainer>
        </FContainer>
      </template>
      <template #[`cell.action`]="{ row }">
        <FContainer display="flex" marginRight="containerMedium">
          <FContainer marginRight="containerLarge">
            <FIcon
              group="action"
              name="info"
              size="16"
              @click="showMoreInfo(row)"
              :pressable="true"
              key="inventory-more-details"
            />
            <!-- <FTooltip placement="top">
              <template slot="title">
                {{
                  $t('inventory.inventory_request.more_details', {
                    ns: 'inventory',
                  })
                }}
              </template>
              <FIcon
                group="action"
                name="info"
                size="16"
                @click="showMoreInfo()"
                :pressable="true"
              />
            </FTooltip> -->
          </FContainer>
          <FContainer marginRight="containerLarge" v-if="isReserved(row)">
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="canEditOrDelete(row, 'edit')"
              :pressable="true"
              key="inventory-line-item-edit"
            />
          </FContainer>
          <FContainer marginRight="containerLarge" v-if="isReserved(row)">
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="canEditOrDelete(row, 'delete')"
              :pressable="true"
              key="inventory-line-item-delete"
            />
          </FContainer>
        </FContainer>
      </template>
    </FTable>
    <FContainer v-if="moreInfo">
      <FModal
        :title="
          $t('inventory.inventory_request.more_details', {
            ns: 'inventory',
          })
        "
        :visible="moreInfo"
        size="S"
        :hideFooter="true"
        type="default"
        @cancel="handleCancel"
      >
        <FContainer v-if="popupLoading">
          <FSpinner :size="30"></FSpinner>
        </FContainer>
        <FContainer
          v-else
          paddingTop="containerXxLarge"
          paddingBottom="containerXxLarge"
          paddingLeft="sectionSmall"
          paddingRight="sectionSmall"
          height="50%"
        >
          <FContainer>
            <FTags
              :text="
                $t('inventory.inventory_request.additional_details', {
                  ns: 'inventory',
                })
              "
            ></FTags>
          </FContainer>
          <FContainer display="flex" width="100%" marginTop="containerXxLarge">
            <FContainer width="50%">
              <div>
                <FText
                  appearance="headingMed14"
                  color="backgroundNeutralInverseHovered"
                >
                  {{
                    $t('inventory.inventory_request.created_by', {
                      ns: 'inventory',
                    })
                  }}
                </FText>
              </div>
              <FContainer
                width="70%"
                display="flex"
                alignIems="center"
                marginTop="containerMedium"
              >
                <FContainer
                  marginRight="containerMedium"
                  display="flex"
                  v-if="!isEmpty(createdBy)"
                >
                  <FAvatar
                    size="XS"
                    :userName="createdBy"
                    userStatus="nil"
                  ></FAvatar>
                </FContainer>
                <FContainer display="flex">
                  <FText
                    appearance="bodyReg14"
                    color="backgroundNeutralInverse"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    cursor="pointer"
                  >
                    {{ getCreatedBy }}
                  </FText>
                </FContainer>
              </FContainer>
            </FContainer>
            <FContainer width="50%">
              <div>
                <FText
                  appearance="headingMed14"
                  color="backgroundNeutralInverseHovered"
                >
                  {{
                    $t('inventory.inventory_request.created_time', {
                      ns: 'inventory',
                    })
                  }}
                </FText>
              </div>
              <FContainer
                width="70%"
                display="flex"
                alignIems="center"
                marginTop="containerMedium"
              >
                <FContainer display="flex">
                  <FText
                    appearance="bodyReg14"
                    color="backgroundNeutralInverse"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    cursor="pointer"
                  >
                    {{ createdTime }}
                  </FText>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
          <FContainer display="flex" width="100%" marginTop="containerXxLarge">
            <FContainer width="50%">
              <div>
                <FText
                  appearance="headingMed14"
                  color="backgroundNeutralInverseHovered"
                >
                  {{
                    $t('inventory.inventory_request.modified_by', {
                      ns: 'inventory',
                    })
                  }}
                </FText>
              </div>
              <FContainer
                width="70%"
                display="flex"
                alignIems="center"
                marginTop="containerMedium"
              >
                <FContainer
                  marginRight="containerMedium"
                  display="flex"
                  v-if="!isEmpty(modifiedBy)"
                >
                  <FAvatar
                    size="XS"
                    :userName="modifiedBy"
                    userStatus="nil"
                  ></FAvatar>
                </FContainer>
                <FContainer display="flex">
                  <FText
                    appearance="bodyReg14"
                    color="backgroundNeutralInverse"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    cursor="pointer"
                  >
                    {{ getModifiedBy }}
                  </FText>
                </FContainer>
              </FContainer>
            </FContainer>
            <FContainer width="50%">
              <div>
                <FText
                  appearance="headingMed14"
                  color="backgroundNeutralInverseHovered"
                >
                  {{
                    $t('inventory.inventory_request.modified_time', {
                      ns: 'inventory',
                    })
                  }}
                </FText>
              </div>
              <FContainer
                width="70%"
                display="flex"
                alignIems="center"
                marginTop="containerMedium"
              >
                <FContainer display="flex">
                  <FText
                    appearance="bodyReg14"
                    color="backgroundNeutralInverse"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    cursor="pointer"
                  >
                    {{ modifiedTime }}
                  </FText>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FModal>
    </FContainer>
    <FContainer v-if="showForm">
      <InventoryRequestLineItemForm
        @closeEditForm="closeEditForm"
        :show-form="showForm"
        :details="details"
        :row="currentRow"
        :config="listConfiguration"
        @refreshList="refreshList"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FTable,
  FContainer,
  FIcon,
  FTooltip,
  FButton,
  FText,
  FModal,
  FTags,
  FAvatar,
  FSpinner,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import InventoryRequestLineItemForm from './InventoryRequestLineItemForm.vue'
import { formatDate } from '../../../../../utils/formatter'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { CustomModuleData } from '../../../../../data/CustomModuleData'
import { findRouteForModule, pageTypes } from '@facilio/router'
import getProperty from 'dlv'
import { isWebTabsEnabled, findTab, tabTypes } from '@facilio/router'
import webtabs from '../../../../../store/webtabs'
import module from '../../../../../store/module'

const webtabsStore = webtabs()
const moduleStore = module()
export default {
  props: ['lineItems', 'widget', 'selectedBulkList', 'details'],
  components: {
    FTable,
    FContainer,
    FIcon,
    FTooltip,
    FButton,
    FText,
    FModal,
    FTags,
    FAvatar,
    FSpinner,
    ftoast,
    fDialog,
    InventoryRequestLineItemForm,
  },
  data() {
    return {
      data: [],
      column: [
        { displayName: '', name: 'type', id: 1, fixed: true, width: 50 },
        { displayName: 'Item', name: 'name', id: 2, fixed: true, width: 150 },
        {
          displayName: 'Description',
          name: 'description',
          id: 3,
          width: 250,
        },
        {
          displayName: 'Store Room',
          name: 'storeRoomName',
          id: 4,
          width: 200,
        },
        {
          displayName: 'Quantity',
          name: 'quantity',
          id: 5,
          width: 100,
        },
        {
          displayName: '',
          name: 'defaultAction',
          id: 6,
          fixed: true,
          width: 100,
        },
      ],
      moreInfo: false,
      moreDetails: {},
      createdBy: '',
      createdTime: '',
      modifiedBy: '',
      modifiedTime: '',
      avatarUrl: '',
      userName: '',
      userStatus: '',
      popupLoading: false,
      showForm: false,
      currentRow: {},
    }
  },
  computed: {
    getCreatedBy() {
      let { createdBy } = this
      return isEmpty(createdBy) ? '---' : createdBy
    },
    getModifiedBy() {
      let { modifiedBy } = this
      return isEmpty(modifiedBy) ? '---' : modifiedBy
    },
    moduleData() {
      return CustomModuleData
    },
  },
  methods: {
    isEmpty,
    getToolIcon(row) {
      let { inventoryTypeEnum } = row
      return inventoryTypeEnum === 'TOOL'
    },
    handleSelection(data) {
      this.$emit('selectedList', data)
    },
    async showMoreInfo(row = {}) {
      this.popupLoading = true
      let {
        sysCreatedBy = {},
        sysModifiedBy = {},
        sysCreatedTime = null,
        sysModifiedTime = null,
      } = row
      let { id: createdById } = sysCreatedBy
      let moduleName = 'users'
      let { data } = await API.get(moduleName, {
        id: createdById,
      })
      let { users: createdBy } = data
      if (!isEmpty(createdBy)) {
        let user = createdBy[0]
        let { name, email } = user || {}
        this.createdBy = name || email || '---'
      }

      let { id: modifiedById } = sysModifiedBy

      let { data: modifiedByData } = await API.get(moduleName, {
        id: modifiedById,
      })

      let { users: modifiedBy } = modifiedByData
      if (!isEmpty(modifiedBy)) {
        let user = modifiedBy[0]
        let { name, email } = user || {}
        this.modifiedBy = name || email || '---'
      }

      this.createdTime = !isEmpty(sysCreatedTime)
        ? formatDate(sysCreatedTime)
        : '---'
      this.modifiedTime = !isEmpty(sysModifiedTime)
        ? formatDate(sysModifiedTime)
        : '---'
      this.moreInfo = true
      this.popupLoading = false
    },
    handleCancel() {
      this.moreInfo = false
    },

    async canEditOrDelete(row, identifier) {
      let canEditOrDelete = !this.isRecordLocked() && !this.isRequestedState()
      if (canEditOrDelete) {
        let moduleName = 'inventoryrequestlineitems'
        let { id } = row || {}
        if (identifier == 'delete') {
          let promptValue = await fDialog.warning({
            title: 'Delete Record',
            description: 'Are you sure you want to delete this record',
            saveText: 'Delete',
            cancelText: 'Cancel',
          })
          if (promptValue) {
            let { error } = await API.deleteRecord(moduleName, id)
            if (error) {
              ftoast.critical(error.message || 'Error Occured')
            } else {
              ftoast.success(
                this.$t('inventory.service.delete_success', { ns: 'inventory' })
              )
              this.$emit('reloadPage', row)
            }
          }
        } else {
          this.editModule(row)
        }
      } else {
        ftoast.critical(
          $t('inventory.inventory_request.record_is_locked', {
            ns: 'inventory',
          })
        )
      }
    },
    editModule(row) {
      this.currentRow = row
      this.showForm = true
    },
    canShowMultiSelect() {
      return this.checkReserveInventoryPermission() || this.canEditOrDelete()
    },

    isRecordLocked() {
      let { moduleState } = this.details || {}
      let hasState = getProperty(moduleState, 'id')
      return (
        hasState && moduleStore.isStatusLocked(hasState, 'inventoryrequest')
      )
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

    isRequestedState() {
      let { approvalStatus } = this.details || {}

      if (!isEmpty(approvalStatus)) {
        let statusObj = this.$store.getters.getApprovalStatus(approvalStatus.id)
        return getProperty(statusObj, 'requestedState', false)
      }
      return false
    },
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
    isReserved(row) {
      let { isReserved } = row || {}
      return !isReserved
    },
    reserveLineItems(row) {
      this.$emit('reseveLineItem', row)
    },
    closeEditForm() {
      this.showForm = false
    },
    listConfiguration() {
      let {
        filters,
        searchAndFilterConfig,
        columnCustomConfig,
        formConfig,
        tableSlotList,
        canShowMultiSelect,
      } = this
      return {
        filters,
        hideListSelect: !canShowMultiSelect,
        canHideFooter: false,
        ...(columnCustomConfig || {}),
        ...(searchAndFilterConfig || {}),
        ...(formConfig || {}),
        tableSlotList: tableSlotList || [],
        mainfieldAction: () => {},
        timezone: Vue.prototype.$timezone,
        timeformat: Vue.prototype.$timeformat || 'HH:mm a',
        dateformat: Vue.prototype.$dateformat,
        isRecordEditable: record => {
          return (
            !this.$getProperty(record, 'isReserved') && this.canEditOrDelete()
          )
        },
        isRecordDeletable: record => {
          return (
            !this.$getProperty(record, 'isReserved') && this.canEditOrDelete()
          )
        },
        checkSelection: record => {
          return !this.$getProperty(record, 'isReserved')
        },
      }
    },
    filters() {
      let { details, inventoryType } = this || {}
      let { id } = details || {}
      let filter = {
        inventoryRequestId: {
          operatorId: 9,
          value: [`${id}`],
        },
        inventoryType: {
          operatorId: 9,
          value: [`${inventoryType}`],
        },
      }
      return filter
    },
    refreshList() {
      this.$emit('reloadPage', true)
    },
  },
}
</script>
