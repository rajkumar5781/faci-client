<template>
  <FContainer
    border="solid 1px"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionSmall"
    display="flex"
    flexDirection="column"
  >
    <!-- Planner Name/TextBox, Header buttons-->
    <FContainer
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <FContainer width="100%" marginRight="containerLarge">
        <FText
          v-if="!showPlannerEdit"
          appearance="headingMed14"
          color="backgroundNeutralInverseHovered"
          hover-color="blue60"
        >
          {{ planner.name }}
        </FText>
        <FInput
          v-else
          :placeholder="$t('pm_creation.planner_name', { ns: 'maintenance' })"
          v-model="plannerName"
          appearance="default"
          :autofocus="false"
          :disabled="isPlannerNameEditLoading"
          size="small"
          wrap
        />
      </FContainer>
      <FContainer>
        <FButtonGroup v-if="!showPlannerEdit">
          <template #buttons>
            <FIcon
              v-if="!isDeletingPlanner"
              group="edit"
              name="edit-line"
              size="16"
              @click="onClickEditPlanner"
            />
            <FContainer v-if="isDeletingPlanner">
              <FSpinner :size="16" />
            </FContainer>
            <FIcon
              v-else
              group="action"
              name="delete"
              size="16"
              @click="onClickDeletePlanner"
            />
          </template>
        </FButtonGroup>
        <FButtonGroup v-else>
          <template #buttons>
            <FIcon
              group="default"
              name="close"
              size="16"
              :disabled="isPlannerNameEditLoading"
              @click="onClickCloseEditPlanner" />
            <FContainer v-if="isPlannerNameEditLoading">
              <FSpinner :size="16" />
            </FContainer>
            <FContainer
              v-else
              backgroundColor="backgroundPrimaryDefault"
              borderRadius="medium"
              padding="containerLarge"
              @click="onClickSavePlanner"
              :disabled="isPlannerNameEditLoading"
            >
              <FContainer
                color="backgroundPrimaryDefault"
                backgroundColor="iconNeutralGrey01Subtler"
                borderRadius="full"
                class="flex items-center justify-center"
              >
                <FIcon
                  group="action"
                  name="tick"
                  size="12"
                  :pressable="false"
                />
              </FContainer> </FContainer
          ></template>
        </FButtonGroup>
      </FContainer>
    </FContainer>

    <!-- Alter to be shown on clicking 'Continue' -->
    <FContainer marginTop="sectionXSmall" v-if="showAlert">
      <PlannerAlertBanner
        :resourcePlaceHolderSmallCase="resourcePlaceHolderSmallCase"
      />
    </FContainer>

    <!-- Trigger Planner -->
    <FContainer>
      <TriggerPlanner
        :planner="planner"
        :pmRecord="pmRecord"
        @validate="validate"
        @updatePlannerItem="updatePlannerItem"
      ></TriggerPlanner>
    </FContainer>

    <!-- Resource Planner -->
    <FContainer>
      <ResourcePlanner
        :planner.sync="planner"
        :pmRecord="pmRecord"
        @validate="validate"
        :totalResourcesCount.sync="totalResourcesCount"
      ></ResourcePlanner>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FButton,
  FText,
  FButtonGroup,
  FIcon,
  FInput,
  ftoast,
  fDialog,
  FSpinner,
} from '@facilio/design-system'
import TriggerPlanner from './TriggerPlanner.vue'
import ResourcePlanner from './ResourcePlanner.vue'
import { eventBus } from '../../../../components/page-builder/event-bus'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import PlannerAlertBanner from './PlannerAlertBanner.vue'
import { getResourcePlaceholder } from './utils/pm-utils.js'

export default {
  name: 'PlannerListItem',
  components: {
    FContainer,
    FButton,
    FText,
    FButtonGroup,
    FIcon,
    FInput,
    FSpinner,
    TriggerPlanner,
    ResourcePlanner,
    PlannerAlertBanner,
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
    moduleName: {
      type: String,
      required: true,
    },
    checkValidity: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      // Data
      showPlannerEdit: false,
      plannerName: '',
      totalResourcesCount: 0,
      showAlert: false,

      // Loading states
      isPlannerNameEditLoading: false,
      isDeletingPlanner: false,
    }
  },

  computed: {
    plannerId() {
      let { planner } = this
      let { id } = planner || {}
      return id
    },
    resourcePlaceHolderSmallCase() {
      let { pmRecord } = this || {}
      return getResourcePlaceholder(pmRecord, false, true)
    },
  },

  methods: {
    /* API calls */

    /**
     * updatePlannerName updates the Planner name
     */
    async updatePlannerName() {
      this.isPlannerNameEditLoading = true
      let { moduleName, plannerName: name, planner } = this || {}
      let { id } = planner || {}
      let params = {
        data: { name },
        id,
      }
      let { error } = await API.updateRecord(moduleName, params)

      if (isEmpty(error)) {
        let message =
          name +
          this.$t('pm_creation.planner_updated_message_suffix', {
            ns: 'maintenance',
          })
        ftoast.success(message)
        this.$emit('reloadPlanners', { skipLoading: true })
      } else {
        ftoast.critical(error.message || 'Error Occured')
      }

      this.isPlannerNameEditLoading = false
    },

    /**
     * deletePlanner deletes the current plan
     */
    async deletePlanner(planner) {
      let { moduleName } = this || {}
      let canDelete = await fDialog.warning({
        title: this.$t('pm_creation.planner_delete_prompt', {
          ns: 'maintenance',
        }),
        description: this.$t('pm_creation.planner_delete', {
          ns: 'maintenance',
        }),
        saveText: this.$t('pm_creation.delete', { ns: 'maintenance' }),
        cancelText: this.$t('pm_creation.cancel', { ns: 'maintenance' }),
      })

      if (canDelete) {
        let { id, name } = planner || {}
        let { error } = await API.deleteRecord(moduleName, [id])
        if (isEmpty(error)) {
          let message =
            name +
            this.$t('pm_creation.has_been_deleted_successfully', {
              ns: 'maintenance',
            })
          ftoast.success(message)
          this.$emit('reloadPlanners', { skipLoading: true })
        } else {
          ftoast.critical(error.message || 'Error Occured')
        }
      }
    },

    /* Click Listeners */

    /**
     * onClickEditPlanner triggers when the edit icon is clicked
     */
    onClickEditPlanner() {
      this.showPlannerEdit = true
      let { planner } = this
      let { name } = planner || {}
      this.plannerName = name
    },

    /**
     * onClickDeletePlanner triggers when the delete icon is clicked.
     * this deletes the current planner and updates the UI
     */
    async onClickDeletePlanner() {
      this.isDeletingPlanner = true
      let { planner } = this
      await this.deletePlanner(planner)
      this.isDeletingPlanner = false
    },

    /**
     * onClickSavePlanner triggers when Save button is clicked while editing the planner name
     */
    async onClickSavePlanner() {
      let { planner } = this
      await this.updatePlannerName()
      this.closeEditModeOfPlanner()
      eventBus.$emit('handlePlannerActions', ['editPlanner'], planner)
    },

    /**
     * onClickSavePlanner triggers when close button is clicked while editing the planner name
     */
    onClickCloseEditPlanner() {
      this.closeEditModeOfPlanner()
    },

    /**
     * closeEditModeOfPlanner disables the edit mode of the planner
     */
    closeEditModeOfPlanner() {
      this.showPlannerEdit = false
    },

    /* Helper Functions */

    /**
     * updatePlannerItem emits an event so that this Planner Item in list will get updated
     * @param {*} planner
     */
    updatePlannerItem(planner) {
      this.$emit('updatePlannerItem', planner)
    },

    validate({ doNavigateToFirstInValidPlanner } = {}) {
      let { planner, totalResourcesCount } = this
      let { id, trigger } = planner || {}
      if (
        isEmpty(trigger) ||
        isEmpty(totalResourcesCount) ||
        totalResourcesCount <= 0
      ) {
        this.showAlert = true
        if (
          !isEmpty(doNavigateToFirstInValidPlanner) &&
          doNavigateToFirstInValidPlanner
        ) {
          this.$emit('scrollToCurrentPlanner', id)
        }
        return false
      }
      this.showAlert = false
      return true
    },
  },
}
</script>
