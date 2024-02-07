<template>
  <FContainer display="flex">
    <slot name="buttons"></slot>
    <slot
      v-if="showPopUpFormDialog"
      name="popup-form"
      :record="currentRecord"
      :recordId="currentRecordId"
    >
      <PopupLineItemsForm
        :key="`popup-form-${moduleName}`"
        :config="formConfig"
        :moduleName="moduleName"
        :moduleDisplayName="moduleDisplayName"
        :dataId="currentRecordId"
        :dataObj="currentRecord"
        :recordConversionDetails="lineItemLookupDetails"
        :additionalParams="additionalParams"
        :selectedFormDetails="selectedFormDetails"
        :hideNotification="hideNotification"
        :hasPreviousDialog="!isEmpty(currentBtnDetails)"
        @openPrevious="openPreviousDialog"
        @onSave="refreshList()"
        @onClose="closeForm"
      ></PopupLineItemsForm>
    </slot>
    <slot v-if="showWizard">
      <LineItemsWizard
        :config="currentBtnDetails"
        :selectedLookupModuleId="selectedLookupModuleId"
        :currentModuleName="currentModuleName"
        @onSave="handleSelectedLookup"
        @onCancel="closeWizard"
      ></LineItemsWizard>
    </slot>
  </FContainer>
</template>

<script lang="jsx">
import PopupLineItemsForm from '/src/pages/modules/inventory/components/lineitems/PopupLineItemsForm.vue'
import LineItemsWizard from '/src/pages/modules/inventory/components/lineitems/LineItemsWizard.vue'
import { FContainer } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'LineItemsAddition',
  props: [
    'config',
    'moduleName',
    'moduleDisplayName',
    'hideNotification',
    'additionalParams',
    'currentModuleName',
  ],

  components: {
    FContainer,
    LineItemsWizard,
    PopupLineItemsForm,
  },
  data() {
    return {
      currentRecordId: null,
      currentRecord: null,
      showPopUpFormDialog: false,
      showWizard: false,
      selectedLookupModuleId: null,
      currentBtnDetails: {},
    }
  },

  computed: {
    formConfig() {
      let { currentRecordId, currentRecord = {}, config = {} } = this
      let {
        formTitle,
        modifyFieldPropsHook = () => {},
        onBlurHook = () => {},
        onWidgetChange = () => {},
      } = config
      let modifyFieldProps = field =>
        modifyFieldPropsHook(field, { currentRecordId, currentRecord })

      return {
        formTitle,
        modifyFieldPropsHook: modifyFieldProps,
        onBlurHook,
        onWidgetChange,
      }
    },
    lineItemLookupDetails() {
      let { selectedLookupModuleId, currentBtnDetails } = this
      return { selectedLookupModuleId, currentBtnDetails }
    },
    selectedFormDetails() {
      let { currentRecordId } = this
      let { formDetails = {} } = this.config || {}
      let { defaultForm = {}, addForm = {}, editForm = {} } = formDetails

      if (!isEmpty(currentRecordId) && !isEmpty(editForm)) {
        return editForm || {}
      } else if (isEmpty(currentRecordId) && !isEmpty(addForm)) {
        return addForm || {}
      } else if (!isEmpty(defaultForm)) {
        return defaultForm || {}
      }
      return null
    },
    disableActionableUIElements() {
      let { disableActionableUIElements = false } = this.config
      if (
        isEmpty(disableActionableUIElements) ||
        !disableActionableUIElements
      ) {
        return false
      } else {
        return true
      }
    },
  },
  methods: {
    isEmpty,
    handleClickActionBtn(value) {
      this.$emit('clickedActionBtn', value)
      let { lookupModuleName } = value || {}
      if (!isEmpty(lookupModuleName)) {
        this.currentBtnDetails = value
        this.showWizard = true
      } else this.showPopUpFormDialog = true
    },
    openPreviousDialog() {
      this.showWizard = true
      this.$nextTick(() => {
        this.showPopUpFormDialog = false
      })
    },
    openForm(record) {
      let { id } = record || {}
      this.currentRecordId = id || null
      if (isEmpty(id) && !isEmpty(record)) {
        this.currentRecord = record
      }
      this.showPopUpFormDialog = true
      this.$nextTick(() => {
        this.showWizard = false
      })
    },
    refreshList(response) {
      this.$emit('saveForm', response)
    },
    handleSelectedLookup(record) {
      let { id } = record || {}
      this.selectedLookupModuleId = id
      this.$emit('selectedLookupModuleRecord', record)
      this.openForm()
    },
    closeWizard() {
      this.showWizard = false
      this.closeForm()
    },
    closeForm() {
      this.currentRecordId = null
      this.currentRecord = null
      this.showPopUpFormDialog = false
      this.selectedLookupModuleId = null
      this.currentBtnDetails = {}
      this.$emit('selectedLookupModuleRecord', null)
    },
  },
}
</script>
