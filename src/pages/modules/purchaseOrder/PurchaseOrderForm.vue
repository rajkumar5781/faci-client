<script>
import ModuleForm from '../../form/ModuleForm.vue'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import setProperty from 'dlv'
import { ftoast } from '@facilio/design-system'
export default {
  extends: ModuleForm,
  computed: {
    conversionId() {
      let { $route = {} } = this
      let {
        query: { recordIds, vendorQuote },
        params: { id },
      } = $route
      return Number(id) || recordIds || vendorQuote
    },
    prIds() {
      let { $route = {} } = this
      let {
        query: { recordIds },
      } = $route
      return recordIds
    },
    requestForQuotation() {
      let { $route } = this
      let {
        query: { requestForQuotation },
      } = $route
      return requestForQuotation
    },
    vendorQuote() {
      let { $route } = this
      let {
        query: { vendorQuote },
      } = $route
      return vendorQuote
    },
    isWidgetsSupported() {
      return true
    },
    isV3Api() {
      return true
    },
    moduleName() {
      return 'purchaseorder'
    },
    moduleDisplayName() {
      return 'Purchase Order'
    },
    queryData() {
      return this.moduleData
    },
  },
  methods: {
    async init() {
      let { conversionId, moduleName, loadDataManually } = this
      this.isLoading = true
      if (!isEmpty(conversionId) || loadDataManually) {
        await this.loadModuleData({
          moduleName,
          conversionId,
        })
      } else {
        this.moduleData = new this.modelDataClass({
          moduleName,
          ...(this.dataObj || {}),
        })
      }

      if (!isEmpty(this.selectedFormDetails)) {
        this.selectedForm = await this.loadFormData(
          null,
          this.selectedFormDetails || null
        )
        return
      }

      // To load to widgets and replace the creation form for the module
      let widgetId = await this.getCreateEditRecordWidgetId()

      if (!isEmpty(widgetId)) {
        this.widgetId = widgetId
        this.isLoading = false
      } else {
        await this.loadFormsList(moduleName)
        this.setInitialForm()
      }
      this.isLoading = false
    },
    async loadModuleData({ conversionId, moduleName }) {
      try {
        let { customProps, prIds, vendorQuote } = this || {}
        let url = `/v2/module/data/${conversionId}?moduleName=${moduleName}`
        let param = { id: conversionId }
        if (!isEmpty(prIds) && isArray(JSON.parse(prIds))) {
          url = `/v2/purchaseorder/convertPrToPo`
          param = { recordIds: JSON.parse(this.prIds) }
        } else if (!isEmpty(vendorQuote)) {
          url = `/v3/requestForQuotation/convertVendorQuoteToPo`
          param = {
            vendorQuote,
          }
        } else {
          url = `v3/modules/data/summary?moduleName=purchaseorder`
        }
        let { data, error } = await API.get(url, param)
        if (error) {
          let { message } = error
          ftoast.critical(message)
        } else {
          let { purchaseorder = {}, purchaserequest = {} } = data || {}
          let summaryData = purchaseorder || purchaserequest
          let { data: subData } = summaryData
          if (subData) {
            summaryData = { ...summaryData, ...subData }
          }
          let { lineItems = [] } = summaryData
          if (!isEmpty(lineItems)) {
            lineItems.forEach(lineItem => {
              let {
                tax,
                toolType,
                itemType,
                service,
                description,
                unitOfMeasure,
              } = lineItem || {}
              if (isEmpty(tax)) {
                setProperty(this.lineItem, 'tax', { id: null })
              }
              if (isEmpty(toolType)) {
                setProperty(this.lineItem, 'toolType', { id: null })
              }
              if (isEmpty(itemType)) {
                setProperty(this.lineItem, 'itemType', { id: null })
              }
              if (isEmpty(service)) {
                setProperty(this.lineItem, 'service', { id: null })
              }
              if (isEmpty(description)) {
                setProperty(this.lineItem, 'description', '')
              }
              if (isEmpty(unitOfMeasure)) {
                setProperty(this.lineItem, 'unitOfMeasure', null)
              }
            })
          }
          summaryData = { ...summaryData, moduleName }
          this.moduleData = new this.modelDataClass(summaryData)
        }
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('purchase_order.summary_fetch_error', { ns: 'procurement' })
        )
      }
    },
  },
}
</script>
