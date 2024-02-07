<template>
  <FContainer>
    <portal :to="`header-${widget.id}-${widget.name}`">
      <FContainer
        paddingBottom="containerLarge"
        paddingTop="containerLarge"
        paddingLeft="containerXxLarge"
        paddingRight="containerXxLarge"
        display="flex"
        justifyContent="space-between"
        width="100%"
      >
        <FContainer>
          <FText
            appearance="headingMed14"
            color="backgroundNeutralInverseHovered"
          >
            {{ widget.displayName }}
          </FText>
        </FContainer>
        <FContainer v-if="!isEmpty(recordsList)">
          <FPagination
            :pageSize="pageSize"
            :total="totalRecords"
            :currentPage="currentPage"
            :disabled="disabled"
            @nextClick="currentChange"
            @prevClick="currentChange"
            @currentChange="currentChange"
          />
        </FContainer>
      </FContainer>
    </portal>
    <FContainer
      v-if="loading"
      padding="containerXxLarge"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FSpinner :size="30"></FSpinner>
    </FContainer>
    <FContainer
      v-if="!loading && isEmpty(recordsList)"
      padding="containerXxLarge"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'no-data'"
        :size="'S'"
        :title="
          $t('facility.booking.no_external_attendees_registered', {
            ns: 'facilitybooking',
          })
        "
        :vertical="false"
      />
    </FContainer>
    <FContainer
      v-if="!loading && !isEmpty(recordsList)"
      padding="containerXxLarge"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FTable
        :columns="column"
        :data="datas"
        :rounded="false"
        :hideBorder="false"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FEmptyState,
  FTable,
  ftoast,
  FSpinner,
  FPagination,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { API } from '@facilio/api'

export default {
  props: ['widget', 'details', 'fitMyContent'],
  components: {
    FContainer,
    FTable,
    FText,
    FEmptyState,
    FSpinner,
    FPagination,
  },
  data() {
    return {
      column: [
        {
          displayName: 'Name',
          name: 'name',
          id: 1,
          width: 250,
          fixed: true,
        },
        {
          displayName: 'Email',
          name: 'email',
          id: 2,
          width: 250,
        },
        {
          displayName: 'Contact No',
          name: 'phone',
          id: 3,
          width: 250,
        },
      ],
      datas: [],
      recordsList: [],
      pageSize: 5,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      loading: false,
    }
  },
  created() {
    this.loadRelatedRecords()
  },
  computed: {},
  methods: {
    isEmpty,
    async loadRelatedRecords() {
      let recordFilter = {
        facilityBooking: { operatorId: 36, value: [`${this.details.id}`] },
      }
      let { currentPage, pageSize } = this

      let params = {
        page: currentPage,
        perPage: pageSize,
        withCount: true,
        viewName: 'all',
        force: false,
        moduleName: 'facilityBookingExternalAttendee',
        filters: JSON.stringify(recordFilter),
      }

      let url = 'v3/modules/data/list'
      this.loading = true
      let { data, error, meta } = await API.get(url, params)
      if (error) {
        let {
          message = this.$t(
            'facility.booking.error_loading_external_attendee_list',
            {
              ns: 'facilitybooking',
            }
          ),
        } = error
        ftoast.critical(message)
      } else {
        let { facilityBookingExternalAttendee } = data || []
        this.recordsList = facilityBookingExternalAttendee
        let { pagination } = meta || {}
        let totalCount = getProperty(pagination, 'totalCount', 0)

        this.totalRecords = totalCount
      }
      this.loading = false
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
    currentChange(page) {
      this.currentPage = page
      this.loadRelatedRecords()
    },
  },
}
</script>
