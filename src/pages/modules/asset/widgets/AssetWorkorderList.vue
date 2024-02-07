<template>
  <FContainer height="100%" display="flex" width="100%">
    <template v-if="isActive">
      <portal :to="portalName" :key="portalName + '-portalwrap'">
        <!-- new search component needs to be used -->
      </portal>
      <portal
        v-if="!isEmpty(list)"
        paddingTop="sectionLarge"
        class="portal-alignment-ws"
        ref="footer-portal"
        :class="{ height2px: !showFooterDivider }"
        :to="`footer-${widget.id}-${widget.name}`"
        @change="footerChange"
      >
        <FContainer
          v-if="!isEmpty(list) && totalCount > 5"
          padding="containerXLarge containerNone"
        >
          <FPagination
            v-if="!isEmpty(list)"
            :total="totalCount"
            :pageCount="pageCount()"
            :currentPage.sync="page"
            :pageSize="perPage"
          ></FPagination>
        </FContainer>
      </portal>
    </template>
    <!-- Widget Content -->
    <portal
      v-if="moduleName && moduleName == 'workorder' && !isEmpty(list)"
      :to="`action-${widget.id}-${widget.name}`"
      class="portal-alignment-ws action-ws"
    >
      <FButton
        v-if="$access.hasPermission('asset:CREATE') && !decommission"
        @click="openWoCreation()"
        appearance="secondary"
        size="small"
        iconGroup="navigation"
        iconName="addition"
        iconPosition="prefix"
        >{{ $t('asset.reactive.new_workorder', { ns: 'asset' }) }}</FButton
      >
    </portal>
    <FContainer
      v-if="loading"
      display="flex"
      width="100%"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(list)"
      display="flex"
      flexDirection="column"
      height="98%"
      width="100%"
    >
      <FDivider width="100%"></FDivider>

      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer height="100%" display="flex" justifyContent="center">
          <FContainer
            display="flex"
            justifyContent="center"
            width="500px"
            height="100%"
          >
            <FEmptyState
              :title="title"
              :description="description"
              vertical
              size="S"
              illustration="no-entries"
            >
              <template
                #buttons
                v-if="!isClosed && moduleName && moduleName == 'workorder'"
              >
                <FButton
                  v-if="$access.hasPermission('asset:CREATE') && !decommission"
                  @click="openWoCreation()"
                  appearance="secondary"
                  size="medium"
                  iconGroup="navigation"
                  iconName="addition"
                  iconPosition="prefix"
                  >{{
                    $t('asset.reactive.new_workorder', { ns: 'asset' })
                  }}</FButton
                >
              </template>
            </FEmptyState>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>

    <FContainer v-else height="100%">
      <FTable
        :rounded="false"
        :columns="column"
        :hideBorder="true"
        :data="list"
        @onCellClick="goToSummary"
      >
        <template #[`cell.createdTime`]="{ row }">
          <FText color="textMain">{{ getDateColumnValue(row, tabType) }}</FText>
        </template>
        <template #[`cell.assignedTo`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FAvatar size="S" :userName="getAssignedToName(row)"></FAvatar>
            <FContainer>
              <FText color="textMain"> {{ getAssignedTo(row) }}</FText>
            </FContainer>
          </FContainer>
        </template>
        <template #[`cell.resolveTime`]="{ row }">
          <FText color="textMain">{{
            getResolveColumnValue(row, tabType)
          }}</FText>
        </template>
      </FTable>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  getDaysBetween,
  formatDate,
  getFormattedDuration,
} from '../../../../utils/formatter'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FTable,
  FAvatar,
  FPagination,
  FButton,
  FSpinner,
  FDivider,
  FEmptyState,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  components: {
    FContainer,
    FText,
    FTable,
    FAvatar,
    FPagination,
    FButton,
    FSpinner,
    FDivider,
    FEmptyState,
  },
  props: [
    'tabType',
    'url',
    'isActive',
    'portalName',
    'goToSummary',
    'widget',
    'resizeWidget',
    'details',
    'moduleName',
  ],
  mounted() {
    this.loadData()
    this.loadCount()
  },
  data() {
    return {
      loading: false,
      list: null,
      page: 1,
      perPage: 5,
      totalCount: null,
      showFooterDivider: false,
      column: [
        {
          displayName: 'Subject',
          name: 'subject',
          id: 1,
          clickable: true,
        },
        {
          displayName:
            this.tabType == 'upcoming' ? 'Scheduled on' : 'Created on',
          name: 'createdTime',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Assigned To',
          name: 'assignedTo',
          id: 3,
          width: 250,
          clickable: true,
        },
        {
          displayName: 'Estimated Duration To Resolve',
          name: 'resolveTime',
          id: 4,
          width: 270,
        },
      ],
      isEmpty,
    }
  },
  computed: {
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
    title() {
      let { tabType, moduleName } = this
      if (moduleName == 'workorder') {
        return this.$t(
          `asset.reactive.${tabType}_title`,
          `No ${tabType} Workorders available`,
          { ns: 'asset' }
        )
      }
      return this.$t(
        `asset.pm.${tabType}_title`,
        `No ${tabType} planned workorders available`,
        { ns: 'asset' }
      )
    },
    description() {
      let { tabType, moduleName } = this
      if (moduleName == 'workorder') {
        if (tabType.includes('closed')) {
          return this.$t(
            `asset.reactive.${tabType}_desc`,
            `No Workorders have been closed so far!`,
            { ns: 'asset' }
          )
        }
        return this.$t(
          `asset.reactive.${tabType}_desc`,
          `There are no ${tabType} Workorders available. Click here to raise a new Ticket!`,
          { ns: 'asset' }
        )
      } else {
        return this.$t(
          `asset.pm.${tabType}_desc`,
          `There are no ${tabType} planned Workorders scheduled!`,
          { ns: 'asset' }
        )
      }
    },
    isClosed() {
      let { tabType } = this
      if (tabType.includes('closed')) {
        return true
      }
      return false
    },
  },
  methods: {
    footerChange() {},
    async loadData() {
      this.loading = true

      let { data } = await API.get(
        `${this.url}&perPage=${this.perPage}&page=${this.page}`
      )
      this.list = data?.workorders
      if (isEmpty(this.list)) {
        this.resizeWidget({ h: 5 })
      }
      console.log('list: ', data)
      this.loading = false
    },
    async loadCount() {
      let { data } = await API.get(`${this.url}&count=true`)
      this.totalCount = data?.workorderscount
    },
    getDateColumnValue(workorder, tabType) {
      if (tabType === 'closed') {
        if (isEmpty(workorder['actualWorkEnd'])) {
          return '---'
        } else {
          return formatDate(workorder['actualWorkEnd'], false, false)
        }
      } else if (tabType === 'open') {
        if (isEmpty(workorder['createdTime'])) {
          return '---'
        } else {
          return formatDate(workorder['createdTime'], false, false)
        }
      } else {
        if (isEmpty(workorder['scheduledStart'])) {
          return '---'
        } else {
          return formatDate(workorder['scheduledStart'], false, false)
        }
      }
    },
    getResolveColumnValue(workorder, tabType) {
      if (isEmpty(workorder) || isEmpty(workorder.scheduledStart)) {
        return '---'
      } else if (tabType === 'closed') {
        if (isEmpty(workorder.actualWorkDuration)) {
          return '---'
        }

        return getFormattedDuration(workorder.actualWorkDuration, 'seconds')
      } else if (!isEmpty(workorder.dueDate)) {
        let duration = getDaysBetween(
          workorder.scheduledStart,
          workorder.dueDate
        )
        return getFormattedDuration(duration, null, true)
      } else {
        return '---'
      }
    },
    getAssignedTo(workorder) {
      return workorder.assignedTo?.name ? workorder.assignedTo.name : '__'
    },
    getAssignedToName(workorder) {
      return workorder.assignedTo?.name ? workorder.assignedTo.name : ''
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.perPage)
    },
    openWoCreation() {
      let { details } = this
      let query = {
        resource: details.id,
        resourceLabel: details.name,
        resourceResourceType: 2,
      }
      let { siteId } = details
      if (!isEmpty(siteId)) {
        query.siteId = siteId
      }

      let { name } = findRouteForModule('workorder', pageTypes.CREATE) || {}

      name && this.$router.push({ name, query })
    },
  },
  watch: {
    page() {
      this.loadData()
    },
  },
}
</script>
