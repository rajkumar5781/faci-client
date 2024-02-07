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
        <FContainer v-if="!isEmpty(internalAttendeesList)">
          <FPagination
            :pageSize="pageSize"
            :total="getTotalRecords"
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
    <FContainer v-if="!loading && isEmpty(internalAttendeesList)">
      <FEmptyState
        :illustration="'no-data'"
        :size="'S'"
        :title="$t('facility.booking.no_internal_attendees_registered', { ns: 'facilitybooking' })"
        :vertical="false"
      />
    </FContainer>
    <FContainer
      v-if="!loading && !isEmpty(internalAttendeesList)"
      padding="containerXxLarge"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FTable
        :columns="column"
        :data="internalAttendeesList"
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
  FSpinner,
  FPagination,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
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
      internalAttendeesList: [],
      pageSize: 5,
      currentPage: 1,
      disabled: false,
      loading: false,
    }
  },
  created() {
    this.getInternalAttendeesList()
  },
  computed: {
    getTotalRecords() {
      let { details } = this
      let { internalAttendees = [] } = details || {}
      return internalAttendees.length
    },
  },
  methods: {
    isEmpty,
    getInternalAttendeesList() {
      this.loading = true
      let { currentPage, pageSize } = this

      let list = getProperty(this.details, 'internalAttendees', [])

      list =
        list.slice((currentPage - 1) * pageSize, currentPage * pageSize) || []

      this.internalAttendeesList = list
      this.loading = false
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
    currentChange(page) {
      this.currentPage = page
      this.getInternalAttendeesList()
    },
  },
}
</script>
