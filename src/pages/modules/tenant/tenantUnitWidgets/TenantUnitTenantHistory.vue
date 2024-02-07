<template>
  <FContainer height="100%">
    <FContainer
      v-if="isLoading"
      display="flex"
      justify-content="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else-if="isEmpty(recordList)" height="100%">
      <FEmptyState
          :title="$t('no_location_found', 'Vacant', { ns: 'tenant' })"
          :description="$t('history_empty_state_description', 'Vacant', { ns: 'tenant' })"
          vertical
          size="M"
          illustration="no-data"
          type="narrow"
        />
    </FContainer>
    <div v-else>
    <FContainer
      height="100%"
      overflow="scroll"
    >
      <CommonList
        :viewDetail="viewDetail"
        :records="recordList"
        :hideBorder="true"
        selectType=""
        :hideIdColumn="true"
      ></CommonList>
    </FContainer>
    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" align-items="center">
        <FPagination
          :pageSize="this.perPage"
          :total="this.totalRecords"
          :currentPage="this.page"
          :disabled="false"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </div>
  </FContainer>
</template>
<script>
import { CommonList } from '@facilio/ui/new-app'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import debounce from 'lodash/debounce'
import {
  FContainer,
  FText,
  FSpinner,
  ftoast,
  FPagination,
  FIcon,
  FDivider,
  FEmptyState
} from '@facilio/design-system'

export default {
  props: ['details', 'widget', 'footerPortal'],
  components: {
    FContainer,
    FText,
    FSpinner,
    ftoast,
    FPagination,
    CommonList,
    FIcon,
    FEmptyState,
    FDivider,
  },
  data() {
    return {
      recordList: [],
      page: 1,
      viewDetail: {},
      perPage: 5,
      isLoading: false,
      totalRecords: 0,
      searchText: null,
      showColumnSettings: false,
      moduleName: 'tenantunit',
      isEmpty,
      loadDebouncedRecords: null,
    }
  },
  created() {
    this.init()
  },
  computed: {
    viewName() {
      return this.widget?.widgetParams?.viewName || 'all'
    },
    viewModuleName() {
      return this.widget?.widgetParams?.viewModuleName || 'tenant'
    },
  },
  mounted() {
    this.loadDebouncedRecords = debounce(this.loadRecords, 70)
  },
  methods: {
    async init() {
      this.isLoading = true
      await this.loadView()
      this.loadRecords()
      this.isLoading = false
    },
    async loadRecords() {
      let recordList = []
      let { page, perPage, moduleName } = this
      let params = {
        page,
        perPage,
        force: false,
        withCount: true,
        // orderBy: 'associatedTime',   temp fix
        orderType: 'desc',
        filters: JSON.stringify({
          space: { operatorId: 54, value: [this.details.id.toString()] },
        }),
      }
      let unRelatedModuleName = 'tenantspaces'

      let { data, error, meta } = await API.get(
        `v3/unrelated/${moduleName}/fetchAll/${unRelatedModuleName}`,
        params
      )

      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t(
              'tenant.unable_to_fetch_tenant_history',
              'Unable to fetch tenant history',
              { ns: 'tenant' }
            )
        )
      } else {
        recordList = (data?.tenantspaces || []).map(list => list.tenant)
        this.recordList = recordList
        if (!isEmpty(meta)) {
          this.totalRecords = meta?.pagination?.totalCount || 0
        }
      }
      this.showLoading = false
    },
    currentChange(page) {
      this.page = page
      this.loadDebouncedRecords()
    },

    async loadView() {
      this.viewLoading = true

      let { error, data } = await API.get(`v2/views/${this.viewName}`, {
        moduleName: this.viewModuleName,
      })
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('tenant.cannot_fetch_view', 'Cannot fetch view details', {
              ns: 'tenant',
            })
        )
      } else {
        this.viewDetail = data?.viewDetail || {}
      }
      this.viewLoading = false
    },
  },
}
</script>
