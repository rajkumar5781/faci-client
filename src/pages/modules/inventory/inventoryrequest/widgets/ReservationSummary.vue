<template>
  <FContainer>
    <FModal
      :title="
        $t('inventory.inventory_request.reservation_summary', {
          ns: 'inventory',
        })
      "
      :visible="showReservationSummary"
      :cancelText="$t('inventory.service.cancel', { ns: 'inventory' })"
      :saveText="$t('inventory.inventory_request.reserve', { ns: 'inventory' })"
      size="XL"
      :hideFooter="true"
      @cancel="handleCancel"
    >
      <FContainer
        v-if="loading"
        padding="sectionMedium"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FSpinner :size="30" />
      </FContainer>
      <FContainer v-else>
        <FTable
          :columns="column"
          :data="lineItems"
          :rounded="false"
          :read-only="true"
          :hideBorder="false"
          key="inventory-request-bulk-action"
        >
          <template #[`cell.errorColumn`]="{ row }">
            <FContainer
              v-if="warningMsg(row)"
              display="flex"
              alignItems="center"
            >
              <FContainer>
                <FIcon
                  group="alert"
                  name="triangle-warning-filled"
                  size="16"
                  key="triangle-warning-filled"
                  color="backgroundAccentYellowMedium"
                ></FIcon>
              </FContainer>
              <FContainer>
                <FText appearance="bodyReg14" color="textDefault">
                  {{ getErrorMessage(row) }}
                </FText>
              </FContainer>
            </FContainer>
            <FContainer v-if="errorMsg(row)" display="flex" alignItems="center">
              <FContainer>
                <FIcon
                  group="alert"
                  name="circle-warning-filled"
                  size="16"
                  key="circle-warning-filled"
                  color="backgroundSemanticRedLight"
                />
              </FContainer>
              <FContainer>
                <FText appearance="bodyReg14" color="textDefault">
                  {{ getErrorMessage(row) }}
                </FText>
              </FContainer>
            </FContainer>
          </template>
        </FTable>
        <FContainer
          paddingTop="containerXLarge"
          paddingBottom="containerXLarge"
          paddingLeft="sectionSmall"
          paddingRight="sectionSmall"
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
        >
          <FContainer paddingRight="containerXLarge">
            <FText appearance="headingMed14" color="textDefault">
              {{ getReservationQuantityMsg }}
            </FText>
          </FContainer>
          <FContainer>
            <FButton
              appearance="primary"
              :disabled="canShowReserveButton"
              size="medium"
              @click="reserveInvReqLineItems"
            >
              <FText>
                {{
                  $t('inventory.inventory_request.reserve', { ns: 'inventory' })
                }}
              </FText>
            </FButton>
          </FContainer>
        </FContainer>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTable,
  FModal,
  ftoast,
  FSpinner,
  FIcon,
  FButton,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { API } from '@facilio/api'

export default {
  props: ['bulkList', 'showPopup', 'details'],
  components: {
    FContainer,
    FText,
    FTable,
    FModal,
    ftoast,
    FSpinner,
    FIcon,
    FButton,
  },
  data() {
    return {
      column: [
        { displayName: 'Item', name: 'name', id: 1, fixed: true, width: 200 },
        {
          displayName: 'Description',
          name: 'description',
          id: 2,
          width: 200,
        },
        {
          displayName: 'Store Room',
          name: 'storeRoomName',
          id: 3,
          width: 200,
        },
        {
          displayName: 'Available Quantity',
          name: 'availableQuantity',
          id: 4,
          width: 130,
        },
        {
          displayName: 'Quantity',
          name: 'quantity',
          id: 5,
          width: 130,
        },
        {
          displayName: '',
          name: 'errorColumn',
          id: 6,
          width: 400,
        },
      ],
      data: [],
      showReservationSummary: this.showPopup,
      loading: false,
      nonReservableLineItems: [],
      lineItems: [],
    }
  },
  computed: {
    moduleName() {
      return 'inventoryrequestlineitems'
    },
    getReservationQuantityMsg() {
      let { reservableLineItems, reservingLineItems } = this
      let msg = this.$t('inventory.inventory_request.reservation_status', {
        count: reservableLineItems.length,
        total: reservingLineItems.length,
        ns: 'inventory',
      })
      return msg
    },
    canShowReserveButton() {
      let { reservableLineItems } = this
      return isEmpty(reservableLineItems)
    },
  },
  created() {
    this.reserveMultipleLineItems()
  },
  methods: {
    loadInventoryRequestLineItems() {
      this.loading = true
      let { reservingLineItems: list = [] } = this
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
          lineitem.disable = true
        }

        let { name } = storeRoom
        lineitem.storeRoomName = name
        return { ...item, lineitem }
      })
      this.loading = false
    },
    handleCancel() {
      this.$emit('closeReservationSummary', true)
    },
    async reserveInvReqLineItems() {
      let { bulkList: reservableLineItems } = this
      let { workorder } = this.details || {}
      if (isEmpty(workorder)) {
        ftoast.critical(
          this.$t('inventory.inventory_request.workorder_cannot_be_empty', {
            ns: 'inventory',
          })
        )
      } else {
        let workorderId = workorder?.id
        let inventoryrequestlineitems = (reservableLineItems || []).map(
          lineItem => ({
            id: getProperty(lineItem, 'id'),
          })
        )
        let url = `v3/modules/bulkPatch/related/inventoryRequest/${this.moduleName}`
        let params = {
          data: {
            inventoryrequestlineitems: inventoryrequestlineitems,
          },
          moduleName: this.moduleName,
          params: {
            reserve: true,
            workorderId: workorderId,
          },
        }
        if (!isEmpty(inventoryrequestlineitems)) {
          let { error } = await API.post(url, params)
          if (error) {
            ftoast.critical(
              error.message ||
                this.$t('inventory.inventory_request.error_occured', {
                  ns: 'inventory',
                })
            )
          } else {
            ftoast.success(
              this.$t('inventory.inventory_request.reserve_success', {
                ns: 'inventory',
              })
            )
            this.$emit('save')
            this.showReservationSummary = false
          }
        }
      }
    },

    async reserveLineItem(record) {
      let { id } = record || {}
      let params = {
        reserve: true,
        filters: JSON.stringify({
          id: { operatorId: 9, value: [`${id}`] },
        }),
      }
      let { list, error } = await API.fetchAll(this.moduleName, params)
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('inventory.inventory_request.error_occured', {
              ns: 'inventory',
            })
        )
      } else {
        this.reservingLineItems = list || {}
        this.setReservableLineItems(this.reservingLineItems)
        this.showReservationSummary = true
      }
    },

    async reserveMultipleLineItems() {
      this.loading = true
      let { bulkList: selectedLineItems } = this
      let recordIds = selectedLineItems.map(element => {
        let { id } = element
        return `${id}`
      })
      let params = {
        reserve: true,
        filters: JSON.stringify({
          id: { operatorId: 9, value: recordIds },
        }),
      }
      let { list, error } = await API.fetchAll(this.moduleName, params)
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('inventory.inventory_request.error_occured', {
              ns: 'inventory',
            })
        )
      } else {
        this.reservingLineItems = list || {}
        this.loadInventoryRequestLineItems()
        this.setReservableLineItems(this.reservingLineItems)
        this.showReservationSummary = true
      }

      this.loading = false
    },
    setReservableLineItems(reservingLineItems) {
      this.reservableLineItems = (reservingLineItems || []).filter(lineItem => {
        let errorType = getProperty(lineItem, 'errorType', '')
        return errorType !== 'Non-reservable'
      })
    },
    errorMsg(lineItem) {
      return getProperty(lineItem, 'errorType') === 'Non-reservable'
    },
    warningMsg(lineItem) {
      return getProperty(lineItem, 'errorType') === 'Reservable'
    },
    getErrorMessage(row) {
      let { errorMessage } = row || {}
      return !isEmpty(errorMessage) ? errorMessage : ''
    },
  },
}
</script>
