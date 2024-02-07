import { LiveForm, FormSwitch, LiveFormLoader } from '@facilio/forms'
import FetchViewsMixin from '../../components/views/FetchViews.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { CustomModuleData } from '../../data/CustomModuleData'
import { getConnectedAppsInstance } from '@facilio/ui/connected-app'
import {
  isEmpty,
  isFunction,
  isNullOrUndefined,
} from '@facilio/utils/validation'
import Constants from '../../utils/constants'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import { getBaseURL } from '../../utils/api/base-url'
import { cloneDeep } from 'lodash/cloneDeep'
import dlv from 'dlv'
import {
  FEmptyState,
  ftoast,
  FContainer,
  FButton,
} from '@facilio/design-system'
import FormBackground from '../../assets/patterns/form-background.svg?component'
import { getDurationInSecs } from '../../utils/formatter'

export default {
  name: 'FormMixin',
  mixins: [FetchViewsMixin],
  components: {
    LiveForm,
    FormSwitch,
    LiveFormLoader,
    FormBackground,
    FEmptyState,
    FContainer,
    FButton,
  },
  data() {
    return {
      forms: [],
      isLoading: true,
      selectedForm: {},
      formObj: {},
      isSaving: false,
      moduleData: {},
      widgetsArr: [],
      subFormRecords: {},
      widgetId: null,
      isEmpty,
      formSwitchStyle: 'medium',
      dialog: false,
      hasConnectedSideBar: false,
    }
  },
  computed: {
    switchWidthStyle() {
      let { formSwitchStyle = 'small', hasConnectedSideBar } = this
      let width = Constants.FORM_SIZE[formSwitchStyle]
      width = `${width} + 64px`
      return hasConnectedSideBar ? `calc(${width} + 400px)` : `calc(${width})`
    },
    formLoaderWidthStyle() {
      let { formSwitchStyle = 'small' } = this
      let width = Constants.FORM_SIZE[formSwitchStyle]
      return `width: ${width}`
    },
    showEmptyState() {
      let { forms } = this || {}
      return (
        !this.isLoading && isEmpty(forms) && !this.isCreateEditWidgetConfigured
      )
    },
    moduleDisplayName() {
      if (this.formObj?.module) {
        return this.formObj.module.displayName
      }
      return ''
    },
    moduleDataId() {
      let { $route, dataId } = this
      if (isEmpty(dataId)) {
        let id = this.$attrs.id || $route.params.id

        return !isEmpty(id) ? Number(id) : id
      }
      return dataId
    },
    title() {
      let { moduleDisplayName, moduleDataId } = this
      return isEmpty(moduleDataId)
        ? `Create ${moduleDisplayName}`
        : `Edit ${moduleDisplayName}`
    },
    isEdit() {
      let { moduleDataId } = this
      return !isEmpty(moduleDataId)
    },
    customClass() {
      return ''
    },
    queryFormId() {
      let { $route } = this
      let {
        query: { formId },
      } = $route
      if (!isEmpty(formId)) {
        return parseInt(formId)
      }
      return formId
    },
    isV3Api() {
      return true
    },
    isCreateEditWidgetConfigured() {
      let { widgetId } = this
      return !isEmpty(widgetId)
    },
    isWidgetsSupported() {
      return true
    },
    customClassForContainer() {
      return ''
    },
    modelDataClass() {
      return CustomModuleData
    },
    customProps() {
      return {}
    },
    loadDataManually() {
      return false
    },
    canShowFormSwitch() {
      let { isCreateEditWidgetConfigured, forms } = this || {}
      return !isEmpty(forms) && !isCreateEditWidgetConfigured
    },
    queryData() {
      let { $route } = this
      let { query = {} } = $route || {}
      let { formDetails = {} } = query || {}

      if (!isEmpty(formDetails)) {
        formDetails = JSON.parse(formDetails)
      } else {
        formDetails = query
      }

      return formDetails || {}
    },
  },
  created() {
    this.init()
  },
  watch: {
    selectedForm: {
      async handler(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          this.widgetsArr = []
          this.isLoading = true
          await this.loadFormData()
          this.isLoading = false
        }
      },
      deep: true,
    },
  },
  methods: {
    getConnectedAppsInstance,
    setLiveFormWidthStyle() {
      let { formObj } = this
      let { sections = [] } = formObj || {}
      let maxWidth = 'medium'
      sections.forEach(section => {
        let { fields = [] } = section || {}
        ;(fields || []).forEach(field => {
          let { displayTypeEnum } = field || {}
          if (Constants.SECTION_WIDTH_EXPAND.includes(displayTypeEnum)) {
            maxWidth = 'large'
          }
        })
      })
      this.formSwitchStyle = maxWidth
    },
    save() {
      this.$refs['live-form']?.saveRecord()
    },
    cancel() {
      this.$refs['live-form']?.cancel()
    },
    switchForm(value) {
      let { forms } = this || {}
      let selectedForm = forms.find(form => form.id == value)

      this.selectedForm = selectedForm
      this.setLiveFormWidthStyle()
    },
    hasConnectedApp(val) {
      if (val) {
        this.hasConnectedSideBar = true
      } else this.setLiveFormWidthStyle()
    },
    async init() {
      let { moduleDataId, moduleName, loadDataManually } = this
      this.isLoading = true
      if (!isEmpty(moduleDataId) || loadDataManually) {
        await this.loadModuleData({
          moduleName,
          moduleDataId,
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
    async getCreateEditRecordWidgetId() {
      let { isEdit } = this
      let operatorValue = isEdit ? 7 : 6
      let filters = {
        entityType: {
          operatorId: 9,
          value: [`${operatorValue}`],
        },
      }

      this.isLoading = true
      try {
        let { connectedAppWidgets } =
          await this.modelDataClass.loadWidgets(filters)
        let [selectedWidget] = connectedAppWidgets || []
        let { id } = selectedWidget || {}

        return id
      } catch (error) {
        this.showErrorToastMessage(
          error,
          'Error Occurred while fetching connected app widget'
        )
      }
    },
    async loadFormsList(moduleName) {
      try {
        this.forms = await this.modelDataClass.loadFormsList(moduleName)
      } catch (error) {
        this.showErrorToastMessage(
          error,
          'Unable to fetch module form templates'
        )
      }
    },
    async loadModuleData({ moduleDataId, moduleName }) {
      try {
        let { customProps } = this || {}
        this.moduleData = await this.modelDataClass.fetch({
          moduleName,
          id: moduleDataId,
          ...customProps,
        })
      } catch (error) {
        this.showErrorToastMessage(
          error,
          'Error Occurred while fetching record detail summary'
        )
      }
    },
    async setInitialForm() {
      let { moduleData, forms, queryFormId } = this
      let selectedForm = {}
      let formId = null
      if (!isEmpty(forms)) {
        if (!isEmpty(queryFormId)) {
          formId = queryFormId
        } else {
          formId = this.getSelectedFormId(moduleData)
        }

        if (isEmpty(formId)) {
          selectedForm = dlv(this, 'forms.0')
        } else {
          let existingForm = this.forms.find(form => formId === form.id)
          if (isEmpty(existingForm)) selectedForm = dlv(this, 'forms.0')
          else selectedForm = existingForm
        }

        this.$set(this, 'selectedForm', selectedForm)
      }
    },
    async loadFormData(formId, selectedFormDetails) {
      let {
        selectedForm,
        moduleName,
        moduleDataId,
        moduleData,
        loadDataManually,
        dataObj,
      } = this
      let formObj = {}

      try {
        let form = await this.modelDataClass.loadFormData({
          formId,
          moduleName,
          selectedForm: selectedFormDetails || selectedForm,
        })

        if (!isEmpty(form)) {
          formObj = {
            ...form,
            secondaryBtnLabel: 'Cancel',
            primaryBtnLabel: 'Save',
          }

          if (
            (!isEmpty(moduleDataId) && !isEmpty(moduleData?.id)) ||
            loadDataManually ||
            !isEmpty(dataObj)
          ) {
            formObj = this.moduleData.deserialize(formObj)
          }
          this.formObj = formObj
        }
      } catch (error) {
        this.showErrorToastMessage(
          error,
          'Error Occurred while fetching form details'
        )
      }

      return formObj
    },
    showErrorToastMessage(error, customMsg) {
      let message = error?.message || customMsg
      ftoast.critical(message)
    },
    onBlurHook() {
      // override in consuming components
    },
    onWidgetChange(widgetsArr) {
      this.$set(this, 'widgetsArr', widgetsArr)
    },
    afterSaveHook(response) {
      let { moduleName } = this
      let { [moduleName]: data } = response
      let { id } = data
      this.redirectToSummary(id)
    },
    async redirectToSummary(id) {
      this.isSaving = true

      let { moduleName } = this
      let viewname = await this.fetchView(moduleName)

      this.isSaving = false

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

      if (name) {
        this.$router.push({ name, params: { viewname, id } })
      }
    },
    redirectToList() {
      let { moduleName } = this

      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}

      if (name) {
        this.$router.push({ name })
      }
    },
    async saveRecord(formModel) {
      let { formObj, afterSaveHook, afterSerializeHook } = this

      this.isSaving = true
      //same params as serialize method
      let response = await this.moduleData.save(
        formObj,
        formModel,
        afterSerializeHook
      )
      this.isSaving = false

      // Hook to handle notification after crud operation
      this.notificationHandler(response)

      // Hook to handle response after crud operation
      if (!isEmpty(afterSaveHook) && isFunction(afterSaveHook)) {
        this.afterSaveHook(response)
      }
    },
    notificationHandler(response) {
      let { moduleDataId, moduleDisplayName } = this
      let { error } = response
      if (error) {
        let { message = 'Error occured' } = error
        ftoast.critical(message)
      } else {
        let successMsg = moduleDataId
          ? `${moduleDisplayName} updated successfully`
          : `${moduleDisplayName} created successfully`
        ftoast.success(successMsg)
      }
    },
    getSelectedFormId(moduleData) {
      if (!isEmpty(moduleData)) {
        let { formId } = moduleData
        return formId
      }
    },
    modifySectionPropsHook() {
      // Overriding section object in consuming component
    },
    handleFormModlechange() {
      //this method to handle formModel change
    },
    deserializeData(moduleData) {
      let { data } = moduleData
      let { isV3Api } = this
      let { formObj } = this
      if (!isEmpty(formObj)) {
        let { sections } = formObj
        if (!isEmpty(sections)) {
          sections.forEach(section => {
            let { fields } = section
            if (!isEmpty(fields)) {
              fields.forEach(field => {
                let {
                  field: fieldObj,
                  name,
                  displayTypeEnum,
                  displayType,
                } = field

                // Custom fields data extraction
                if (
                  !isEmpty(fieldObj) &&
                  !fieldObj.default &&
                  !isEmpty(data) &&
                  !isV3Api
                ) {
                  if (
                    displayTypeEnum === 'IMAGE' ||
                    displayTypeEnum === 'SIGNATURE'
                  ) {
                    let imageId = moduleData.data[`${name}Id`]
                    let imgUrl = `${getBaseURL()}/v2/files/preview/${
                      moduleData.data[`${name}Id`]
                    }`
                    this.$set(field, 'imgUrl', imageId ? imgUrl : null)
                    this.$set(field, 'value', imageId)
                  } else if (displayTypeEnum === 'FILE') {
                    let fileId = moduleData.data[`${name}Id`]
                    let fileObj = { name: moduleData.data[`${name}FileName`] }
                    this.$set(field, 'fileObj', fileId ? fileObj : null)
                    this.$set(field, 'value', fileId)
                  } else if (displayTypeEnum === 'LOOKUP_SIMPLE') {
                    this.$set(field, 'value', (data[name] || {}).id)
                  } else if (displayTypeEnum === 'DURATION') {
                    this.$set(
                      field,
                      'value',
                      getDurationInSecs(
                        data[name],
                        !isEmpty((fieldObj || {}).unit) ? fieldObj.unit : 's'
                      )
                    )
                  } else if (
                    displayTypeEnum === 'SADDRESS' ||
                    displayTypeEnum === 'ADDRESS'
                  ) {
                    this.$set(
                      field,
                      'value',
                      dlv(
                        this,
                        `moduleData.data.${field.name}`,
                        cloneDeep(Constants.ADDRESS_FIELD_DEFAULTS)
                      )
                    )
                  } else {
                    this.$set(field, 'value', data[name])
                  }
                } else if (displayTypeEnum === 'TEAMSTAFFASSIGNMENT') {
                  let { assignedTo, assignmentGroup } = moduleData
                  let fieldValue = {
                    assignedTo: {
                      id: '',
                    },
                    assignmentGroup: {
                      id: '',
                    },
                  }
                  if (!isEmpty(assignedTo)) {
                    fieldValue.assignedTo = assignedTo
                  }
                  if (!isEmpty(assignmentGroup)) {
                    fieldValue.assignmentGroup = assignmentGroup
                  }
                  this.$set(field, 'value', fieldValue)
                } else {
                  if (
                    displayTypeEnum === 'IMAGE' ||
                    displayTypeEnum === 'SIGNATURE'
                  ) {
                    let imageId = moduleData[`${name}Id`]
                    let imgUrl = `${getBaseURL()}/v2/files/preview/${
                      moduleData[`${name}Id`]
                    }`
                    this.$set(field, 'imgUrl', imageId ? imgUrl : null)
                    this.$set(field, 'value', imageId)
                  } else if (displayTypeEnum === 'FILE') {
                    let fileId = moduleData[`${name}Id`]
                    let fileObj = { name: moduleData[`${name}FileName`] }
                    this.$set(field, 'fileObj', fileId ? fileObj : null)
                    this.$set(field, 'value', fileId)
                  } else if (
                    (displayTypeEnum === 'LOOKUP_SIMPLE' ||
                      displayTypeEnum === 'REQUESTER' ||
                      displayTypeEnum === 'SPACECHOOSER') &&
                    field.name !== 'siteId'
                  ) {
                    this.$set(field, 'value', (moduleData[name] || {}).id)
                  } else if (displayType === 56) {
                    let { config } = field
                    let { endFieldName, startFieldName, scheduleJsonName } =
                      config
                    let scheduleValueObj = {
                      startFieldValue: moduleData[startFieldName],
                      endFieldValue: moduleData[endFieldName],
                      scheduleJsonValue: moduleData[scheduleJsonName],
                      isRecurring: moduleData.isRecurring,
                    }
                    this.$set(field, 'scheduleValueObj', scheduleValueObj)
                  } else if (
                    displayTypeEnum === 'SADDRESS' ||
                    displayTypeEnum === 'ADDRESS'
                  ) {
                    this.$set(
                      field,
                      'value',
                      dlv(
                        this,
                        `moduleData.${field.name}`,
                        cloneDeep(Constants.ADDRESS_FIELD_DEFAULTS)
                      )
                    )
                  } else if (displayTypeEnum === 'QUOTE_ADDRESS') {
                    this.$set(
                      field,
                      'billToAddress',
                      dlv(this, 'moduleData.billToAddress', {})
                    )
                    this.$set(
                      field,
                      'shipToAddress',
                      dlv(this, 'moduleData.shipToAddress', {})
                    )
                  } else if (
                    ['QUOTE_LINE_ITEMS', 'LINEITEMS'].includes(displayTypeEnum)
                  ) {
                    this.$set(
                      field,
                      'value',
                      dlv(this, `moduleData.${name}`, null)
                    )
                    Constants.QUOTE_LINE_ITEMS_ADDITIONAL_FIELDS.forEach(
                      additionalField => {
                        let value = dlv(
                          this,
                          `moduleData.${additionalField}`,
                          null
                        )
                        if (additionalField === 'tax') {
                          if (isEmpty(value)) {
                            value = { id: null }
                          } else {
                            value = pick(value, ['id'])
                          }
                        }
                        this.$set(field, additionalField, value)
                      }
                    )
                  } else if (
                    ['INVREQUEST_LINE_ITEMS'].includes(displayTypeEnum)
                  ) {
                    this.$set(
                      field,
                      'value',
                      dlv(this, `moduleData.lineItems`, null) ||
                        dlv(this, `moduleData.inventoryrequestlineitems`, null)
                    )
                  } else if (displayTypeEnum === 'BUDGET_AMOUNT') {
                    this.$set(
                      field,
                      'value',
                      this.getFormattedBudgetAmountsData(moduleData)
                    )
                  } else if (displayTypeEnum === 'FACILITY_BOOKING_SLOTS') {
                    this.$set(
                      field,
                      'value',
                      this.getFormattedSlotData(moduleData)
                    )
                    this.$set(field, 'bookingDate', moduleData.bookingDate)
                  } else if (displayTypeEnum === 'FACILITY_AVAILABILITY') {
                    this.$set(
                      field,
                      'value',
                      this.formatForFacilityAvailability(moduleData)
                    )
                  } else if (displayTypeEnum === 'NOTES') {
                    this.$set(field, 'value', field.value)
                  } else {
                    if (
                      ['NUMBER', 'DECIMAL'].includes(displayTypeEnum) &&
                      !isNullOrUndefined(moduleData[name])
                    ) {
                      this.$set(field, 'value', moduleData[name])
                    } else if (isEmpty(moduleData[name])) {
                      this.$set(field, 'value', null)
                    } else {
                      this.$set(field, 'value', moduleData[name])
                    }
                  }
                }
              })
            }
          })
        }
      }
    },
  },
}
