<template>
  <FModal
    :visible="showAwardVendorModal"
    @cancel="onClose"
    :title="$t('rfq.vendor_comparision', { ns: 'procurement' })"
    size="XL"
    :hideFooter="true"
  >
    <FContainer
      backgroundColor="backgroundCanvas"
      zIndex="100"
      position="sticky"
      top="0"
    >
      <FContainer display="flex" background="backgroundCanvas" width="100%">
        <FContainer
          v-if="vendorViewVisibility"
          display="flex"
          alignItems="center"
          paddingLeft="sectionSmall"
          width="20%"
        >
          <FInput
            v-model="searchVendor"
            type="text"
            :placeholder="$t('rfq.search_vendor', { ns: 'procurement' })"
            @change="filterVendorQuotes"
          />
        </FContainer>
        <FContainer
          v-if="lineItemViewVisibility"
          display="flex"
          alignItems="center"
          paddingLeft="sectionSmall"
          width="20%"
        >
          <FInput
            v-model="searchLineItem"
            type="text"
            :placeholder="$t('rfq.search_lineitem', { ns: 'procurement' })"
            @change="filterRfqLineItem"
          />
        </FContainer>
        <FContainer
          width="80%"
          paddingRight="sectionSmall"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <FContainer
            display="flex"
            alignItems="center"
            paddingRight="containerLarge"
          >
            <FText>
              {{ $t('rfq.view_as', { ns: 'procurement' }) }}
            </FText>
          </FContainer>
          <FContainer
            backgroundColor="backgroundMidgroundMedium"
            height="fit-content"
            borderRadius="medium"
            margin="containerLarge containerNone"
          >
            <FContainer display="flex" margin="containerMedium">
              <FButton
                :appearance="vendorViewVisibility ? 'secondary' : 'tertiary'"
                size="small"
                @click="openVendorViewDialog"
                iconGroup="webtabs"
                iconName="vendor"
                iconPosition="prefix"
              >
                {{ $t('rfq.vendor', { ns: 'procurement' }) }}
              </FButton>
              <FButton
                :appearance="lineItemViewVisibility ? 'secondary' : 'tertiary'"
                size="small"
                @click="openLineItemViewDialog"
                iconGroup="dsm"
                iconName="line-item"
                iconPosition="prefix"
              >
                {{ $t('rfq.line_item', { ns: 'procurement' }) }}
              </FButton>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <template v-if="vendorViewVisibility">
      <div v-if="isEmpty(filteredVendorQuotes)"></div>
      <FContainer
        v-else
        v-for="vendorQuote in filteredVendorQuotes"
        :key="vendorQuote.id"
      >
        <RfqComparisonVendorView
          :isAwarded="isAwarded"
          :vendorQuote="vendorQuote"
          :vendorQuotes="vendorQuotes"
          :lineItemTotalCount="lineItemTotalCount"
          :lineItemsCheckedCount="lineItemsCheckedCount"
          :lineItemsChecked="lineItemsChecked"
          :taxDetails="allTaxes"
          @updateVendorQuote="updateVendorQuote"
          @setLineItemsChecked="setLineItemsChecked"
          @setlineItemsCheckedCount="setlineItemsCheckedCount"
        >
        </RfqComparisonVendorView>
      </FContainer>
    </template>
    <template v-if="lineItemViewVisibility">
      <div v-if="isEmpty(filteredRfqLineItems)"></div>
      <FContainer
        v-else
        v-for="(rfqLineItem, index) in filteredRfqLineItems"
        :key="rfqLineItem.id"
      >
        <RfqComparisonLineItemView
          :isAwarded="isAwarded"
          :rfqLineItem="rfqLineItem"
          :filteredRfqLineItems="filteredRfqLineItems"
          :index="index"
          :taxDetails="allTaxes"
          :vendorQuotesLineItems="vendorQuotesLineItems"
          :lineItemsChecked="lineItemsChecked"
          @setLineItemsChecked="setLineItemsChecked"
          @setlineItemsCheckedCount="setlineItemsCheckedCount"
        >
        </RfqComparisonLineItemView>
      </FContainer>
    </template>
    <FContainer
      display="flex"
      justifyContent="center"
      position="sticky"
      bottom="20px"
      z-index="100"
      v-if="showAwardToolBar"
    >
      <FBulkToolbar @close="closeDialog()" :recordCount="lineItemsCheckedCount">
        <FTooltip placement="top">
          <template v-if="!checkItemCountReceived" slot="title">
            {{
              $t('rfq.banner_msg', { ns: 'procurement', lineItemTotalCount })
            }}
          </template>
          <FButton
            appearance="secondary"
            size="small"
            @click="saveRecord"
            :disabled="!checkItemCountReceived"
            :loading="isButtonLoading"
            iconGroup="files"
            iconName="edit-list"
            iconPosition="prefix"
            >{{ $t('rfq.award', { ns: 'procurement' }) }}</FButton
          >
        </FTooltip>
      </FBulkToolbar>
    </FContainer>
    <FContainer height="15px" />
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import RfqComparisonVendorView from './RfqComparisonVendorView.vue'
import RfqComparisonLineItemView from './RfqComparisonLineItemView.vue'
import LineItemsMixin from '../mixins/LineItemsMixin.vue'
import RfqMixin from '../mixins/Rfqmixins'
import { loadTaxes, sumValues, taxMode } from '../utils/purchaseUtils'
import {
  FModal,
  FContainer,
  FText,
  FInput,
  FIcon,
  FButton,
  FBulkToolbar,
  FTooltip,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import getProperty from 'dlv'
import setProperty from 'dlv'
export default {
  name: 'AwardVendor',
  props: ['moduleName', 'record', 'showAwardVendorModal'],
  mixins: [RfqMixin, LineItemsMixin],
  components: {
    RfqComparisonVendorView,
    RfqComparisonLineItemView,
    FModal,
    FContainer,
    FText,
    FInput,
    FIcon,
    FButton,
    FBulkToolbar,
    FTooltip,
  },
  data() {
    return {
      requestForQuotationLineItems: null,
      vendorViewVisibility: true,
      vendorQuotes: null,
      lineItemTotalCount: '',
      lineItemsChecked: null,
      lineItemsCheckedCount: '',
      lineItemViewVisibility: false,
      vendorQuotesLineItems: null,
      searchVendor: '',
      searchLineItem: '',
      filteredVendorQuotes: null,
      filteredRfqLineItems: null,
      isButtonLoading: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    isAwarded() {
      let { record = {} } = this
      let { isAwarded } = record
      return isAwarded
    },
    showAwardToolBar() {
      let { isAwarded, lineItemsCheckedCount } = this
      return !isAwarded && lineItemsCheckedCount > 0
    },
    awardButtonClass() {
      let { record, lineItemTotalCount, lineItemsCheckedCount } = this
      let { isAwarded } = record || {}
      let isAllChecked = lineItemTotalCount === lineItemsCheckedCount
      return !isAllChecked || isAwarded
    },
    checkItemCountReceived() {
      let { lineItemsCheckedCount, lineItemTotalCount } = this
      return lineItemsCheckedCount === lineItemTotalCount
    },
    checkAwardedToOneVendor() {
      let {
        lineItemsChecked = [],
        lineItemTotalCount,
        lineItemsCheckedCount,
      } = this
      if (!isEmpty(lineItemsChecked)) {
        let isAllChecked = lineItemTotalCount === lineItemsCheckedCount
        let pickOneVendor = lineItemsChecked[0].vendor || {}
        let pickOneVendorName = pickOneVendor.name || {}
        let isAwardedToOneVendor = lineItemsChecked.every(element => {
          let { vendor } = element || {}
          let { name } = vendor || {}
          return name === pickOneVendorName
        })
        return isAwardedToOneVendor && isAllChecked
      }
      return false
    },
  },
  methods: {
    getProperty,
    isEmpty,
    async init() {
      await this.loadVendorQuotes()
      let { vendorQuotes } = this
      let taxList = await loadTaxes()
      this.allTaxes = taxList
      this.individualTaxes = this.getIndividualTaxes(vendorQuotes, taxList)
      this.groupedTaxes = this.getGroupedTaxes(vendorQuotes, taxList)
      if (
        !this.isEdit &&
        taxMode() === 2 &&
        !isEmpty(taxList) &&
        isArray(taxList) &&
        taxList.length === 1
      ) {
        setProperty(this.model, 'tax.id', getProperty(taxList, [0, 'id']))
      }
    },
    filterRfqLineItem() {
      let { searchLineItem, requestForQuotationLineItems = [] } = this
      let searchKey = searchLineItem.toLowerCase() || {}
      let filteredRfqLineItems = requestForQuotationLineItems.filter(
        rfqLineItem => {
          let itemName = this.getItemName(rfqLineItem).toLowerCase()
          return itemName.includes(searchKey)
        }
      )
      this.filteredRfqLineItems = filteredRfqLineItems
      if (isEmpty(searchKey)) {
        this.filteredRfqLineItems = requestForQuotationLineItems
      }
    },
    updateVendorQuote(updatedVendorQuote) {
      let { vendorQuotes = [] } = this
      let lineItems = []
      let updatedVendorQuotes = vendorQuotes.map(vendorQuote => {
        if (vendorQuote.id === updatedVendorQuote.id) return updatedVendorQuote
        else return vendorQuote
      })
      updatedVendorQuotes.forEach(vendorQuote => {
        let { vendorQuotesLineItems = [] } = vendorQuote || {}
        vendorQuotesLineItems.forEach(vendorQuotesLineItem => {
          lineItems.push(vendorQuotesLineItem)
        })
      })
      this.vendorQuotesLineItems = lineItems
      this.vendorQuotes = updatedVendorQuotes
      this.filteredVendorQuotes = updatedVendorQuotes
    },
    filterVendorQuotes() {
      let { searchVendor, vendorQuotes = [] } = this
      let searchKey = searchVendor.toLowerCase() || {}
      let filteredVendorQuotes = vendorQuotes.filter(vendorQuote => {
        let vendorName = getProperty(vendorQuote, 'vendor.name').toLowerCase()
        return vendorName.includes(searchKey)
      })
      this.filteredVendorQuotes = filteredVendorQuotes
      if (isEmpty(searchKey)) {
        this.filteredVendorQuotes = vendorQuotes
      }
    },
    setlineItemsCheckedCount(count) {
      let { lineItemsChecked = [] } = this
      this.lineItemsCheckedCount = lineItemsChecked.length
    },
    setLineItemsChecked(val) {
      let { vendorQuotes = [] } = this
      let checkedLineItems = []
      vendorQuotes.map(vendorQuote => {
        let { vendorQuotesLineItems = [], vendor } = vendorQuote || {}
        vendorQuotesLineItems.map(vendorQuotesLineItem => {
          let { checked } = vendorQuotesLineItem
          if (checked) {
            vendorQuotesLineItem.vendor = vendor
            checkedLineItems.push(vendorQuotesLineItem)
          }
        })
      })
      this.lineItemsChecked = checkedLineItems
    },
    openVendorViewDialog() {
      this.vendorViewVisibility = true
      this.lineItemViewVisibility = false
    },
    openLineItemViewDialog() {
      this.lineItemViewVisibility = true
      this.vendorViewVisibility = false
    },
    onClose() {
      this.$emit('cancel')
    },
    async loadVendorQuotes() {
      let vendorQuotesLineItemsList = []
      let reqForQuotId = getProperty(this, 'record.id')
      let params = {
        filters: JSON.stringify({
          requestForQuotation: {
            operatorId: 36,
            value: [`${reqForQuotId}`],
          },
        }),
        getWithLineItems: true,
      }
      let { list = [], error = {} } = await API.fetchAll('vendorQuotes', params)
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('rfq.error_loading_vendor_quotes', {
              ns: 'procurement',
            })
        )
      } else {
        list = list.filter(vendorQuote => {
          let { isFinalized, negotiation } = vendorQuote || {}
          return isFinalized && !negotiation
        })
        list.map(vendorQuote => {
          let { vendorQuotesLineItems = [], vendor } = vendorQuote || {}
          vendorQuotesLineItems.forEach(vendorQuotesLineItem => {
            vendorQuotesLineItem.checked = false
            vendorQuotesLineItem.vendor = vendor
            vendorQuotesLineItem.amount = 0
            vendorQuotesLineItemsList.push(vendorQuotesLineItem)
          })
          this.lineItemTotalCount = this.getLength(vendorQuotesLineItems)
        })
        this.vendorQuotesLineItems = vendorQuotesLineItemsList
        this.vendorQuotes = list
        this.filteredVendorQuotes = list
      }
      let rfqLineItems = this.getRfqLineItems()
      this.requestForQuotationLineItems = rfqLineItems
      this.auotSetCheckedLineItemsIfAwarded()
    },
    getRfqLineItems() {
      let { requestForQuotationLineItems } = this.record || {}
      this.filteredRfqLineItems = requestForQuotationLineItems
      return requestForQuotationLineItems
    },
    auotSetCheckedLineItemsIfAwarded() {
      let { isAwarded } = this.record || {}
      let lineItemsChecked = []
      if (isAwarded) {
        let { requestForQuotationLineItems = [], vendorQuotesLineItems = [] } =
          this
        requestForQuotationLineItems.forEach(element => {
          let { awardedTo, id } = element || {}
          let rfqVendorName = awardedTo.name || {}
          let filteredLineItems = []
          filteredLineItems = vendorQuotesLineItems.filter(
            vendorQuotesLineItem => {
              let { requestForQuotationLineItem, vendor } = vendorQuotesLineItem
              let rfqId = getProperty(requestForQuotationLineItem, 'id', null)
              let vendQuotVendorName = getProperty(vendor, 'name', null)
              return rfqId === id && vendQuotVendorName === rfqVendorName
            }
          )
          let checkedLineItems = filteredLineItems.map(element => {
            element.checked = true
            return element
          })
          if (!isEmpty(checkedLineItems))
            lineItemsChecked.push(checkedLineItems)
        })
        this.lineItemsChecked = lineItemsChecked
        this.lineItemsCheckedCount = this.getLength(lineItemsChecked)
      }
    },
    getLength(val) {
      let lengthProp = Object.keys(val)
      let { length } = lengthProp
      return length
    },
    closeDialog() {
      this.onClose()
    },
    async saveRecord() {
      this.isButtonLoading = true
      let { lineItemsChecked, checkAwardedToOneVendor } = this
      let message = checkAwardedToOneVendor
        ? this.$t('rfq.award_all_to_one_vendor_confirmation', {
            ns: 'procurement',
          })
        : this.$t('rfq.award_vendor_comparison_confirmation', {
            ns: 'procurement',
          })
      if (!isEmpty(lineItemsChecked)) {
        let value = await fDialog.warning({
          title: this.$t('rfq.confirm_vendor_selection', { ns: 'procurement' }),
          description: message,
          cancelText: this.$t('rfq.cancel', { ns: 'procurement' }),
          saveText: this.$t('rfq.confirm', { ns: 'procurement' }),
        })
        if (value) {
          let rfqLineItems = (lineItemsChecked || []).map(lineItem => {
            let { requestForQuotationLineItem } = lineItem || {}
            let {
              counterPrice: awardedPrice,
              vendor: awardedTo,
              quantity,
              tax,
            } = lineItem || {}
            return {
              ...requestForQuotationLineItem,
              awardedPrice,
              awardedTo,
              quantity,
              tax,
            }
          })
          let data = {
            id: this.record.id,
            data: {
              requestForQuotationLineItems: rfqLineItems,
            },
            params: {
              awardQuotes: true,
            },
          }
          let { error = {} } = await API.updateRecord(this.moduleName, data)
          if (error) {
            let { message } = error
            ftoast.critical(
              message ||
                this.$t('rfq.error_awarding_vendors', { ns: 'procurement' })
            )
          } else {
            ftoast.success(
              this.$t('rfq.awarded_vendors_success', {
                ns: 'procurement',
              })
            )

            this.onClose()
            this.$emit('saved')
          }
        }
      }
      this.isButtonLoading = false
    },
  },
}
</script>
