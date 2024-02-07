<template>
  <FContainer
    height="calc(100% - 16px)"
    width="100%"
    display="flex"
    flexDirection="column"
    alignItems="center"
    marginTop="sectionXSmall"
    overflow="scroll"
  >
    <FContainer
      height="max-content"
      width="50%"
      display="flex"
      flexDirection="column"
      padding="sectionSmall"
      border="solid 1px"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="high"
    >
      <FContainer marginBottom="sectionXSmall">
        <FText appearance="headingMed16">
          {{ $t('alarm_filter_rule.rule_details', { ns: 'remote_monitor' }) }}
        </FText>
      </FContainer>
      <FForm
        ref="flagged-alarm-process-form"
        uniqueId="flagged-alarm-process-form"
        :model="basicRuleDetails"
        position="top"
        :rules="formRules"
        class="flex flex-col gap-y-8"
      >
        <FFormItem :label="$t('field_names.name')" prop="name" :required="true">
          <FInput
            v-model="basicRuleDetails.name"
            :placeholder="$t('field_names.name')"
          >
          </FInput>
        </FFormItem>

        <FFormItem :label="$t('field_names.description')" prop="description">
          <FTextArea
            v-model="basicRuleDetails.description"
            :placeholder="$t('field_names.description')"
          >
          </FTextArea>
        </FFormItem>

        <FContainer display="flex" justifyContent="space-between">
          <FContainer flexBasis="49%">
            <FFormItem
              :label="
                $t('field_names.evaluation_type', { ns: 'remote_monitor' })
              "
              prop="executionType"
            >
              <FSelect
                v-model="basicRuleDetails.executionType"
                :placeholder="`${$t('actions.select')} ${$t(
                  'field_names.evaluation_type',
                  { ns: 'remote_monitor' }
                )}`"
                :options="executionTypeOptionsList"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
          <FContainer flexBasis="49%">
            <FFormItem
              :label="$t('field_names.priority', { ns: 'remote_monitor' })"
              prop="priority"
            >
              <FInput
                v-model="basicRuleDetails.priority"
                :placeholder="`${$t('actions.enter')} ${$t(
                  'field_names.priority',
                  { ns: 'remote_monitor' }
                )}`"
                type="number"
                :min="1"
                :max="100"
              ></FInput>
            </FFormItem>
          </FContainer>
        </FContainer>
        <FContainer display="flex" justifyContent="space-between">
          <FContainer width="49%">
            <FFormItem
              :label="$t('field_names.client')"
              prop="client"
              :required="true"
            >
              <Lookup
                v-model="basicRuleDetails.client"
                :field="lookupFields.client"
                moduleName="flaggedAlarmProcess"
                :hideLookupIcon="true"
              >
              </Lookup>
            </FFormItem>
          </FContainer>
          <FContainer width="49%">
            <FFormItem
              :label="$t('field_names.alarm_type', { ns: 'remote_monitor' })"
              prop="selectedAlarmTypeIds"
              :required="true"
            >
              <Lookup
                v-model="basicRuleDetails.selectedAlarmTypeIds"
                :field="lookupFields.alarmType"
                :hideLookupIcon="true"
                :fetchOptionsMethod="fetchAlarmTypeOptions"
                moduleName="flaggedEventRuleAlarmType"
              >
              </Lookup>
            </FFormItem>
          </FContainer>
        </FContainer>
      </FForm>
    </FContainer>
  </FContainer>
</template>

<script>
import view from '../../../../../store/views'
import rmHelpers from '../../utils/rmHelpers'
import { constructSelectOptionList } from '../../utils/rmHelpers'
import { Lookup } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FForm,
  FFormItem,
  FInput,
  FTextArea,
  FSelect,
  FDivider,
  FTags,
  FModal,
  FIcon,
} from '@facilio/design-system'
import { getOptionsForSecondLevelLookup } from '../../utils/rmHelpers'

const viewStore = view()
export default {
  components: {
    FContainer,
    FText,
    FForm,
    FFormItem,
    FInput,
    FTextArea,
    FSelect,
    Lookup,
    FDivider,
    FTags,
    FModal,
    FIcon,
  },
  props: ['flaggedEventRule', 'isNew'],
  data() {
    return {
      showAddAlarmTypeDialog: false,
      moduleName: '',
      executionTypeOptionsList: [],
      basicRuleDetails: {
        name: '',
        executionType: null,
        priority: null,
        client: null,
        selectedAlarmTypeIds: null,
      },
      rmHelpers: {},
      formRules: {
        name: {
          required: true,
          message: `${this.$t('actions.please_enter')} ${this.$t(
            'field_names.name'
          )}`,
          trigger: 'blur',
        },
        executionType: {
          required: true,
          message: `${this.$t('actions.please_select')} ${this.$t(
            'field_names.evaluation_type',
            { ns: 'remote_monitor' }
          )}`,
          trigger: 'change',
        },
        priority: {
          required: true,
          message: `${this.$t('actions.please_enter')} ${this.$t(
            'field_names.priority',
            { ns: 'remote_monitor' }
          )}`,
          trigger: 'blur',
        },
        client: {
          required: true,
          message: `${this.$t('actions.please_select')} ${this.$t(
            'field_names.client'
          )}`,
          trigger: 'blur',
        },
        selectedAlarmTypeIds: {
          required: true,
          message: `${this.$t('actions.please_select')} ${this.$t(
            'field_names.alarm_type',
            { ns: 'remote_monitor' }
          )}`,
          trigger: 'blur',
        },
      },
      lookupFields: {
        alarmType: {
          name: 'alarmType',
          isDataLoading: false,
          options: [],
          lookupModuleName: 'alarmType',
          placeHolderText: this.$t('field_names.alarm_type', {
            ns: 'remote_monitor',
          }),
          multiple: true,
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
    }
  },
  created() {
    this.rmHelpers = rmHelpers
    this.init()
  },
  methods: {
    async init() {
      let { isNew } = this
      this.loading = true
      if (!isNew) {
        this.deserializeData()
      }
      await viewStore.loadModuleMeta('flaggedAlarmProcess')
      let metaInfo = viewStore?.metaInfo
      this.executionTypeOptionsList = constructSelectOptionList(
        metaInfo,
        'executionType'
      )
      this.loading = false
    },
    deserializeData() {
      let { flaggedEventRule = {} } = this
      let {
        name,
        description,
        executionType,
        priority,
        client,
        flaggedEventRuleAlarmTypeRel = [],
      } = flaggedEventRule
      let selectedAlarmTypeIds = []
      if (!isEmpty(flaggedEventRuleAlarmTypeRel)) {
        flaggedEventRuleAlarmTypeRel.forEach(alarmTypeRel => {
          let { alarmType = {} } = alarmTypeRel
          let { id } = alarmType
          selectedAlarmTypeIds.push(id)
        })
      }
      this.basicRuleDetails = {
        name,
        description,
        executionType,
        priority,
        client,
        flaggedEventRuleAlarmTypeRel,
        selectedAlarmTypeIds,
      }
    },
    getSerializedData() {
      let ruleBasicDetailsForm = this.$refs['flagged-alarm-process-form']
      let validData = ruleBasicDetailsForm?.validate()
      if (!validData) {
        return { invalid: true }
      }

      let { basicRuleDetails = {}, isNew } = this
      let {
        client: clientId,
        priority,
        status,
        selectedAlarmTypeIds,
      } = basicRuleDetails
      if (isEmpty(priority)) {
        priority = 1
      }
      if (isNew) {
        status = true
      }
      let flaggedEventRuleAlarmTypeRel = (selectedAlarmTypeIds || []).map(
        alarmType => {
          return { alarmType: { id: alarmType }, flaggedEventRule: null }
        }
      )
      return {
        ...basicRuleDetails,
        flaggedEventRuleAlarmTypeRel,
        client: { id: clientId },
        priority,
        status,
      }
    },
    async fetchAlarmTypeOptions(props) {
      let options = await getOptionsForSecondLevelLookup(props, null, true)
      return options
    },
  },
}
</script>
