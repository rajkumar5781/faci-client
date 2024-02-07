<template>
  <FContainer
    display="flex"
    flexDirection="column"
    flex="1"
    width="100%"
    height="100%"
  >
    <FContainer
      padding="containerLarge containerXLarge"
      borderBottom="solid 0.5px"
      borderColor="borderNeutralBaseSubtle"
    >
      <FInput
        placeholder="Search"
        v-model="searchText"
        @change="fetchPeopleRecords"
      >
        <template #searchText>
          <FIcon group="action" name="search" :size="16"></FIcon>
        </template>
      </FInput>
    </FContainer>
    <FContainer
      display="flex"
      alignItems="center"
      justifyContent="center"
      v-if="showLoading"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      display="flex"
      alignItems="center"
      justifyContent="center"
      v-else-if="isEmpty(records)"
      height="100%"
    >
      <FEmptyState
        :title="
          $t('people_emptyStateMsg', 'No People Found', { ns: 'attendance' })
        "
        illustration="no-entries"
        :vertical="true"
        size="S"
        class="grow"
      ></FEmptyState>
    </FContainer>
    <FContainer
      v-else
      flex="1 0 0"
      padding="containerLarge containerXLarge"
      overflow="scroll"
    >
      <FContainer
        v-for="record in records"
        :key="record.id"
        hover-backgroundColor="backgroundNeutralHovered"
        :backgroundColor="
          selectedRecordId === record.id ? 'backgroundNeutralHovered' : ''
        "
        padding="containerXLarge"
        marginTop="containerSmall"
        marginBottom="containerSmall"
        borderRadius="medium"
        cursor="pointer"
        overflow="hidden"
        @click="loadCalenderForSelectedPerson(record)"
      >
        <FText
          :appearance="
            selectedRecordId === record.id ? 'headingMed14' : 'bodyReg14'
          "
          color="textMain"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          display="block"
        >
          {{ record.name }}
        </FText>
      </FContainer>
    </FContainer>

    <FContainer
      borderTop="solid 0.5px"
      borderColor="borderNeutralBaseSubtle"
      padding="containerLarge"
      width="100%"
    >
      <Pagination
        v-if="!isEmpty(recordCount)"
        :totalCount="recordCount"
        :currentPageNo="page"
        :currentPageCount="records.length"
        :perPage="perPage"
        @onPageChanged="onPageChanged"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FIcon,
  FInput,
  FSpinner,
  FEmptyState,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import Pagination from '../list/Pagination.vue'

export default {
  name: 'AttendanceSideBar',
  props: [
    'records',
    'showLoading',
    'recordCount',
    'page',
    'perPage',
    'selectedRecordId',
  ],
  data() {
    return {
      searchText: null,
    }
  },
  components: {
    FContainer,
    FText,
    FIcon,
    Pagination,
    FInput,
    FSpinner,
    FEmptyState,
  },
  methods: {
    isEmpty,
    async fetchPeopleRecords() {
      this.$emit('fetchPeopleRecords', this.searchText)
    },
    loadCalenderForSelectedPerson(record) {
      this.$emit('loadCalenderForSelectedPerson', record)
    },
    onPageChanged(page) {
      this.$emit('update:page', page)
      this.$emit('fetchPeopleRecords', this.searchText)
    },
  },
}
</script>
