<template>
  <FContainer
    display="flex"
    justifyContent="center"
    marginTop="containerXxLarge"
  >
    <FContainer margin="containerXxLarge containerNone">
      <FCard>
        <FContainer padding="sectionSmall">
          <FText appearance="headingMed14">{{
            $t('kpi_details_title', { ns: 'kpi' })
          }}</FText>
          <FContainer paddingTop="sectionXSmall">
            <FForm
              ref="kpi-details-form"
              :model="modelValue"
              :rules="rules"
              position="top"
            >
              <FContainer display="flex">
                <FFormItem :label="$t('kpi_name', { ns: 'kpi' })" prop="name">
                  <FInput
                    v-model="modelValue.name"
                    :placeholder="$t('kpi_name_placeholder', { ns: 'kpi' })"
                  />
                </FFormItem>
              </FContainer>

              <FContainer display="flex" paddingTop="containerXxLarge">
                <FFormItem
                  :label="$t('description', { ns: 'kpi' })"
                  prop="description"
                >
                  <FTextArea
                    v-model="modelValue.description"
                    :placeholder="$t('description_placeholder', { ns: 'kpi' })"
                  ></FTextArea>
                </FFormItem>
              </FContainer>
              <FContainer display="flex" paddingTop="containerXxLarge">
                <FFormItem :label="$t('metric', { ns: 'kpi' })" prop="metricId">
                  <FContainer width="328px">
                    <FSelect
                      v-if="!isLoading"
                      v-model="modelValue.metricId"
                      :options="metricOptions"
                      :placeholder="$t('select', { ns: 'kpi' })"
                      :disabled="isEditForm"
                      filterable
                      @change="loadUnit"
                    />
                  </FContainer>
                </FFormItem>
                <FContainer paddingLeft="containerXxLarge">
                  <FFormItem
                    v-if="!isCustomUnit"
                    :label="$t('unit', { ns: 'kpi' })"
                    prop="unitId"
                  >
                    <FContainer width="328px">
                      <FSelect
                        v-if="!isLoading"
                        v-model="modelValue.unitId"
                        :disabled="isEditForm"
                        :options="unitOptions"
                        :placeholder="$t('select', { ns: 'kpi' })"
                        filterable
                      />
                    </FContainer>
                  </FFormItem>
                  <FFormItem
                    v-else
                    :label="$t('unit', { ns: 'kpi' })"
                    prop="customUnit"
                  >
                    <FContainer width="328px">
                      <FInput
                        v-if="!isLoading"
                        v-model="modelValue.customUnit"
                        :disabled="isEditForm"
                        :placeholder="
                          $t('custom_unit_placeholder', { ns: 'kpi' })
                        "
                      ></FInput>
                    </FContainer>
                  </FFormItem>
                </FContainer>
              </FContainer>
              <FContainer display="flex" paddingTop="containerXxLarge">
                <FFormItem
                  :label="$t('applicable_to', { ns: 'kpi' })"
                  prop="resourceType"
                >
                  <FRadioGroup
                    v-model="modelValue.resourceType"
                    :options="resourceTypeOptions"
                    @change="updateResourceType"
                    alignment="horizontal"
                  ></FRadioGroup>
                </FFormItem>
              </FContainer>
              <FContainer v-if="showResourceOptions">
                <FContainer
                  v-if="!isSiteKpi"
                  display="flex"
                  paddingTop="containerSmall"
                >
                  <FFormItem :label="getCategoryLabel" prop="categoryId">
                    <Lookup
                      v-if="canShowCategoryLookup"
                      v-model="modelValue.categoryId"
                      :field.sync="resourceModuleMeta.parentModule"
                      @recordSelected="resetResourceSelectionType"
                      :disabled="isEditForm"
                    ></Lookup>
                  </FFormItem>
                </FContainer>
                <FContainer
                  v-if="modelValue.categoryId || isSiteKpi"
                  display="flex"
                  :paddingTop="
                    isSiteKpi ? 'containerSmall ' : 'containerXxLarge'
                  "
                >
                  <FFormItem :label="getResourceTypeName">
                    <FRadioGroup
                      v-model="bulkSelectOption"
                      :options="resourceSelectionOptions"
                      alignment="horizontal"
                      @change="resetResources"
                    ></FRadioGroup>
                  </FFormItem>
                </FContainer>
                <FContainer
                  v-if="bulkSelectOption !== 'all'"
                  display="flex"
                  paddingTop="containerSmall"
                >
                  <FFormItem
                    :label="`${$t('select', {
                      ns: 'kpi',
                    })} ${getResourceTypeName}(s)`"
                    prop="connectedResources"
                  >
                    <Lookup
                      v-model="modelValue.connectedResources"
                      :field.sync="resourceModuleMeta.childModule"
                      :preHookFilterConstruction="constructCategoryFilter"
                      @showLookupWizard="showLookupWizard"
                    ></Lookup>
                  </FFormItem>
                </FContainer>
              </FContainer>
            </FForm>
          </FContainer>
        </FContainer>
      </FCard>
    </FContainer>
    <FContainer>
      <LookupWizard
        v-if="canShowLookupWizard"
        :canShowLookupWizard.sync="canShowLookupWizard"
        :listUrlConfig="listUrlConfig"
        :field.sync="selectedLookupField"
        @setListValues="setLookupFieldValue"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FCard,
  FText,
  FForm,
  FFormItem,
  FInput,
  FSelect,
  FTextArea,
  FRadioGroup,
} from '@facilio/design-system'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { dset } from 'dset'

const resourceTypeEnum = [
  { value: 1, enumName: 'assetCategory' },
  { value: 2, enumName: 'spaceCategory' },
  { value: 3, enumName: 'utilityType' },
  { value: 4, enumName: 'site' },
]

const resourceObj = {
  assetCategory: {
    parentModule: {
      lookupModuleName: 'assetcategory',
      lookupModule: {
        type: -1,
      },
      options: [],
      isDataLoading: false,
      placeHolderText: 'Select Asset Category',
      filter: 'category',
      displayName: 'Asset Category',
    },
    childModule: {
      isDataLoading: false,
      options: [],
      lookupModuleName: 'asset',
      placeHolderText: 'Select Assets',
      field: {
        lookupModule: {
          name: 'asset',
          displayName: 'Asset',
        },
      },
      multiple: true,
      displayName: 'Assets',
    },
  },
  spaceCategory: {
    parentModule: {
      lookupModuleName: 'spacecategory',
      lookupModule: {
        type: -1,
      },
      options: [],
      isDataLoading: true,
      placeHolderText: 'Select Space Category',
      filter: 'spacecategory',
      displayName: 'Space Category',
    },
    childModule: {
      lookupModuleName: 'space',
      field: {
        lookupModule: {
          name: 'space',
          displayName: 'Space',
        },
      },
      options: [],
      isDataLoading: false,
      multiple: true,
      placeHolderText: 'Select Space',
      displayName: 'Spaces',
    },
  },
  utilityType: {
    parentModule: {
      lookupModuleName: 'utilitytype',
      lookupModule: {
        type: -1,
      },
      options: [],
      isDataLoading: true,
      placeHolderText: 'Select Utility Type',
      filter: 'utilitytype',
      displayName: 'Utility Types',
    },
    childModule: {
      lookupModuleName: 'meter',
      field: {
        lookupModule: {
          name: 'meter',
          displayName: 'Meter',
        },
      },
      options: [],
      isDataLoading: false,
      multiple: true,
      placeHolderText: 'Select Meters',
      displayName: 'Meters',
    },
  },
  site: {
    parentModule: {
      filter: 'site',
      displayName: 'Sites',
    },
    childModule: {
      lookupModuleName: 'site',
      field: {
        lookupModule: {
          name: 'site',
          displayName: 'Site',
        },
      },
      options: [],
      isDataLoading: false,
      multiple: true,
      placeHolderText: 'Select Site',
      displayName: 'Sites',
    },
  },
}

export default {
  name: 'KPIDetails',
  components: {
    FContainer,
    FCard,
    FText,
    FForm,
    FFormItem,
    FInput,
    FSelect,
    FTextArea,
    FRadioGroup,
    Lookup,
    LookupWizard,
  },
  props: ['moduleName', 'kpiDetailsObj', 'isEditForm'],
  data() {
    return {
      metricName: '',
      metricsUnits: {},
      isCustomUnit: false,
      isLoading: false,
      bulkSelectOption: 'all',
      canShowCategoryLookup: true,
      canShowLookupWizard: false,
      selectedLookupField: null,
      resourceTypeOptions: [
        {
          label: this.$t('asset', { ns: 'kpi' }),
          value: 1,
          disabled: this.isEditForm,
        },
        {
          label: this.$t('meter', { ns: 'kpi' }),
          value: 3,
          disabled: this.isEditForm,
        },
        {
          label: this.$t('site', { ns: 'kpi' }),
          value: 4,
          disabled: this.isEditForm,
        },
      ],
      resourceTypeEnum,
      resourceObj,
      rules: {
        name: {
          required: true,
          message: this.$t('kpi_name_validation', { ns: 'kpi' }),
          trigger: 'change',
        },
        categoryId: {
          required: true,
          trigger: 'change',
          validator: value => {
            let resourceType = getProperty(
              this,
              'modelValue.resourceType',
              null
            )
            if ((resourceType === 4 && isEmpty(value)) || !isEmpty(value)) {
              return { invalid: false }
            } else {
              return {
                invalid: true,
                errorMessage: this.$t('category_validation', { ns: 'kpi' }),
              }
            }
          },
        },
        connectedResources: {
          required: true,
          trigger: 'change',
          validator: value => {
            let { bulkSelectOption } = this
            if (
              (bulkSelectOption === 'all' && isEmpty(value)) ||
              !isEmpty(value)
            ) {
              return { invalid: false }
            } else {
              return {
                invalid: true,
                errorMessage: this.$t('specific_resources_validation', {
                  ns: 'kpi',
                }),
              }
            }
          },
        },
      },
    }
  },
  watch: {
    'modelValue.categoryId': {
      async handler(newVal, oldVal) {
        if (!isEmpty(oldVal)) {
          this.resetResourceSelectionType()
        }
      },
      deep: true,
    },
  },
  computed: {
    modelValue: {
      get() {
        return this.kpiDetailsObj
      },
      set(value) {
        this.$emit('kpiDetailsChange', value)
      },
    },
    isSiteKpi() {
      let { modelValue: { resourceType } = {} } = this
      return resourceType === 4
    },
    resourceModuleMeta() {
      let { resourceObj, resourceTypeEnum, modelValue = {} } = this
      let { resourceType } = modelValue
      let obj = resourceTypeEnum.filter(m => m.value === resourceType)
      let resourceModules = obj[0]
      return resourceObj[resourceModules.enumName]
    },
    getCategoryLabel() {
      let { modelValue = {} } = this
      let { resourceType } = modelValue
      switch (resourceType) {
        case 1:
          return this.$t('asset_category', { ns: 'kpi' })
        case 3:
          return this.$t('utility_type', { ns: 'kpi' })
        default:
          return this.$t('category', { ns: 'kpi' })
      }
    },
    getResourceTypeName() {
      let { modelValue, resourceTypeOptions } = this
      let { resourceType } = modelValue || {}
      let resourceTypeObj = resourceTypeOptions.find(
        option => option.value === resourceType
      )
      return resourceTypeObj?.label
    },
    resourceSelectionOptions() {
      return [
        {
          label: `All ${this.getResourceTypeName}`,
          value: 'all',
        },
        {
          label: `Specific ${this.getResourceTypeName}`,
          value: 'include',
        },
      ]
    },
    showResourceOptions() {
      let { modelValue = {} } = this
      let { resourceType } = modelValue
      return !isEmpty(resourceType)
    },
    metricOptions() {
      let metricList = getProperty(this, 'metricsUnits.metrics')
      if (!isEmpty(metricList)) {
        let metricOptions = metricList.map(metric => {
          return {
            label: metric.name,
            value: metric.metricId,
          }
        })
        let others = {
          label: this.$t('others', { ns: 'kpi' }),
          value: 0,
        }
        metricOptions.push(others)
        return metricOptions
      }
      return []
    },
    unitOptions() {
      let { metricName, metricsUnits = {} } = this
      let { metricWithUnits } = metricsUnits
      if (!isEmpty(metricName) && !isEmpty(metricWithUnits)) {
        let unitOptions = metricWithUnits[metricName]?.map(unit => {
          return {
            label: unit.displayName + ' (' + unit.symbol + ')',
            value: unit.unitId,
          }
        })
        return unitOptions
      }
      return []
    },
    listUrlConfig() {
      let { moduleName, resourceModuleMeta = {} } = this
      let { childModule: { lookupModuleName } = {} } = resourceModuleMeta
      let url = `v3/unrelated/${moduleName}/fetchAll/${lookupModuleName}`
      return {
        url,
        toModuleName: lookupModuleName,
        filters: this.constructCategoryFilter(),
        multiple: true,
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.isLoading = true
      let { modelValue = {} } = this
      let { connectedResources, metricId } = modelValue
      if (!isEmpty(connectedResources)) {
        this.bulkSelectOption = 'include'
      }
      await this.loadDefaultMetricUnits()
      if (!isEmpty(metricId)) {
        if (metricId === 0) {
          this.isCustomUnit = true
        } else {
          this.isCustomUnit = false
          this.setMetricName(metricId)
        }
      }
      this.isLoading = false
    },
    validateForm() {
      let form = this.$refs['kpi-details-form']
      if (!isEmpty(form)) {
        let { validate } = form
        if (!isEmpty(validate)) {
          return form.validate()
        }
      }
    },
    async loadDefaultMetricUnits() {
      let { moduleName } = this
      let { data } = await API.get(
        `/kpiUnits/${moduleName}/getDefaultMetricUnits`
      )
      if (!isEmpty(data)) {
        this.metricsUnits = data
      }
    },
    loadUnit(selectedMetricId) {
      let { metricsUnits } = this
      if (selectedMetricId !== 0) {
        this.isCustomUnit = false
        this.setMetricName(selectedMetricId)
        let unitId = metricsUnits.orgUnitsList.find(
          metric => metric.metric === selectedMetricId
        )
        if (!isEmpty(this.modelValue.unitId)) {
          dset(this, 'modelValue.unitId', unitId.unit)
        }
      } else {
        this.isCustomUnit = true
        dset(this, 'modelValue.unitId', 0)
      }
    },
    setMetricName(selectedMetricId) {
      let { metricsUnits } = this
      if (!isEmpty(selectedMetricId) && selectedMetricId !== 0) {
        this.metricName = metricsUnits.metrics.find(
          metric => selectedMetricId === metric.metricId
        )
        this.metricName = this.metricName._name
      }
    },
    updateResourceType() {
      dset(this, 'modelValue.categoryId', null)
      this.resetResourceSelectionType()
      this.canShowCategoryLookup = false
      this.$nextTick(() => {
        this.canShowCategoryLookup = true
      })
    },
    constructCategoryFilter() {
      let { modelValue = {}, resourceModuleMeta = {} } = this
      let { categoryId } = modelValue
      let { parentModule } = resourceModuleMeta
      let { filter } = parentModule
      let filters = {}
      if (!isEmpty(categoryId)) {
        filters[filter] = {
          operator: 'is',
          value: [`${categoryId}`],
        }
      }
      return filters
    },
    resetResourceSelectionType() {
      dset(this, 'bulkSelectOption', 'all')
      this.resetResources()
    },
    resetResources() {
      dset(this, 'modelValue.connectedResources', null)
    },
    showLookupWizard(field, canShow) {
      dset(this, 'selectedLookupField', field)
      dset(this, 'canShowLookupWizard', canShow)
    },
    setLookupFieldValue(selectedItems) {
      let selectedValues = selectedItems.map(selectedItem => {
        let { value } = selectedItem
        return value
      })
      dset(this, 'modelValue.connectedResources', selectedValues)
    },
  },
}
</script>
