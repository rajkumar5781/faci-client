<template>
  <FContainer
    v-if="loading"
    height="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FSpinner :size="50" />
  </FContainer>
  <!-- rule form  -->
  <FContainer
    v-else
    display="flex"
    justifyContent="space-between"
    padding="containerXLarge containerNone"
    height="calc(100% - 24px)"
    width="100%"
  >
    <FContainer
      height="100%"
      width="24%"
      backgroundColor="backgroundMidgroundSubtle"
      borderRadius="high"
    >
      <!-- rule form header  -->
      <FContainer
        display="flex"
        alignItems="center"
        paddingLeft="containerXxLarge"
        height="40px"
      >
        <FText appearance="headingMed14">
          {{ $t('alarm_filter_rule.rule_details', { ns: 'remote_monitor' }) }}
        </FText>
      </FContainer>
      <FDivider width="100%" backgroundColor="backgroundMidgroundDark">
      </FDivider>
      <!-- rule form body  -->
      <FContainer
        padding="containerXLarge containerXxLarge"
        height="calc(100% - 40px)"
        overflow="scroll"
      >
        <FForm
          ref="alarm-filter-rule-form"
          uniqueId="alarm-filter-rule-form"
          :model="basicRuleDetails"
          position="top"
          :rules="formRules"
        >
          <FContainer marginBottom="containerXxLarge">
            <FFormItem :label="$t('field_names.name')" prop="name">
              <FInput
                v-model="basicRuleDetails.name"
                :placeholder="$t('field_names.name')"
                size="medium"
              >
              </FInput>
            </FFormItem>
          </FContainer>
          <FContainer marginBottom="containerXxLarge">
            <FFormItem
              :label="$t('field_names.description')"
              prop="description"
            >
              <FTextArea
                v-model="basicRuleDetails.description"
                :placeholder="$t('field_names.description')"
                :rows="3"
              >
              </FTextArea>
            </FFormItem>
          </FContainer>
          <FContainer marginBottom="containerXxLarge">
            <FFormItem
              :label="$t('field_names.client')"
              prop="client"
              :required="true"
            >
              <Lookup
                v-model="basicRuleDetails.client"
                :field="lookupFields.client"
                moduleName="alarmCorrelationRule"
                :hideLookupIcon="true"
                :disabled="!isNew"
                size="medium"
              >
              </Lookup>
            </FFormItem>
          </FContainer>
          <FContainer marginBottom="containerXxLarge">
            <FFormItem
              :label="$t('field_names.rule_type', { ns: 'remote_monitor' })"
              prop="ruleType"
              :required="true"
            >
              <FSelect
                v-model="basicRuleDetails.ruleType"
                :placeholder="
                  $t('field_names.rule_type', { ns: 'remote_monitor' })
                "
                :options="ruleTypeList"
                size="medium"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
          <FContainer marginBottom="containerXxLarge">
            <FFormItem
              :label="$t('field_names.alarm_type', { ns: 'remote_monitor' })"
              prop="alarmType"
              :required="true"
            >
              <Lookup
                v-model="basicRuleDetails.alarmType"
                :field="lookupFields.alarmType"
                moduleName="alarmCorrelationRule"
                :hideLookupIcon="true"
                :disabled="canDisableAlarmType"
                @recordSelected="resetValues"
                size="medium"
              >
              </Lookup>
            </FFormItem>
          </FContainer>
          <FContainer marginBottom="containerXxLarge">
            <FFormItem
              :label="
                $t('field_names.alarm_approach', { ns: 'remote_monitor' })
              "
              prop="alarmApproach"
              :required="true"
            >
              <FSelect
                v-model="basicRuleDetails.alarmApproach"
                :placeholder="
                  $t('field_names.alarm_approach', {
                    ns: 'remote_monitor',
                  })
                "
                :options="alarmApproachOptionsList"
                :clearable="false"
                size="medium"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
        </FForm>
      </FContainer>
    </FContainer>
    <FContainer
      border="solid 1px"
      borderRadius="high"
      borderColor="borderNeutralBaseSubtler"
      width="75%"
    >
      <AlarmFilterRuleCriteriaList
        ref="alarm-filter-rule-criteria-list"
        :criteriaTypeOptionsList="filteredCriteriaTypeOptionsList"
        :alarmApproach="alarmApproach"
        :alarmType="alarmType"
        :clientId="clientId"
        :ruleType="ruleType"
        :isNew="isNew"
        :criteriaList="criteriaList"
        :alarmTypeLoading="alarmTypeLoading"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import AlarmFilterRuleCriteriaList from './AlarmFilterRuleCriteriaList.vue'
import { Lookup } from '@facilio/ui/new-forms'
import view from '../../../../../store/views.js'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import { constructSelectOptionList } from '../../utils/rmHelpers'

const viewStore = view()
import {
  FContainer,
  FText,
  FForm,
  FFormItem,
  FInput,
  FTextArea,
  FSelect,
  FDivider,
  FSpinner,
} from '@facilio/design-system'
import { API } from '@facilio/api'
export default {
  components: { AlarmFilterRuleCriteriaList, Lookup },
  components: {
    FContainer,
    FText,
    FForm,
    FFormItem,
    FInput,
    FTextArea,
    FSelect,
    FDivider,
    Lookup,
    FSpinner,
    AlarmFilterRuleCriteriaList,
  },
  props: ['isNew', 'alarmFilterRule'],
  data() {
    return {
      loading: false,
      alarmTypeLoading: false,
      moduleName: 'alarmCorrelationRule',
      alarmApproachOptionsList: [],
      criteriaTypeOptionsList: [],
      ruleTypeList: [],
      basicRuleDetails: {
        name: null,
        description: '',
        client: null,
        ruleType: 'INDIVIDUAL',
        alarmType: null,
        alarmApproach: 2,
        filterRuleCriteriaList: [],
        controllerCriteria: null,
        siteCriteria: null,
      },
      criteriaList: [],
      lookupFields: {
        alarmType: {
          name: 'alarmType',
          isDataLoading: false,
          options: [],
          lookupModuleName: 'alarmType',
          placeHolderText: this.$t('field_names.alarm_type', {
            ns: 'remote_monitor',
          }),
          filters: {
            linkName: { operatorId: 4, value: ['heartbeat'] },
            oneLevelLookup: {},
          },
          field: {
            lookupModule: {
              name: 'alarmType',
              displayName: 'Alarm Type',
            },
          },
        },
        client: {
          name: 'client',
          isDataLoading: false,
          options: [],
          lookupModuleName: 'client',
          placeHolderText: this.$t('field_names.client'),
          field: {
            lookupModule: {
              name: 'client',
              displayName: 'Client',
            },
          },
        },
      },
      formRules: {
        name: {
          required: true,
          message: `${this.$t('actions.please_enter')} ${this.$t(
            'field_names.name'
          )}`,
          trigger: 'blur',
        },
        client: {
          required: true,
          message: `${this.$t('actions.please_select')} ${this.$t(
            'field_names.client'
          )}`,
          trigger: 'change',
        },
        alarmType: {
          required: true,
          message: `${this.$t('actions.please_select')} ${this.$t(
            'field_names.alarm_type',
            { ns: 'remote_monitor' }
          )}`,
          trigger: 'change',
        },
        alarmApproach: {
          required: true,
          message: `${this.$t('actions.please_select')} ${this.$t(
            'field_names.alarm_approach',
            { ns: 'remote_monitor' }
          )}`,
          trigger: 'change',
        },
      },
    }
  },
  computed: {
    filteredCriteriaTypeOptionsList() {
      let { criteriaTypeOptionsList = [], alarmApproach } = this
      // 2 -> Repeat Until Resolved
      let RURExcludeList = [
        'ALARM_OPEN_FOR_SPECIFIED_DURATION',
        'ALARM_COUNTS_IN_A_PERIOD_OF_TIME_OR_OPEN_FOR_DURATION',
      ]
      let commonExcludeList = [
        'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD',
        'ALARM_ROLL_UP',
        'SITE_OFFLINE_ALARM',
      ]
      criteriaTypeOptionsList = criteriaTypeOptionsList.filter(criteriaType => {
        let { value } = criteriaType
        return !commonExcludeList.includes(value)
      })
      if (alarmApproach === 1) {
        return criteriaTypeOptionsList.filter((criteriaType = {}) => {
          let { value } = criteriaType
          return !RURExcludeList.includes(value)
        })
      }
      return criteriaTypeOptionsList
    },
    alarmApproach() {
      let alarmApproach = getProperty(
        this,
        'basicRuleDetails.alarmApproach',
        null
      )
      return alarmApproach
    },
    alarmType() {
      let alarmType = getProperty(this, 'basicRuleDetails.alarmType', null)
      return alarmType
    },
    clientId() {
      let { basicRuleDetails = {} } = this
      let { client = null } = basicRuleDetails
      return client
    },
    filterRuleCriteriaList() {
      let filterRuleCriteriaList = getProperty(
        this,
        'basicRuleDetails.filterRuleCriteriaList',
        []
      )
      return filterRuleCriteriaList
    },
    ruleType() {
      let ruleType = getProperty(this, 'basicRuleDetails.ruleType', 1)
      return ruleType
    },
    canDisableAlarmType() {
      let { ruleType } = this
      return ['CONTROLLER_OFFLINE', 'SITE_OFFLINE'].includes(ruleType)
    },
  },
  watch: {
    ruleType(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal === 'CONTROLLER_OFFLINE') {
          this.lookupFields.alarmType.filters = {
            linkName: { operatorId: 5, value: ['heartbeat'] },
            oneLevelLookup: {},
          }
          this.fetchAndSetAlarmType('heartbeat')
        } else if (newVal === 'SITE_OFFLINE') {
          this.lookupFields.alarmType.filters = {
            linkName: { operatorId: 5, value: ['controlleroffline'] },
            oneLevelLookup: {},
          }
          this.fetchAndSetAlarmType('controlleroffline')
        } else {
          this.lookupFields.alarmType.filters = {
            linkName: { operatorId: 4, value: ['heartbeat'] },
            oneLevelLookup: {},
          }
          if (oldVal === 'CONTROLLER_OFFLINE') {
            this.basicRuleDetails.alarmType = null
          }
        }
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      let { moduleName } = this
      await viewStore.loadModuleMeta(moduleName)
      let { metaInfo } = viewStore || {}
      this.alarmApproachOptionsList = constructSelectOptionList(
        metaInfo,
        'alarmApproach'
      )
      this.ruleTypeList = constructSelectOptionList(metaInfo, 'ruleType')
      let { data = {}, error } = await API.get(
        '/v3/alarmCorrelationRule/alarmFilterCriteriaTypeOptions'
      )
      if (isEmpty(error)) {
        let { alarmFilterCriteriaTypes } = data
        this.criteriaTypeOptionsList = alarmFilterCriteriaTypes
      }

      this.deserializeData()
      this.loading = false
    },
    async fetchAndSetAlarmType(alarmType) {
      this.alarmTypeLoading = true
      let filters = {
        linkName: { operatorId: 5, value: [`${alarmType}`] },
        oneLevelLookup: {},
      }
      let payload = {
        filters: JSON.stringify(filters),
      }

      let { list, error } = await API.fetchAll('alarmType', payload)
      if (isEmpty(error)) {
        if (!isEmpty(list)) {
          this.basicRuleDetails.alarmType = getProperty(list, '0.id', null)
        }
      }
      this.alarmTypeLoading = false
    },
    getSerializedData() {
      let { basicRuleDetails = {} } = this
      let basicRuleDetailsForm = getProperty(
        this,
        '$refs.alarm-filter-rule-form',
        {}
      )
      if (!isEmpty(basicRuleDetailsForm)) {
        let valid = basicRuleDetailsForm.validate()
        if (!valid) {
          return { invalid: true }
        }
      }
      let criteriaListComponentContainer = getProperty(
        this,
        '$refs.alarm-filter-rule-criteria-list',
        {}
      )
      let filterRuleCriteriaList = []
      if (!isEmpty(criteriaListComponentContainer)) {
        filterRuleCriteriaList =
          criteriaListComponentContainer.getSerializedData()
        let { invalid } = filterRuleCriteriaList
        if (invalid) {
          return { invalid: true }
        }
      }

      return { ...basicRuleDetails, filterRuleCriteriaList }
    },
    deserializeData() {
      let { isNew, alarmFilterRule } = this
      if (!isNew) {
        let basicRuleDetails = cloneDeep(alarmFilterRule)
        let alarmType = getProperty(alarmFilterRule, 'alarmType.id', null)
        let client = getProperty(alarmFilterRule, 'client.id', null)
        this.basicRuleDetails = { ...basicRuleDetails, alarmType, client }
        this.criteriaList = alarmFilterRule?.filterRuleCriteriaList || []
      }
    },
    resetValues() {
      this.basicRuleDetails.filterRuleCriteriaList = []
    },
  },
}
</script>
