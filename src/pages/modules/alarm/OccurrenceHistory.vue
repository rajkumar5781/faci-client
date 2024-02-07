<template>
  <FContainer>
    <FTabs
      v-model="activeTab"
      :tabsList="tabs"
      appearance="link"
      @change="clearCurrentFilters"
    >
      <FTabPane
        v-for="(tab, index) in tabs"
        :tab="tab.value"
        :activeKey="tab.value"
        :key="tab.value"
      >
        <FContainer v-if="activeTab === 'occurrences'" height="100%">
          <AlarmWidgetList
            ref="occurrenceWidget"
            :key="`${tab.name}${index}`"
            :details="details"
            :loading="occurenceloading"
            :name="activeTab"
            :list="occurrenceList"
            :fields="occurrenceFields"
          ></AlarmWidgetList>
          <portal :to="`footer-${widget.id}-${widget.name}`" slim>
            <FContainer padding="containerLarge">
              <FPagination
                :currentPage="occurrenceCurrentPage"
                :pageSize="perPage"
                :total="occurrenceCount"
                @update:currentPage="handleNextPageOccurrence"
                :disabled="false"
              />
            </FContainer>
          </portal>
        </FContainer>
        <FContainer v-if="activeTab === 'events'" height="100%">
          <AlarmWidgetList
            ref="eventWidget"
            :key="`${tab.name}${index}`"
            :details="details"
            :name="activeTab"
            :loading="eventloading"
            :list="eventList"
            :fields="eventFields"
          ></AlarmWidgetList>
          <portal :to="`footer-${widget.id}-${widget.name}`" slim>
            <FContainer padding="containerLarge">
              <FPagination
                :currentPage="eventCurrentPage"
                :pageSize="perPage"
                :total="eventCount"
                @update:currentPage="handleNextPageEvent"
                :disabled="false"
              />
            </FContainer>
          </portal>
        </FContainer>
      </FTabPane>
    </FTabs>
    <portal :to="`action-${widget.id}-${widget.name}`">
      <FTimelineFilter
        v-model="datePickerValue"
        dateType="day"
        @change="changeDateFilter"
      ></FTimelineFilter>
    </portal>
  </FContainer>
</template>
<script>
import AlarmWidgetList from './AlarmWidgetList.vue'
import { API } from '@facilio/api'
import {
  FTabs,
  FTabPane,
  FPagination,
  FContainer,
  FTimelineFilter,
  ftoast,
} from '@facilio/design-system'

export default {
  components: {
    AlarmWidgetList,
    FTabs,
    FTabPane,
    FPagination,
    FContainer,
    FTimelineFilter,
  },
  data() {
    return {
      occurrenceList: null,
      datePickerValue: [
        new Date(
          new Date(this.details.lastOccurredTime).toLocaleDateString('en-US') +
            ' 00:00:00'
        ).getTime() -
          3 * 24 * 60 * 60 * 1000,
        new Date(
          new Date(this.details.lastOccurredTime).toLocaleDateString('en-US') +
            ' 23:59:59:999'
        ).getTime(),
      ],
      eventList: null,
      currentParamsForFilter: null,
      recordCount: null,
      occurrenceCount: null,
      occurrenceCurrentPage: 1,
      eventCurrentPage: 1,
      eventCount: null,
      defaultOccurrenceFields: [
        { displayName: 'ID', name: 'id', displayType: 'ID', width: 90, id: 1 },
        {
          displayName: 'Occurred Time',
          name: 'createdTime',
          displayType: 'DATE_TIME',
          id: 2,
        },
        {
          displayName: 'Cleared Time',
          name: 'clearedTime',
          displayType: 'DATE_TIME',
          id: 3,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          displayType: 'DURATION',
          id: 4,
        },
      ],
      eventFields: [
        { displayName: 'ID', name: 'id', displayType: 'ID', width: 90, id: 1 },
        {
          displayName: 'Event Message',
          name: 'eventMessage',
          displayType: 'STRING',
          id: 2,
        },
        {
          displayName: 'Event Time',
          name: 'createdTime',
          displayType: 'DATE_TIME',
          id: 3,
        },
        {
          displayName: 'Severity',
          name: 'previousSeverity',
          displayType: 'PREVIOUS_SEVERITY',
          id: 4,
        },
      ],
      tabs: [
        {
          name: 'occurrences',
          value: 'occurrences',
          label: 'Occurrences',
        },
        {
          name: 'events',
          value: 'events',
          label: 'Events',
        },
      ],
      activeTab: 'occurrences',
      occurrence: null,
      loading: false,
      eventloading: false,
      occurenceloading: false,
      perPage: 10,
    }
  },
  created() {
    let { datePickerValue, activeTab } = this
    activeTab === 'occurrences'
      ? this.filterOccurrence(datePickerValue)
      : this.filterEvent(datePickerValue)
  },
  computed: {
    isNewReadingAlarm() {
      let { details: alarm } = this
      let { type } = alarm || {}
      return type === 1 ? true : false
    },
    alarmId() {
      let { details = {} } = this
      let { id } = details || {}
      return id
    },
    occurrenceFields() {
      let { defaultOccurrenceFields, isNewReadingAlarm, constructField } = this
      let constructedFields = []
      if (isNewReadingAlarm) {
        constructedFields = [
          constructField('Energy Impact (kWh)', 'energyImpact', 'IMPACT', 5),
          constructField('Cost Impact', 'costImpact', 'IMPACT', 6),
          constructField(
            'Severity',
            'previousSeverity',
            'PREVIOUS_SEVERITY',
            7
          ),
        ]
      } else {
        constructedFields = [
          constructField(
            'Severity',
            'previousSeverity',
            'PREVIOUS_SEVERITY',
            5
          ),
          constructField('Acknowledged By', 'acknowledgedBy', 'USER_AVATAR', 6),
        ]
      }
      return [...defaultOccurrenceFields, ...constructedFields]
    },
  },
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'sectionKey',
    'widget',
    'resizeWidget',
  ],

  methods: {
    async getOccurrence(payload, force = false) {
      try {
        let { isNewReadingAlarm, alarmId } = this
        let moduleName = isNewReadingAlarm
          ? 'readingalarmoccurrence'
          : 'alarmoccurrence'
        let { filters, orderBy, orderType } = payload || {}
        let { perPage } = this
        let withCount = true
        let page = this.occurrenceCurrentPage
        let params = {
          filters,
          page,
          force,
          orderBy,
          orderType,
          withCount,
          perPage,
        }
        this.currentParamsForFilter = params
        let { data = {}, meta } = await API.get(
          `v3/modules/newreadingalarm/${alarmId}/relatedList/${moduleName}/alarm`,
          params
        )
        let { pagination } = meta || {}
        let { totalCount } = pagination || {}
        if (isNewReadingAlarm) {
          let { readingalarmoccurrence } = data || {}
          this.occurrenceList = readingalarmoccurrence
        } else {
          let { alarmoccurrence } = data || {}
          this.occurrenceList = alarmoccurrence
        }
        this.occurrenceCount = totalCount
        this.recordCount = this.occurrenceCount
        this.occurenceloading = false
      } catch (errorMsg) {
        ftoast.critical(errorMsg)
      }
    },
    async getEvents(payload, force = false) {
      try {
        let { alarmId } = this
        let moduleName = 'baseevent'
        let { perPage } = this
        let { filters, orderBy, orderType } = payload || {}
        let withCount = true
        let page = this.eventCurrentPage
        let params = {
          filters,
          page,
          force,
          orderBy,
          orderType,
          withCount,
          perPage,
        }
        this.currentParamsForFilter = params
        let { data = {}, meta } = await API.get(
          `v3/modules/newreadingalarm/${alarmId}/relatedList/${moduleName}/baseAlarm`,
          params
        )
        let { baseevent } = data || {}
        let { pagination } = meta || {}
        let { totalCount } = pagination || {}
        this.eventList = baseevent
        this.eventCount = totalCount
        this.eventloading = false
      } catch (errorMsg) {
        ftoast.critical(errorMsg)
      }
    },
    loadOccurrence(filter) {
      this.occurenceloading = true
      let params = {
        page: this.page,
        perPage: this.perPage,
        filters: filter.filters,
        orderBy: 'CREATED_TIME',
        orderType: 'desc',
      }
      this.getOccurrence(params)
    },
    loadEvent(filter) {
      this.eventloading = true
      let params = {
        page: this.page,
        perPage: this.perPage,
        filters: filter.filters,
        orderBy: 'CREATED_TIME',
        orderType: 'desc',
      }
      this.getEvents(params)
    },
    async handleNextPageOccurrence(page) {
      this.occurenceloading = true
      this.occurrenceCurrentPage = page
      await this.getOccurrence(this.currentParamsForFilter)
    },
    async handleNextPageEvent(page) {
      this.eventloading = true
      this.eventCurrentPage = page
      await this.getEvents(this.currentParamsForFilter)
    },
    changeDateFilter(changedDateValue) {
      this.activeTab === 'occurrences'
        ? this.filterOccurrence(changedDateValue)
        : this.filterEvent(changedDateValue)
    },
    getFilter(tabName, dateValue) {
      let idFilterValue = {
        operatorId: 36,
        value: [JSON.stringify(this.details.id)],
      }
      let filter = {
        createdTime: {
          operatorId: 20,
          value: [JSON.stringify(dateValue[0]), JSON.stringify(dateValue[1])],
        },
      }
      if (tabName === 'occurrences') {
        return {
          ...filter,
          alarm: idFilterValue,
        }
      }
      return {
        ...filter,
        baseAlarm: idFilterValue,
      }
    },
    filterOccurrence(dateValue) {
      let newfilter = this.getFilter('occurrences', dateValue)
      this.loadOccurrence({ filters: JSON.stringify(newfilter) })
    },
    filterEvent(dateValue) {
      let newfilter = this.getFilter('events', dateValue)
      this.loadEvent({ filters: JSON.stringify(newfilter) })
    },
    constructField(displayName, name, displayType, id) {
      return {
        displayName,
        name,
        displayType,
        id,
      }
    },
    clearCurrentFilters() {
      let { datePickerValue, activeTab } = this
      this.currentParamsForFilter = {}
      if (activeTab === 'occurrences') this.filterOccurrence(datePickerValue)
      else this.filterEvent(datePickerValue)
    },
  },
}
</script>
