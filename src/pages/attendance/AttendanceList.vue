<template>
  <FContainer display="flex" class="w-full h-full" flexDirection="column">
    <FContainer
      display="flex"
      padding="containerXLarge"
      justifyContent="space-between"
      border="1px solid"
      borderBottom="none"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="high high none none"
    >
      <FText color="textMain" appearance="headingMed14">
        {{ getPageCount }}
      </FText>
      <FContainer display="flex">
        <FPagination
          :currentPage.sync="page"
          :total="recordCount"
          :pageCount="perPage"
          :pageSize="perPage"
          @currentChange="onPageChanged"
        ></FPagination>
      </FContainer>
    </FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      class="h-full w-full"
      border="1px solid"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="none none high high"
    >
    <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(records)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      class="h-full w-full"
      border="1px solid"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="none none high high"
    >
      <FEmptyState
        :description="
        $t('list_emptyStateMsg', 'No Attendance Available',{ ns: 'attendance' })"
        :vertical="true"
      ></FEmptyState>
    </FContainer>
    <FTable v-else :columns="columns" :data="records" :rounded="false">
      <template #[`cell.day`]="{ row, prop }">
        <FText>{{ formatTimeStamp(row[prop], true) }}</FText>
      </template>
      <template #[`cell.checkInTime`]="{ row, prop }">
        <FText>{{ formatTimeStamp(row[prop]) }}</FText>
      </template>
      <template #[`cell.checkOutTime`]="{ row, prop }">
        <FText>{{ formatTimeStamp(row[prop]) }}</FText>
      </template>
      <template #[`cell.workingHours`]="{ row, prop }">
        <FText>{{ formatDuration(row[prop]) }}</FText>
      </template>
      <template #[`cell.totalPaidBreakHrs`]="{ row, prop }">
        <FText>{{ formatDuration(row[prop]) }}</FText>
      </template>
      <template #[`cell.totalUnpaidBreakHrs`]="{ row, prop }">
        <FText>{{ formatDuration(row[prop]) }}</FText>
      </template>
      <template #[`cell.status`]="{ row, prop }">
        <FTags
          v-if="!isEmpty(row[prop])"
          appearance="accent"
          :text="row[prop]"
          :accentColor="getAccentTagForStatus(row[prop])"
          :disabled="false"
          :isClickable="false"
        />
        <FText v-else>{{ '---' }}</FText>
      </template>
      <template #[`cell.shift`]="{ row, prop }">
        <FText>{{ getShiftLabel(row[prop]) }}</FText>
      </template>
    </FTable>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTable,
  FTags,
  FPagination,
  FEmptyState,
  FSpinner
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate, getFormattedDuration } from '../../utils/formatter'
import { getAccentTagForStatus } from './AttendanceMixin'
import getProperty from 'dlv'
import { eventBus } from '../../components/page-builder/event-bus'
import { API } from '@facilio/api'
export default {
  name: 'AttendanceList',
  props: ['selectedRecordId'],
  mounted() {
    eventBus.$on('refresh-attendance', this.loadRecords)
  },
  beforeDestroy() {
    eventBus.$off('refresh-attendance')
  },
  created() {
    if (!isEmpty(this.selectedRecordId)) this.loadRecords(this.selectedRecordId)
  },
  data() {
    return {
      recordCount: 0,
      perPage: 15,
      page: 1,
      records: [],
      loading:false,
      columns: [
        {
          displayName: 'Date',
          name: 'day',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Check-In',
          name: 'checkInTime',
          id: 2,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Check-Out',
          name: 'checkOutTime',
          id: 3,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Work Hours',
          name: 'workingHours',
          id: 4,
          width: 100,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 5,
          width: 100,
        },
        {
          displayName: 'Shift',
          name: 'shift',
          id: 6,
          width: 100,
        },
        {
          displayName: 'Paid Break',
          name: 'totalPaidBreakHrs',
          id: 7,
          width: 100,
        },
        {
          displayName: 'Unpaid Break',
          name: 'totalUnpaidBreakHrs',
          id: 8,
          width: 100,
        },
      ],
    }
  },
  components: {
    FContainer,
    FText,
    FTable,
    FTags,
    FPagination,
    FEmptyState,
    FSpinner
  },
  computed: {
    getPageCount() {
      let { recordCount, records = [], page, perPage } = this
      let currentPageCount = records.length
      if (!isEmpty(currentPageCount) && recordCount > 1) {
        let fromCount = (page - 1) * perPage + 1
        let toCount =
          (page - 1) * perPage + currentPageCount < recordCount
            ? page * perPage
            : recordCount
        return `${fromCount + '-' + toCount} ${this.$t(
          'of',
          'of'
        )} ${recordCount} ${this.$t('records', 'Records')}`
      } else if (recordCount == 1) {
        return `${recordCount} ${this.$t('record', 'Record')}`
      }
      return ''
    },
  },
  methods: {
    isEmpty,
    getAccentTagForStatus,
    formatDate,
    getFormattedDuration,
    formatTimeStamp(value, onlyDate = false) {
      return !isEmpty(value) ? formatDate(value, onlyDate, false) : '---'
    },
    formatDuration(value) {
      return !isEmpty(value) ? getFormattedDuration(value) : '---'
    },
    getShiftLabel(shift) {
      return getProperty(shift, 'name', '---')
    },
    onPageChanged() {
      let { selectedRecordId } = this || {}
      if (!isEmpty(selectedRecordId)) {
        this.loadRecords(selectedRecordId)
      }
    },
    async loadRecords(selectedRecordId = null) {
      this.records = []
      this.loading = true
      let { page, perPage } = this
      let filters = {
        people: {
          operatorId: 36,
          value: !isEmpty(selectedRecordId) ? [String(selectedRecordId)] : [],
        },
      }
      let params = {
        page,
        perPage,
        viewName: 'all',
        filters: JSON.stringify(filters),
        withCount: true,
      }
      this.$emit('fetchTransitionButtons', selectedRecordId)
      let {
        data = {},
        error,
        meta,
      } = await API.get('/v3/attendance/list', params)
      if (error) {
        let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        this.recordCount = getProperty(meta, 'pagination.totalCount', null)
        this.records = getProperty(data, 'attendance', [])
      }
      this.loading = false
    },
  },
}
</script>
