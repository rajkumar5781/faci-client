<template>
  <FContainer display="flex" class="w-full h-full">
    <FSidebar
      v-if="isAdmin"
      toggleText="People"
      title="People"
      :defaultOpen="true"
      :sidebarWidth="280"
    >
      <template #sidebar>
        <AttendanceSidebar
          :records="records"
          :showLoading="showLoading"
          :recordCount="recordCount"
          :page.sync="page"
          :perPage="perPage"
          :selectedRecordId="selectedRecordId"
          @fetchPeopleRecords="fetchPeopleRecords"
          @loadCalenderForSelectedPerson="loadCalenderForSelectedPerson"
        />
      </template>
      <template #content>
        <FContainer
          display="flex"
          class="w-full h-full"
          padding="containerNone containerXLarge"
          flexDirection="column"
        >
          <AttendanceTopBar
            :selectedRecordLabel="selectedRecordLabel"
            :transitionsLoading="transitionsLoading"
            :transitionButtons="transitionButtons"
            :activeAttendanceView.sync="activeAttendanceView"
            @handleTransitionClick="handleTransitionClick"
            @handleTransitionDropdown="handleTransitionDropdown"
          />
          <AttendanceCalendar
            v-if="canShowCalendar"
            @fetchTransitionButtons="fetchAttendanceTransitionButtons"
            :selectedRecordId="selectedRecordId"
          />
          <AttendanceList
            v-else-if="canShowListView"
            @fetchTransitionButtons="fetchAttendanceTransitionButtons"
            :selectedRecordId="selectedRecordId"
          />
        </FContainer>
      </template>
    </FSidebar>
    <FContainer
      v-else
      display="flex"
      class="w-full h-full"
      padding="containerNone containerXLarge"
      flexDirection="column"
    >
      <AttendanceTopBar
        :selectedRecordLabel="selectedRecordLabel"
        :transitionsLoading="transitionsLoading"
        :transitionButtons="transitionButtons"
        :activeAttendanceView.sync="activeAttendanceView"
        @handleTransitionClick="handleTransitionClick"
        @handleTransitionDropdown="handleTransitionDropdown"
      />
      <AttendanceCalendar
        v-if="canShowCalendar"
        @fetchTransitionButtons="fetchAttendanceTransitionButtons"
        :selectedRecordId="selectedRecordId"
      />
      <AttendanceList
        v-else-if="canShowListView"
        @fetchTransitionButtons="fetchAttendanceTransitionButtons"
        :selectedRecordId="selectedRecordId"
      />
    </FContainer>
    <TransitionModal
      v-if="showTransitionModal"
      :isAdmin="isAdmin"
      :transition="transition"
      :peopleId="selectedRecordId"
      @closeTransitionModal="closeTransitionModal"
      @transitionSuccess="fetchAttendanceForSelectedEmployee"
    />
  </FContainer>
</template>
<script>
import {
  FContainer,
  FCalendar,
  FSidebar,
  FText,
  FIcon,
  FButton,
  FDivider,
  FSegmentedControl,
  FButtonGroup,
  FInput,
  FSpinner,
  FDropdown,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import Pagination from '../list/Pagination.vue'
import TransitionModal from './TransitionModal.vue'
import AttendanceSidebar from './AttendanceSidebar.vue'
import AttendanceTopBar from './AttendanceTopBar.vue'
import AttendanceCalendar from './AttendanceCalendar.vue'
import AttendanceList from './AttendanceList.vue'
import { eventBus } from '../../components/page-builder/event-bus'
import isEqual from 'lodash/isEqual'

export default {
  name: 'Attendance',
  props: ['isAdmin'],
  data() {
    return {
      activeAttendanceView: 'calender',
      recordCount: 0,
      perPage: 15,
      page: 1,
      records: [],
      selectedRecordId: null,
      selectedRecordLabel: 'Unknown',
      showLoading: false,
      transitionsLoading: false,
      transitionButtons: [],
      transition: null,
      showTransitionModal: false,
    }
  },
  components: {
    FCalendar,
    FContainer,
    FSidebar,
    FText,
    FIcon,
    FButton,
    FDivider,
    FSegmentedControl,
    FButtonGroup,
    Pagination,
    FInput,
    FSpinner,
    FDropdown,
    TransitionModal,
    AttendanceSidebar,
    AttendanceTopBar,
    AttendanceCalendar,
    AttendanceList,
  },
  created() {
    this.loadData()
  },
  watch: {
    isAdmin: {
      handler() {
        this.loadData()
      },
    },
    selectedRecordId: {
      handler(newVal, oldVal) {
        if (!isEmpty(newVal) && !isEqual(newVal, oldVal)) {
          eventBus.$emit('refresh-attendance', newVal)
        }
      },
    },
  },
  computed: {
    canShowCalendar() {
      let { activeAttendanceView, selectedRecordId } = this
      return activeAttendanceView === 'calender' && !isEmpty(selectedRecordId)
    },
    canShowListView() {
      let { activeAttendanceView, selectedRecordId } = this
      return activeAttendanceView === 'list' && !isEmpty(selectedRecordId)
    },
  },
  methods: {
    isEmpty,
    loadData() {
      if (this.isAdmin) {
        this.fetchPeopleRecords()
      } else {
        let { $account = {} } = this
        let peopleId = getProperty($account, 'user.peopleId', null)
        if (!isEmpty(peopleId)) this.fetchPeople(peopleId)
      }
    },
    async fetchPeople(peopleId) {
      this.showLoading = true
      let route = `/v3/attendance/people/${peopleId}`
      let { error, data } = await API.get(route)
      if (error) {
        let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        this.recordCount = 1
        this.records = [getProperty(data, 'people', [])]
        if (!isEmpty(this.records)) {
          this.loadCalenderForSelectedPerson(this.records[0])
        }
      }
      this.showLoading = false
    },
    async fetchPeopleRecords(searchText = null) {
      let { perPage, page } = this
      let filters = {
        peopleType: {
          operatorId: 54,
          value: ['2', '3'],
        },
      }
      let params = {
        moduleName: 'people',
        filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
        perPage,
        page,
        withCount: true,
        orderBy: 'name',
        orderType: 'asc',
        search: !isEmpty(searchText) ? searchText : null,
      }

      this.showLoading = true

      let {
        data = {},
        error,
        meta = {},
      } = await API.get('/v3/attendance/people/list', params)

      if (error) {
        let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        this.recordCount = getProperty(meta, 'pagination.totalCount', null)
        this.records = getProperty(data, 'people', [])
        if (!isEmpty(this.records)) {
          this.loadCalenderForSelectedPerson(this.records[0])
        }
      }

      this.showLoading = false
    },
    loadCalenderForSelectedPerson(record) {
      let { id, name } = record || {}
      if (!isEmpty(id)) {
        this.selectedRecordId = id
        this.selectedRecordLabel = name
      }
    },
    async fetchAttendanceForSelectedEmployee(selectedRecordId) {
      eventBus.$emit('refresh-attendance', selectedRecordId)
    },
    async fetchAttendanceTransitionButtons(selectedRecordId) {
      let { isAdmin } = this
      if (isAdmin) {
        this.transitionButtons = [
          'CHECK_IN',
          'BREAK',
          'RESUME_WORK',
          'CHECK_OUT',
        ]
        return
      }
      if (isEmpty(selectedRecordId)) return
      this.transitionsLoading = true
      let params = {
        peopleID: selectedRecordId,
      }
      let { error, data } = await API.get('/v3/attendance/transition', params)
      if (!error) {
        this.transitionButtons = data.attendanceTransitions
      }
      this.transitionsLoading = false
    },
    handleTransitionClick() {
      let { transitionButtons = [] } = this
      if (transitionButtons.length > 0) {
        this.transition = transitionButtons[0]
        this.showTransitionModal = true
      }
    },
    handleTransitionDropdown(option = {}) {
      let { value = null } = option
      this.transition = value
      this.showTransitionModal = true
    },
    closeTransitionModal() {
      this.transition = null
      this.showTransitionModal = false
    },
  },
}
</script>
