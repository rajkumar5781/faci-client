<template>
  <FModal
    :visible.sync="readingFieldErrorToggle"
    size="S"
    :hideFooter="false"
    @cancel="closeReadingFieldErrorDialogBox"
  >
    <template #header>
      <FIcon group="alert" name="critical-filled"></FIcon>
    </template>
    <FContainer
      display="flex"
      flexDirection="column"
      gap="containerXLarge"
      padding="containerXxLarge sectionSmall"
    >
      <FContainer display="flex" flexDirection="column" gap="containerXLarge">
        <FText appearance="headingMed16" color="textDescription"
          >Was the meter reset since the last reading?</FText
        >
        <FText appearance="bodyReg14" color="textDescription">{{
          readingFieldError
        }}</FText>
      </FContainer>
      <FContainer
        padding="containerXLarge containerXLarge containerMedium containerXLarge"
        backgroundColor="backgroundMidgroundSubtle"
        border="1px solid"
        borderRadius="medium"
        borderColor="borderNeutralBaseSubtler"
      >
        <FRadioGroup
          v-model="readingData"
          :options="[
            { label: 'Yes', value: 3 },
            { label: 'No', value: 6 },
          ]"
          alignment="horizontal"
        >
        </FRadioGroup>

        <FContainer
          v-if="readingData === 3"
          display="flex"
          flexDirection="column"
          gap="containerLarge"
        >
          <FText appearance="headingMed14" color="textDescription">{{
            task.subject
          }}</FText>
          <FContainer
            display="flex"
            gap="containerXLarge"
            justifyContent="space-between"
          >
            <FContainer
              display="flex"
              flexDirection="column"
              gap="containerMedium"
            >
              <FText appearance="captionReg12" color="textMain"
                >Input Value</FText
              >
              <FInput
                type="number"
                @focus="checkAndShowTask(task)"
                v-model="task.inputValue"
                size="small"
              >
                <template #clickable
                  ><FSelect
                    v-if="
                      isReadingFieldValidationEnabled && checkReadingField(task)
                    "
                    v-model="task.readingFieldUnit"
                    :clearable="false"
                    :options="getReadingFieldUnits(task.readingField.metric)"
                    :disabled="!canExecuteTask"
                /></template>
              </FInput>
            </FContainer>

            <FContainer
              display="flex"
              flexDirection="column"
              gap="containerMedium"
            >
              <FText appearance="captionReg12" color="textMain"
                >Enter Consumption</FText
              >
              <FInput
                type="number"
                :disabled="!canExecuteTask"
                v-model="consumptionData"
                size="small"
              >
                <template #clickable
                  ><FSelect
                    v-if="
                      isReadingFieldValidationEnabled && checkReadingField(task)
                    "
                    v-model="task.readingFieldUnit"
                    :clearable="false"
                    :options="getReadingFieldUnits(task.readingField.metric)"
                    :disabled="!canExecuteTask"
                /></template>
              </FInput>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <template #footer>
      <FContainer
        v-if="readingData === 3"
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FButton
          :disabled="isDisabled"
          @click="onSave(task)"
          appearance="primary"
        >
          Save
        </FButton>
      </FContainer>
      <FContainer
        v-else
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FButton @click="closeReadingFieldErrorDialogBox" appearance="primary">
          Save
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FContainer,
  FModal,
  FText,
  FIcon,
  FRadioGroup,
  FInput,
  FSelect,
  FButton,
} from '@facilio/design-system'
import workorderMixin from '../workorderHelper'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'

export default {
  mixins: [workorderMixin],

  props: [
    'currentTaskObj',
    'task',
    'readingFieldErrorToggle',
    'readingFieldError',
    'readingFieldSuggestionToggle',
    'readingFieldSuggestions',
    'canExecuteTask',
    'readingData',
    'consumptionData',
  ],
  data() {
    return {
      showModal: true,
      metricWithUnits: {},
    }
  },
  components: {
    FContainer,
    FText,
    FModal,
    FIcon,
    FRadioGroup,
    FInput,
    FSelect,
    FButton,
  },
  async mounted() {
    await this.loadReadingFieldUnits()
  },
  computed: {
    isReadingFieldValidationEnabled() {
      return this.$access.isLicenseEnabled('READING_FIELD_UNITS_VALIDATION')
    },
    isDisabled() {
      return !this.consumptionData
    },
  },
  methods: {
    newTask() {
      return this.task
    },

    checkReadingField() {
      return task => {
        return (
          !isEmpty(task.readingField) &&
          task.readingField.metric > 0 &&
          task.readingFieldUnit > 0
        )
      }
    },
    async loadReadingFieldUnits() {
      let { data, error } = await API.get('v2/getReadingFieldUnits')
      if (!error) {
        if (data) {
          this.metricWithUnits = data.readingFieldUnits.MetricsWithUnits
        }
      }
    },
    getReadingFieldUnits(readingFieldMetricId) {
      if (!isEmpty(this.metricWithUnits)) {
        let currentMetricId = Object.keys(this.metricWithUnits).find(
          metricUnitKey => metricUnitKey == readingFieldMetricId
        )
        let readingFieldUnits = this.metricWithUnits[currentMetricId]
        let readingsUnits = readingFieldUnits.map(units => {
          return {
            label: units.symbol,
            value: units.unitId,
          }
        })
        return readingsUnits
      }
    },
    closeReadingFieldErrorDialogBox() {
      this.resetReadingFieldUnitDialogBox()
      this.readingData = 6 // meterReset state is now false .
      this.consumptionData = ''
    },
    resetReadingFieldUnitDialogBox() {
      this.readingFieldErrorToggle = false
      this.readingFieldError = null
      this.readingFieldSuggestionToggle = false
      this.readingFieldSuggestions = []
      this.currentTaskObj = null
      this.$emit('closeAlert')
    },
    onSave(task) {
      let consumptionData = this.consumptionData
      let readingData = this.readingData
      this.$emit('updateData', { consumptionData, readingData })
      this.$emit('saveTask', task)
    },
  },
}
</script>
