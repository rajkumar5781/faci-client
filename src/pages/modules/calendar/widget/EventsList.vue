<template>
  <FContainer>
    <portal :to="`action-${widget.id}-${widget.name}`">
      <FContainer display="flex" alignItems="center">
        <!-- <MainFieldSearch
          v-if="!isEmpty(criteriaData) || !isEmpty(searchText)"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch> -->
        <!-- will be enabled after server update -->
      </FContainer>
    </portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      top="50%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else>
      <FEmptyState
        v-if="isEmpty(events)"
        :description="$t('events.no_events_calendar', { ns: 'energy' })"
        :title="$t('events.no_events_associated', { ns: 'energy' })"
        :vertical="true"
        illustration="no-entries"
      />

      <FContainer v-else height="95%" overflowY="scroll">
        <FTable
          :columns="columns"
          :data="events"
          hideBorder
          :showSelect="false"
        >
          <template #[`cell.eventType`]="{ row }">
            <FText>
              {{ getProperty(eventTypeMap, `${row.eventType}`, 'N/A') }}
            </FText>
          </template>
          <template #[`cell.calendarEventTimeSlotString`]="{ row }">
            <MultiLookupTag
              :values="row.calendarEventTimeSlotString"
              :toShow="1"
            />
          </template>
        </FTable>
      </FContainer>
    </FContainer>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
        v-if="showPagination"
        :key="`calendar-events-pagination`"
        :total="totalRecords"
        :currentPage.sync="page"
        :pageCount="getPageCount"
        :pageSize="perPage"
        @currentChange="loadEvents"
      />
      </FContainer>
    </portal>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FEmptyState,
  FContainer,
  FSpinner,
  FTable,
  FText,
  ftoast,
  FPagination,
} from '@facilio/design-system'
import { MultiLookupTag } from '@facilio/ui/tasks'
import getProperty from 'dlv'
const eventTypeMap = {
  10: 'Special Type',
  20: 'Special Maintenance',
  30: 'Holiday',
  40: 'Regular Maintenance',
  50: 'Monthly',
  60: 'Season',
  70: 'Day of the Week',
}
export default {
  name: 'CalendarEventList',
  props: ['widget', 'details'],
  data(){
    return {
      isLoading: false,
      events: null,
      page: 1,
      perPage: 10,
      totalRecords: null,
      columns: [
        {
          displayName: this.$t('name', { ns: 'energy' }),
          name: 'name',
          id: 2,
        },
        {
          displayName: this.$t('type', { ns: 'energy' }),
          name: 'eventType',
          id: 3,
        },
        {
          displayName: this.$t('timeslots', { ns: 'energy' }),
          name: 'calendarEventTimeSlotString',
          id: 4,
          width: 200,
        },
      ],
      eventTypeMap,
    }
  },
  components: {
    FEmptyState,
    FContainer,
    FSpinner,
    FTable,
    FText,
    FPagination,
    MultiLookupTag,
  },
  created() {
    this.loadEvents()
  },
  computed: {
    recordId() {
      let { $attrs } = this
      let { id } = $attrs || {}
      return id
    },
    getPageCount() {
      let { events } = this
      return (events || []).length
    },
    showPagination() {
      let { totalRecords, events } = this
      return !isEmpty(totalRecords) || !isEmpty(events)
    },
  },
  methods: {
    getProperty,
    isEmpty,
    async loadEvents(force = false) {
      this.isLoading = true
      let { recordId, page, perPage } = this
      let moduleName = 'calendar'
      let relatedModuleName = 'calendarEventMapping'
      let relatedFieldName = 'calendar'
      let relatedConfig = {
        moduleName,
        id: recordId,
        relatedModuleName,
        relatedFieldName,
      }
      let { error, list, meta } = await API.fetchAllRelatedList(
        relatedConfig,
        { withCount: true, page, perPage },
        {
          force,
        }
      )
      let { pagination } = meta || {}
      this.totalRecords = getProperty(pagination, 'totalCount', 0)

      if (!error) {
        if (!isEmpty(list)) {
          list = (list || []).map(calendarEvent => {
            let { event, calendarEventTimeSlotString } = calendarEvent || {}
            let { name, eventType, eventSequence } = event || {}

            calendarEventTimeSlotString = (
              calendarEventTimeSlotString || []
            ).map(slot => {
              return { name: slot }
            })

            return {
              name,
              eventType,
              eventSequence,
              calendarEventTimeSlotString,
            }
          })
          this.events = list
        }
      } else {
        ftoast.critical(error?.message || 'Error Occured')
      }
      this.isLoading = false
    },
  },
}
</script>
