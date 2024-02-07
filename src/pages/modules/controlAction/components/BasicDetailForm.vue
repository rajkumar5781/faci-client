<template>
  <FContainer height="100%">
    <FContainer
      borderBottom="solid 1px"
      borderColor="borderNeutralBaseSubtler"
      padding="containerLarge containerXxLarge"
    >
      <FText appearance="headingMed14">{{
        $t('controls.control_details', { ns: 'energy' })
      }}</FText>
    </FContainer>
    <FContainer
      height="calc(100% - 36px)"
      overflow="scroll"
      padding="containerMedium containerXxLarge"
    >
      <FContainer
        borderBottom="solid 1px"
        borderColor="borderNeutralBaseSubtler"
      >
        <FContainer
          v-if="isControlActionTemplateModule"
          marginBottom="containerXxLarge"
        >
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.template_type', { ns: 'energy' }) }}</FText
          >
          <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
          <FSelect
            v-model="basicDetails.controlActionTemplateType"
            :options="TEMPLATE_TYPE_LIST"
            :placeholder="$t('controls.place_holder.select', { ns: 'energy' })"
          />
        </FContainer>
        <FContainer marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{
              $t('controls.ca_name', { ns: 'energy', isTemplateModule })
            }}</FText
          >
          <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
          <FInput
            :placeholder="$t('controls.place_holder.name', { ns: 'energy' })"
            v-model="basicDetails.name"
            appearance="default"
            type="text"
            size="medium"
          />
        </FContainer>
        <FContainer marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.description', { ns: 'energy' }) }}
            <FText appearance="captionMed12" paddingLeft="containerMedium">
              {{ `(${$t('controls.optional', { ns: 'energy' })})` }}
            </FText></FText
          >
          <FTextArea
            :placeholder="
              $t('controls.place_holder.description', { ns: 'energy' })
            "
            v-model="basicDetails.description"
            appearance="default"
            :rows="4"
          />
        </FContainer>
        <FContainer marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('type', { ns: 'energy' }) }}
          </FText>
          <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
          <FSelect
            v-model="basicDetails.controlActionType"
            :options="TYPE_LIST"
            :disabled="true"
            :placeholder="$t('controls.place_holder.select', { ns: 'energy' })"
          />
        </FContainer>
        <FContainer marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.asset_category', { ns: 'energy' }) }}
          </FText>
          <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
          <Lookup
            :field="field"
            :moduleName="moduleName"
            v-model="basicDetails.assetCategory"
            @showLookupWizard="openCategoryLookupWizard"
          />
          <LookupWizard
            v-if="canShowLookupWizard"
            :parentModuleName="moduleName"
            :canShowLookupWizard.sync="canShowLookupWizard"
            @setLookupFieldValue="setLookupFieldValue"
            :field.sync="field"
          />
        </FContainer>
        <FContainer
          marginBottom="containerXxLarge"
          v-if="!isControlActionTemplateModule"
        >
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.schedule_date', { ns: 'energy' }) }}
          </FText>
          <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
          <FDatePicker
            :placeholder="$t('controls.place_holder.date', { ns: 'energy' })"
            v-model="basicDetails.scheduledActionDateTime"
            type="date-time"
            :timeFormat="{ is12Hour: false, interval: 30 }"
            :validateDate="validateStartDate"
            displayFormat="YYYY-MM-DD HH:mm"
          />
        </FContainer>
        <FContainer v-if="showCalendarLookup">
          <FContainer marginBottom="containerXxLarge">
            <FText
              appearance="headingMed14"
              paddingRight="containerSmall"
              display="inline-flex"
              marginBottom="containerMedium"
              >{{ $t('controls.ca_calendar', { ns: 'energy' }) }}
            </FText>
            <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
            <Lookup
              :field="calField"
              :moduleName="moduleName"
              v-model="basicDetails.calendar"
              @showLookupWizard="openCalLookupWizard" />
            <LookupWizard
              v-if="canShowCalLookupWizard"
              :parentModuleName="moduleName"
              :canShowLookupWizard.sync="canShowCalLookupWizard"
              @setLookupFieldValue="setLookupFieldValue"
              :field.sync="calField"
          /></FContainer>
        </FContainer>
      </FContainer>
      <FContainer>
        <FContainer
          v-if="!showCalendarLookup"
          display="flex"
          padding="containerXLarge containerNone"
        >
          <FCheckbox v-model="basicDetails.isEnableRevert" :value="false" />
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="flex"
            alignItems="center"
            >{{ $t('controls.enable_revert_action', { ns: 'energy' }) }}
          </FText>
        </FContainer>
        <FContainer v-if="showRevertOption" marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.revert_date', { ns: 'energy' }) }}
          </FText>
          <FText color="backgroundSemanticRedMedium">{{ '*' }}</FText>
          <FDatePicker
            :placeholder="$t('controls.place_holder.date', { ns: 'energy' })"
            v-model="basicDetails.revertActionDateTime"
            type="date-time"
            :timeFormat="{ is12Hour: false, interval: 30 }"
            :validateDate="validateEndDate"
            displayFormat="YYYY-MM-DD HH:mm"
          />
        </FContainer>
        <FContainer
          marginBottom="containerXxLarge"
          marginTop="containerXxLarge"
          v-if="showSimulation"
        >
          <FContainer display="flex" alignItems="center">
            <FText appearance="headingMed14" paddingRight="containerMedium"
              >{{ $t('controls.simulation', { ns: 'energy' }) }}
            </FText>
            <FTooltip placement="right">
              <template slot="title">{{
                $t('controls.simulation_info_description', {
                  ns: 'energy',
                })
              }}</template>
              <FIcon group="action" name="info" size="14" :pressable="false" />
            </FTooltip>
          </FContainer>
          <FContainer margin="containerMedium containerNone" display="flex">
            <FCheckbox v-model="basicDetails.isSandBox" />
            <FText
              paddingRight="containerSmall"
              alignItems="center"
              display="flex"
              >{{ $t('controls.activate_simulation', { ns: 'energy' }) }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FSelect,
  FContainer,
  FText,
  FInput,
  FTextArea,
  FDatePicker,
  FCheckbox,
  FTooltip,
  FIcon,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import cloneDeep from 'lodash/cloneDeep'
import { isEmpty } from '@facilio/utils/validation'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {
  isSimulationExecutionType,
  isScheduledTemplateType,
} from '../widgets/controlsUtil'

dayjs.extend(duration)

const TYPE_LIST = [
  { label: 'Set Point Change', value: 1 },
  { label: 'Schedule Change', value: 2 },
]
const TEMPLATE_TYPE_LIST = [
  { label: 'Un Scheduled', value: 1 },
  { label: 'Scheduled', value: 2 },
  { label: 'Flagged Events', value: 3 },
]
export default {
  props: ['prefillRecordDetails', 'isControlActionTemplateModule'],
  data() {
    return {
      basicDetails: {
        name: null,
        description: null,
        controlActionSourceType: null,
        controlActionType: 1,
        assetCategory: null,
        calendar: null,
        scheduledActionDateTime: null,
        revertActionDateTime: null,
        isEnableRevert: false,
        isSandBox: false,
        controlActionTemplateType: null,
      },
      TYPE_LIST,
      TEMPLATE_TYPE_LIST,
      canShowLookupWizard: false,
      canShowCalLookupWizard: false,
      field: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'assetcategory',
        name: 'assetCategory',
        field: {
          lookupModule: {
            name: 'assetcategory',
            displayName: 'Asset Category',
          },
        },
      },
      calField: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'calendar',
        name: 'calendar',
        field: {
          lookupModule: {
            name: 'calendar',
            displayName: 'Calendar',
          },
        },
        filters: {
          calendarType: {
            operatorId: 54,
            value: ['2'],
          },
        },
      },
    }
  },
  created() {
    this.basicDetails = cloneDeep(this.prefillRecordDetails)
    if (this.isControlActionTemplateModule) {
      this.setBooleanField()
    }
  },
  components: {
    FContainer,
    FText,
    FSelect,
    FInput,
    FTextArea,
    FDatePicker,
    FCheckbox,
    Lookup,
    LookupWizard,
    FTooltip,
    FIcon,
  },
  watch: {
    basicDetails: {
      async handler(newVal) {
        this.$emit('onFormDetailsChange', newVal)
      },
      deep: true,
    },
  },
  computed: {
    isTemplateModule() {
      let { isControlActionTemplateModule } = this
      return isControlActionTemplateModule
        ? this.$t('controls.template', { ns: 'energy' })
        : ''
    },
    moduleName() {
      return getProperty(this, 'isControlActionTemplateModule', false)
        ? 'controlActionTemplate'
        : 'controlAction'
    },
    showRevertOption() {
      let { basicDetails = {}, isControlActionTemplateModule } = this
      let { isEnableRevert } = basicDetails
      return isEnableRevert && !isControlActionTemplateModule
    },
    showSimulation() {
      let { isControlActionTemplateModule, showCalendarLookup } = this
      return isControlActionTemplateModule ? showCalendarLookup : true
    },
    showCalendarLookup() {
      return (
        getProperty(this, 'basicDetails.controlActionTemplateType', null) === 2
      )
    },
  },
  methods: {
    openCalLookupWizard() {
      this.canShowCalLookupWizard = true
    },
    openCategoryLookupWizard() {
      this.canShowLookupWizard = true
    },
    setBooleanField() {
      let { basicDetails = {} } = this
      let controlActionExecutionType = getProperty(
        this,
        'basicDetails.controlActionExecutionType',
        1
      )
      let controlActionTemplateType = getProperty(
        this,
        'basicDetails.controlActionTemplateType',
        1
      )
      let isEnableRevert = getProperty(
        this,
        'basicDetails.isEnableRevert',
        false
      )
      this.basicDetails = {
        ...basicDetails,
        isEnableRevert:
          isScheduledTemplateType(controlActionTemplateType) || isEnableRevert,
        isSandBox: isSimulationExecutionType(controlActionExecutionType),
      }
    },
    setLookupFieldValue(props = {}) {
      let { field: selectedLookupField, isControlActionTemplateModule } = this
      let { field = {} } = props

      if (isEmpty(selectedLookupField)) this.selectedLookupField = field

      let { selectedItems, options = [], multiple } = field
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

      this.$set(this.field, 'options', options)
      if (isControlActionTemplateModule) {
        if (multiple) {
          this.basicDetails.calendar = selectedItemIds
        } else {
          this.basicDetails.calendar = selectedItemIds[0]
        }
      } else {
        if (multiple) {
          this.basicDetails.assetCategory = selectedItemIds
        } else {
          this.basicDetails.assetCategory = selectedItemIds[0]
        }
      }
    },
    validateStartDate(date) {
      let today = dayjs()
      let currentDate = dayjs(date)
      let isSameDay = today.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      return currentDate.isBefore(today) && !isSameDay
    },
    validateEndDate(date) {
      let { basicDetails = {} } = this
      let { scheduledActionDateTime } = basicDetails
      let today = dayjs()
      let startDate = dayjs(scheduledActionDateTime)
      let currentDate = dayjs(date)
      let isSameDay =
        currentDate.format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD')
      return (
        currentDate.isBefore(startDate) ||
        isSameDay ||
        currentDate.isBefore(today)
      )
    },
  },
}
</script>
