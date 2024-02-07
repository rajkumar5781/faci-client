<template>
  <FContainer
    padding="containerXxLarge"
    marginTop="sectionXSmall"
    backgroundColor="backgroundMidgroundSubtle"
    borderRadius="high"
  >
    <FContainer>
      <PlannedMaintenanceConfigurationHeader
        :heading="
          getFormattedText(
            $t('pm_creation.trigger_heading', { ns: 'maintenance' })
          )
        "
        :description="
          getFormattedText(
            $t('pm_creation.trigger_desc', { ns: 'maintenance' })
          )
        "
        headingAppearance="headingMed14"
        descriptionAppearance="captionReg12"
      >
        <template #actions>
          <FContainer v-if="isLoading"> <FSpinner :size="16" /> </FContainer>
          <FContainer v-else>
            <FContainer
              v-if="isTriggerAvailable"
              display="flex"
              flexDirection="row"
            >
              <FTags
                appearance="simple"
                :text="frequencyTypeTagName"
                :disabled="false"
              />
              <FDivider
                height="auto"
                width=""
                background="backgroundNeutralHovered"
                marginLeft="containerXLarge"
                marginRight="containerXLarge"
              />
              <FButtonGroup>
                <template #buttons>
                  <FIcon
                    group="edit"
                    name="edit-line"
                    size="12"
                    @click="openTriggerDialog"
                    :pressable="!isDeleting"
                  />

                  <FContainer v-if="isDeleting">
                    <FSpinner :size="16" />
                  </FContainer>
                  <FIcon
                    v-else
                    group="action"
                    name="delete"
                    size="12"
                    @click="resetTrigger"
                  />
                </template>
              </FButtonGroup>
            </FContainer>
            <FContainer v-else>
              <FButton
                appearance="secondary"
                size="medium"
                iconGroup="sign-symbols"
                iconName="addition"
                :iconButton="false"
                iconPosition="prefix"
                @click="openTriggerDialog"
              >
                {{ addTriggerButtonText }}
              </FButton></FContainer
            >
          </FContainer>
        </template>
      </PlannedMaintenanceConfigurationHeader>
    </FContainer>

    <Trigger
      v-if="showTriggerDialog"
      :triggerData="triggerData"
      :account="account"
      @trigger="onClickSaveTrigger"
      @cancel="onCloseTriggerDialog"
    />
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { Trigger } from '@facilio/ui/new-forms'
import PlannedMaintenanceConfigurationHeader from './PlannedMaintenanceConfigurationHeader.vue'
import { isEmpty } from '@facilio/utils/validation'
import { getPlaceholderText } from './utils/pm-utils.js'
import Constants from './utils/constant'
import { FREQUENCY_HASH } from './utils/pm-utils.js'
import {
  FContainer,
  FButton,
  FTags,
  FDivider,
  FButtonGroup,
  FIcon,
  FSpinner,
  ftoast,
} from '@facilio/design-system'

export default {
  name: 'TriggerPlanner',
  components: {
    FContainer,
    FButton,
    FTags,
    FDivider,
    FButtonGroup,
    FIcon,
    FSpinner,
    Trigger,
    PlannedMaintenanceConfigurationHeader,
  },

  props: {
    planner: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      required: true,
    },
  },

  created() {
    let { isTriggerAvailable } = this
    if (isTriggerAvailable) {
      //this.loadTrigger()
    }
  },

  data() {
    return {
      // constants
      moduleName: 'pmTriggerV2',
      addTriggerButtonText: 'Add Trigger',

      // data
      showTriggerDialog: false,
      triggerData: null,

      // Loading states
      isLoading: false,
      isSaving: false,
      isDeleting: false,
    }
  },

  computed: {
    isTriggerAvailable() {
      let { planner } = this
      let { trigger } = planner || {}
      return !isEmpty(trigger)
    },
    frequencyTypeTagName() {
      let { planner } = this
      let { trigger } = planner || {}
      if (isEmpty(trigger)) {
        return '---'
      }

      let { scheduleInfo } = trigger || {}
      if (isEmpty(scheduleInfo)) {
        let { schedule } = trigger || {}
        scheduleInfo = JSON.parse(schedule)
      }
      let { frequencyType } = scheduleInfo || {}
      if (!isEmpty(frequencyType)) {
        let frequencyValue = Constants.FACILIO_SCHEDULE_FREQUENCY[frequencyType]
        return !isEmpty(frequencyValue) ? frequencyValue : 'frequencyType'
      }
      return '---'
    },
    account() {
      return this.$account
    },
  },

  methods: {
    /**
     * Loads Trigger if it's attached to the Planner
     */
    async loadTrigger() {
      this.isLoading = true
      let { planner, moduleName } = this
      let { trigger } = planner || {}
      let { id } = trigger || {}
      let { [moduleName]: record } = await API.fetchRecord(moduleName, { id })
      this.triggerData = this.deserializeTrigger(record)
      this.isLoading = false
    },

    /**
     * saveTrigger() makes API call to update the Planner with the updated Trigger data
     * and updates the PlannerItem in List by emitting updatePlannerItem
     */
    async saveTrigger() {
      this.isLoading = true
      let { planner, triggerData } = this || {}
      let trigger = this.serializeTrigger(triggerData)
      let { id } = planner || {}
      let params = { id, data: { trigger } }
      let { error } = await API.updateRecord('pmPlanner', params)
      if (!isEmpty(error)) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        let message = this.$t(
          'pm_creation.trigger_details_have_been_saved_successfully',
          {
            ns: 'maintenance',
          }
        )
        ftoast.success(message)
        this.$emit('updatePlannerItem', { ...planner, trigger })

        // call validate after updatePlannerItem
        // this.$nextTick(() => {
        // removed so that alert isn't shown immediately after removing the trigger/added before adding the resource.
        //   this.$emit('validate')
        // })
        this.onCloseTriggerDialog()
      }
      this.isLoading = false
    },

    /**
     * resetTrigger() makes API call to reset the Trigger set to the Planner
     * and updates the PlannerItem in List by emitting updatePlannerItem
     */
    async resetTrigger() {
      this.isDeleting = true
      let { planner } = this || {}
      let trigger = null
      let { id } = planner || {}
      let params = { id, data: { trigger } }
      let { error } = await API.updateRecord('pmPlanner', params)
      if (!isEmpty(error)) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        let message = this.$t(
          'pm_creation.trigger_details_have_been_deleted_successfully',
          {
            ns: 'maintenance',
          }
        )
        ftoast.success(message)
        this.showTriggerDialog = false
        this.$emit('updatePlannerItem', { ...planner, trigger })
        this.triggerData = null
      }
      this.isDeleting = false
    },

    /**
     * Helper functions
     */
    /**
     * Helper function to deserializeTrigger
     * @param {} trigger
     */
    deserializeTrigger(trigger) {
      let { schedule } = trigger || {}
      if (!isEmpty(schedule)) {
        let scheduleInfo = JSON.parse(schedule)
        let frequency = this.getFrequency(scheduleInfo) - 1 // -1 as handling in trigger component is like that
        let data = { ...trigger, frequency }
        return data
      }
      return trigger
    },

    /**
     * Helper function to serializeTrigger
     * @param {} trigger
     */
    serializeTrigger() {
      let { triggerData, pmRecord } = this || {}
      let { schedule, startTime, endTime } = triggerData || {}
      let scheduleInfo = JSON.parse(schedule)
      let { frequencyType } = scheduleInfo || {}
      let { id: pmId } = pmRecord || {}

      let frequency = frequencyType // freq is same as scheduleInfo's frequencyType
      let trigger = {
        ...triggerData,
        startTime,
        endTime,
        frequencyType,
        frequency,
        schedule: JSON.stringify(scheduleInfo),
        pmId,
        type: 1,
        typeEnum: 'SCHEDULE',
      }
      return trigger
    },

    getFrequency(scheduleInfo) {
      let { frequencyType } = scheduleInfo || {}
      let frequency = null
      if (['DAILY'].includes(FREQUENCY_HASH[frequencyType])) {
        frequency = 2
      } else if (['WEEKLY'].includes(FREQUENCY_HASH[frequencyType])) {
        frequency = 3
      } else if (
        ['MONTHLY_DATE', 'MONTHLY_WEEK'].includes(FREQUENCY_HASH[frequencyType])
      ) {
        frequency = 4
      } else if (
        ['QUARTERLY_DATE', 'QUARTERLY_WEEK'].includes(
          FREQUENCY_HASH[frequencyType]
        )
      ) {
        frequency = 5
      } else if (
        ['HALF_YEARLY_DATE', 'HALF_YEARLY_WEEK'].includes(
          FREQUENCY_HASH[frequencyType]
        )
      ) {
        frequency = 6
      } else if (
        ['ANNUALLY_DATE', 'ANNUALLY_WEEK'].includes(
          FREQUENCY_HASH[frequencyType]
        )
      ) {
        frequency = 7
      }
      return frequency
    },

    /**
     * Helper function to format the text with some data available in `pmRecord`
     * @param {*} text
     * @param {*} isUpperCase
     */
    getFormattedText(text, isUpperCase) {
      let { pmRecord } = this || {}
      return getPlaceholderText({ pmRecord, text, isUpperCase })
    },

    /**
     * Helper function to open the Trigger dialog
     */
    openTriggerDialog() {
      let { isTriggerAvailable } = this
      if (isTriggerAvailable) {
        let { planner } = this
        let { trigger } = planner || {}
        this.triggerData = this.deserializeTrigger(trigger)
      }
      this.showTriggerDialog = true
    },

    /**
     * Helper function to close the Trigger dialog
     */
    onCloseTriggerDialog() {
      this.showTriggerDialog = false
    },

    /**
     * Callback functions
     */

    /**
     * Click listener of Trigger dialog save button
     * @param {*} trigger
     */
    onClickSaveTrigger(trigger) {
      this.triggerData = trigger
      this.saveTrigger()
    },
  },
}
</script>
