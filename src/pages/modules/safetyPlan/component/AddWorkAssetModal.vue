<template>
  <FContainer>
    <FModal
      :title="$t('safety_plan.work_asset', { ns: 'procurement' })"
      :visible="showWorkAssetModal"
      size="S"
      :confirmLoading="isSaving"
      @ok="saveRecord"
      @cancel="closeDialog"
    >
      <FContainer padding="sectionLarge containerXLarge">
        <FContainer padding="containerXLarge">
          <FText paddingBottom="containerMedium">{{
            $t('safety_plan.asset', { ns: 'procurement' })
          }}</FText>
          <Lookup
            v-model="selectedAsset"
            moduleName="workAsset"
            :disabled="!isEmpty(selectedSpace)"
            :field="assetField"
            @showLookupWizard="openCloseWizard('asset', true)"
          />
        </FContainer>
        <FContainer padding="containerXLarge">
          <FText paddingBottom="containerMedium">{{
            $t('safety_plan.space', { ns: 'procurement' })
          }}</FText>
          <Lookup
            v-model="selectedSpace"
            moduleName="workAsset"
            :disabled="!isEmpty(selectedAsset)"
            :field="spaceField"
            @showLookupWizard="openCloseWizard('space', true)"
          />
        </FContainer>
      </FContainer>
      <LookupWizard
        v-if="canShowWizard"
        parentModuleName="workAsset"
        :canShowLookupWizard.sync="canShowWizard"
        :field="wizardField"
        @setLookupFieldValue="setLookUpValue"
      /> </FModal
  ></FContainer>
</template>
<script>
import { FModal, FContainer, ftoast , FText } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
export default {
  props: [
    'details',
    'availableSpaces',
    'availableAssets',
    'showWorkAssetModal',
    'moduleDisplayName',
  ],
  components: { FModal, FContainer, LookupWizard, Lookup ,FText },
  data() {
    return {
      canShowWizard: false,
      wizardField: null,
      selectedAsset: null,
      selectedSpace: null,
      selectedModule: null,
      isSaving:false,
    }
  },
  computed: {
    assetField() {
      let { availableAssets, details = {} } = this
      let { siteId } = details
      let field = {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'asset',
        name: 'asset',
        field: {
          lookupModule: {
            name: 'asset',
            displayName: 'Asset',
          },
        },
        multiple: false,
        forceFetchAlways: true,
        selectedItems: [],
        filters: {
          siteId: {
            operatorId: 9,
            value: [`${siteId}`],
          },
        },
      }
      if (!isEmpty(availableAssets)) {
        let { filters = {} } = field
        let { id } = filters
        field = {
          ...field,
          filters: {
            ...filters,
            id: { ...id, operatorId: 37, value: availableAssets },
          },
        }
      }
      return field
    },
    spaceField() {
      let { availableSpaces, details = {} } = this
      let { siteId } = details
      let field = {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'basespace',
        name: 'space',
        field: {
          lookupModule: {
            name: 'basespace',
            displayName: 'Space',
          },
        },
        multiple: false,
        forceFetchAlways: true,
        selectedItems: [],
        filters: {
          siteId: {
            operatorId: 9,
            value: [`${siteId}`],
          },
        },
      }
      if (!isEmpty(availableSpaces)) {
        field['filters']['id'] = {
          operatorId: 37,
          value: this.availableSpaces,
        }
      }
      return field
    },
  },
  methods: {
    getProperty,
    isEmpty,
    closeDialog() {
      this.$emit('closeDialog')
    },
    openCloseWizard(moduleName, canShow) {
      if (['asset', 'space'].includes(moduleName)) {
        this.wizardField =
          moduleName === 'asset' ? this.assetField : this.spaceField
        this.selectedModule = moduleName
        this.canShowWizard = canShow
      } else {
        this.canShowWizard = false
      }
    },
    setLookUpValue(selectedValue) {
      let { selectedModule } = this
      let field = getProperty(selectedValue, 'field')
      let selectedData = getProperty(field, 'selectedItems')
      if (!isEmpty(selectedData)) {
        let data = selectedData[0]
        if (selectedModule === 'asset') this.selectedAsset = data?.value
        else if (selectedModule === 'space') this.selectedSpace = data?.value
      }
      this.openCloseWizard(false)
    },
    async saveRecord() {
      let { moduleDisplayName, selectedAsset, selectedSpace } = this
      let safetyPlanId = this.details.id
      let successMsg = this.$t('safety_plan.success_msg', {
        ns: 'procurement',
        moduleDisplayName,
      })
      if (selectedAsset || selectedSpace) {
        let data = {
          asset: {
            id: selectedAsset,
          },
          space: {
            id: selectedSpace,
          },
          safetyPlan: { id: safetyPlanId },
        }
        this.isSaving = true
        let response = await API.createRecord('workAsset', {
          data,
        })
        let { error } = response || {}
        this.isSaving = false
        if (error) {
          let { message } = error
          ftoast.critical(message)
        } else {
          if (successMsg) {
            ftoast.success(successMsg)
          }
          this.closeDialog()
          this.$emit('loadRecords', true)
          if (!isEmpty(selectedAsset)) {
            this.$emit('getWorkAssetHazards', selectedAsset, 'asset')
          } else {
            this.$emit('getWorkAssetHazards', selectedSpace, 'space')
          }
        }
      }
    },
  },
}
</script>
