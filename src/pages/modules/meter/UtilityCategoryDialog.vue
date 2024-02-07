<template>
  <FModal
    v-if="canShowUtilityTypeDialog"
    :title="$t('meter.utility_type', { ns: 'energy' })"
    :visible="canShowUtilityTypeDialog"
    :confirmLoading="false"
    saveText="Confirm"
    size="S"
    type="default"
    padding="containerNone"
    @ok="saveCategory()"
    @cancel="closeDialog()"
  >
    <FContainer
      height="50%"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
      padding="containerXxLarge"
    >
      <FText>{{ $t('meter.utility_type', { ns: 'energy' }) }}</FText>
      <Lookup
        v-model="utilityCategoryId"
        :field="selectedLookupField"
        :moduleName="moduleName"
        @showLookupWizard="showLookupWizard"
      />
      <LookupWizard
        v-if="canShowLookupWizard"
        :canShowLookupWizard.sync="canShowLookupWizard"
        :parentModuleName="moduleName"
        @setLookupFieldValue="setWizardValue"
        :field.sync="selectedLookupField"
      />
      <FText v-if="error" color="textSemanticRed" appearance="captionMed12">{{
        $t('meter.please_select_utilityType', { ns: 'energy' })
      }}</FText>
    </FContainer>
  </FModal>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { FModal, FContainer, FText, ftoast } from '@facilio/design-system'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'

const selectedLookupField = {
  isDataLoading: false,
  options: [],
  config: {},
  lookupModuleName: 'utilitytype',
  name: 'utilityType',
  field: {
    lookupModule: {
      name: 'utilitytype',
      displayName: 'Meter Category',
    },
  },
  multiple: false,
  selectedItems: [],
}
export default {
  props: ['canShowUtilityTypeDialog'],
  components: { FModal, FContainer, FText, Lookup, LookupWizard },
  data() {
    return {
      error: false,
      isSaving: false,
      canShowLookupWizard: false,
      selectedLookupField,
      utilityCategoryId: null,
      moduleName: 'meter',
    }
  },
  watch: {
    selectedLookupField: {
      async handler() {
        this.error = false
        this.canShowLookup = false
      },
      deep: true,
    },
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
    showLookupWizard(_, canShow) {
      this.canShowLookupWizard = canShow
    },
    setWizardValue(props) {
      let { field } = props || {}
      let { selectedItems = [] } = field || {}
      let selectedCategoryId = null

      if (!isEmpty(selectedItems)) {
        selectedCategoryId =
          (selectedItems || []).find(item => item.value)?.value || {}
      }
      this.utilityCategoryId = selectedCategoryId
    },
    saveCategory() {
      let { utilityCategoryId } = this
      if (utilityCategoryId) {
        this.$emit('openCategoryForm', utilityCategoryId)
      } else {
        this.error = true
      }
    },
  },
}
</script>
