<template>
  <FContainer>
    <FModal
      :title="$t('historical.run_historical', 'Run Historical', { ns: 'rule' })"
      :visible="visibility"
      saveText="Create"
      @ok="onSubmit"
      @cancel="closeDialog"
      ><FContainer padding="containerXxLarge sectionLarge">
        <FForm
          ref="historyForm"
          :model="historyForm"
          :rules="formRules"
          :validateForm="true"
        >
          <FFormItem prop="assets">
            <FText apprearance="captionReg12">{{
              $t('summary.assets', 'Assets', { ns: 'rule' })
            }}</FText>
            <Lookup
              :key="`assets-lookup-field`"
              ref="assets-lookup-field"
              v-model="historyForm.assets"
              :field="assetField"
              :categoryId="assetCategoryId"
              @showLookupWizard="showLookupWizard"
            ></Lookup>
          </FFormItem>
          <FContainer paddingTop="containerXxLarge">
            <FFormItem>
              <FText apprearance="captionReg12">{{
                $t('create.actions', 'Actions', { ns: 'rule' })
              }}</FText>
              <FContainer display="flex" width="351px" flexWrap="wrap">
                <FContainer display="flex" paddingBottom="containerXLarge">
                  <FCheckbox v-model="historyForm.alarm" disabled></FCheckbox>
                  <FText appearance="bodyReg14">{{
                    $t('historical.create_alarm', 'Create Alarm', {
                      ns: 'rule',
                    })
                  }}</FText>
                </FContainer>
                <FContainer
                  display="flex"
                  paddingBottom="containerXLarge"
                  paddingLeft="containerXLarge"
                >
                  <FCheckbox v-model="historyForm.impact" disabled></FCheckbox>
                  <FText appearance="bodyReg14">{{
                    $t(
                      'historical.calculate_fault_impact',
                      'Calculate Fault Impact',
                      { ns: 'rule' }
                    )
                  }}</FText>
                </FContainer>
                <FContainer display="flex">
                  <FCheckbox v-model="historyForm.rca" disabled></FCheckbox>
                  <FText appearance="bodyReg14">{{
                    $t('historical.calculate_rca', 'Calculate RCA', {
                      ns: 'rule',
                    })
                  }}</FText>
                </FContainer>
              </FContainer>
            </FFormItem>
          </FContainer>
          <FContainer paddingTop="containerXxLarge">
            <FFormItem prop="dateRange" paddingTop="containerXxLarge">
              <FText apprearance="captionReg12">{{
                $t('historical.interval', 'Interval', { ns: 'rule' })
              }}</FText>
              <FDatePicker
                v-model="historyForm.dateRange"
                type="date-time-range"
                displayFormat="DD-MM-YYYY HH:mm:ss"
                placeholder="DD-MM-YYYY | HH:mm:ss"
                :validateDate="validDate"
              ></FDatePicker>
            </FFormItem>
          </FContainer>
        </FForm>
      </FContainer>
    </FModal>
    <LookupWizard
      v-if="canShowLookupWizard"
      :canShowLookupWizard.sync="canShowLookupWizard"
      :field="selectedLookupField"
      :categoryId="assetCategoryId"
      @setLookupFieldValue="setLookupFieldValue"
    ></LookupWizard>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FModal,
  FForm,
  FFormItem,
  FCheckbox,
  FDatePicker,
  FText,
  ftoast,
} from '@facilio/design-system'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'

import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { getOrgMoment } from './util'

export default {
  props: ['ruleId', 'visibility'],
  components: {
    FContainer,
    FModal,
    FForm,
    FFormItem,
    FCheckbox,
    FDatePicker,
    FText,
    Lookup,
    LookupWizard,
  },
  created() {
    this.loadRule()
  },
  data() {
    return {
      ruleList: [],
      assetCategoryId: null,
      historyForm: {
        assets: null,
        dateRange: null,
        alarm: true,
        rca: true,
        impact: true,
      },
      assetField: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'asset',
        placeHolderText: `${this.$t('historical.assets', 'Assets', {
          ns: 'rule',
        })}`,
        field: {
          lookupModule: {
            name: 'asset',
            displayName: 'Asset',
          },
        },
        filters: {},
        multiple: true,
      },
      canShowLookupWizard: false,
      selectedLookupField: null,
      formRules: {
        dateRange: [
          {
            required: true,
            message: `${this.$t(
              'historical.validate_daterange',
              'Please choose a Date Range',
              { ns: 'rule' }
            )}`,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    validDate(time) {
      let currentTime = getOrgMoment(Date.now()).valueOf()
      return time > currentTime
    },
    reset() {
      this.historyForm = {
        assets: null,
        dateRange: null,
        alarm: true,
        rca: true,
        impact: true,
      }
    },
    showLookupWizard(field, canShow) {
      this.$set(this, 'selectedLookupField', field)
      this.$set(this, 'canShowLookupWizard', canShow)
    },
    setLookupFieldValue(props) {
      let { historyForm } = this
      let { field } = props
      let { options = [], selectedItems = [] } = field || {}
      let selectedItemIds = []
      if (!isEmpty(selectedItems)) {
        selectedItemIds = selectedItems.map(item => item.value)
        if (!isEmpty(options)) {
          let ids = options.map(item => item.value)
          let newOptions = selectedItems.filter(
            item => !ids.includes(item.value)
          )
          options.unshift(...newOptions)
        } else {
          options = [...selectedItems]
        }
      }
      this.$set(historyForm, `assets`, selectedItemIds)
      this.$set(this.selectedLookupField, 'options', options)
    },
    async onSubmit() {
      if (this.$refs['historyForm'].validate()) {
        this.createHistory()
      }
    },
    async loadRule(force = true) {
      let { ruleId } = this
      try {
        let { newreadingrules } = await API.fetchRecord(
          'newreadingrules',
          {
            id: ruleId,
          },
          { force }
        )
        let { assetCategory: { id } = {} } = newreadingrules || {}
        this.assetCategoryId = id
      } catch (errorMsg) {
        ftoast.critical(errorMsg.message)
      }
    },
    async createHistory() {
      let { historyForm, ruleId } = this
      let { dateRange, assets } = historyForm || {}

      let url = 'v3/historical/newreadingrules/run'
      let params = {
        recordId: ruleId,
        assetIds: assets,
        startTime: dateRange[0],
        endTime: dateRange[1],
      }
      let { data, error } = await API.post(url, params)
      if (!isEmpty(error)) {
        ftoast.critical(error.message)
      } else {
        let { success } = data || {}
        ftoast.success(success)
        this.closeDialog()
      }
    },
    closeDialog() {
      this.reset()
      this.$emit('close')
    },
  },
}
</script>

<style scoped></style>
