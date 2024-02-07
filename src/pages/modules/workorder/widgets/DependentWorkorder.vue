<template>
  <FContainer :height="showLoading ? 'fit-content' : '100%'">
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center">
        <MainFieldSearch
          v-if="!isEmpty(recordList) || !isEmpty(searchText)"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
        <template v-if="!isEmpty(recordList)">
          <FDivider height="24px" style="margin: 0px 12px" />
          <ColumnCustomization
            :moduleName="moduleName"
            :parentModuleName="currentModuleName"
            :viewName="viewname"
            :viewFields="viewFields"
            @refreshRelatedList="reloadData"
          ></ColumnCustomization>
        </template>
      </FContainer>
    </portal>
    <FContainer
      v-if="showLoading"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer v-else-if="isEmpty(recordList)" height="100%" display="flex">
      <FEmptyState
        :title="emptyStateText"
        illustration="no-entries"
        :vertical="true"
        size="S"
        class="grow"
      ></FEmptyState>
    </FContainer>
    <CommonList
      v-else-if="!isEmpty(recordList)"
      :viewDetail="viewDetail"
      :records="recordList"
      :slotList="[]"
      :hideBorder="true"
      :orgDetails="orgDetails"
      :getRoute="getRoute"
      selectType=""
      :mainFieldAction="mainFieldAction"
      @redirectToSummary="redirectToSummary"
    >
    </CommonList>
    <portal v-if="recordCount > 0 || !isEmpty(recordList)" :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :key="`pagination-${moduleName}`"
          :total="recordCount"
          :currentPage.sync="page"
          :currentPageCount="(recordList || []).length"
          :pageCount="perPage"
          :pageSize="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import { FEmptyState } from '@facilio/design-system'
export default {
  extends: RelatedList,
  components: {
    FEmptyState,
  },
  computed: {
    relatedFieldName() {
      return 'parentWO'
    },
    moduleName() {
      return 'workorder'
    },
    moduleDisplayName() {
      return 'Workorder'
    },
    perPage() {
      return 5
    },
  },
}
</script>
