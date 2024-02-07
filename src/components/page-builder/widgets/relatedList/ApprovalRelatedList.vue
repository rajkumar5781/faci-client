<template>
  <FContainer height="100%">
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center">
        <MainFieldSearch
          v-if="!isEmpty(recordList) || !isEmpty(searchText)"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
        <template v-if="!isEmpty(recordList)">
          <FDivider height="24px" style="margin: 0px 12px" />
          <ApprovalColumnCustomization
            :moduleName="moduleName"
            :viewName="viewname"
            :viewFields="viewFields"
            @refreshRelatedList="reloadData"
          ></ApprovalColumnCustomization>
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
    >
    </CommonList>
    <portal v-if="recordCount > 0 || !isEmpty(recordList)" :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :key="`pagination-${moduleName}`"
          :total="recordCount"
          :currentPage.sync="page"
          :currentPageCount="(recordList || []).length"
          :perPage="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import SingleRelatedList from './SingleRelatedList.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import ApprovalColumnCustomization from '../../../../pages/list/views/ApprovalColumnCustomization.vue'

export default {
  extends: SingleRelatedList,
  components: { ApprovalColumnCustomization },
  methods: {
    async loadViewDetails() {
      this.viewLoading = true
      try {
        let { moduleName, viewname } = this
        let param = {
          moduleName,
        }
        let { error, data } = await API.get(
          `v2/approvaltab/views/${viewname}`,
          param
        )
        if (error) throw error
        else this.viewDetail = data?.viewDetail || {}
      } catch (errorMsg) {
        ftoast.critical(
          errorMsg ||
            his.$t(
              'approvals.cannot_fetch_view_details',
              'Cannot fetch view details',
              {
                ns: 'approvals',
              }
            )
        )
      }
      this.viewLoading = false
    },
  },
}
</script>
