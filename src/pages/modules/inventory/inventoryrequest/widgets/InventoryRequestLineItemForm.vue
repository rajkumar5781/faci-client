<template>
  <FContainer>
    <FModal
      :title="
        $t('inventory.inventory_request.create_items', {
          ns: 'inventory',
        })
      "
      :visible="showForm"
      :cancelText="$t('inventory.service.cancel', { ns: 'inventory' })"
      :saveText="$t('inventory.inventory_request.reserve', { ns: 'inventory' })"
      size="S"
      :hideFooter="true"
      @cancel="handleCancel"
    >
      <FContainer padding="sectionSmall">
        <PopupLineItemsForm
          :key="`popup-form-${moduleName}`"
          :config="formConfig"
          :moduleName="moduleName"
          :moduleDisplayName="moduleDisplayName"
          :dataId="currentRecordId"
          :dataObj="currentRecord"
          :recordConversionDetails="lineItemLookupDetails"
          :selectedFormDetails="selectedFormDetails"
          @onSave="refreshList"
          @onClose="handleCancel"
        ></PopupLineItemsForm>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import { FContainer, FText, FTable, FModal } from '@facilio/design-system'
import PopupLineItemsForm from '/src/pages/modules/inventory/components/lineitems/PopupLineItemsForm.vue'
import { isEmpty } from '@facilio/utils/validation'
export default {
  props: ['showForm', 'details', 'row', 'config'],
  components: {
    FContainer,
    FTable,
    FText,
    FModal,
    PopupLineItemsForm,
  },
  computed: {
    moduleName() {
      return 'inventoryrequestlineitems'
    },
    moduleDisplayName() {
      return this.$t(
        'inventory.inventory_request.inventory_request_line_items',
        { ns: 'inventory' }
      )
    },
    currentRecordId() {
      let { row } = this
      let { id } = row || {}
      return id
    },
    currentRecord() {
      let { row } = this
      return row
    },
    formConfig() {
      let { currentRecordId, currentRecord, config } = this
      let {
        formTitle,
        modifyFieldPropsHook = () => {},
        onBlurHook = () => {},
        onWidgetChange = () => {},
      } = config || {}
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
      let { formDetails } = this.config || {}
      let { defaultForm, addForm, editForm } = formDetails || {}

      if (!isEmpty(currentRecordId) && !isEmpty(editForm)) {
        return editForm || {}
      } else if (isEmpty(currentRecordId) && !isEmpty(addForm)) {
        return addForm || {}
      } else if (!isEmpty(defaultForm)) {
        return defaultForm || {}
      }
      return null
    },
  },
  methods: {
    isEmpty,
    handleCancel() {
      this.$emit('closeEditForm', true)
    },
    refreshList() {
      this.$emit('refreshList', true)
    },
  },
}
</script>
