<template>
  <FContainer>
    <portal :to="actionPortal">
      <FContainer class="related-list-widget-header-action">
        <MainFieldSearch
          v-if="!isEmpty(recordList) || !isEmpty(searchText)"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
      </FContainer>
    </portal>
    <FContainer v-if="showLoading">
      <FSpinner :size="20" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(recordList)"
      class="related-list-empty-state"
    >
      <FEmptyState
        :title="emptyStateText"
        illustration="no-entries"
        :vertical="true"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else-if="!isEmpty(recordList)">
      <FTable :columns="columns" :data="recordList" hideBorder>
        <template #[`cell.item`]="{ row }">
          <FContainer v-if="isItem(row)">
            <FText appearance="bodyReg14">{{
              getProperty(row, 'lineItem.itemType.name', '---')
            }}</FText>
          </FContainer>
          <FContainer v-else>
            <FText appearance="bodyReg14">{{
              getProperty(row, 'lineItem.toolType.name', '---')
            }}</FText>
          </FContainer>
        </template>
        <template #[`cell.receiptTime`]="{ row }">
          <FText appearance="bodyReg14">
            {{ getTime(row) }}
          </FText>
        </template>
        <template #[`cell.status`]="{ row }">
          <FContainer v-if="row.status === 1">
            <FTags
              appearance="status"
              :text="getStatusEnum(row)"
              :disabled="false"
              statusType="success"
            />
          </FContainer>
          <FContainer v-else>
            <FTags
              appearance="status"
              :text="getStatusEnum(row)"
              :disabled="false"
              statusType="default"
            />
          </FContainer>
        </template>
      </FTable>
    </FContainer>
    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <Pagination
          v-if="recordCount > 0 || !isEmpty(recordList)"
          :key="`pagination-${moduleName}`"
          :totalCount="recordCount"
          :currentPageNo.sync="page"
          :currentPageCount="(recordList || []).length"
          :perPage="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import { FTags, FTable, FEmptyState } from '@facilio/design-system'
import getProperty from 'dlv'
import dayjs from 'dayjs'
import { formatDate } from '../../../../utils/formatter'
export default {
  extends: RelatedList,
  components: {
    FTags,
    FTable,
    FEmptyState,
  },
  data() {
    return {}
  },
  computed: {
    columns() {
      return [
        {
          displayName: this.$t('receivable.line_item', { ns: 'procurement' }),
          name: 'item',
          id: 1,
          width: 256,
        },
        {
          displayName: this.$t('receivable.quantity', { ns: 'procurement' }),
          name: 'quantity',
          id: 2,
          width: 128,
        },
        {
          displayName: this.$t('receivable.time', { ns: 'procurement' }),
          name: 'receiptTime',
          id: 3,
          width: 192,
        },
        {
          displayName: this.$t('receivable.status', { ns: 'procurement' }),
          name: 'status',
          id: 4,
          width: 192,
        },
        {
          displayName: this.$t('rfq.table_column.remark', {
            ns: 'procurement',
          }),
          name: 'remarks',
          id: 5,
          width: 288,
        },
      ]
    },
    moduleName() {
      return 'receipts'
    },
    relatedFieldName() {
      return 'receivableId'
    },
    moduleDisplayName() {
      return 'Receipts'
    },
    title() {
      return 'Receipts'
    },
  },
  methods: {
    getProperty,
    isItem(row) {
      return this.getProperty(row, 'lineItem.inventoryType', '---') === 1
    },
    getTime(row) {
      let timeStamp = this.getProperty(row, 'receiptTime', null)
      return timeStamp ? formatDate(timeStamp) : '---'
    },
    getStatusEnum(row) {
      let status = this.getProperty(row, 'statusEnum', null)
      status = status.toLowerCase()
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : '---'
    },
  },
}
</script>
