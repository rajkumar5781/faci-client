<template>
  <FContainer display="flex" justifyContent="center" alignItems="center">
    <portal :to="`action-${widget.id}-${widget.name}`" slim>
      <FButtonGroup>
        <template #buttons>
          <FButton appearance="secondary" @click="toggleVisibility">
            {{
              $t(
                'historical.run_historical_calc',
                'Run Historical Calculation',
                { ns: 'rule' }
              )
            }}
          </FButton>
          <FButton appearance="tertiary">
            <FIcon
              group="action"
              name="refresh"
              size="16"
              @click="refresh"
            ></FIcon>
          </FButton>
        </template>
      </FButtonGroup>
    </portal>

    <RuleRunHistoricalForm
      :ruleId="ruleId"
      :visibility="showHistoricalDialog"
      @close="showHistoricalDialog = false"
    ></RuleRunHistoricalForm>

    <FContainer
      v-if="parentLogLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      <FSpinner :size="40" />
    </FContainer>
    <FTable
      v-if="!isDataEmpty && !parentLogLoading"
      :columns="columns"
      :showSelectBar="false"
      :hideBorder="false"
      :rounded="false"
      :data="parentLog"
      accordionType="prefix"
      @accordionToggle="handleNodeClick"
    >
      <template #[`accordion`]="{ row }">
        <FContainer v-if="row.loading" display="flex" justifyContent="center"
          ><FSpinner :size="30" padding="containerXxLarge"></FSpinner
        ></FContainer>
        <FContainer class="dropDownHeight" overflow="scroll" v-else>
          <FContainer
            v-for="(child, childIndex) in childrenMap[row.id]"
            :key="child.id + child.resourceId + childIndex"
            display="flex"
            justifyContent="space-between"
            backgroundColor="backgroundMidgroundSubtle"
            paddingTop="containerXxLarge"
            paddingBottom="containerXxLarge"
            paddingLeft="containerXLarge"
            class="resourcePadding"
          >
            <FText>{{ child.resourceContext.name }}</FText>
            <FTags
              appearance="status"
              :statusType="getChildStatusType(child)"
              :text="getChildStatusText(child)"
            ></FTags>
          </FContainer>
        </FContainer>
      </template>
      <template #[`cell.asset`]="{ row }"
        ><FText>{{ getNoOfResources(row) }}</FText>
      </template>
      <template #[`cell.startAndEndDate`]="{ row }"
        ><FText>{{ getStartAndEndDate(row) }}</FText>
      </template>
      <template #[`cell.executedBy`]="{ row }">
        <FContainer display="flex" alignItems="center">
          <FAvatar size="S" userStatus="nil" :userName="row.executedBy" />
          <FText paddingLeft="containerMedium">{{
            getCreatedUserName(row)
          }}</FText>
        </FContainer>
      </template>
      <template #[`cell.executedTime`]="{ row }"
        ><FText>{{ formatDateFull(row.createdTime) }}</FText>
      </template>
      <template #[`cell.alarms`]="{ row }"
        ><FText> {{ getOccurrenceCount(row) }}</FText>
      </template>
      <template #[`cell.status`]="{ row }">
        <FTags
          appearance="status"
          :statusType="getParentStatusType(row)"
          :text="getParentStatusText(row)"
        ></FTags>
      </template>
    </FTable>
    <FContainer
      v-if="isDataEmpty && !parentLogLoading"
      display="flex"
      align-items="center"
      justify-content="center"
    >
      <FContainer width="500px">
        <FEmptyState
          :title="
            $t('summary.no_log_available', 'No Log available', { ns: 'rule' })
          "
          :vertical="true"
          size="S"
          illustration="no-entries"
        />
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FButtonGroup,
  FButton,
  FIcon,
  FTable,
  FText,
  FAvatar,
  FTags,
  FSpinner,
  FEmptyState,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import RuleRunHistoricalForm from './RuleRunHistoricalForm.vue'
import { getOrgMoment } from './util.js'
import clone from 'lodash/clone'
import { ftoast } from '@facilio/design-system'

export default {
  components: {
    FContainer,
    FButtonGroup,
    FButton,
    FIcon,
    FTable,
    FText,
    FAvatar,
    FTags,
    FSpinner,
    FEmptyState,
    RuleRunHistoricalForm,
  },
  props: ['details', 'widget'],
  mounted() {
    this.loadParentLogger()
    this.loadUsers()
  },
  data() {
    return {
      users: [],
      ruleJobStatus: {
        1: {
          label: 'In progress',
          appearance: 'warning',
        },
        2: {
          label: 'Completed',
          appearance: 'success',
        },
        3: {
          label: 'Failed',
          appearance: 'danger',
        },
        4: {
          label: 'Partially Completed',
          appearance: 'success',
        },
        5: {
          label: 'Rescheduled',
          appearance: 'warning',
        },
      },
      childJobStatus: {
        1: {
          label: 'In progress',
          appearance: 'warning',
        },
        2: {
          label: 'Generating Event',
          appearance: 'success',
        },
        3: {
          label: 'Processing Alarm',
          appearance: 'danger',
        },
        4: {
          label: 'Completed',
          appearance: 'success',
        },
        5: {
          label: 'Failed',
          appearance: 'danger',
        },
        6: {
          label: 'Processing Alarm',
          appearance: 'warning',
        },
        7: {
          label: 'Partially Completed',
          appearance: 'success',
        },
        8: {
          label: 'Rescheduled',
          appearance: 'warning',
        },
      },
      childrenMap: {},
      dateLogMap: {},
      showHistoricalDialog: false,
      parentLog: null,
      parentLogLoading: false,
      activeRule: null,
      activeNames: [],
      focusParentId: null,
      resourceName: [],
      orderType: 'desc',
      columns: [
        { displayName: 'Asset', name: 'asset', id: 1 },
        {
          displayName: 'Start & End Date',
          name: 'startAndEndDate',
          id: 2,
          width: 300,
        },
        {
          displayName: 'Executed By',
          name: 'executedBy',
          id: 3,
        },
        {
          displayName: 'Executed Time',
          name: 'executedTime',
          id: 4,
        },
        {
          displayName: 'Alarms',
          name: 'alarms',
          id: 5,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 6,
        },
      ],
      isEmpty,
    }
  },
  computed: {
    isDataEmpty() {
      let { parentLog } = this
      return isEmpty(parentLog)
    },
    ruleId() {
      let { details: { id } = {} } = this
      return id
    },
  },
  methods: {
    async loadUsers() {
      let { data, error } = await API.get('/users')
      if (isEmpty(error)) {
        let { users } = data || []
        this.users = users
      }
    },
    getUser(id) {
      let { users } = this
      let user = users.find(user => user.id === id)
      if (user) {
        return clone(user)
      }
      return {
        id: id,
        name: 'Unknown',
      }
    },
    getCreatedUserName(record) {
      let { createdBy } = record || {}
      return this.getUserName(createdBy)
    },
    getUserName(userId) {
      let currentUser = this.getUser(userId)
      let { name } = currentUser || {}
      return name === 'Unknown' ? '---' : name
    },
    getParentStatusText(row) {
      let { ruleJobStatus } = this
      let { label } = ruleJobStatus[row.status] || {}

      let { resolvedResourcesCount, noOfResources } = row || {}
      return `${resolvedResourcesCount} / ${noOfResources} ${label}`
    },
    getChildStatusText(child) {
      let { childJobStatus } = this
      let { label } = childJobStatus[child.status] || {}
      return label
    },
    getParentStatusType(row) {
      let { ruleJobStatus } = this
      let { appearance } = ruleJobStatus[row.status] || {}
      return appearance
    },
    getChildStatusType(child) {
      let { childJobStatus } = this
      let { appearance } = childJobStatus[child.status] || {}
      return appearance
    },
    getNoOfResources(row) {
      let { noOfResources } = row || {}
      return `${noOfResources} ${this.$t('summary.assets', 'Assets', {
        ns: 'rule',
      })}`
    },
    getStartAndEndDate(row) {
      let { startTime, endTime } = row || {}
      return `${this.formatDateFull(startTime)} - ${this.formatDateFull(
        endTime
      )}`
    },
    getOccurrenceCount(row) {
      let { totalAlarmCount } = row || {}
      return totalAlarmCount > 0
        ? `${totalAlarmCount} Occurred`
        : 'No occurrence'
    },
    formatDateFull(timeStamp) {
      return getOrgMoment(timeStamp).format('DD MMM YYYY HH:mm')
    },
    refresh() {
      this.loadParentLogger()
    },
    toggleVisibility() {
      this.showHistoricalDialog = !this.showHistoricalDialog
    },
    async loadParentLogger() {
      this.parentLogLoading = true
      let url =
        'v2/historical/newreadingrules/getWorkflowRuleLoggers?ruleId=' +
        this.ruleId
      let { error, data } = await API.get(url)
      if (error) {
        let { message } = error
        ftoast.critical(message || 'Error Occured')
      } else {
        let { workflowRuleLoggers } = data
        this.parentLog = workflowRuleLoggers
        this.parentLogLoading = false
        this.parentLog.sort((a, b) => {
          if (a.createdTime > b.createdTime) {
            return -1
          }
          if (a.createdTime < b.createdTime) {
            return 1
          }
          return 0
        })
      }
    },
    async handleResourceApiCall(resourceData) {
      let url =
        'v2/historicalLogger/getWorkflowRuleResourceHistoricalLogs?parentRuleResourceId=' +
        resourceData.id
      this.$set(this, 'loading', true)
      let { error, data = {} } = await API.get(url)
      if (error) {
        let { message } = error
        this.$message.error(message || 'Error Occured')
      } else {
        let { workflowRuleHistoricalLogs } = data
        this.$set(resourceData, 'loading', false)
        this.dateLogMap[resourceData.id] = Object.assign(
          workflowRuleHistoricalLogs
        )
        resourceData.loading = false
        this.$forceUpdate()
      }
    },
    async handleNodeClick(nodeData) {
      let { accordionToggle } = nodeData || {}
      if (!accordionToggle) {
        return
      }
      let url =
        'v2/historical/newreadingrules/getWorkflowRuleResourceLoggers?parentRuleLoggerId=' +
        nodeData.id
      this.$set(nodeData, 'loading', true)
      let { error, data } = await API.get(url)
      if (error) {
        let { message } = error
        this.$message.error(message || 'Error Occured')
      } else {
        let { workflowRuleResourceLoggers } = data
        this.$set(nodeData, 'loading', false)
        this.childrenMap[nodeData.id] = Object.assign(
          workflowRuleResourceLoggers
        )
        nodeData.loading = false
      }
    },
  },
}
</script>

<style scoped>
.dropDownHeight {
  max-height: 208px;
}
.resourcePadding {
  padding-left: 5vw;
  padding-right: 7vw;
}
</style>
