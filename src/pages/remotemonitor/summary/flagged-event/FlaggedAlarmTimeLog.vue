<template>
  <FContainer height="100%" width="100%">
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="header justify-content-space"
    >
      <FContainer display="flex">
        <FTooltip placement="top" class="pointer fwBold pL15 f16">
          <template slot="title">
            {{
              $t('flagged_event.refresh_to_reload_logs', {
                ns: 'remote_monitor',
              })
            }}
          </template>
          <FIcon
            group="action"
            @click="reloadLatestData"
            size="16"
            name="refresh"
          />
        </FTooltip>
        <FPagination
          :total="totalCount"
          :pageSize="perPage"
          :currentPage="currentPage"
          @currentChange="setPage"
          class="mL10"
        >
        </FPagination>
      </FContainer>
    </portal>
    <FContainer
      v-if="loading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
    >
      <FSpinner :show="loading" :size="30" />
    </FContainer>
    <FContainer
      v-else-if="totalCount < 1"
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FEmptyState
        :title="$t('summary.widgets.timelog.log_empty', 'No Logs Available')"
        :vertical="true"
        illustration="no-entries"
      />
    </FContainer>
    <FTable
      v-else
      :hideBorder="true"
      :rounded="false"
      :columns="columns"
      :data="flaggedAlarmTimeLogList"
    >
      <template #[`cell.performedBy`]="{ row, prop }">
        <FContainer display="flex" columnGap="containerMedium" width="100%">
          <FAvatar size="XS" :userName="getProperty(row, 'performedBy')" />
          <FText appearance="bodyReg14" color="textDescription">
            {{ getProperty(row, 'performedBy') }}
          </FText>
        </FContainer>
      </template>

      <template #[`cell.startTime`]="{ row, prop }">
        <FText appearance="bodyReg14">{{
          getFormattedTime(row, 'startTime')
        }}</FText>
      </template>
      <template #[`cell.endTime`]="{ row, prop }">
        <FText appearance="bodyReg14">{{
          getFormattedTime(row, 'endTime')
        }}</FText>
      </template>
      <template #[`cell.duration`]="{ row, prop }">
        <FText appearance="bodyReg14">{{ getDurationFromMs(row) }}</FText>
      </template>
    </FTable>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTooltip,
  FPagination,
  FIcon,
  FSpinner,
  FEmptyState,
  FTable,
  FText,
  FAvatar,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import {
  getFormattedDuration,
  formatDate,
} from '../../../../../src/utils/formatter'
export default {
  components: {
    FContainer,
    FTooltip,
    FPagination,
    FIcon,
    FSpinner,
    FEmptyState,
    FTable,
    FText,
    FAvatar,
  },
  props: ['details', 'moduleName', 'resizeWidget', 'widget', 'fitToViewArea'],
  data() {
    return {
      loading: false,
      totalCount: 0,
      currentPage: 1,
      perPage: 10,
      columns: [
        {
          name: 'eventStatus',
          displayName: this.$t('field_names.status', { ns: 'remote_monitor' }),
          id: 1,
          fixed: true,
          width: 70,
        },
        {
          name: 'performedTeam',
          displayName: this.$t('field_names.team', { ns: 'remote_monitor' }),
          id: 6,
          width: 80,
        },
        {
          name: 'performedBy',
          displayName: this.$t('flagged_event.actioned_by', {
            ns: 'remote_monitor',
          }),
          id: 6,
          width: 100,
        },
        {
          name: 'assessmentStatus',
          displayName: this.$t('field_names.assessment_status', {
            ns: 'remote_monitor',
          }),
          id: 2,
          fixed: true,
          width: 100,
        },
        {
          name: 'startTime',
          displayName: this.$t('field_names.start_time', {
            ns: 'remote_monitor',
          }),
          id: 3,
          width: 100,
        },
        {
          name: 'endTime',
          displayName: this.$t('field_names.end_time', {
            ns: 'remote_monitor',
          }),
          id: 4,
          width: 100,
        },
        {
          name: 'duration',
          displayName: this.$t('field_names.duration', {
            ns: 'remote_monitor',
          }),
          id: 7,
          width: 100,
        },
      ],
      flaggedAlarmTimeLogList: [],
    }
  },
  created() {
    this.loadFlaggedAlarmTimeLog()
  },
  methods: {
    getProperty,
    async reloadLatestData() {
      this.currentPage = 1
      await this.loadFlaggedAlarmTimeLog()
    },
    async loadFlaggedAlarmTimeLog() {
      this.loading = true
      let recordId = getProperty(this, 'details.id')
      let { currentPage: page, perPage } = this
      let params = { page, perPage, withCount: true }
      let url = `v3/modules/flaggedAlarm/${recordId}/relatedList/alarmTimeLog/parentTicket`
      let config = { force: true }
      let { data = {}, error, meta = {} } = await API.get(url, params, config)
      if (isEmpty(error)) {
        let { alarmTimeLog } = data || {}
        this.totalCount = getProperty(meta, 'pagination.totalCount', 0)
        this.flaggedAlarmTimeLogList = this.deserializeData(alarmTimeLog)
      }
      this.loading = false
    },
    getDurationFromMs(row, type = 'milliseconds') {
      let { duration } = row || {}
      if (isEmpty(duration) || duration < 0) {
        return '---'
      }
      return getFormattedDuration(duration, type)
    },
    setPage(page) {
      this.currentPage = page
      this.loadFlaggedAlarmTimeLog()
    },
    getFormattedTime(row, key) {
      let value = getProperty(row, key)
      if (isEmpty(value) || value < 0) {
        return '---'
      }
      return formatDate(value)
    },
    deserializeData(alarmTimeLogList = []) {
      return alarmTimeLogList.map(alarmTimeLog => {
        let { eventStatusDisplayName, assessmentStatusDisplayName } =
          alarmTimeLog || {}
        let performedBy = getProperty(alarmTimeLog, 'performedBy.name', '')
        let performedTeam = getProperty(alarmTimeLog, 'performedTeam.name', '')
        return {
          ...alarmTimeLog,
          eventStatus: eventStatusDisplayName,
          assessmentStatus: assessmentStatusDisplayName,
          performedBy,
          performedTeam,
        }
      })
    },
  },
}
</script>
