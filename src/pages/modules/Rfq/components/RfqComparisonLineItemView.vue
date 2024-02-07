<template>
  <!-- vendor-quotes-lineitems-table -->
  <FContainer :pointerEvents="canDisableClickActions ? 'none' : ''">
    <FContainer
      height="15px"
      backgroundColor="backgroundMidgroundMedium"
    ></FContainer>
    <FContainer
      padding="containerLarge containerXLarge"
      display="flex"
      alignItems="center"
      width="100%"
    >
      <FContainer
        width="70%"
        display="flex"
        alignItems="center"
        padding="containerLarge containerNone"
      >
        <FContainer display="flex" alignItems="center" width="40%">
          <FIcon group="dsm" name="line-item" size="14"></FIcon>
          <FText appearance="headingMed16">{{
            getItemName(rfqLineItem)
          }}</FText>
        </FContainer>
        <FContainer padding="containerNone containerXLarge">
          <FDivider height="24px" />
        </FContainer>
        <FContainer width="10%">
          <FText appearance="headingMed14">{{
            `${$t('rfq.uom', { ns: 'procurement' })} : ${getUOM(rfqLineItem)}`
          }}</FText>
        </FContainer>
        <FContainer padding="containerNone containerXLarge">
          <FDivider height="24px" />
        </FContainer>
        <FContainer width="30%">
          <FText appearance="headingMed14">{{
            `${$t('rfq.required_quantity', {
              ns: 'procurement',
            })} : ${getQuantity(rfqLineItem)}`
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="canShowAwardedInLineItem"
        width="30%"
        display="flex"
        alignItems="center"
        paddingRight="sectionSmall"
        justifyContent="flex-end"
      >
        <FText appearance="headingMed14">{{
          `${$t('rfq.awarded_to', {
            ns: 'procurement',
          })} : ${showAwardedInLineItem(rfqLineItem)}`
        }}</FText>
      </FContainer>
    </FContainer>
    <FContainer>
      <FTable
        :data="getVendorQuotesLineItems(rfqLineItem)"
        :columns="column"
        :rounded="false"
      >
        <template #[`cell.award`]="{ row }">
          <FRadio
            v-model="row.checked"
            :label="row.id"
            @change="setCheckedLineItem(rfqLineItem, row.id)"
          />
        </template>
        <template #[`cell.vendorName`]="{ row }">
          <FContainer>
            <FIcon group="webtabs" name="vendor" size="12" />
            <FText>{{ getVendorName(row) }}</FText></FContainer
          >
        </template>
        <template #[`cell.taxPercentage`]="{ row }">
          <FText>{{ getTaxPercentage(row) }}</FText>
        </template>
        <template #[`cell.taxAmount`]="{ row }">
          <FText float="right">{{ getTaxAmount(row) }}</FText>
        </template>
        <template #[`cell.counterPrice`]="{ row }">
          <FText float="right">{{ getCounterPrice(row) }}</FText>
        </template>
        <template #[`cell.amount`]="{ row }">
          <FText float="right">{{ getAmount(row) }}</FText>
        </template>
        <template #[`cell.remarks`]="{ row }">
          <FText>{{ getRemarks(row) }}</FText>
        </template>
      </FTable>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import PurchaseOrderMixin from '../../purchaseOrder/mixin/poMixin.vue'
import RfqMixin from '../mixins/Rfqmixins'
import LineItemsMixin from '../mixins/LineItemsMixin.vue'
import isEqual from 'lodash/isEqual'
import { loadEnumMap } from '../utils/purchaseUtils'
import {
  FContainer,
  FText,
  FDivider,
  FRadio,
  FTable,
  FIcon,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { getCurrency } from '../../../../utils/formatter'
export default {
  props: [
    'isAwarded',
    'rfqLineItem',
    'vendorQuotesLineItems',
    'index',
    'lineItemsChecked',
    'filteredRfqLineItems',
    'taxDetails',
  ],
  mixins: [PurchaseOrderMixin, RfqMixin, LineItemsMixin],
  components: { FContainer, FText, FDivider, FRadio, FTable, FIcon },
  data() {
    return {
      radioStatusArr: [],
      uomEnumMap: {},
    }
  },
  watch: {
    filteredRfqLineItems(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.setRadioStatusArr()
      }
    },
  },
  created() {
    this.init()
  },
  computed: {
    canDisableClickActions() {
      let { isAwarded } = this
      return isAwarded
    },
    canShowAwardedInLineItem() {
      let { radioStatusArr = [] } = this
      let showAwardedInLineItem = radioStatusArr.some(
        radioStatus => !isEmpty(radioStatus)
      )
      return showAwardedInLineItem
    },
    column() {
      let currency = getCurrency()
      return [
        {
          id: 1,
          fixed: true,
          displayName: this.$t('rfq.table_column.award', { ns: 'procurement' }),
          name: 'award',
          width: 67,
        },
        {
          displayName: this.$t('rfq.table_column.vendor_name', {
            ns: 'procurement',
          }),
          name: 'vendorName',
          id: 2,
          width: 385,
        },
        {
          displayName: this.$t('rfq.table_column.tax', { ns: 'procurement' }),
          name: 'taxPercentage',
          id: 3,
          width: 80,
        },
        {
          displayName: this.$t('rfq.table_column.taxAmount', {
            ns: 'procurement',
            currency,
          }),
          name: 'taxAmount',
          id: 4,
          width: 125,
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
          displayName: this.$t('rfq.table_column.taxAmount', {
            ns: 'procurement',
            currency,
          }),
          name: 'amount',
          id: 6,
          width: 152,
        },
        {
          displayName: this.$t('rfq.table_column.remark', {
            ns: 'procurement',
          }),
          name: 'remarks',
          id: 7,
          width: 300,
        },
      ]
    },
  },
  methods: {
    getProperty,
    async init() {
      this.uomEnumMap = await loadEnumMap()
      this.setTaxes()
      this.setRadioStatusArr()
    },
    setTaxes() {
      let { taxDetails } = this
      this.allTaxes = taxDetails
    },
    setRadioStatusArr() {
      let radioStatusArr = []
      let { index, filteredRfqLineItems = [], rfqLineItem } = this
      let requestForQuotationLineItems = filteredRfqLineItems
      requestForQuotationLineItems.forEach((_, rfqIndex) => {
        if (rfqIndex == index) {
          let vendorQuoteLineItemForRfqLineItems =
            this.getVendorQuotesLineItems(rfqLineItem)
          let checkedLineItem = vendorQuoteLineItemForRfqLineItems.find(
            vendorQuoteLineItemForRfqLineItem => {
              return vendorQuoteLineItemForRfqLineItem?.checked
            }
          )
          if (!isEmpty(checkedLineItem)) {
            let { id } = checkedLineItem
            radioStatusArr.push(id)
          } else {
            radioStatusArr.push(null)
          }
        } else {
          radioStatusArr.push(null)
        }
      })
      this.radioStatusArr = radioStatusArr
    },
    setCheckedLineItem(rfqLineItem, id) {
      let rfqLineItemId = id
      let vendorQuoteLineItems = this.getVendorQuotesLineItems(rfqLineItem)
      vendorQuoteLineItems.forEach(lineItem => {
        let { id: lineItemId } = lineItem || {}
        lineItem.checked = rfqLineItemId == lineItemId
      })
      let { vendorQuotesLineItems = [] } = this
      let checkedLineItems = vendorQuotesLineItems.filter(
        vendorQuoteLineItem => vendorQuoteLineItem.checked
      )
      this.$emit('setLineItemsChecked', checkedLineItems)
      this.$emit('setlineItemsCheckedCount', this.getLength(checkedLineItems))
      this.setRadioStatusArr()
    },
    showAwardedInLineItem(rfqLineItem) {
      let { lineItemsChecked = [] } = this
      let rfqId = getProperty(rfqLineItem, 'id', null)
      let lineItemForRfq = {}
      if (!isEmpty(lineItemsChecked)) {
        lineItemsChecked.forEach(lineItemChecked => {
          let { requestForQuotationLineItem } = lineItemChecked
          if (getProperty(requestForQuotationLineItem, 'id', null) === rfqId)
            lineItemForRfq = lineItemChecked
        })
      }
      let vendorName = getProperty(lineItemForRfq, 'vendor.name', '---')
      return !isEmpty(lineItemForRfq) ? vendorName : '---'
    },
    getVendorLocation(val) {
      let empty = getProperty(val, 'vendor.address.empty')
      return !empty ? getProperty(val, 'vendor.address.name', '---') : ''
    },
    getUOM(val) {
      let { unitOfMeasure } = val || {}
      return getProperty(this, `uomEnumMap.${unitOfMeasure}`, '---')
    },
    getQuantity(val) {
      return getProperty(val, 'quantity', '---')
    },
    getVendorName(val) {
      return getProperty(val, 'vendor.name', '---')
    },
    getVendorQuotesLineItems(rfqLineItem) {
      let rfqId = getProperty(rfqLineItem, 'id')
      let { vendorQuotesLineItems = [] } = this
      let vendorQuotesLineItemsForRfq = vendorQuotesLineItems.filter(
        vendorQuoteLineItem => {
          let id = getProperty(
            vendorQuoteLineItem,
            'requestForQuotationLineItem.id',
            null
          )
          return rfqId === id
        }
      )
      return vendorQuotesLineItemsForRfq
    },
    getLength(val) {
      let lengthProp = Object.keys(val)
      let { length } = lengthProp
      return length
    },
  },
}
</script>
