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
  name: 'QuoteForm',
  data() {
    return {
      dataId: null,
      moduleName: 'quote',
      moduleDisplayName: 'Quote',
    }
  },
  computed: {
    workorder() {
      let { $route = {} } = this
      let {
        query: { workorder },
      } = $route
      return workorder
    },
    quoteType() {
      let { $route = {} } = this
      let {
        query: { conversionType },
      } = $route
      return conversionType
    },
    isConversion() {
      let { workorder } = this
      return workorder
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
    async loadModuleData({ moduleDataId, moduleName }) {
      try {
        let { workorder, isConversion, quoteType } = this
        let url
        let param
        if (!isEmpty(isConversion)) {
          let targetValue
          url = `v3/modulemapping/addOrFetchRecord/workorder/quote`
          targetValue = { customerType: quoteType }
          param = {
            recordId: workorder,
            targetValue,
            viewOnly: true,
            templateName: 'workOrderToQuoteConversion',
          }
          let { data, error } = await API.post(url, param)
          if (error) {
            let { message } = error
            ftoast.critical(message)
          } else {
            let { quote = {} } = data || {}
            let summaryData = quote
            let { data: subData } = summaryData
            if (subData) {
              summaryData = { ...summaryData, ...subData }
            }

            summaryData = { ...summaryData, moduleName }
            this.moduleData = new this.modelDataClass(summaryData)
          }
        } else {
          url = `v3/modules/data/summary?moduleName=quote`
          param = { id: moduleDataId }
          let { data, error } = await API.post(url, param)
          if (error) {
            let { message } = error
            ftoast.critical(message)
          } else {
            let { quote = {} } = data || {}
            let summaryData = quote
            let { data: subData } = summaryData
            if (subData) {
              summaryData = { ...summaryData, ...subData }
            }

            summaryData = { ...summaryData, moduleName }
            this.moduleData = new this.modelDataClass(summaryData)
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
