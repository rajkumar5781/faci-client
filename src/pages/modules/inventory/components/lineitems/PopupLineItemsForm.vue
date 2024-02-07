<template>
  <FModal
    :title="customTitle"
    :visible="true"
    size="S"
    :hideFooter="false"
    :breadCrumbProps="{ appearance: 'back' }"
    :confirmLoading="isSaving"
    @ok="onClickSaveRecord"
    @cancel="cancelForm"
    @path="openPreviousDialog"
  >
    <div>
      <LiveFormLoader v-if="isLoading" :dialog="true" />
      <LiveForm
        v-else
        ref="line-item-f-web-form"
        :form="formFields"
        :dialog="true"
        :module="moduleName"
        :isSaving="isSaving"
        :isEdit="isEdit"
        :isV3Api="true"
        :isWidgetsSupported="false"
        :moduleData="moduleData"
        :moduleDataId="moduleDataId"
        :subFormRecords="subFormRecords"
        :liveFormWidthStyle="formSwitchStyle"
        formLabelPosition="1"
        :modifyFieldPropsHook="config.modifyFieldPropsHook"
        @save="saveRecord"
        @onBlur="config.onBlurHook"
        @onWidgetChange="config.onWidgetChange"
        @cancel="cancelForm"
      ></LiveForm>
    </div>
  </FModal>
</template>
<script>
import { LiveForm, LiveFormLoader } from '@facilio/forms'

import ModuleForm from '../../../../form/ModuleForm.vue'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import { FModal, ftoast } from '@facilio/design-system'

export default {
  name: 'PopupLineItemsForm',
  extends: ModuleForm,
  components: { LiveForm, LiveFormLoader, FModal, ftoast },
  data: () => ({
    showDialog: true,
    formSwitchStyle: 'width:520px',
  }),
  props: [
    'dataId',
    'config',
    'additionalParams',
    'hideNotification',
    'hasPreviousDialog',
    'recordConversionDetails',
    'heading',
    'isFieldChange',
  ],
  computed: {
    moduleDataId() {
      return this.dataId
    },
    isEdit() {
      return !isEmpty(this.dataId)
    },
    moduleName() {
      return this.$attrs.moduleName
    },

    moduleDisplayName() {
      return this.$attrs.moduleDisplayName
    },
    customTitle() {
      let { formTitle } = this.config
      let { defaultForm, addForm, editForm } = formTitle || {}
      let customTitle

      if (this.isEdit && editForm) customTitle = editForm
      else if (!this.isEdit && addForm) customTitle = addForm
      else if (defaultForm) customTitle = defaultForm
      else customTitle = this.title

      return customTitle
    },
    loadDataManually() {
      let { selectedLookupModuleId, currentBtnDetails } =
        this.recordConversionDetails || {}
      let { getRecordDetails } = currentBtnDetails || {}

      return (
        !isEmpty(selectedLookupModuleId) &&
        !isEmpty(getRecordDetails) &&
        isFunction(getRecordDetails)
      )
    },

    title() {
      let { moduleDisplayName, moduleDataId } = this
      if (isEmpty(moduleDataId)) {
        if (!isEmpty(this.heading)) {
          return this.heading
        } else {
          return `Add ${moduleDisplayName}`
        }
      } else {
        return `Edit ${moduleDisplayName}`
      }
    },

    formFields() {
      let {
        isFieldChange = false,
        formObj: { sections = [] },
      } = this

      if (isFieldChange) {
        sections.forEach(section => {
          section.fields.forEach(fields => {
            if (
              fields.displayTypeEnum === 'LOOKUP_SIMPLE' &&
              fields.name === 'space'
            ) {
              fields.displayTypeEnum = 'SPACECHOOSER'
            }
          })
        })
      }
      return this.formObj
    },
  },
  methods: {
    openPreviousDialog() {
      this.$emit('openPrevious')
    },
    cancelForm() {
      this.$emit('onClose')
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
          : `${moduleDisplayName} Added successfully`
        ftoast.success(successMsg)
      }
    },

    async loadModuleData({ moduleDataId, moduleName }) {
      try {
        let {
          customProps,
          loadDataManually,
          recordConversionDetails = {},
        } = this

        if (!loadDataManually) {
          this.moduleData = await this.modelDataClass.fetch({
            moduleName,
            id: moduleDataId,
            ...customProps,
          })
        } else {
          let { selectedLookupModuleId: id, currentBtnDetails = {} } =
            recordConversionDetails
          let { getRecordDetails = () => {}, lookupModuleName } =
            currentBtnDetails
          let payload = { id, lookupModuleName, moduleName, ...customProps }

          this.moduleData = await getRecordDetails(payload)
        }
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('custommodules.summary.record_summary_error')
        )
      }
    },
    afterSerializeHook({ data }) {
      let { additionalParams, moduleData } = this
      let additionalPayLoad = isFunction(additionalParams)
        ? additionalParams(data, moduleData)
        : additionalParams

      return { ...data, ...(additionalPayLoad || {}) }
    },
    afterSaveHook(response) {
      let { error } = response || {}

      this.$emit('onSave', response)
      if (!error) {
        this.cancelForm()
      }
    },
    onClickSaveRecord() {
      this.$refs['line-item-f-web-form']?.saveRecord()
    },
  },
}
</script>
