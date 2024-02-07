<template>
  <FModal
    :visible="true"
    :size="hasMultiColumnElements ? 'M' : 'S'"
    :maskClosable="true"
    :title="title"
    type="default"
    padding="containerNone"
    :confirmLoading="isSaving"
    @cancel="closeAction"
    @ok="triggerSaving"
  >
    <div v-if="isLoading" class="loading-container !w-fit">
      <LiveFormLoader formWidthStyle="width:520px" :dialog="true" />
    </div>
    <div v-else class="dsm-form-wrapper z-20">
      <LiveForm
        ref="live-form"
        :form="formObj"
        :formsList="forms"
        :isV3Api="isV3Api"
        :dialog="true"
        liveFormWidthStyle="small"
        :showHeader="true"
        :isEdit="isEdit"
        :moduleDataId="moduleDataId"
        :moduleData="moduleData"
        :saving="isSaving"
        :loading="isLoading"
        :modifyFieldPropsHook="modifyFieldPropsHook"
        :connectedAppEventChannel="getConnectedAppsInstance()"
        :account="$account"
        :moduleName="moduleName"
        @save="submitForm"
        @cancel="closeAction"
        @hasConnectedApp="hasConnectedApp"
      />
    </div>
    <DialogForm
      v-if="showDialogForm"
      :moduleName="quickCreateModuleName"
      :formId="quickCreateFormId"
      :saveAction="saveDialogForm"
      :closeAction="closeDialogForm"
    ></DialogForm>
  </FModal>
</template>
<script>
import { ACTION_TYPES } from '../../components/custom-button/CustomButtonUtil.js'
import { FModal } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import FormMixin from './FormMixin'
import QuickCreateMixin from './QuickCreateMixin'

export default {
  name: 'DialogForm',
  props: [
    'moduleName',
    'recordId',
    'transition',
    'record',
    'formId',
    'closeAction',
    'saveAction',
    'isExternalModule',
    'isV3',
    'actionType',
    'isFormOfCustomButton',
  ],
  mixins: [FormMixin, QuickCreateMixin],
  components: { FModal },
  data() {
    return {
      hasMultiColumnElements: false,
    }
  },
  async created() {
    if (this.formId) {
      await this.loadModuleData()
      await this.loadFormData()
    }
    this.isLoading = false
  },
  computed: {
    title() {
      if (this.$attrs.title) return this.$attrs.title

      let { moduleDisplayName, moduleDataId } = this
      return isEmpty(moduleDataId)
        ? `Create ${moduleDisplayName}`
        : `Edit ${moduleDisplayName}`
    },
  },
  methods: {
    init() {
      // override to prevent default code in formcreation
    },
    async loadFormData(selectedFormDetails) {
      let {
        selectedForm,
        moduleName,
        moduleDataId,
        moduleData,
        loadDataManually,
        dataObj,
        formId,
        transition,
      } = this
      let { formModuleName } = transition || {}
      let formObj = {}
      let _moduleName = this.isExternalModule ? formModuleName : moduleName

      try {
        let form = await this.modelDataClass.loadFormData({
          formId,
          moduleName: _moduleName,
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

          if (formObj.sections) {
            // Check if there are any subforms
            // TODO: Also handle for cases where fields with
            // span !== 1..ie multiple fields in the same row
            let { sections } = formObj
            this.hasMultiColumnElements = sections.some(
              section => section.subFormId > 0
            )
          }
        }
      } catch (error) {
        this.showErrorToastMessage(
          error,
          'Error Occurred while fetching form details'
        )
      }

      return formObj
    },
    loadModuleData() {
      // Keeping this async in case we need to load data from api here
      if (!isEmpty(this.record)) {
        return new Promise(resolve => {
          this.moduleData = this.record
          resolve()
        })
      } else {
        let { moduleName } = this
        this.moduleData = new this.modelDataClass({
          moduleName,
          ...(this.dataObj || {}),
        })
        return Promise.resolve()
      }
    },
    modifyFieldPropsHook(field) {
      let {
        recordId,
        isFormOfCustomButton,
        actionType,
        isExternalModule,
        transition,
      } = this
      let { moduleName: parentModuleName } = transition || {}

      let { displayTypeEnum, lookupModuleName } = field || {}
      let isRelatedModuleField =
        displayTypeEnum === 'LOOKUP_SIMPLE' &&
        lookupModuleName === parentModuleName
      let isDisabled = isFormOfCustomButton
        ? actionType === ACTION_TYPES.CREATE_RECORD
        : isExternalModule

      if (isRelatedModuleField) {
        return { ...field, isDisabled, value: recordId }
      }
    },
    triggerSaving() {
      let liveform = this.$refs['live-form']
      liveform.saveRecord()
    },
    async submitForm(data) {
      this.isSaving = true
      let { formObj, formId } = this
      let { subFormFiles } = data
      data = this.moduleData.serialize(formObj, data)

      if (subFormFiles) data = { ...data, subFormFiles }

      try {
        await this.saveAction(data, formId)
      } catch (error) {
        this.closeAction()
      }

      this.isSaving = false
      this.$emit('afterSave')
    },
  },
}
</script>
