<script>
import ModuleForm from '../../form/ModuleForm.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { dset as setProperty } from 'dset'
export default {
  extends: ModuleForm,
  name: 'InvoiceForm',
  data() {
    return {
      dataId: null,
      conversionForm: null,
    }
  },
  computed: {
    id() {
      let paramId = this.$attrs.id || this.$route.params.id
      return paramId ? parseInt(this.$route.params.id) : ''
    },
    groupId() {
      let { $route = {} } = this
      let { params = {} } = $route
      let { id } = params
      return !isEmpty(id) ? parseInt(id) : null
    },
    workorder() {
      let { $route = {} } = this
      let {
        query: { workorder },
      } = $route
      return workorder
    },
    invoiceType() {
      let { $route = {} } = this
      let {
        query: { conversionType },
      } = $route
      return conversionType
    },
    poId() {
      let { $route = {} } = this
      let {
        query: { poId },
      } = $route
      return poId
    },
    quote() {
      let { $route = {} } = this
      let {
        query: { quote },
      } = $route
      return quote
    },
    invoiceId() {
      let { $route = {} } = this
      let {
        query: { invoiceId },
      } = $route
      return invoiceId
    },
    conversionType() {
      let { $route = {} } = this
      let {
        query: { conversionType },
      } = $route
      return conversionType
    },
    isConversion() {
      let { workorder, poId, quote, invoiceId, moduleDataId } = this
      return workorder || poId || quote || invoiceId || moduleDataId
    },
    version() {
      let { $route = {} } = this
      let { query } = $route
      let version = getProperty(query, 'version', '').slice(1)
      return !isEmpty(version) ? parseInt(version) : null
    },
    moduleName() {
      return 'invoice'
    },
    moduleDisplayName() {
      return 'Invoice'
    },
    queryData() {
      return this.moduleData
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      let { isConversion, moduleName, moduleDataId } = this
      this.isLoading = true
      if (!isEmpty(isConversion)) {
        await this.loadConversionForm()
        await this.loadModuleData({ moduleDataId, moduleName })
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
    async loadConversionForm() {
      let url = `v3/invoice/getConversionForm`
      let { data, error } = await API.get(url)
      if (error) {
        let { message } = error
        ftoast.critical(message)
      } else {
        let { form = {} } = data || {}
        this.conversionForm = form
      }
    },
    async loadModuleData({ moduleDataId, moduleName }) {
      try {
        let {
          workorder,
          poId,
          quote,
          conversionType,
          isConversion,
          invoiceType,
          invoiceId,
          conversionForm,
        } = this
        let url
        let param
        if (!isEmpty(workorder) && !isEmpty(invoiceType)) {
          url = `v3/invoice/woToInvoice`
          param = { recordId: workorder, invoiceType }
          let targetValue
          url = `v3/modulemapping/addOrFetchRecord/workorder/invoice`
          targetValue = { invoiceType }
          param = {
            recordId: workorder,
            targetValue,
            viewOnly: true,
            templateName: 'workOrderToInvoiceConversion',
          }
        } else if (!isEmpty(quote)) {
          url = `v3/invoice/quoteToInvoice`
          param = {
            recordId: quote,
          }
        } else if (!isEmpty(poId)) {
          url = `v3/invoice/poToInvoice`
          param = {
            recordId: poId,
          }
        } else if (!isEmpty(conversionType) && !isEmpty(invoiceId)) {
          url = `v3/invoice/convertInvoice`
          param = {
            invoiceId: invoiceId,
            invoiceType: conversionType,
          }
        } else {
          url = `v3/modules/data/summary?moduleName=invoice`
          param = { id: moduleDataId }
        }
        let { data, error } = await API.post(url, param)
        if (error) {
          let { message } = error
          ftoast.critical(message)
        } else {
          let { invoice = {}, form = {} } = data || {}
          let summaryData = invoice
          let { data: subData } = summaryData
          if (subData) {
            summaryData = { ...summaryData, ...subData }
          }

          summaryData = { ...summaryData, moduleName }
          this.moduleData = new this.modelDataClass(summaryData)
          if (isConversion && !isEmpty(conversionForm)) {
            this.selectedFormDetails = conversionForm
            this.forms = [conversionForm]
          }
        }
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('purchase_order.summary_fetch_error', { ns: 'procurement' })
        )
      }
    },
    afterSerializeHook({ data }) {
      if (this.invoiceId) {
        data.parentInvoiceId = { id: this.invoiceId }
      }
      return data
    },
  },
}
</script>
