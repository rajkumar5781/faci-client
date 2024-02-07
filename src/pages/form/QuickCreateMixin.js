import { API } from '@facilio/api'

const LOOKUP_FILTERS_MAP = {
  1: 'building',
  2: 'asset',
  3: 'tenantcontact',
  4: 'clientcontact',
  5: 'vendorcontact',
  6: 'employee',
}

export default {
  data() {
    return {
      quickCreateField: null,
      quickCreateFormId: null,
      showDialogForm: false,
      quickCreateSaveResolver: Promise.resolve,
    }
  },
  provide() {
    return {
      loadDialogForm: this.loadDialogForm,
      disableQuickCreate: false,
    }
  },
  computed: {
    quickCreateModuleName() {
      let { quickCreateField } = this
      let { lookupModuleName, config } = quickCreateField
      let {
        isFiltersEnabled = false,
        filterValue,
        lookupModuleName: configLookupModuleName,
      } = config || {}
      if (isFiltersEnabled) {
        lookupModuleName =
          configLookupModuleName || LOOKUP_FILTERS_MAP[filterValue]
      }
      return lookupModuleName
    },
  },
  methods: {
    async loadDialogForm(lookupField) {
      this.quickCreateField = lookupField
      return new Promise(async resolve => {
        let { quickCreateModuleName } = this
        let formsList
        try {
          formsList = await this.modelDataClass.loadFormsList(
            quickCreateModuleName
          )
        } catch (error) {
          this.showErrorToastMessage(
            error,
            'Unable to fetch module form templates'
          )
        }
        let selectedForm = formsList[0] || {}
        this.quickCreateFormId = selectedForm.id
        this.showDialogForm = true
        this.quickCreateSaveResolver = resolve
      })
    },
    async saveDialogForm(formData) {
      let moduleName = this.quickCreateModuleName
      let response = await API.createRecord(moduleName, {
        data: formData,
      })
      let record = response[moduleName]
      this.quickCreateSaveResolver(record)
      this.closeDialogForm()
    },
    closeDialogForm() {
      this.showDialogForm = false
    },
  },
}
