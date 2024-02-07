<template>
  <FContainer class="pmpt-details-container">
    <FContainer v-if="isListLoading" class="pmpt-details-spinner-position">
      <FSpinner :size="20" ref="content-container"></FSpinner>
    </FContainer>
    <FTabs
      v-else
      v-model="selectedPlannerId"
      appearance="link"
      :tabsList="tabsList"
      @change="handleTabClick"
      :hideBorder="false"
      :lazy="false"
    >
      <FTabPane v-for="tab in tabsList" :activeKey="tab.value" :key="tab.value">
        <FContainer>
          <SummaryFieldsWidget
            :details="plannerTriggerSummaryDetail"
            :moduleName="moduleName"
            :detailsLayout="detailsLayoutPlannerTriggerSummaryWidget"
            :widget="plannerTriggerSummaryWidget"
            :resizeWidget="resizeTriggerDetailsWidget"
            v-bind="$attrs"
          >
          </SummaryFieldsWidget>
        </FContainer>
      </FTabPane>
    </FTabs>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { getRelatedFieldName } from '../util/relatedFieldUtil'
import CommonFieldList from '../../../../components/page-builder/widgets/fieldSummary/CommonFieldList.vue'
import SummaryFieldsWidget from '../../../../components/page-builder/widgets/fieldSummary/SummaryFieldsWidget.vue'
import {
  FTabs,
  FTabPane,
  FContainer,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import {
  SCOPE_CATEGORY_PLACEHOLDER,
  FREQUENCY_HASH,
  FACILIO_FREQUENCY,
  FIELDS_SEASON_SCHEDULE_HASH,
  RUN_EVERY_FREQUENCY_HASH,
} from '../util/pm-utils'
import { eventBus } from '../../../../components/page-builder/event-bus.js'
import cloneDeep from 'lodash/cloneDeep'

const getSchedulerData = planner => {
  let schedule = getProperty(planner, 'trigger.schedule')
  if (!isEmpty(schedule)) {
    return JSON.parse(schedule)
  } else {
    return {}
  }
}

const SKIP_OPTIONS = [
  {
    label: 'Do not skip',
    value: -1,
  },
  {
    label: 'Second Cycle',
    value: 2,
  },
  {
    label: 'Third Cycle',
    value: 3,
  },
  {
    label: 'Fourth Cycle',
    value: 4,
  },
  {
    label: 'Fifth Cycle',
    value: 5,
  },
  {
    label: 'Sixth Cycle',
    value: 6,
  },
  {
    label: 'Seventh Cycle',
    value: 7,
  },
  {
    label: 'Eighth Cycle',
    value: 8,
  },
  {
    label: 'Ninth Cycle',
    value: 9,
  },
  {
    label: 'Tenth Cycle',
    value: 10,
  },
]

const FIELDS_HASH = [
  {
    name: 'frequency',
    getValue: ({ planner }) => {
      let schedule = getSchedulerData(planner)
      console.log(schedule)
      let facilioFrequency = FACILIO_FREQUENCY
      if (!isEmpty(schedule)) {
        let { frequencyType } = schedule || {}
        if (
          ['MONTHLY_DATE', 'MONTHLY_WEEK'].includes(
            FREQUENCY_HASH[frequencyType]
          )
        ) {
          frequencyType = 3
        } else if (
          ['QUARTERLY_DATE', 'QUARTERLY_WEEK'].includes(
            FREQUENCY_HASH[frequencyType]
          )
        ) {
          frequencyType = 4
        } else if (
          ['HALF_YEARLY_DATE', 'HALF_YEARLY_WEEK'].includes(
            FREQUENCY_HASH[frequencyType]
          )
        ) {
          frequencyType = 5
        } else if (
          ['ANNUALLY_DATE', 'ANNUALLY_WEEK'].includes(
            FREQUENCY_HASH[frequencyType]
          )
        ) {
          frequencyType = 6
        }

        if (facilioFrequency[frequencyType]) {
          return facilioFrequency[frequencyType]
        } else {
          return frequencyType
        }
      }

      return '---'
    },
  },
  {
    name: 'skipEvery',
    getValue: ({ planner }) => {
      let scheduler = getSchedulerData(planner)
      let { skipEvery } = scheduler || {}
      let skipObject = SKIP_OPTIONS.find(option => {
        let { value } = option || {}
        return value === skipEvery
      })
      let { label } = skipObject || {}
      return label || '---'
    },
  },
  {
    name: 'runEvery',
    getValue: ({ planner }) => {
      let scheduler = getSchedulerData(planner)
      let { frequency = null, frequencyType } = scheduler || {}
      let frequencyTextObj = RUN_EVERY_FREQUENCY_HASH[frequencyType]
      if (!isEmpty(frequency)) {
        if (frequency == 1) {
          frequency = frequencyTextObj?.singular || ''
        } else {
          frequency = frequencyTextObj
            ? `${frequency} ${frequencyTextObj?.plural}`
            : ''
        }
      }
      return frequency || '---'
    },
  },
]

const FIELDS_HASH_DISPLAY_NAMES_HASH = {
  resourceCount: {
    name: 'resourceCount',
    getValue: ({ pmv2Detail }) => {
      let { assignmentTypeEnum } = pmv2Detail || {}
      return SCOPE_CATEGORY_PLACEHOLDER[assignmentTypeEnum] || 'Resources'
    },
  },
}
export default {
  props: ['resizeWidget'],
  components: {
    FTabs,
    FTabPane,
    FContainer,
    FSpinner,
    CommonFieldList,
    SummaryFieldsWidget,
  },
  data: () => ({
    moduleName: 'pmPlanner',
    plannerList: [],
    plannerMap: {},
    plannerTriggerMap: {},
    tabsList: [],
    selectedPlannerId: null,
    details: {},
    widgetLocalCopy: {},
    isListLoading: false,
  }),
  created() {
    this.init()
  },
  computed: {
    recordId() {
      let { $route } = this
      let { params } = $route
      let { id } = params || {}
      return id
    },
    pmv2Detail() {
      let { $attrs } = this
      let { details } = $attrs || {}
      return details
    },
    plannerTriggerSummaryWidget() {
      let { $attrs } = this
      let { widget } = $attrs || {}
      return widget
    },
    detailsLayoutPlannerTriggerSummaryWidget() {
      let { $attrs } = this
      let { widget } = $attrs || {}
      let { widgetDetail = {} } = widget || {}
      let { groups = [] } = widgetDetail || {}
      return groups
    },
    plannerTriggerSummaryDetail() {
      let { selectedPlannerId, plannerMap } = this
      let planner = plannerMap[selectedPlannerId]
      return planner
    },
  },
  watch: {
    selectedPlannerId() {
      let { plannerMap, selectedPlannerId } = this
      let planner = plannerMap[`${selectedPlannerId}`]
      let { seasons } = planner || {}
      // On change of planner tab, we check for seasons details.
      if (isEmpty(seasons)) {
        // Remove Season details fields in Summary Widget for Trigger details, if it doesn't exists
        let { plannerTriggerSummaryWidget } = this
        let { widgetDetail } = plannerTriggerSummaryWidget || {}
        let { groups } = widgetDetail || {}
        if (!isEmpty(groups) && groups.length > 1) {
          groups = [groups[0]] // First group is Summary Widget for Trigger details
          widgetDetail.groups = groups

          this.$set(this.$attrs, 'widget.widgetDetail', widgetDetail)
        }
      } else {
        // Add Season details in Summary Widget for Trigger details, if it exists
        plannerMap[`${selectedPlannerId}`] = this.serializeForSeasonsSchedule(
          seasons,
          planner
        )
      }
    },
  },
  methods: {
    /**
     * Helper function to instantiate the objects
     */
    async init() {
      let { $attrs } = this
      let { widget } = $attrs || {}
      /* 
      Setting visibleRowCount to 2 so that the only Trigger summary's first 2 rows are visible (for now 
      we have only 2 rows in Trigger summary). Season Details will be made visible on clicking view more.
      */
      widget.widgetDetail.visibleRowCount = 2
      this.widgetLocalCopy = cloneDeep(widget)

      await this.loadPlannerList()
      this.serializePlannerDetailsDisplayNames()
    },

    /**
     * Helper function to set the current Planner's ID .
     * - update ResourcePlanner Detail
     * @param {*} plannerId
     */
    handleTabClick(plannerId) {
      this.selectedPlannerId = `${plannerId}`
      // Update the ResourcePlanner details
      let { pmv2Detail } = this
      this.$nextTick(() => {
        eventBus.$emit(
          'updateResourcePlannerDetail',
          parseInt(plannerId),
          pmv2Detail
        )
      })
    },
    /**
     * loadPlannerList(), fetches the planners for the pm with #ID `#recordId`.
     * - It sets the tabslist
     * - serialize PlannerDetails for SummaryWidget
     * - serialize for Seasons schedule, if available
     */
    async loadPlannerList() {
      let { $attrs } = this
      let { details: pmv2Detail } = $attrs || {}

      this.isListLoading = true
      let { moduleName, recordId } = this || {}
      let id = recordId || {}
      let relatedFieldName = getRelatedFieldName(
        'plannedmaintenance',
        moduleName
      )
      let relatedConfig = {
        moduleName: 'plannedmaintenance',
        id,
        relatedModuleName: moduleName,
        relatedFieldName,
      }

      let { error, list } = await API.fetchAllRelatedList(relatedConfig)

      if (!isEmpty(error)) {
        ftoast.critical(
          error.message || this.$t('maintenance.pm.planner_list_error')
        )
      } else {
        if (!isEmpty(list)) {
          let selectedPlanner = list[0]
          let tabsList_ = []
          let plannerList_ = []
          list.forEach(planner => {
            let tab = {
              label: planner.name,
              value: `${planner.id}`,
            }
            let { trigger = {} } = planner || {}
            // delete trigger?.frequencyType
            // delete trigger?.frequencyEnum

            let { scheduleInfo } = trigger || {}
            let { seasons = [] } = scheduleInfo || {}
            planner = {
              ...planner,
              ...scheduleInfo,
              startTime: trigger?.startTime,
              endTime: trigger?.endTime,
            }
            planner = this.serializePlannerDetailsForSummaryWidget(
              planner,
              pmv2Detail
            )

            if (!isEmpty(seasons)) {
              planner = this.serializeForSeasonsSchedule(seasons, planner)
            }
            this.plannerMap[planner.id] = planner
            plannerList_.push(planner)
            tabsList_.push(tab)
          })
          this.tabsList = tabsList_
          let { id } = selectedPlanner || {}
          this.handleTabClick(id)
          this.plannerList = plannerList_ || []
        }
      }

      this.isListLoading = false
    },
    /**
     * serializePlannerDetailsForSummaryWidget() function sets the value for fields from backend.
     * FIELDS_HASH - contains the field's value based on some condition.
     * @param {*} planner
     */
    serializePlannerDetailsForSummaryWidget(planner) {
      FIELDS_HASH.forEach(field => {
        let value = field.getValue({ planner })
        planner[`${field.name}`] = value
      })
      return planner
    },

    /**
     * serializePlannerDetailsDisplayNames() function customizes the displayName value for the fields from backend
     * FIELDS_HASH_DISPLAY_NAMES_HASH - contains the field's display name based on some condition
     */
    serializePlannerDetailsDisplayNames() {
      let { detailsLayoutPlannerTriggerSummaryWidget } = this
      let { $attrs } = this
      let { details: pmv2Detail } = $attrs || {}
      detailsLayoutPlannerTriggerSummaryWidget.forEach(group => {
        let { fields = [] } = group || {}
        fields.forEach(field => {
          let displayField = FIELDS_HASH_DISPLAY_NAMES_HASH[field.name]
          if (!isEmpty(displayField)) {
            field.displayName = displayField.getValue({ pmv2Detail })
          }
        })
      })
    },
    /**
     * serializeForSeasonsSchedule() function update the planner object with the season's details, by creating the
     * fieldname dynamically based on the mocked fields from backend.
     * Let us say we have n-seasons for a trigger. With the one set of mocked fields for season details group,
     * we will create n-number of season details row, by appending row number to the fieldname.
     *
     * - For each season we update the respective fieldname as `fieldname_rowIndex` and add season field's value to planner object.
     * @param {*} seasons
     * @param {*} planner
     */
    serializeForSeasonsSchedule(seasons, planner) {
      let { widgetLocalCopy } = this
      let widgetDetail = cloneDeep(widgetLocalCopy.widgetDetail || {})
      let { groups = [] } = widgetDetail || {}
      // TODO(1): Later get the group based on name `seasonDetailWidgetGroup`
      if (
        groups.length > 1 &&
        !isEmpty(groups[1]) &&
        groups[1].displayName === 'Season Details'
      ) {
        let seasonGroup = groups[1]
        let { fields = [] } = seasonGroup || {}
        let updatedSeasonFields = []
        let i = 1
        seasons.forEach(season => {
          let seasonDetail = {}
          fields.forEach(field => {
            // update field details
            let fieldsCopy = cloneDeep(field)
            fieldsCopy.rowIndex = i
            let fieldName = fieldsCopy.name
            fieldsCopy.name = fieldName + '_' + fieldsCopy.rowIndex
            // update season data with corressponding fieldNames
            let val = FIELDS_SEASON_SCHEDULE_HASH[`${fieldName}`].getValue({
              season,
            })
            seasonDetail[`${fieldsCopy.name}`] = val
            //   seasonFieldsList.push(fieldsCopy)
            updatedSeasonFields.push(fieldsCopy)
          })

          planner = {
            ...planner,
            ...seasonDetail,
          }
          i++
        })
        widgetDetail.groups[1].fields = updatedSeasonFields
        this.$set(this.$attrs.widget, 'widgetDetail', widgetDetail)
      }
      return planner
    },

    /**
     * resizeTriggerDetailsWidget() function de-structures height from widgetDetail object and increases the height by 40px
     * to compensate the height of FTabs component which wraps the SummaryFieldsWidget and call WidgetSupplier.resizeWidget(),
     * to resize the widget. This function this called for every rendering of the SummaryFieldsWidget.
     * @param {height} widgetDetail
     */
    resizeTriggerDetailsWidget({ height }) {
      height += 40
      this.resizeWidget({ height })
    },
  },
}
</script>
<style scoped lang="scss">
.pmpt-details-container {
  height: 100%;
  .pmpt-details-spinner-position {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
