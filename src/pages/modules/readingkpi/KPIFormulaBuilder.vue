<template>
  <FContainer
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    marginTop="containerXxLarge"
  >
    <FContainer width="70%">
      <FContainer margin="containerXxLarge containerNone">
        <FCard>
          <FContainer
            :padding="
              isDynamicKpi
                ? 'sectionSmall sectionSmall containerNone sectionSmall'
                : 'sectionSmall'
            "
            :style="isDynamicKpi ? 'padding-bottom: 10px' : ''"
          >
            <FText appearance="headingMed14">{{
              $t('kpi_type', { ns: 'kpi' })
            }}</FText>
            <FContainer paddingTop="sectionXSmall">
              <FForm
                ref="kpi-type-form"
                :model="kpiTypeObj"
                :rules="rules"
                position="top"
              >
                <FContainer display="flex">
                  <FFormItem
                    :label="$t('kpi_type', { ns: 'kpi' })"
                    prop="kpiTypeLabel"
                  >
                    <FRadioGroup
                      v-model="modelValue.kpiTypeLabel"
                      :options="kpiTypeOptions"
                      alignment="horizontal"
                      @change="handleKPITypeChange"
                    />
                  </FFormItem>
                </FContainer>
                <FContainer
                  v-if="!isDynamicKpi"
                  display="flex"
                  paddingTop="containerSmall"
                >
                  <FFormItem
                    :label="$t('frequency', { ns: 'kpi' })"
                    prop="frequency"
                  >
                    <FSelect
                      v-model="modelValue.frequency"
                      :options="frequencyOptions"
                      :placeholder="$t('select', { ns: 'kpi' })"
                      @change="handleFreqChange"
                    />
                  </FFormItem>
                </FContainer>
              </FForm>
            </FContainer>
          </FContainer>
        </FCard>
      </FContainer>
      <FormulaBuilder
        v-model="formulaBuilderObj"
        :categoryId="categoryId"
        :resourceType="resourceType"
        :hideTimeInterval="isDynamicKpi"
        :hideCodeView="isDynamicKpi"
        :moduleName="moduleName"
      ></FormulaBuilder>
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
  FRadioGroup,
  FSelect,
} from '@facilio/design-system'
import { FormulaBuilder } from '@facilio/formula'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { dset } from 'dset'

const frequencyOptions = [
  { label: '1 Min', value: 1 },
  { label: '2 Mins', value: 2 },
  { label: '3 Mins', value: 3 },
  { label: '4 Mins', value: 4 },
  { label: '5 Mins', value: 5 },
  { label: '10 Mins', value: 6 },
  { label: '15 Mins', value: 7 },
  { label: '20 Mins', value: 8 },
  { label: '30 Mins', value: 9 },
  { label: '1 Hr', value: 10 },
  { label: '2 Hr', value: 11 },
  { label: '3 Hr', value: 12 },
  { label: '4 Hr', value: 13 },
  { label: '8 Hr', value: 14 },
  { label: '12 Hr', value: 15 },
  { label: '1 Day', value: 16 },
  { label: 'Weekly ', value: 17 },
  { label: 'Monthly ', value: 18 },
  { label: 'Quarterly ', value: 19 },
  { label: 'Half Yearly', value: 20 },
  { label: 'Annually ', value: 21 },
]

export default {
  name: 'KPIFormulaBuilder',
  components: {
    FContainer,
    FCard,
    FText,
    FForm,
    FFormItem,
    FRadioGroup,
    FSelect,
    FormulaBuilder,
  },
  props: [
    'moduleName',
    'kpiDetailsObj',
    'kpiTypeObj',
    'kpiFormulaBuilderObj',
    'isEditForm',
  ],
  data() {
    return {
      kpiTypeOptions: [
        {
          label: this.$t('computed_kpi_label', { ns: 'kpi' }),
          value: 'computed',
          disabled: this.isEditForm,
        },
        {
          label: this.$t('realtime_kpi_label', { ns: 'kpi' }),
          value: 'realtime',
          disabled: this.isEditForm,
        },
      ],
      frequencyOptions,
      rules: {
        frequency: {
          required: true,
          trigger: 'change',
          validator: value => {
            let kpiTypeLabel = getProperty(
              this,
              'modelValue.kpiTypeLabel',
              null
            )
            if (
              (kpiTypeLabel === 'realtime' && isEmpty(value)) ||
              !isEmpty(value)
            ) {
              return { invalid: false }
            } else
              return {
                invalid: true,
                errorMessage: this.$t('frequeny_validation', { ns: 'kpi' }),
              }
          },
        },
      },
    }
  },
  computed: {
    modelValue: {
      get() {
        return this.kpiTypeObj
      },
      set(value) {
        this.$emit('kpiTypeChange', value)
      },
    },
    formulaBuilderObj: {
      get() {
        return this.kpiFormulaBuilderObj
      },
      set(value) {
        this.$emit('kpiFormulaBuilderObjChange', value)
      },
    },
    isDynamicKpi() {
      let { modelValue = {} } = this
      let { kpiTypeLabel } = modelValue
      return kpiTypeLabel === 'realtime'
    },
    categoryId() {
      let { kpiDetailsObj = {} } = this
      let { categoryId } = kpiDetailsObj
      return categoryId
    },
    resourceType() {
      let { kpiDetailsObj = {} } = this
      let { resourceType } = kpiDetailsObj
      return resourceType
    },
  },
  methods: {
    handleFreqChange() {
      let { modelValue = {} } = this
      let { frequency } = modelValue
      if (!isEmpty(frequency)) {
        dset(this, 'modelValue.kpiType', frequency > 15 ? 2 : 1)
      }
    },
    handleKPITypeChange() {
      let { modelValue = {} } = this
      let { kpiTypeLabel } = modelValue
      if (kpiTypeLabel === 'realtime') {
        dset(this, 'modelValue.kpiType', 3)
        dset(this, 'modelValue.frequency', -1)
      } else {
        dset(this, 'modelValue.frequency', null)
      }
    },
    validateForm() {
      let form = this.$refs['kpi-type-form']
      if (!isEmpty(form)) {
        let { validate } = form
        if (!isEmpty(validate)) {
          return form.validate()
        }
      }
    },
  },
}
</script>
