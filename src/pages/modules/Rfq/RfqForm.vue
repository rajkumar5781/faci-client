<script lang="jsx">
import ModuleForm from '../../form/ModuleForm.vue'
import { isEmpty, isNumber, isArray } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
export default {
  extends: ModuleForm,
  computed: {
    moduleName() {
      return 'requestForQuotation'
    },
    moduleDisplayName() {
      return 'Request For Quotation'
    },
    prIds() {
      let { $route } = this
      let {
        query: { recordIds },
      } = $route
      return recordIds
    },
    conversionId() {
      let { $route } = this
      let {
        query: { recordIds },
        params: { id },
      } = $route
      return Number(id) || recordIds
    },
    loadDataManually() {
      let { prIds } = this
      return !isEmpty(prIds)
    },
    customProps() {
      let { prIds } = this
      return { prIds }
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
        let { prIds } = this
        let params = {
          moduleName,
          id: conversionId,
          prIds,
        }
        let { data } = await this.fetchRecord(params)
        if (!isEmpty(prIds)) {
          data['recordIds'] = JSON.parse(prIds)
        }
        data = { ...data, moduleName}
        this.moduleData = new this.modelDataClass(data)
      } catch (error) {
        this.showErrorToastMessage(error, this.$t('error_occured'))
      }
    },
    async fetchRecord({ moduleName, id, force = false, prIds }) {
      if (!isEmpty(prIds)) {
        if (!isEmpty(prIds) && isArray(JSON.parse(prIds))) {
          let queryParam = {
            recordIds: JSON.parse(prIds),
          }
          let { data, error } = await API.get(
            '/v3/requestForQuotation/convertPrToRfq',
            queryParam
          )
          if (error) {
            let { message } = error
            ftoast.critical(message)
            return {}
          } else {
            let { requestForQuotation } = data || {}
            return { data: requestForQuotation, moduleName }
          }
        }
        return {}
      } else {
        let { [moduleName]: data = {}, error } = await API.fetchRecord(
          moduleName,
          { id },
          { force }
        )

        if (error) {
          ftoast.critical(this.$t('error_occured'))
        } else {
          return { data, moduleName }
        }
      }
    },
  },
}
</script>
