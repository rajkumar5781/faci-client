<template>
  <FContainer display="flex" justifyContent="center" alignItems="center">
    <FContainer v-if="isLoading" display="flex" justifyContent="center"
      ><FSpinner :size="30" padding="containerXxLarge"></FSpinner
    ></FContainer>
    <FTable
      v-if="showTable"
      :columns="columns"
      :showSelectBar="false"
      :hideBorder="false"
      :rounded="false"
      :data="records"
    >
      <template #[`cell.ruleName`]="{ row }">
        <FTooltip placement="bottom" :mouseEnterDelay="0.25">
          <template #title>{{ getProperty(row, 'ruleName') }}</template>
          <FText
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width="175px"
            cursor="pointer"
          >
            {{ getProperty(row, 'ruleName') }}
          </FText>
        </FTooltip>
      </template>
    </FTable>
    <FContainer
      v-if="showEmptyState"
      display="flex"
      align-items="center"
      justify-content="center"
    >
      <FContainer width="500px">
        <FEmptyState
          :title="
            $t('summary.no_root_cause', 'No Root Causes available', {
              ns: 'rule',
            })
          "
          :vertical="true"
          size="S"
          illustration="no-entries"
        />
      </FContainer>
    </FContainer>
    <portal :to="`footer-${widget.id}-${widget.name}`" slim>
      <FContainer paddingTop="containerLarge" paddingBottom="containerLarge">
        <FPagination
          :currentPage="page"
          :pageSize="perPage"
          :total="recordCount"
          @update:currentPage="loadNextPage"
          :disabled="false"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FTable,
  FPagination,
  FEmptyState,
  FSpinner,
  ftoast,
  FText,
  FTooltip,
} from '@facilio/design-system'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import getProperty from 'dlv'
export default {
  props: ['details', 'widget'],

  components: {
    FContainer,
    FTable,
    FPagination,
    FEmptyState,
    FSpinner,
    FText,
    FTooltip,
  },
  created() {
    this.loadRecords()
  },
  data() {
    return {
      moduleName: 'newreadingrules',
      records: [],
      page: 1,
      perPage: 4,
      recordCount: null,

      columns: [
        { displayName: 'Rule Name', name: 'ruleName', id: 1 },
        {
          displayName: 'Severity',
          name: 'severity',
          id: 2,
        },
        {
          displayName: 'Fault Type',
          name: 'faultType',
          id: 3,
        },
        {
          displayName: 'Category',
          name: 'category',
          id: 4,
        },
      ],
    }
  },
  computed: {
    showTable() {
      let { isRecordsEmpty = {}, isLoading = {} } = this
      return !isRecordsEmpty && !isLoading
    },
    showEmptyState() {
      let { isRecordsEmpty = {}, isLoading = {} } = this
      return isRecordsEmpty && !isLoading
    },
    isRecordsEmpty() {
      let { records } = this
      return isEmpty(records)
    },
    ruleId() {
      let { details: { id } = {} } = this
      return id
    },
  },
  methods: {
    getProperty,
    async loadRecords() {
      let { ruleId, page, perPage } = this
      let queryParam = {
        ruleId,
        page,
        perPage,
      }
      this.isLoading = true
      let { data = {}, error } = await API.get(
        'v3/newreadingrules/fetchRootCause',
        queryParam
      )
      if (isEmpty(error)) {
        let { result } = data || {}
        let { records, recordCount } = result || {}
        this.records = records
        this.recordCount = recordCount
      } else {
        ftoast.critical(error.message)
      }
      this.isLoading = false
    },
    async loadNextPage(page) {
      this.page = page
      await this.loadRecords()
    },
  },
  getRecordData(record, property) {
    let { row } = record || {}
    return getProperty(row, `${property}`, '---')
  },
  redirectToSummary(record) {
    let { id } = record || {}
    let { moduleName, $route } = this
    let { params } = $route
    let { viewname } = params

    if (isWebTabsEnabled()) {
      let { name } = findRouteForModule('newreadingrules', pageTypes.OVERVIEW)
      if (name) {
        this.$router.push({
          name,
          params: { viewname, id },
        })
      }
    } else {
      this.$router.push({
        name: 'newRulesSummary',
        params: { moduleName, viewname, id },
      })
    }
  },
}
</script>

<style scoped></style>
