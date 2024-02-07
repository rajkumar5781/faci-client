<template>
  <FContainer height="100%">
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="portal-alignment-ws action-ws"
    >
      <FContainer>
        <FButton
          appearance="secondary"
          size="small"
          v-if="!decommission"
          class="f13"
          @click="showAssetBreakdown = true"
          >{{
            $t('asset.performance.report_downtime', 'Report Downtime', {
              ns: 'asset',
            })
          }}</FButton
        >
      </FContainer>
    </portal>
    <portal
      v-if="!isEmpty(history)"
      paddingTop="sectionLarge"
      class="portal-alignment-ws"
      ref="footer-portal"
      :to="`footer-${widget.id}-${widget.name}`"
    >
      <FContainer v-if="!isEmpty(history)">
        <FPagination
          v-if="!isEmpty(history)"
          :total="totalCount"
          :pageCount="pageCount()"
          :currentPage.sync="page"
          :pageSize="perPage"
        ></FPagination>
      </FContainer>
    </portal>

    <FContainer
      v-if="loading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="25" />
    </FContainer>

    <FContainer height="100%" v-else-if="isEmpty(history)">
      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer
          height="100%"
          width="500px"
          display="flex"
          justifyContent="center"
        >
          <FEmptyState
            title="No History Available"
            vertical
            size="S"
            illustration="no-entries"
          />
        </FContainer>
      </FContainer>
    </FContainer>

    <FContainer v-else height="100%">
      <FTable :rounded="false" :columns="column" :data="history">
        <template #[`cell.fromtime`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            getDateColumnValue(row.fromtime)
          }}</FText>
        </template>
        <template #[`cell.totime`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            getDateColumnValue(row.totime)
          }}</FText>
        </template>
      </FTable>
    </FContainer>
    <ReportDowntime
      v-if="showAssetBreakdown"
      :visibility.sync="showAssetBreakdown"
      :assetBDSourceDetails="breakdownDetails"
      @onSave="updateBreakdownStats"
      @closeDialog="closeDialog"
    ></ReportDowntime>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FSpinner,
  FText,
  FTable,
  FButton,
  FPagination,
  FEmptyState,
} from '@facilio/design-system'
 import AssetPerfOverallDowntime from './AssetPerfOverallDowntime.vue'
import ReportDowntime from './ReportDowntime.vue'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
import { API } from '@facilio/api'
export default {
   extends: AssetPerfOverallDowntime,
  props: ['details', 'layoutParams', 'widget'],
  components: {
    FContainer,
    FSpinner,
    FText,
    FTable,
    FButton,
   ReportDowntime,
    FPagination,
    FEmptyState,
  },
  computed: {
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
  },
  data() {
    return {
      history: null,
      page: 1,
      perPage: 5,
      totalCount: null,
      loading: false,
      column: [
        {
          displayName: 'Downtime Message',
          name: 'condition',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'From',
          name: 'fromtime',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'To',
          name: 'totime',
          id: 3,
          width: 250,
          clickable: true,
        },
      ],
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    page() {
      this.loadData()
    },
  },
  methods: {
    isEmpty,
    pageCount() {
      return Math.ceil(this.totalCount / this.perPage)
    },
    async loadData() {
      this.loading = true
      let url = `v2/assets/downtimehistory?assetId=${this.details.id}`
      let { data } = await API.get(url)
      this.history = data?.history || []
      this.totalCount = this.history.length
      this.loading = false
    },
    getDateColumnValue(time) {
      if (isEmpty(time)) {
        return '---'
      } else {
        return formatDate(time, true, false)
      }
    },
    closeDialog() {
      this.showAssetBreakdown = false
    },
  },
}
</script>
