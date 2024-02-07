<template>
  <FModal
    title="Depreciation Schedule"
    :visible="true"
    :confirmLoading="saving"
    saveText="Save"
    size="S"
    :hideFooter="false"
    @ok="submitForm"
    @cancel="closeDialog()"
    padding="containerLarge"
  >
    <FForm :model="depreciation" :rules="rules" ref="depreciationForm">
      <FContainer v-if="loading"> </FContainer>

      <FContainer
        v-else
        padding="containerXxLarge sectionLarge"
        justifyContent="center"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="sectionSmall"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">{{
              $t('asset.name', 'Name', { ns: 'asset' })
            }}</FText>
            <FInput
              v-model="depreciation.name"
              type="text"
              :placeholder="
                $t('asset.enter_depreciation_name', 'Enter depreciation name', {
                  ns: 'asset',
                })
              "
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">
              {{
                $t('asset.depreciation_type', 'Depreciation Type', {
                  ns: 'asset',
                })
              }}
            </FText>

            <FSelect
              v-model="depreciation.depreciationType"
              :placeholder="
                $t(
                  'asset.select_depreciation_type',
                  'Select depreciation type',
                  { ns: 'asset' }
                )
              "
              :options="formattedDepreciationTypes"
              size="medium"
            >
            </FSelect>
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">
              {{ $t('asset.period_type', 'Period type', { ns: 'asset' }) }}
            </FText>

            <FSelect
              v-model="depreciation.frequencyType"
              :options="formattedFrequencyTypes"
              size="medium"
            >
            </FSelect>
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">
              {{ $t('asset.period', 'Period', { ns: 'asset' }) }}
            </FText>
            <FInput
              v-model="depreciation.frequency"
              type="number"
              :placeholder="
                $t('asset.enter_period', 'Enter period', { ns: 'asset' })
              "
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="captionReg12">
              {{
                $t('asset.start_date_field', 'Start date field', {
                  ns: 'asset',
                })
              }}
            </FText>
            <FSelect
              v-model="depreciation.startDateFieldId"
              :placeholder="
                $t('asset.select_start_date', 'select start date', {
                  ns: 'asset',
                })
              "
              :options="formattedDateFields"
              size="medium"
            >
            </FSelect>
          </FContainer>
        </FContainer>
      </FContainer>
    </FForm>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { mapState, mapActions } from 'pinia'
import { isEmpty } from '@facilio/utils/validation'
import { isDateTypeField } from '@facilio/utils/field'
import viewStore from '../../../../store/views'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FForm,
  FSelect,
  FFormItem,
  FModal,
  ftoast,
  FInput,
} from '@facilio/design-system'

export default {
  props: ['id'],
  components: {
    FContainer,
    FText,
    FForm,
    FSelect,
    FFormItem,
    FModal,
    FInput,
  },

  data() {
    return {
      depreciation: {
        name: '',
        depreciationType: 1,
        frequency: null,
        frequencyType: 1,
        totalPriceFieldId: null,
        salvagePriceFieldId: null,
        currentPriceFieldId: null,
        startDateFieldId: null,
      },
      loading: false,
      saving: false,
      dateFields: {},
      rules: {
        name: {
          required: true,
          message: this.$t('common._common.please_enter_a_name'),
          trigger: 'change',
        },
        frequency: {
          required: true,
          message: this.$t('common.header.please_select_period'),
          trigger: 'change',
        },
        startDateFieldId: {
          required: true,
          message: this.$t('common._common.please_select_a_start_date'),
          trigger: 'change',
        },
      },
    }
  },
  created() {
    this.assetDepreciationType()
  },

  computed: {
    ...mapState(viewStore, {
      metaInfo: 'metaInfo',
    }),
    frequencyTypes() {
      let FREQUENCY_TYPES = {
        MONTHLY: { label: 'Monthly', id: 1 },
        QUARTERLY: { label: 'Quarterly', id: 2 },
        HALFYEARLY: { label: 'Half Yearly', id: 3 },
        YEARLY: { label: 'Yearly', id: 4 },
      }
      return Object.values(FREQUENCY_TYPES).reduce((res, freq) => {
        res[freq.id] = freq.label
        return res
      }, {})
    },
    formattedDepreciationTypes() {
      return Object.entries(this.depreciationTypes).map(
        ([key, displayName]) => ({
          label: displayName,
          value: Number(key),
        })
      )
    },
    formattedFrequencyTypes() {
      return Object.entries(this.frequencyTypes).map(([key, displayName]) => ({
        label: displayName,
        value: Number(key),
      }))
    },
    formattedDateFields() {
      this.filterOptions()
      return this.dateFields.map(dateField => ({
        label: dateField.displayName,
        value: dateField.id,
      }))
    },
  },

  methods: {
    ...mapActions(viewStore, ['loadModuleMeta']),

    assetDepreciationType() {
      let promises = []
      promises.push(this.loadModuleMeta('asset'))
      if (this.id) {
        promises.push(this.init())
      }

      Promise.all(promises)
        .then(() => {
          this.filterOptions()
          this.loading = false
        })
        .catch(() => {
          ftoast.critical('Error Occured')
        })
      let DEPRECIATION_TYPES = {
        1: 'Straight Line',
        2: 'Double Declining Balance',
      }

      this.depreciationTypes = DEPRECIATION_TYPES
    },
    init() {
      this.loading = true
      let param = { id: this.id }
      return API.fetchRecord('assetdepreciation', param).then(
        ({ assetdepreciation, error }) => {
          if (error) {
            ftoast.critical(error.messsage || 'Error Occured')
          } else {
            this.depreciation = assetdepreciation
          }
        }
      )
    },

    filterOptions() {
      let fields = getProperty(this.metaInfo, 'fields', null)
      if (!isEmpty(fields)) {
        this.dateFields = fields.filter(field => isDateTypeField(field))
        const getName = name => fields.find(field => field.name === name) || {}
        if (!this.id) {
          this.depreciation.totalPriceFieldId = getName('unitPrice').id
          this.depreciation.currentPriceFieldId = getName('currentPrice').id
          this.depreciation.salvagePriceFieldId = getName('salvageAmount').id
          this.depreciation.startDateFieldId = getName('purchasedDate').id
        }
      }
    },

    submitForm() {
      if (this.id) {
        this.updateDepreciation()
      } else {
        this.createDepreciation()
      }
    },

    createDepreciation() {
      let param = { data: { ...this.depreciation, active: true } }

      this.saving = true
      API.createRecord('assetdepreciation', param).then(
        ({ assetdepreciation, error }) => {
          if (error) {
            ftoast.critical(error.messsage || 'Error Occured')
          } else {
            this.$emit('onRecordSaved', assetdepreciation)
            ftoast.success(
              this.$t(
                'asset.depreciation_schedule_created',
                'Depreciation schedule created',
                { ns: 'asset' }
              )
            )
          }

          this.saving = false
          this.closeDialog()
        }
      )
    },

    updateDepreciation() {
      let param = { id: this.id, data: this.depreciation }

      this.saving = true
      API.updateRecord('assetdepreciation', param).then(({ error }) => {
        if (error) {
          ftoast.critical(error.messsage || 'Error Occured')
        } else {
          this.$emit('onRecordSaved')
          ftoast.success(
            this.$t(
              'asset.depreciation_schedule_updated',
              'Depreciation schedule updated',
              { ns: 'asset' }
            )
          )
        }

        this.saving = false
        this.closeDialog()
      })
    },

    closeDialog() {
      this.$emit('onClose')
    },
  },
}
</script>
