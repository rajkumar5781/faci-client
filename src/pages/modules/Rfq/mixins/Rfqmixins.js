import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { sumValues } from '../utils/purchaseUtils'
export default {
  methods: {
    getProperty,
    getVendorQuotesLineItems(val) {
      return getProperty(val, 'vendorQuotesLineItems')
    },
    uom(val) {
      let unitOfMeasure = getProperty(
        val,
        'requestForQuotationLineItem.unitOfMeasure'
      )
      return this.uomEnumMap[unitOfMeasure]
    },
    getItemName(val, defaultValue = '---') {
      let { inventoryTypeEnum } = val || {}
      const inventoryTypeVsKeys = {
        ITEM: 'itemType.name',
        TOOL: 'toolType.name',
        SERVICE: 'service.name',
        DEFAULT: 'description',
      }
      let nameKey =
        inventoryTypeVsKeys[inventoryTypeEnum] || inventoryTypeVsKeys['DEFAULT']
      return getProperty(val, nameKey, defaultValue)
    },
    getItemDescription(val = {}, defaultValue = '---') {
      let { inventoryTypeEnum } = val
      return inventoryTypeEnum === 'OTHERS'
        ? ''
        : getProperty(val, 'description', defaultValue)
    },
    getRemarks(val, defaultValue = '---') {
      return getProperty(val, 'remarks', defaultValue)
    },
    getAmount(val = {}, defaultValue = '---') {
      let { quantity, counterPrice, taxAmount } = val
      let amount = quantity * counterPrice
      if (!isEmpty(taxAmount)) {
        amount += taxAmount
      }
      val.amount = amount
      return !isEmpty(amount) && !isEmpty(counterPrice)
        ? parseFloat(amount).toFixed(2)
        : defaultValue
    },
    getTotalAmount(vendorQuote, defaultValue = '---') {
      let { vendorQuotesLineItems } = vendorQuote || {}
      let totalAmount = sumValues(
        vendorQuotesLineItems.map(vendorQuoteLineItem => {
          return vendorQuoteLineItem.amount
        })
      )
      return !isEmpty(totalAmount)
        ? parseFloat(totalAmount).toFixed(2)
        : defaultValue
    },
    getCounterPrice(val, defaultValue = '---') {
      let counterPrice = getProperty(val, 'counterPrice')
      return !isEmpty(counterPrice)
        ? parseFloat(counterPrice).toFixed(2)
        : defaultValue
    },
    getUnitPrice(val, defaultValue = '---') {
      let unitPrice = getProperty(val, 'unitPrice')
      return !isEmpty(unitPrice)
        ? parseFloat(unitPrice).toFixed(2)
        : defaultValue
    },
    totalQuotedAmount(vendorQuotesLineItems, defaultValue = '---') {
      let totalAmount = sumValues(
        vendorQuotesLineItems.map(vendorQuoteLineItem => {
          let { quantity, counterPrice, taxAmount } = vendorQuoteLineItem || {}
          let amount = quantity * counterPrice
          if (!isEmpty(taxAmount)) {
            amount += taxAmount
          }
          return !isNaN(amount) ? amount : 0
        })
      )
      return totalAmount ? parseFloat(totalAmount).toFixed(2) : defaultValue
    },
  },
  RFQ_TYPE: {
    OPEN_BID: 'OPEN_BID',
    CLOSED_BID: 'CLOSED_BID',
  },
}
