<template>
  <FContainer>
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center">
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
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
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
          <FContainer v-if="row.inventoryType === 1">
            <FText appearance="bodyReg14">{{
              getProperty(row, 'itemType.name', '---')
            }}</FText>
          </FContainer>
          <FContainer v-else>
            <FText appearance="bodyReg14">{{
              getProperty(row, 'toolType.name', '---')
            }}</FText>
          </FContainer>
        </template>
        <template #[`cell.icon`]="{ row }">
          <FContainer v-if="row.inventoryType === 1">
            <FIcon group="files" name="line-item" size="20" />
          </FContainer>
          <FContainer v-else>
            <FIcon group="action" name="spanner" size="20" />
          </FContainer>
        </template>
        <template #[`cell.description`]="{ row }">
          <FText v-if="row.inventoryType === 1" appearance="bodyReg14">
            {{ getProperty(row, 'itemType.description', '---') }}
          </FText>
          <FText v-else appearance="bodyReg14">
            {{ getProperty(row, 'toolType.description', '---') }}
          </FText>
        </template>
        <template #[`cell.inventoryType`]="{ row }">
          <FText v-if="row.inventoryType === 1" appearance="bodyReg14">
            {{ $t('tr.item', { ns: 'procurement' }) }}
          </FText>
          <FText v-else appearance="bodyReg14">
            {{ $t('tr.tool', { ns: 'procurement' }) }}
          </FText>
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
<script lang="jsx">
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import {
  FIcon,
  FTable,
  FEmptyState,
  FText,
  FContainer,
  FSpinner,
} from '@facilio/design-system'
import getProperty from 'dlv'
export default {
  extends: RelatedList,
  components: {
    FIcon,
    FText,
    FContainer,
    FTable,
    FEmptyState,
    FSpinner,
  },
  computed: {
    columns() {
      return [
        {
          displayName: '',
          name: 'icon',
          id: 1,
          width: 50,
        },
        {
          displayName: this.$t('tr.table_column.name', { ns: 'procurement' }),
          name: 'item',
          id: 2,
        },
        {
          displayName: this.$t('tr.table_column.inventory_type', {
            ns: 'procurement',
          }),
          name: 'inventoryType',
          id: 3,
        },
        {
          displayName: this.$t('tr.table_column.description', {
            ns: 'procurement',
          }),
          name: 'description',
          id: 4,
        },
        {
          displayName: this.$t('tr.table_column.quantity_transfered', {
            ns: 'procurement',
          }),
          name: 'quantity',
          id: 5,
        },
      ]
    },
    moduleName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.moduleName',
        'transferrequestlineitems'
      )
    },
    relatedFieldName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.relatedFieldName',
        'transferRequest'
      )
    },
    moduleDisplayName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.moduleDisplayName',
        'Line Items'
      )
    },
    title() {
      return getProperty(this, '$attrs.widget.widgetParams.title', 'Line Items')
    },
  },
  methods: {
    getProperty,
    getItemType(row) {
      return getProperty(row, 'itemType.id', '---')
    },
  },
}
</script>
