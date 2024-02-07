<template>
  <FContainer
    padding="containerXxLarge"
    marginTop="sectionXSmall"
    backgroundColor="backgroundMidgroundSubtle"
    borderRadius="high"
  >
    <FContainer>
      <PlannedMaintenanceConfigurationHeader
        :heading="cardHeading"
        :description="
          getFormattedText(
            $t('pm_creation.resource_planner_desc', { ns: 'maintenance' })
          )
        "
        headingAppearance="headingMed14"
        descriptionAppearance="captionReg12"
      >
        <template #actions>
          <FContainer>
            <FButton
              appearance="secondary"
              size="medium"
              iconGroup="sign-symbols"
              iconName="addition"
              :iconButton="false"
              iconPosition="prefix"
              @click="onClickAddResourcesButton"
            >
              {{
                getFormattedText(
                  $t('pm_creation.add_resources', { ns: 'maintenance' }),
                  true
                )
              }}
            </FButton>
          </FContainer>
        </template>
      </PlannedMaintenanceConfigurationHeader>

      <FContainer v-if="isConfigured" marginTop="containerXxLarge">
        <ResourcePlannerList
          ref="resource-planner-list"
          :planner="planner"
          :pmRecord="pmRecord"
          :resourcesCount="resourcesCount"
          :moduleName="moduleName"
          :plannerTitle="cardHeading"
          :resourcePlaceholder="resourcePlaceholder"
          @reloadResourcePlanner="reloadResourcePlanner"
          @onClickShowCustomizeResourcePlanner="
            onClickShowCustomizeResourcePlanner
          "
        >
        </ResourcePlannerList
      ></FContainer>
    </FContainer>

    <ResourcePlannerSelector
      v-if="showResourcePlannerSelector"
      :moduleName="moduleName"
      :planner="planner"
      :pmRecord="pmRecord"
      :totalCount.sync="totalCount"
      @reloadResourcePlanner="reloadResourcePlanner"
      @onCloseResourcePlannerSelector="onCloseResourcePlannerSelector"
    >
    </ResourcePlannerSelector>

    <ResourcePlannerDialog
      ref="resource-planner-dialog"
      v-if="showCustomizeResourcePlanner"
      :canShowResourcePlannerDialog.sync="showCustomizeResourcePlanner"
      :planner="planner"
      :pmRecord="pmRecord"
      :resourcesCount="resourcesCount"
      :moduleName="moduleName"
      :dialogTitle="cardHeading"
      :resourcePlaceholder="resourcePlaceholder"
      :selectAllRecordProp="selectAllRecordProp"
      @reloadResourcesForDialog="reloadResourcesForDialog"
    />
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import getProperty from 'dlv'
import {
  FContainer,
  FButton,
  FTags,
  FDivider,
  FButtonGroup,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import PlannedMaintenanceConfigurationHeader from './PlannedMaintenanceConfigurationHeader.vue'
import { isEmpty } from '@facilio/utils/validation'
import { getPlaceholderText, getResourcePlaceholder } from './utils/pm-utils.js'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil.js'
import ResourcePlannerSelector from './ResourcePlannerSelector.vue'
import ResourcePlannerList from './ResourcePlannerList.vue'
import ResourcePlannerDialog from './ResourcePlannerDialog.vue'

export default {
  name: 'ResourcePlanner',
  components: {
    FContainer,
    FButton,
    FTags,
    FDivider,
    FButtonGroup,
    FIcon,
    PlannedMaintenanceConfigurationHeader,
    ResourcePlannerSelector,
    ResourcePlannerList,
    ResourcePlannerDialog,
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
    totalResourcesCount: {
      type: Number,
      default: 0,
    },
  },

  created() {
    this.loadResourcePlanner()
  },

  data() {
    return {
      // Constants
      moduleName: 'pmResourcePlanner',

      // Data
      resourcesCount: 0,
      jpCount: 0,
      assigneeCount: 0,
      totalCount: 0,
      showResourcePlannerSelector: false,

      // Resource Planner Dialog
      showCustomizeResourcePlanner: false,
      selectAllRecordProp: {
        canShow: true,
        allRecordsSelected: false,
      },
    }
  },

  watch: {
    resourcesCount: {
      handler(val) {
        this.$emit('update:totalResourcesCount', val)
        // this.$emit('validate') // removed so that alert isn't shown immediately after removing all resources.
      },
    },
  },

  computed: {
    cardHeading() {
      let { resourcePlaceholder } = this
      return `${resourcePlaceholder} ${this.$t('pm_creation.resource_planner', {
        ns: 'maintenance',
      })}`
    },
    // Not used anywhere.
    heading() {
      let { resourcesCount } = this || {}

      return `${this.$t('pm_creation.resources_conf_1', {
        ns: 'maintenance',
      })} ${resourcesCount} ${this.getFormattedPlannerText(
        this.$t('pm_creation.resources_conf_2', { ns: 'maintenance' })
      )}`
    },
    resourcePlaceholder() {
      let { pmRecord } = this || {}
      return getResourcePlaceholder(pmRecord, true)
    },
    isTriggerAvailable() {
      let { planner } = this
      let { trigger } = planner || {}
      return !isEmpty(trigger)
    },
    triggerName() {
      let { planner } = this
      let { trigger } = planner || {}
      if (isEmpty(trigger)) {
        return '---'
      }
      let { name } = trigger || {}
      return name
    },
    isConfigured() {
      let { resourcesCount } = this || {}
      return resourcesCount > 0
    },
  },

  methods: {
    /* API Calls */
    async loadResourcePlanner() {
      this.isLoading = true
      let { moduleName, planner } = this || {}
      let { id } = planner || {}
      let params = {
        withCount: true,
      }
      let relatedFieldName = getRelatedFieldName('pmPlanner', moduleName)
      let relatedConfig = {
        moduleName: 'pmPlanner',
        id,
        relatedModuleName: moduleName,
        relatedFieldName,
      }
      let { error, list, meta } = await API.fetchAllRelatedList(
        relatedConfig,
        params
      )
      if (isEmpty(error)) {
        let count = getProperty(meta, 'pagination.totalCount')
        this.resourcesCount = count
        await this.computeResourceAllotments(list)
      } else {
        ftoast.critical(
          error.message ||
            this.$t('pm_creation.error_occurred', { ns: 'maintenance' })
        )
      }
      this.isLoading = false
    },

    /**
     * Function to calculate count of JobPlans and Assignees mapped to the Resources
     */
    computeResourceAllotments(resources) {
      if (!isEmpty(resources)) {
        let jpMap = []
        let assigneeMap = []

        jpMap = resources.map(resource => {
          let { jobPlan } = resource || {}
          let { id: jobPlanId } = jobPlan || {}
          if (!isEmpty(jobPlanId)) {
            return jobPlanId
          }
          return false
        })
        assigneeMap = resources.map(resource => {
          let { assignedTo } = resource || {}
          let { id: assignedToId } = assignedTo || {}
          if (!isEmpty(assignedToId)) {
            return assignedToId
          }
          return false
        })
        jpMap = jpMap.filter(jp => {
          return jp
        })
        assigneeMap = assigneeMap.filter(assignee => {
          return assignee
        })

        jpMap = [...new Set(jpMap)]
        assigneeMap = [...new Set(assigneeMap)]
        this.jpCount = jpMap.length
        this.assigneeCount = assigneeMap.length
      }
    },

    /**
     * Click Listeners
     */

    /**
     * onClickAddResourcesButton triggers when Added Resources button is clicked
     */
    onClickAddResourcesButton() {
      this.showResourcePlannerSelector = true
    },

    /* HELPER FUNCTIONS */
    /**
     * onCloseResourcePlannerSelector closes the ResourcePlannerSelectorDialog box
     */
    onCloseResourcePlannerSelector() {
      this.showResourcePlannerSelector = false
    },

    /**
     * getFormattedPlannerText formats the text based on JobPlan and Assignee count
     * @param {*} text
     */
    getFormattedPlannerText(text) {
      let { assigneeCount, jpCount } = this
      if (jpCount === 1 && assigneeCount === 1) {
        text = this.$t('pm_creation.default_planner_msg', { ns: 'maintenance' })
      }
      if (jpCount > 1) {
        text = text.replace(
          'default Job Plan',
          this.$t('pm_creation.multiple_jp', { ns: 'maintenance' })
        )
      }
      if (assigneeCount === 1) {
        text = text.replace(
          'multiple Assignees',
          this.$t('pm_creation.default_assign', { ns: 'maintenance' })
        )
      }
      if (jpCount === 0 && assigneeCount === 0) {
        text = text.replace(
          ' with a default Job Plan & multiple Assignees.',
          '.'
        )
      } else {
        if (jpCount === 0) {
          text = text.replace('a default Job Plan &', '')
        }
        if (assigneeCount === 0) {
          text = text.replace(' & multiple Assignees.', '.')
        }
      }

      text = this.getFormattedText(text)
      return text
    },

    /**
     * getFormattedText returns the Specific Resource name (Site, Space, Asset, etc.)
     * based on PM_ASSIGNMENT_TYPE.
     * @param {*} text
     * @param {*} isUpperCase
     */
    getFormattedText(text, isUpperCase) {
      let { pmRecord, resourcesCount } = this || {}

      return getPlaceholderText({
        pmRecord,
        text,
        isUpperCase,
        isSingular: resourcesCount === 1,
      })
    },

    onClickShowCustomizeResourcePlanner() {
      this.showCustomizeResourcePlanner = true
    },
    reloadResourcePlanner() {
      let resourcePlannerListRef = this.$refs['resource-planner-list']
      if (!isEmpty(resourcePlannerListRef)) {
        resourcePlannerListRef.loadResources()
      }
      this.loadResourcePlanner()
    },
    reloadResourcesForDialog() {
      // this.$refs['resource-planner-dialog'].loadResources()
      this.reloadResourcePlanner()
    },
  },
}
</script>
