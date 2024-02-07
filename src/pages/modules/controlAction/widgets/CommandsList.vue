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
    <FContainer
      v-if="showLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
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
    <FTable
      v-else-if="!isEmpty(recordList)"
      :columns="columns"
      :data="recordList"
    >
      <template #[`cell.site`]="{ row }">
        <FText>{{ getProperty(row, 'site.name', '---') }}</FText>
      </template>
      <template #[`cell.asset`]="{ row }">
        <FText>{{ getProperty(row, 'asset.name', '---') }}</FText>
      </template>
      <template #[`cell.controller`]="{ row }">
        <FText>{{ getProperty(row, 'controller.name', '---') }}</FText>
      </template>
      <template #[`cell.commandActionTypeEnum`]="{ row, prop }">
        <FTags
          v-if="row[prop]"
          appearance="simple"
          :text="getEnumValue(row[prop])"
        ></FTags>
        <FText v-else>{{ '---' }}</FText>
      </template>
      <template #[`cell.controlActionStatusEnum`]="{ row, prop }">
        <FTags
          v-if="row[prop]"
          :statusType="getStatusType(row[prop])"
          appearance="status"
          :text="getStatusText(row[prop])"
        ></FTags>
        <FText v-else>{{ '---' }}</FText>
      </template>
      <template #[`cell.readingName`]="{ row, prop }">
        <FTooltip placement="top">
          <template slot="title">
            <FText>{{ getReadingFieldName(row) }}</FText>
          </template>
          <FText cursor="pointer">{{ getReadingFieldName(row) }}</FText>
        </FTooltip>
      </template>
    </FTable>
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
import getProperty from 'dlv'
import { FTable, FTags, FText, FButton, FTooltip } from '@facilio/design-system'
import { COMMAND_STATUS_MAP } from './controlsUtil'
import { isEmpty } from '@facilio/utils/validation'
export default {
  extends: RelatedList,
  components: { FTable, FTags, FText, FButton, FTooltip },
  computed: {
    columns() {
      return [
        {
          displayName: this.$t('controls.table_column.id', { ns: 'energy' }),
          name: 'id',
          id: 1,
          fixed: true,
          width: 76,
        },
        {
          displayName: this.$t('controls.table_column.subject', {
            ns: 'energy',
          }),
          name: 'name',
          id: 2,
          width: 224,
        },
        {
          displayName: this.$t('controls.table_column.site', { ns: 'energy' }),
          name: 'site',
          id: 3,
          width: 128,
        },
        {
          displayName: this.$t('controls.table_column.asset', { ns: 'energy' }),
          name: 'asset',
          id: 4,
          width: 154,
        },
        {
          displayName: this.$t('controls.table_column.controller', {
            ns: 'energy',
          }),
          name: 'controller',
          id: 5,
          width: 224,
        },
        {
          displayName: this.$t('controls.table_column.reading_name', {
            ns: 'energy',
          }),
          name: 'readingName',
          id: 6,
          width: 224,
        },
        {
          displayName: this.$t('controls.table_column.command_action_type', {
            ns: 'energy',
          }),
          name: 'commandActionTypeEnum',
          id: 7,
          width: 128,
        },
        {
          displayName: this.$t('controls.table_column.status', {
            ns: 'energy',
          }),
          name: 'controlActionStatusEnum',
          id: 8,
          width: 172,
        },
        {
          displayName: this.$t('controls.table_column.value_before', {
            ns: 'energy',
          }),
          name: 'previousValue',
          id: 9,
          width: 97,
        },
        {
          displayName: this.$t('controls.table_column.value_after', {
            ns: 'energy',
          }),
          name: 'afterValue',
          id: 10,
          width: 90,
        },
        {
          displayName: this.$t('controls.table_column.recorded_value', {
            ns: 'energy',
          }),
          name: 'setValue',
          id: 11,
          width: 119,
        },
      ]
    },
    moduleName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.moduleName',
        'command'
      )
    },
    relatedFieldName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.relatedFieldName',
        'controlAction'
      )
    },
    moduleDisplayName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.moduleDisplayName',
        'Commands'
      )
    },
    title() {
      return getProperty(this, '$attrs.widget.widgetParams.title', 'Commands')
    },
  },
  methods: {
    getProperty,
    getEnumValue(value) {
      value = value.replace(/_/g, ' ')
      value = value.toLowerCase()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    getReadingFieldName(row) {
      return getProperty(row, 'readingField.displayName', '')
    },
    getTagProps(value) {
      let tagDetail = COMMAND_STATUS_MAP.filter(status => status.enum === value)
      if (!isEmpty(tagDetail)) {
        return getProperty(tagDetail, '0', null)
      } else {
        return {}
      }
    },
    getStatusType(value) {
      let tagDetail = this.getTagProps(value)
      return !isEmpty(tagDetail) ? tagDetail.statusType : 'default'
    },
    getStatusText(value) {
      let tagDetail = this.getTagProps(value)
      return getProperty(tagDetail, 'text', 'default')
    },
  },
}
</script>
