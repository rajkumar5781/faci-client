<template>
  <FModal
    title="Categories"
    :visible="canShowCategoryDialog"
    :confirmLoading="isSaving"
    saveText="Confirm"
    size="S"
    :hideFooter="false"
    @ok="openAssetCreation()"
    @cancel="closeDialog()"
    padding="containerLarge"
  >
    <FContainer
      height="50%"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
      padding="containerXxLarge"
    >
      <FText>Category</FText>
      <Lookup
        :field.sync="selectedLookupField"
        v-model="categoryFormObj.categoryId"
        :hideLookupIcon="false"
        @showLookupWizard="showLookupWizard"
      />
      <LookupWizard
        v-if="canShowLookupWizard"
        :canShowLookupWizard.sync="canShowLookupWizard"
        :field="selectedLookupField"
        @setLookupFieldValue="setWizardValue"
        parentModuleName="asset"
      >
      </LookupWizard>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FText, FModal } from '@facilio/design-system'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import cloneDeep from 'lodash/cloneDeep'
const selectedLookupField = {
  isDataLoading: false,
  options: [],
  config: {},
  lookupModuleName: 'assetcategory',
  field: {
    lookupModule: {
      name: 'assetcategory',
      displayName: 'Asset Category',
    },
  },
  name:'category',
  multiple: false,
  selectedItems: [],
}
export default {
  props: ['canShowCategoryDialog', 'selectedCategory'],
  components: { LookupWizard, FContainer, FText, FModal, Lookup },
  data() {
    return {
      error: false,
      isSaving: false,
      message: 'Please select asset category',
      canShowLookupWizard: false,
      selectedLookupField,
      categoryFormObj: {
        categoryId: null,
      },
    }
  },
  computed: {
    canShowDialog: {
      get() {
        return this.canShowCategoryDialog
      },
      set(value) {
        this.$emit('update:canShowCategoryDialog', value)
      },
    },
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
      this.$set(this, 'canShowDialog', false)
      this.$emit('closeCategory')
    },
    showLookupWizard(_, canShow) {
      this.canShowLookupWizard = canShow
    },
    setWizardValue(props) {
      let { field } = props || {}
      let { selectedItems = [] } = field || {}
      let selectedItemIds = []

      if (!isEmpty(selectedItems)) {
        selectedItemIds = selectedItems.find(item => item.value).value || {}
      }
      this.$set(this.categoryFormObj, 'categoryId', selectedItemIds)
    },
    async openAssetCreation() {
      let { categoryFormObj } = this
      let { categoryId } = categoryFormObj || {}

      this.isSaving = true
      if (!isEmpty(categoryId)) {
        let param = { moduleName: 'assetcategory', id: categoryId }
        let { data, error } = await API.get('v3/modules/data/summary', param)
        if (!error) {
          let { assetcategory } = data || {}
          let selectedCategory = cloneDeep(assetcategory)
          this.$emit('update:selectedCategory', selectedCategory)
          this.$emit('openAssetCreation', selectedCategory)
        }
      } else {
        this.error = true
      }
      this.isSaving = false
    },
  },
}
</script>
