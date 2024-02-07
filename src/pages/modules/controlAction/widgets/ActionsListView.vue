<template>
  <FContainer>
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
      hideBorder
    >
      <template #[`cell.reading`]="{ row }">
        <FTooltip placement="top">
          <template slot="title">
            {{ getReadingValue(row) }}
          </template>
          <FText cursor="pointer">{{ getReadingValue(row) }}</FText>
        </FTooltip>
      </template>
      <template #[`cell.scheduledActionOperatorTypeEnum`]="{ row, prop }">
        <FTags
          v-if="row[prop]"
          appearance="simple"
          :text="getEnumValue(row[prop])"
        ></FTags>
        <FText v-else>{{ '---' }}</FText>
      </template>
      <template #[`cell.revertActionOperatorTypeEnum`]="{ row, prop }">
        <FTags
          v-if="checkRevertAction(row)"
          appearance="simple"
          :text="getEnumValue(row[prop])"
        ></FTags>
        <FText v-else>{{ '---' }}</FText>
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
import { FTable, FText, FTags, FTooltip, ftoast } from '@facilio/design-system'
import { isEmpty, isArray } from '@facilio/utils/validation'
export default {
  extends: RelatedList,
  components: { FTable, FText, FTags, FTooltip },
  computed: {
    columns() {
      return [
        {
          displayName: 'Reading Name',
          name: 'reading',
          id: 1,
          fixed: true,
          width: 256,
        },
        {
          displayName: 'Start Action Operator',
          name: 'scheduledActionOperatorTypeEnum',
          id: 2,
          width: 310,
        },
        {
          displayName: 'Start Action Value',
          name: 'scheduleActionValue',
          id: 3,
          width: 256,
        },
        {
          displayName: 'Revert Action Operator',
          name: 'revertActionOperatorTypeEnum',
          id: 4,
          width: 256,
        },
        {
          displayName: 'Revert Action Value',
          name: 'revertActionValue',
          id: 5,
          width: 256,
        },
      ]
    },
    moduleName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.moduleName',
        'action'
      )
    },
    relatedFieldName() {
      return 'controlAction'
    },
    moduleDisplayName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.moduleDisplayName',
        'Actions'
      )
    },
    title() {
      return getProperty(this, '$attrs.widget.widgetParams.title', 'Actions')
    },
  },
  methods: {
    getEnumValue(value) {
      value = value.replace(/_/g, ' ')
      value = value.toLowerCase()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    getReadingValue(row) {
      return getProperty(row, 'readingField.displayName', '---')
    },
    checkRevertAction(row) {
      let revertValue = getProperty(row, 'revertActionValue', null)
      return !isEmpty(revertValue)
    },
    async loadRecords(force = false) {
      let {
        moduleName,
        viewname,
        perPage,
        recordId,
        relatedFieldName,
        page,
        searchText,
      } = this
      let params = {
        moduleName,
        viewName: viewname,
        perPage,
        recordId,
        relatedFieldName,
        currentModuleName: 'controlAction',
        page,
        search: searchText,
        force,
      }

      this.isLoading = true
      try {
        let recordList = await this.modelDataClass.fetchAll(params)
        if (isArray(recordList)) this.recordList = recordList || []

        this.recordCount = this.modelDataClass.recordListCount
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch moduleList')
      }
      this.isLoading = false
    },
  },
}
</script>
