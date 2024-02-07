<template>
  <div>
    <template v-if="isSummaryOpen">
      <ApprovalSummary
        :list="list"
        :stateflows="stateflows"
        :moduleName="moduleName"
        :listcount="listcount"
        :page="page"
        :record="selectedRecord"
        :listLoading="listLoading"
        @reload="reload"
        @onTransitionError="onTransitionError"
        @redirectToOverview="openSummary"
      ></ApprovalSummary>
    </template>
    <FContainer
      marginTop="containerLarge"
      borderRadius="medium"
      border="1px solid"
      borderColor="borderNeutralBaseSubtle"
      v-else
    >
      <FContainer
        v-if="pageLoaded"
        height="calc(100vh - 210px)"
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <FSpinner :size="20"></FSpinner>
      </FContainer>
      <FContainer
        v-else-if="!listLoading && isEmpty(list)"
        height="calc(100vh - 210px)"
      >
        <FEmptyState
          :vertical="true"
          :title="
            $t('approvals.no_data', {
              ns: 'approvals',
            })
          "
          illustration="no-entries"
        >
        </FEmptyState>
      </FContainer>
      <FContainer v-else>
        <FContainer
          padding="containerLarge containerXLarge"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          class="table-top-radius"
          borderBottom="solid 1px"
          borderColor="borderNeutralBaseSubtler"
        >
          <FContainer
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <FText color="textMain" appearance="headingMed14">{{
              `${toCount} ${this.$t('of', 'of')} ${listcount}
                ${this.$t('records', 'Records')}`
            }}</FText>
            <FPagination
              :pageSize="perPage"
              :total="listcount"
              :currentPage.sync="pages"
              type="series"
              @currentChange="pageChanged({ force: true })"
            >
            </FPagination>
          </FContainer>
        </FContainer>
        <FContainer>
          <FContainer
            v-if="listLoading"
            height="calc(100vh - 210px)"
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <FSpinner :size="20"></FSpinner>
          </FContainer>
          <FContainer v-else>
            <CommonList
              :records="list"
              :viewDetail="viewDetail"
              :slotList="slotList"
              :hideBorder="true"
              :mainFieldAction="mainFieldRedirection"
              style="overflow: scroll"
              :style="{
                height: currentPageCount > 10 ? 'calc(100vh - 210px)' : '',
              }"
              actionColumnWidth="250px"
            >
              <template #[slotList[0].name]="{ record }">
                <ApprovalButton
                  secondaryAppearance="secondary"
                  :record="record"
                  :availableTransitions="getApprovalStates(record)"
                  :moduleName="moduleName"
                  :isList="true"
                  @onSuccess="reload"
                  @onFailure="onTransitionError"
                >
                </ApprovalButton>
              </template>
            </CommonList>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { ViewsList, CommonList } from '@facilio/ui/new-app'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FPagination,
  FTable,
  FButton,
  FSpinner,
  FIcon,
  ftoast,
  FEmptyState,
} from '@facilio/design-system'
import ApprovalSummary from './ApprovalSummary.vue'
import ApprovalButton from '../../../src/components/page-builder/approval-bar/ApprovalBar.vue'
import isEqual from 'lodash/isEqual'

export default {
  props: ['moduleName', 'modules'],
  data() {
    return {
      list: [],
      perPage: 25,
      includeParentFilter: true,
      filters: {},
      isLoading: false,
      stateflows: [],
      listcount: null,
      currentPageCount: null,
      pageLoaded: false,
      listLoading: false,
      viewDetail: {},
      selectedRecord: {},
      pages: 1,
      isEmpty,
    }
  },
  components: {
    ViewsList,
    FContainer,
    FText,
    FPagination,
    FTable,
    FButton,
    FSpinner,
    CommonList,
    ViewsList,
    FIcon,
    ApprovalSummary,
    ApprovalButton,
    FEmptyState,
  },
  async created() {
    this.pageLoaded = true
    await this.loadViewDetails()
    await this.loadApprovals({ force: true })
    await this.loadApprovalCounts({ force: true })
    this.pageLoaded = false
  },
  computed: {
    toCount() {
      return this.page * this.perPage < this.listcount
        ? this.page * this.perPage
        : this.listcount
    },
    currentView() {
      return this.$route.params.viewname || 'all'
    },
    slotList() {
      return [
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 200,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
      ]
    },
    selectedRecordId() {
      if (this.$route.params.id) {
        return parseInt(this.$route.params.id)
      }
      return -1
    },
    isSummaryOpen() {
      return !isEmpty(this.selectedRecordId)
    },
    page() {
      let { pages } = this
      return parseInt(this.$route.query.page) || pages || 1
    },
  },
  watch: {
    moduleName() {
      this.reload({ force: true })
      this.loadViewDetails()
    },
    selectedRecordId: {
      handler(newVal) {
        if (newVal !== -1) {
          this.$emit('summaryOpen', false)
        } else {
          this.$emit('summaryOpen', true)
        }
      },
      immediate: true,
    },
    page(newVal) {
      if (!isEqual(this.pages, newVal)) {
        this.pages = newVal
        this.loadApprovals({ force: true })
      }
    },
  },
  methods: {
    async loadApprovals({ skipLoading = false, force = false } = {}) {
      this.listLoading = true

      let {
        moduleName,
        page,
        perPage,
        includeParentFilter,
        filters,
        currentView,
      } = this
      let { criteriaIds } = this.$route.query
      let params = {
        moduleName,
        viewName: currentView,
        page,
        perPage,
        filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
        criteriaIds: !isEmpty(criteriaIds) ? criteriaIds : null,
        includeParentFilter,
      }

      if (!skipLoading) this.isLoading = true

      return API.get(`/v2/approval/moduleList`, params, { force }).then(
        ({ data, error }) => {
          if (error) {
            this.listLoading = false
            ftoast.warning(
              error.message ||
                this.$t('approvals.could_not_load_approvals', {
                  ns: 'approvals',
                })
            )
          } else {
            let { records = [], stateFlows = [] } = data || {}
            this.list = records
            this.currentPageCount = records?.length
            this.stateflows = stateFlows
            this.listLoading = false
          }
          if (!this.isSummaryOpen) this.isLoading = false
        }
      )
    },
    async loadApprovalCounts({ force = false } = {}) {
      let { moduleName, includeParentFilter, filters, currentView } = this
      let { criteriaIds } = this.$route.query
      let params = {
        moduleName,
        viewName: currentView,
        filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
        criteriaIds: !isEmpty(criteriaIds) ? criteriaIds : null,
        includeParentFilter,
        fetchCount: true,
      }

      await API.get(`/v2/approval/moduleList`, params, { force }).then(
        ({ data, error }) => {
          if (error) {
            ftoast.warning(
              error.message ||
                this.$t('approvals.error_occured', {
                  ns: 'approvals',
                })
            )
            this.listcount = null
          } else {
            this.listcount = data.recordCount
          }
        }
      )
    },
    reload(force = false) {
      this.loadApprovals({ force })
      this.loadApprovalCounts({ force })
    },
    async loadViewDetails() {
      this.viewLoading = true

      try {
        let { moduleName, currentView } = this
        let { error, data } = await API.get(
          `v2/approvaltab/views/${currentView}`,
          { moduleName }
        )

        if (error) throw error
        else this.viewDetail = data?.viewDetail || {}
      } catch (errorMsg) {
        ftoast.critical(
          errorMsg ||
            this.$t('approvals.cannot_fetch_view_details', {
              ns: 'approvals',
            })
        )
      }

      this.viewLoading = false
    },
    mainFieldRedirection({ record, value }) {
      let { id = null } = record || {}

      return {
        text: value,
        id,
        clickAction: (field, e) => this.openSummary(record.id),
        ...value,
      }
    },
    async openSummary(id) {
      let { moduleName, currentView: viewName } = this
      this.selectedRecord = (this.list || []).find(record => record.id === id)
      this.$router.push({
        params: { id, moduleName, viewName },
        query: {
          ...this.$route.query,
        },
      })
    },
    getApprovalStates(record) {
      let { approvalStatus, approvalFlowId } = record || {}
      let { id: approvalStatusId } = approvalStatus || {}
      if (isEmpty(approvalStatus) || isEmpty(approvalFlowId)) {
        return []
      }
      let key = `${approvalFlowId}_${approvalStatusId}`
      let transitions = this.stateflows[key]
      let { evaluatedTransitionIds = [] } = record

      if (transitions) {
        transitions = transitions.filter(({ id }) =>
          (evaluatedTransitionIds || []).includes(id)
        )
        return transitions.slice(0, 2)
      }
      return []
    },
    onTransitionError() {
      ftoast.warning(
        this.$t('approvals.could_not_update_record', {
          ns: 'approvals',
        })
      )
    },
    pageChanged(val) {
      this.loadApprovals({ force: true })
    },
  },
}
</script>
