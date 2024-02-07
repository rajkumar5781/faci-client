<template>
  <FContainer>
    <FModal
      title="Apply depreciation Schedule"
      :visible="!canShowAddNewForm"
      :confirmLoading="applyingDepreciation"
      saveText="Save"
      size="M"
      :hideFooter="false"
      @ok="submitForm()"
      @cancel="closeDialog()"
      padding="containerLarge"
    >
      <FContainer>
        <FContainer v-if="loading">
          <FShimmer :rounded="false" :height="45" :width="50" />
        </FContainer>

        <FContainer v-else padding="containerLarge">
          <FForm
            ref="depreciationForm"
            :rules="rules"
            :model="selectedDepreciation"
          >
            <FFormItem>
              <FContainer display="flex" justifyContent="space-between">
                <FContainer>
                  <FSelect
                    v-model="selectedDepreciation.id"
                    placeholder="Select Depreciation Schedule"
                    :filterable="true"
                    :options="optionList"
                    size="small"
                  />
                </FContainer>

                <FContainer>
                  <FButton
                    @click="canShowAddNewForm = true"
                    appearance="secondary"
                    size="large"
                  >
                    {{ $t('asset.add_new', 'Add New', { ns: 'asset' }) }}
                  </FButton>
                </FContainer>
              </FContainer>
            </FFormItem>
          </FForm>
        </FContainer>

        <FDivider width="100%"></FDivider>

        <FContainer padding="containerLarge">
          {{ $t('asset.preview', 'Preview', { ns: 'asset' }) }}
        </FContainer>

        <AssetDepreciationSchedule
          :details="asset"
          :selectedDepreciationId="selectedDepreciation.id"
          @appliedDepreciationId="setDepreciationId"
          @depreciationRel="setDepreciationRel"
        ></AssetDepreciationSchedule>
        <AddAssetDepreciation
          v-if="canShowAddNewForm"
          @onRecordSaved="addDepreciation"
          @onClose="canShowAddNewForm = false"
        ></AddAssetDepreciation>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import AddAssetDepreciation from './AddAssetDepreciation.vue'
import { API } from '@facilio/api'
import AssetDepreciationSchedule from './AssetDepreciationSchedule.vue'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FButton,
  FForm,
  FSelect,
  FShimmer,
  FFormItem,
  FModal,
  FDivider,
  ftoast,
} from '@facilio/design-system'

export default {
  props: ['asset'],

  data() {
    return {
      selectedDepreciation: {
        id: null,
      },
      loading: false,
      appliedDepreciationId: null,
      depreciationList: [],
      canShowAddNewForm: false,
      applyingDepreciation: false,
      depreciationRelId: null,
      error: false,
      errorText: '',
      rules: {
        id: {
          required: true,
          message: 'Please select a Depreciation Schedule',
          trigger: 'change',
        },
      },
    }
  },

  components: {
    AddAssetDepreciation,
    AssetDepreciationSchedule,
    FContainer,
    FText,
    FDivider,
    FButton,
    FForm,
    FSelect,
    FShimmer,
    FFormItem,
    FModal,
  },

  created() {
    this.loadDepreciation()
  },

  computed: {
    optionList() {
      return this.depreciationList.map(item => ({
        ...item,
        value: item.id,
        label: item.name,
      }))
    },
  },

  watch: {
    'selectedDepreciation.id'(value) {
      if (value) {
        this.error = false
        this.errorText = ''
      }
    },
  },

  methods: {
    async loadDepreciation() {
      this.loading = true
      let { list, error } = await API.fetchAll('assetdepreciation')
      if (error) ftoast.critical(error.message || 'Error Occured')
      else this.depreciationList = list
      this.loading = false
    },
    addDepreciation(depreciation) {
      this.depreciationList.push(depreciation)
      this.selectedDepreciation.id = depreciation.id
    },

    setDepreciationId(id) {
      this.appliedDepreciationId = id
      this.selectedDepreciation.id = id
    },
    setDepreciationRel(rel) {
      let { id } = rel || {}
      this.depreciationRelId = id
    },
    errorBanner(errorMsg) {
      this.error = true
      this.errorText = errorMsg || 'Error Occured'
    },

    async submitForm() {
      let { asset, depreciationRelId } = this
      let param = {
        data: {
          asset: {
            id: asset.id,
          },
          depreciation: {
            id: this.selectedDepreciation.id,
          },
        },
      }
      let promise = {}
      if (isEmpty(depreciationRelId))
        promise = await API.createRecord('assetdepreciationRel', param)
      else
        promise = await API.updateRecord('assetdepreciationRel', {
          ...param,
          id: depreciationRelId,
        })
      let { error } = promise || {}
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        ftoast.success(this.$t('asset.depreciation_scheduled','Depreciation Schedule applied for this Asset',{ns:'asset'}))
        this.$emit('fetchAssetDetail')
        this.applyingDepreciation = false
        this.closeDialog()
      }
    },
    closeDialog() {
      this.$emit('onClose')
    },
  },
}
</script>
