<template>
  <FContainer :pointerEvents="canDisableClickActions ? 'none' : ''">
    <FContainer
      height="15px"
      backgroundColor="backgroundMidgroundMedium"
    ></FContainer>
    <FContainer
      :opacity="disableRowAction ? 0.6 : 1"
      :pointerEvents="disableRowAction ? 'none' : ''"
      :background="
        disableRowAction ? 'backgroundMidgroundMedium' : 'backgroundContainer'
      "
    >
      <FContainer
        display="flex"
        width="100%"
        padding="sectionSmall containerLarge"
      >
        <FContainer width="85%" alignItems="center">
          <FContainer display="flex" alignItems="center">
            <FIcon size="18" group="webtabs" name="vendor" />
            <FText appearance="headingMed20">{{
              getVendorName(vendorQuote)
            }}</FText>
          </FContainer>
        </FContainer>
        <FContainer
          v-if="lineItemsCheckedCount"
          width="15%"
          justifyContent="flex-end"
          alignItems="center"
        >
          <FText appearance="headingMed16" paddingRight="containerXLarge">{{
            `${$t('rfq.awarded', { ns: 'procurement' })} :`
          }}</FText>
          <FText appearance="headingMed14">{{
            showAwardedInVendor(vendorQuote)
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer>
        <FTable :columns="column" :data="getTableData" :rounded="false">
          <template #[`cell.award`]="{ row }">
            <FCheckbox
              v-model="row.checked"
              @change="updateChecked(row)"
              :disabled="checkIsDisabled(row)"
            />
          </template>
          <template #[`cell.id`]="{ row }">
            <FContainer>
              <FIcon group="dsm" name="line-item" size="12" />
              <FText>{{ getItemName(row) }}</FText></FContainer
            >
          </template>
          <template #[`cell.uom`]="{ row }">
            <FText>{{ uom(row) }}</FText>
          </template>
          <template #[`cell.counterPrice`]="{ row }">
            <FText float="right">{{ getCounterPrice(row) }}</FText>
          </template>
          <template #[`cell.taxPercentage`]="{ row }">
            <FText>{{ getTaxPercentage(row) }}</FText>
          </template>
          <template #[`cell.taxAmount`]="{ row }">
            <FText float="right">{{ getTaxAmount(row) }}</FText>
          </template>
          <template #[`cell.amount`]="{ row }">
            <FText float="right">{{ getAmount(row) }}</FText>
          </template>
          <template #[`cell.remarks`]="{ row }">
            <FText>{{ getRemarks(row) }}</FText>
          </template>
        </FTable>
      </FContainer>
      <FContainer padding="containerLarge containerLarge" display="flex">
        <FContainer
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="flex-end"
        >
          <FText appearance="headingMed14">
            {{
              `${$t('rfq.total_quoted_amount', {
                ns: 'procurement',
                currency,
                getTotalCost,
              })}`
            }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import RfqMixin from '../mixins/Rfqmixins'
import LineItemsMixin from '../mixins/LineItemsMixin.vue'
import { loadEnumMap, sumValues } from '../utils/purchaseUtils'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FTable,
  FCheckbox,
  FIcon,
} from '@facilio/design-system'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { getCurrency } from '../../../../utils/formatter'
export default {
  props: [
    'isAwarded',
    'vendorQuote',
    'lineItemsCheckedCount',
    'vendorQuotes',
    'lineItemTotalCount',
    'lineItemsChecked',
    'taxDetails',
  ],
  mixins: [RfqMixin, LineItemsMixin],
  components: { FContainer, FText, FTable, FCheckbox, FIcon },
  data() {
    return {
      checked: false,
      vendorQuotesCopy: [],
      uomEnumMap: {},
    }
  },
  created() {
    this.init()
  },
  watch: {
    lineItemsCheckedCount(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.setMarkAll()
      }
    },
    taxDetails(val) {
      this.$setProperty(this, 'allTaxes', val)
    },
  },
  computed: {
    canDisableClickActions() {
      let { isAwarded } = this
      return isAwarded
    },
    getTableData() {
      return getProperty(this, 'vendorQuote.vendorQuotesLineItems', [])
    },
    disableRowAction() {
      let { vendorQuote } = this
      return this.canDisableMarkAll(vendorQuote)
    },
    currency() {
      return getCurrency()
    },
    getTotalCost() {
      let { vendorQuote } = this
      let { vendorQuotesLineItems = [] } = vendorQuote || {}
      let totalAmount = sumValues(
        vendorQuotesLineItems.map(vendorQuoteLineItem => {
          let { quantity, counterPrice, taxAmount } = vendorQuoteLineItem || {}
          let amount = quantity * counterPrice
          if (!isEmpty(taxAmount)) {
            amount += taxAmount
          }
          vendorQuoteLineItem.amount = amount
          return amount
        })
      )
      return !isEmpty(totalAmount) ? parseFloat(totalAmount).toFixed(2) : '---'
    },
    column() {
      let { currency } = this
      return [
        {
          id: 1,
          displayName: this.$t('rfq.table_column.award', { ns: 'procurement' }),
          name: 'award',
          width: 67,
        },
        {
          displayName: this.$t('rfq.table_column.id', { ns: 'procurement' }),
          name: 'id',
          id: 2,
          width: 256,
        },
        {
          displayName: this.$t('rfq.table_column.uom', { ns: 'procurement' }),
          name: 'uom',
          id: 3,
          width: 76,
        },
        {
          displayName: this.$t('rfq.table_column.quantity', {
            ns: 'procurement',
          }),
          name: 'quantity',
          id: 4,
          width: 88,
        },
        {
          displayName: this.$t('rfq.table_column.quoted_unit_price', {
            ns: 'procurement',
            currency,
          }),
          name: 'counterPrice',
          id: 5,
          width: 164,
        },
        {
          displayName: this.$t('rfq.table_column.tax', { ns: 'procurement' }),
          name: 'taxPercentage',
          id: 3,
          width: 76,
        },
        {
          displayName: this.$t('rfq.table_column.taxAmount', {
            ns: 'procurement',
            currency,
          }),
          name: 'taxAmount',
          id: 6,
          width: 128,
        },
        {
          displayName: this.$t('rfq.table_column.quoted_amount_price', {
            ns: 'procurement',
            currency,
          }),
          name: 'amount',
          id: 7,
          width: 152,
        },
        {
          displayName: this.$t('rfq.table_column.remark', {
            ns: 'procurement',
          }),
          name: 'remarks',
          id: 8,
          width: 250,
        },
      ]
    },
  },
  methods: {
    getProperty,
    async init() {
      this.uomEnumMap = await loadEnumMap()
      this.setTaxes()
      this.vendorQuotesCopy = cloneDeep(this.vendorQuotes)
      this.setMarkedLineItems(this.vendorQuotes)
    },
    setTaxes() {
      let { taxDetails } = this
      this.allTaxes = taxDetails
    },

    getVendorName(val) {
      return getProperty(val, 'vendor.name', '---')
    },
    getVendorQuotesLineItems(val) {
      return getProperty(val, 'vendorQuotesLineItems')
    },
    showAwardedInVendor(vendorQuote) {
      let count,
        checkedLineItems = {}
      let { vendorQuotesLineItems = [] } = vendorQuote || {}
      checkedLineItems = vendorQuotesLineItems.filter(
        vendorQuoteLineItem => vendorQuoteLineItem?.checked
      )
      count = this.getLength(checkedLineItems)
      let { lineItemTotalCount } = this
      return `${count} of ${lineItemTotalCount} Items`
    },
    canDisableMarkAll(vendorQuote) {
      let { vendorQuotesLineItems = [] } = vendorQuote || {}
      let isNotCheckedAndDisabled = vendorQuotesLineItems.every(
        vendorQuoteLineItem => {
          return (
            !vendorQuoteLineItem?.checked &&
            this.checkIsDisabled(vendorQuoteLineItem)
          )
        }
      )
      let { lineItemsChecked } = this
      return isNotCheckedAndDisabled && !isEmpty(lineItemsChecked)
    },
    checkIsDisabled(val = {}) {
      let rfqIds = {}
      let { lineItemsChecked = [] } = this
      if (!isEmpty(lineItemsChecked)) {
        rfqIds = lineItemsChecked.map(checkedLineItem => {
          let { requestForQuotationLineItem } = checkedLineItem || {}
          let { id } = requestForQuotationLineItem || {}
          return id
        })
      }
      let rfqId = getProperty(val, 'requestForQuotationLineItem.id')
      let { checked } = val
      return (
        !isEmpty(val) && !checked && !isEmpty(rfqIds) && rfqIds.includes(rfqId)
      )
    },
    getDisabledRowClassName({ row }) {
      if (this.checkIsDisabled(row)) {
        return 'disabled-row'
      }
      return ''
    },
    updateChecked(row) {
      let { vendorQuote = {}, vendorQuotesCopy } = this
      let { vendorQuotesLineItems = [] } = vendorQuote
      let updatedVendorQuotesLineItems = vendorQuotesLineItems.map(
        vendorQuotesLineItem => {
          if (vendorQuotesLineItem.id === row.id) {
            return row
          } else {
            return vendorQuotesLineItem
          }
        }
      )
      let updatedVendorQuote = cloneDeep(vendorQuote)
      updatedVendorQuote.vendorQuotesLineItems = updatedVendorQuotesLineItems
      vendorQuotesCopy = vendorQuotesCopy.map(vendorQuote => {
        if (vendorQuote.id === updatedVendorQuote.id) {
          return updatedVendorQuote
        } else {
          return vendorQuote
        }
      })
      this.$emit('updateVendorQuote', updatedVendorQuote)
      this.setMarkedLineItems(vendorQuotesCopy)
    },
    setMarkedLineItems(vendorQuotes = []) {
      let checkedLineItems = []
      if (vendorQuotes) {
        vendorQuotes.forEach(vendorQuote => {
          let { vendorQuotesLineItems = [], vendor } = vendorQuote || {}
          vendorQuotesLineItems.forEach(vendorQuotesLineItem => {
            if (vendorQuotesLineItem.checked) {
              vendorQuotesLineItem.vendor = vendor
              checkedLineItems.push(vendorQuotesLineItem)
            }
          })
        })
      }
      this.$emit('setLineItemsChecked', checkedLineItems)
      this.$emit('setlineItemsCheckedCount', this.getLength(checkedLineItems))
      this.setMarkAll()
    },
    setMarkAll() {
      let { vendorQuote } = this
      let vendorQuotesLineItems = this.getVendorQuotesLineItems(vendorQuote)
      let isAnyLineItmeChecked = vendorQuotesLineItems.some(element => {
        return element?.checked
      })
      if (isAnyLineItmeChecked) {
        let lineItemsChecked = vendorQuotesLineItems.filter(element => {
          return element?.checked
        })
        let lineItemsCheckedCount = this.getLength(lineItemsChecked)
        let lineItemsDisabled = vendorQuotesLineItems.filter(element =>
          this.checkIsDisabled(element)
        )
        let lineItemsDisabledCount = this.getLength(lineItemsDisabled)
        let total = lineItemsCheckedCount + lineItemsDisabledCount
        this.checked = total === this.lineItemTotalCount
      } else {
        this.checked = false
      }
    },
    getLength(val) {
      let lengthProp = Object.keys(val)
      let { length } = lengthProp
      return length
    },
    markAll(vendorQuote = {}, check) {
      let { vendorQuotesLineItems = [] } = vendorQuote
      vendorQuotesLineItems.forEach(vendorQuotesLineItem => {
        if (!this.checkIsDisabled(vendorQuotesLineItem))
          vendorQuotesLineItem.checked = check
      })
      this.setMarkedLineItems(check)
    },
  },
}
</script>
