<template>
  <FContainer ref="timeLogListContainer" height="100%">
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="header justify-content-space"
    >
      <FContainer display="flex">
        <FTooltip class="pointer fwBold pL15 f16" title="Refresh">
          <FIcon
            group="action"
            @click="reloadLog"
            size="16"
            name="refresh"
          ></FIcon>
        </FTooltip>
        <FPagination
          :total="totalCount"
          :pageSize="10"
          :currentPage="logPage"
          @currentChange="setPage"
          class="mL10"
        ></FPagination>
      </FContainer>
    </portal>
    <FContainer
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      v-if="loading"
      class="height55vh flex-center-vH"
    >
      <FSpinner :show="loading" :size="20"></FSpinner>
    </FContainer>
    <FContainer
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      v-else-if="totalCount < 1"
    >
      <FEmptyState
        :title="$t('summary.widgets.timelog.log_empty', 'No Logs Available')"
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </FContainer>
    <FTable
      v-else
      :hideBorder="true"
      :rounded="false"
      :columns="columns"
      :data="logModuleData"
    >
      <template #[`cell.state`]="{ row, prop }"
        ><FText appearance="bodyReg14">{{
          dlv(row, 'fromStatus.displayName')
        }}</FText>
      </template>
      <template #[`cell.start_time`]="{ row, prop }"
        ><FText> {{ getTime(row, 'startTime') }}</FText></template
      >
      <template #[`cell.end_time`]="{ row, prop }"
        ><FText appearance="bodyReg14">{{
          getTime(row, 'endTime')
        }}</FText></template
      >
      <template #[`cell.performed_by`]="{ row, prop }"
        ><FText appearance="bodyReg14">{{
          dlv(row, 'doneBy.name') || '---'
        }}</FText></template
      >
      <template #[`cell.duration`]="{ row, prop }"
        ><FText appearance="bodyReg14">{{
          getFormattedDuration(row.duration, 'seconds')
        }}</FText></template
      >
    </FTable>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  ftoast,
  FSpinner,
  FContainer,
  FButton,
  FIcon,
  FTooltip,
  FEmptyState,
  FTable,
  FText,
  FPagination,
} from '@facilio/design-system'
import dlv from 'dlv'
import { getFormattedDuration, formatDate } from '../../../../utils/formatter'

let columns = [
  { displayName: 'State', name: 'state', id: 1, fixed: true, width: 100 },
  {
    displayName: 'Start Time',
    name: 'start_time',
    id: 2,
    fixed: true,
    width: 100,
  },
  { displayName: 'End Time', name: 'end_time', id: 3, fixed: true, width: 100 },
  {
    displayName: 'Performed by',
    name: 'performed_by',
    id: 4,
    fixed: true,
    width: 100,
  },
  { displayName: 'Duration', name: 'duration', id: 5, fixed: true, width: 100 },
]

export default {
  props: ['details', 'moduleName', 'resizeWidget', 'widget', 'fitToViewArea'],

  data() {
    return {
      loading: true,
      logModuleData: [],
      totalCount: 0,
      perPage: 10,
      statusModelData: null,
      performedModelData: null,
      logPage: 1,
      isEmpty,
      dlv,
      columns,
    }
  },
  components: {
    FSpinner,
    FContainer,
    FButton,
    FIcon,
    FTooltip,
    FText,
    FTable,
    FEmptyState,
    FPagination,
  },
  async mounted() {
    this.getLogModule()
    // this.autoResize()
    this.$nextTick(() => {
      this.fitToViewArea()
    })
  },
  methods: {
    getFormattedDuration(duration, type) {
      if (duration < 0) return '---'
      let val = getFormattedDuration(duration, type)
      return val
    },
    getTime(row, type) {
      let value = dlv(row, type)
      if (value < 0) return '---'
      let val = formatDate(value)
      return val
    },
    async getLogModule(force = true) {
      this.loading = true
      let filters = {}
      if (this.statusModelData) {
        filters.fromStatusId = {
          operatorId: 9,
          value: [this.statusModelData],
        }
      }
      if (this.performedModelData) {
        filters.doneById = {
          operatorId: 9,
          value: [this.performedModelData],
        }
      }
      let { error, data } = await API.get(
        `/v2/statetransition/timelog?parentModuleName=${this.moduleName}&includeParentFilter=true&id=${this.details.id}&page=${this.logPage}&perPage=${this.perPage}`,
        { filters: !isEmpty(filters) ? JSON.stringify(filters) : null },
        { force }
      )
      if (error) {
        let { message } = error
        ftoast.critical(message)
      } else {
        this.logModuleData = data.Timelogs || []
        this.totalCount = this.logModuleData.length
      }
      setTimeout(() => {
        this.loading = false
      })
    },
    reloadLog() {
      this.getLogModule(true)
    },
    statusFilter(status) {
      let filters = {}
      filters.moduleState = {
        operatorId: 36,
        value: [status.id],
      }
      this.getLogModule()
    },
    setPage(page) {
      this.logPage = page
      this.getLogModule()
    },
  },
}
</script>
