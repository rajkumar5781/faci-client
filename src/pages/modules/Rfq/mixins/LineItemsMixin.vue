<script lang="jsx">
import { isEmpty, isNumber } from '@facilio/utils/validation'
import { discountMode } from '../utils/purchaseUtils'
import { API } from '@facilio/api'
import { taxMode } from '../utils/purchaseUtils'
import getProperty from 'dlv'
import { getCurrency } from '../../../../utils/formatter'
const MODULE_LINEITEM_MAP = {
  purchaserequest: 'purchaserequestlineitems',
  purchaseorder: 'purchaseorderlineitems',
  quote: 'quotelineitems',
}

export default {
  data() {
    return {
      individualTaxes: [],
      groupedTaxes: [],
      allTaxes: [],
      discountVisibility: false,
      itemTypes: [],
      nonVendorItems: [],
      toolTypes: [],
      vendorItems: [],
      service: [],
      labours: [],
      uomFieldOptions: [],
      loading: true,
      currencyInfoObj: {},
      isDefaultCurrency: false,
    }
  },
  computed: {
    totalAmount() {
      let { subTotal, totalTax, model, discount } = this
      let { shippingCharges, adjustmentsCost, miscellaneousCharges } =
        model || {}
      return (
        Number(subTotal) +
          Number(totalTax) +
          Number(shippingCharges || 0) +
          Number(adjustmentsCost || 0) +
          Number(miscellaneousCharges || 0) +
          Number(discount) || 0
      )
    },
    totalTax() {
      let { lineItems } = this
      let totalTax = 0
      let taxModeVal = taxMode()
      if (taxModeVal === 1) {
        lineItems.forEach(item => {
          let relativeCost = this.getRelativeLineItemCost(item)
          let taxId = getProperty(item, 'tax.id', -1)
          let tax = this.getTaxObject(taxId)
          let taxRate = getProperty(tax, 'rate', 0)
          totalTax =
            totalTax + Number(((relativeCost * taxRate) / 100).toFixed(2))
        })
      } else if (taxModeVal === 2) {
        let { subTotal = 0 } = this
        let total = Number(subTotal)
        if (discountMode() === 1) {
          // Discount itself will be negative
          total += Number(this.discount)
        }
        let taxId = getProperty(this.model, 'tax.id', -1)
        let tax = this.getTaxObject(taxId)
        let taxRate = getProperty(tax, 'rate', 0)
        totalTax = (total * taxRate) / 100
      }
      return Number(totalTax)
    },
    discount() {
      let { subTotal, model, totalTax } = this
      let { discountAmount, discountPercentage } = model || {}
      let discount = 0
      let total = Number(subTotal)
      if (discountMode() === 2) {
        // Beware of recursion
        total += Number(totalTax)
      }
      if (!isEmpty(discountAmount)) {
        discount = Number(discountAmount)
      } else if (!isEmpty(discountPercentage)) {
        discount = (total * Number(discountPercentage)) / 100
      }
      return Number(-discount) || 0
    },
    subTotal() {
      let { lineItems } = this
      let subTotal = 0
      lineItems.forEach(item => {
        let lineItemCost = this.getLineItemTotalCost(item)
        subTotal += Number(lineItemCost) || 0
      })
      return Number(subTotal)
    },
    getAdjustedTotal() {
      let { subTotal, discount } = this
      return Number(subTotal + discount) || 0
    },
    taxSplitUp() {
      let { lineItems = [] } = this
      let taxSplitUpMap = {}
      let taxModeVal = taxMode()
      if (taxModeVal === 1) {
        lineItems.forEach(lineItem => {
          let taxId = getProperty(lineItem, 'tax.id', -1)
          if (taxId > 0) {
            let taxObj = this.getTaxObject(taxId)
            let lineItemCost = Number(this.getRelativeLineItemCost(lineItem))
            let taxRate
            if (taxObj && taxObj.type === 1) {
              taxRate = Number(taxObj.rate)
              let taxAmount = (lineItemCost * taxRate) / 100
              taxAmount = Number(taxAmount)
              if (taxAmount && taxAmount !== 0) {
                if (getProperty(taxSplitUpMap, `${taxObj}.id`, null)) {
                  taxSplitUpMap[taxObj.id].taxAmount += Number(taxAmount)
                } else {
                  taxSplitUpMap[taxObj.id] = {
                    tax: taxObj,
                    taxAmount: Number(taxAmount),
                  }
                }
              }
            } else if (taxObj && taxObj.type === 2) {
              let { childTaxes = [] } = taxObj || {}
              childTaxes.forEach(child => {
                taxRate = Number(child.rate)
                let taxAmount = (lineItemCost * taxRate) / 100
                taxAmount = Number(taxAmount)
                if (taxAmount !== 0) {
                  let { id } = child
                  if (taxSplitUpMap[id]) {
                    taxSplitUpMap[id].taxAmount += Number(taxAmount)
                  } else {
                    taxSplitUpMap[id] = {
                      tax: child,
                      taxAmount: Number(taxAmount),
                    }
                  }
                }
              })
            }
          }
        })
      } else if (taxModeVal === 2) {
        let { subTotal = 0, model, totalTax, discount } = this
        let taxId = getProperty(model, 'tax.id')
        if (!isEmpty(taxId)) {
          let taxObj = this.getTaxObject(taxId)
          if ((taxObj || {}).type === 1) {
            taxSplitUpMap[taxId] = {
              tax: taxObj,
              taxAmount: totalTax,
            }
          } else if ((taxObj || {}).type === 2) {
            let taxRate = 0
            let total = subTotal
            if (discountMode() === 1) {
              total += discount
            }
            let { childTaxes } = taxObj || {}
            childTaxes.forEach(child => {
              taxRate = Number(child.rate)
              let taxAmount = (total * taxRate) / 100
              taxAmount = Number(taxAmount)
              if (taxAmount !== 0) {
                let { id } = child || {}
                if (taxSplitUpMap[id]) {
                  taxSplitUpMap[id].taxAmount += Number(taxAmount)
                } else {
                  taxSplitUpMap[id] = {
                    tax: child,
                    taxAmount: Number(taxAmount),
                  }
                }
              }
            })
          }
        }
      }
      return taxSplitUpMap
    },
    showTotalTax() {
      return Object.keys(this.taxSplitUp || {}).length > 1
    },
    lineItemCurrency() {
      let currency = getCurrency()
      return this.currencyDetails?.symbol || currency
    },
    isMulticurrencyEnabled() {
      let { account, hasMultiCurrencyField, hasMultiCurrencyFieldInModel } =
        this
      let { multiCurrencyEnabled } =
        getProperty(account, 'data.currencyInfo') || {}
      return (
        multiCurrencyEnabled &&
        (hasMultiCurrencyFieldInModel || hasMultiCurrencyField)
      )
    },
    canShowCurrencyDropDown() {
      let { isMulticurrencyEnabled, isDefaultCurrency } = this
      return !isDefaultCurrency && isMulticurrencyEnabled
    },
    currencyDetails: {
      get() {
        let { currencyData, model } = this
        let { currencyCode, exchangeRate, symbol, initialCurrencyCode } =
          currencyData || model || {}
        return { currencyCode, exchangeRate, symbol, initialCurrencyCode }
      },
      set(value) {
        let { currencyData, lineItems, model } = this
        let { currencyCode, exchangeRate } = value || {}
        this.currencyData = { ...(currencyData || {}), ...value }
        let filteredLineItems = (lineItems || []).map(item => {
          return { ...item, currencyCode, exchangeRate }
        })
        this.$emit('update:model', {
          ...model,
          currencyCode,
          exchangeRate,
          filteredLineItems,
        })
      },
    },
  },
  created() {
    this.fetchMetaFields()
  },
  methods: {
    getProperty,
    validateForm() {
      let isValid = true
      let { model = {} } = this
      let { lineItems } = model
      let { requestForQuotationLineItems } = model
      let { module } = this
      let requestedLineItems = {}

      if (module === 'requestForQuotation') {
        requestedLineItems = requestForQuotationLineItems
      } else {
        requestedLineItems = lineItems
      }
      requestedLineItems.forEach((lineItem, index) => {
        let descriptionFormRef = this.$refs[`lineItem-description-${index}`]
        let unitPriceFormRef = this.$refs[`lineItem-unitPrice-${index}`]
        let quantityFormRef = this.$refs[`lineItem-quantity-${index}`]
        if (!isEmpty(descriptionFormRef)) {
          descriptionFormRef[0].validate(valid => {
            if (!valid) {
              isValid = false
            }
          })
        }
        if (!isEmpty(unitPriceFormRef)) {
          unitPriceFormRef[0].validate(valid => {
            if (!valid) {
              isValid = false
            }
          })
        }
        if (!isEmpty(quantityFormRef)) {
          quantityFormRef[0].validate(valid => {
            if (!valid) {
              isValid = false
            }
          })
        }
      })
      let additionalCostForm = this.$refs[`lineItem-additionalCosts`]
      if (!isEmpty(additionalCostForm)) {
        additionalCostForm.validate(valid => {
          if (!valid) {
            isValid = false
          }
        })
      }
      return isValid
    },
    removeLineItems(index) {
      let { lineItems } = this
      lineItems.splice(index, 1)
    },
    getLineItemsList(type) {
      let { lineItemTypesMap } = this
      let listModel = getProperty(lineItemTypesMap, `${type}.list`, [])
      return listModel ? this[`${listModel}`] : false
    },
    typeChangeAction(val) {
      val.unitPrice = null
    },
    getIndividualTaxes(lineItems = [], taxList = []) {
      let lineItemsTaxIdsList = (lineItems || []).map(lineItem => {
        return getProperty(lineItem, 'tax.id')
      })
      let individualTax = (taxList || []).filter(
        t => t.type === 1 && (lineItemsTaxIdsList.includes(t.id) || t.isActive)
      )
      return individualTax
    },
    getGroupedTaxes(lineItems = [], taxList = []) {
      let lineItemsTaxIdsList = (lineItems || []).map(lineItem => {
        return getProperty(lineItem, 'tax.id')
      })
      let groupedTaxes = (taxList || []).filter(
        t => t.type === 2 && (lineItemsTaxIdsList.includes(t.id) || t.isActive)
      )
      return groupedTaxes
    },
    getTaxAmount(lineItem, defaultValue = '---') {
      let taxPrice = getProperty(lineItem, 'taxAmount', 0)
      return !isEmpty(taxPrice) && taxPrice > 0 ? parseFloat(taxPrice).toFixed(2) : defaultValue 
    },
    calculateTaxAmount(lineItem) {
      let taxAmount = 0
      let { quantity, counterPrice } = lineItem || {}
      let taxRate = this.getTaxRate(lineItem)
      if (!isEmpty(quantity) && !isEmpty(counterPrice) && !isEmpty(taxRate)) {
        let amount = quantity * counterPrice
        taxAmount = Number(((amount * taxRate) / 100).toFixed(2))
      }
      this.$set(lineItem, 'taxAmount', taxAmount)
      return taxAmount
    },
    getTaxPercentage(lineItem) {
      let percentage = this.getTaxRate(lineItem)
      return !isEmpty(percentage) ? `${percentage} %` : '---'
    },
    getTaxRate(lineItem) {
      let taxId = Number(getProperty(lineItem, 'tax.id', -1))
      let taxObj
      if (taxId > 0) {
        taxObj = this.getTaxObject(taxId)
      }
      let { rate } = taxObj || {}
      return rate
    },
    getTaxObject(id) {
      let { allTaxes } = this
      return (allTaxes || []).find(tax => tax.id === id)
    },
    getLineItemTotalCost(lineItem) {
      let { quantity, unitPrice } = lineItem || {}
      let totalCost = Number(unitPrice) * Number(quantity)
      return isNumber(totalCost) ? totalCost : 0
    },
    addCost(cost) {
      if (cost === 'discount') {
        this.discountVisibility = true
      } else {
        this.model[`${cost}`] = 0
      }
    },
    removeCost(cost) {
      this.model[`${cost}`] = null
    },
    getRelativeLineItemCost(lineItem) {
      let lineItemCost = this.getLineItemTotalCost(lineItem)
      if (discountMode() === 1) {
        let { subTotal, discount } = this
        let subTotalAfterDiscount = Number(subTotal) + Number(discount)
        return subTotalAfterDiscount * (lineItemCost / subTotal)
      } else if (discountMode() === 2) {
        return lineItemCost
      }
      return 0
    },
    getExchangeRate(prevCurrencyCode, lineItemObj) {
      let {
        currencyList,
        currencyDetails,
        currencyObj,
        account,
        initialCurrency,
      } = this
      if (!isEmpty(currencyList)) {
        let { currencyCode } = currencyDetails || {}

        let result = (currencyList || []).find(
          currency => currencyCode === currency.currencyCode
        )

        prevCurrencyCode = prevCurrencyCode || currencyObj?.oldCurrencyCode
        let previousCurrency = (currencyList || []).find(
          currency => prevCurrencyCode === currency.currencyCode
        )

        let { exchangeRate } = result || {}
        let { currencyCode: baseCode } =
          getProperty(account, 'data.currencyInfo') || {}
        let isBaseCurrencyCode = currencyCode === baseCode
        let isPrevBaseCurrencyCode = prevCurrencyCode === baseCode

        let oldExchangeRate = previousCurrency?.exchangeRate

        let { currencyCode: initCode, exchangeRate: initRate } =
          initialCurrency || {}
        if (currencyCode === initCode) {
          exchangeRate = initRate || exchangeRate
        }
        this.currencyInfoObj = {
          exchangeRate,
          oldExchangeRate,
          isBaseCurrencyCode,
          isPrevBaseCurrencyCode,
          currencyCode,
          lineItemObj,
        }
      }

      this.$emit('calculateExchangeRate', this.currencyInfoObj || {})
    },
    setCurrencyData() {
      let { model, currencyObj } = this
      let { currencyCode, exchangeRate, initialCurrencyCode } =
        currencyObj || model || {}
      this.currencyDetails = { currencyCode, exchangeRate, initialCurrencyCode }
    },
    setCurrencyCodeOnChange(currencyCode, exchangeRate, symbol) {
      if (!isEmpty(currencyCode))
        this.currencyDetails = { currencyCode, exchangeRate, symbol }
      this.$emit('setCurrencyCode', currencyCode, exchangeRate)
    },
    async fetchMetaFields() {
      let { module } = this
      if (isEmpty(module)) {
        return
      }

      let moduleName = MODULE_LINEITEM_MAP[module]
      let { data } = await API.get('/module/metafields', {
        moduleName,
      })
      let lineItemFields = getProperty(data, 'meta.fields', [])
      let multiCurrencyField = (lineItemFields || []).find(
        fld => fld.displayTypeEnum === 'MULTI_CURRENCY'
      )
      this.hasMultiCurrencyField = !isEmpty(multiCurrencyField)
    },
  },
}
</script>
