<template>
  <FContainer
    border="solid 1px"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    marginTop="containerLarge"
    overflow="hidden"
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
    <FContainer v-else-if="!pageLoaded && !isEmpty(activities)">
      <FContainer
        padding="containerLarge containerXLarge"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
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
        </FContainer>
        <FPagination
          :pageSize="perPage"
          :total="listcount"
          :currentPage.sync="page"
          type="series"
          @currentChange="reload({ force: true })"
        >
        </FPagination>
      </FContainer>
      <FContainer>
        <FContainer
          v-if="loading"
          height="calc(100vh - 210px)"
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FSpinner :size="20"></FSpinner>
        </FContainer>
        <FContainer v-else height="calc(100vh - 210px)">
          <FTable
            :columns="column"
            :data="activities"
            :hideBorder="true"
            :rounded="false"
            actionColumnWidth="120"
            class="activity-row"
          >
            <template #[`cell.ttime`]="{ row, prop }">
              <FText>{{ formatDate(row.ttime) }}</FText>
            </template>
            <template #[`cell.user`]="{ row, prop }">
              <FContainer
                display="flex"
                alignItems="center"
                gap="containerMedium"
              >
                <FAvatar
                  size="M"
                  :userName="row.doneBy.name"
                  :avatarUrl="row.doneBy.avatarUrl"
                ></FAvatar>
                <FText>{{ getUserName(row.doneBy.ouid) }}</FText>
              </FContainer>
            </template>
            <template #[`cell.Actions`]="{ row, prop }">
              <FText>{{ row.info.status }}</FText>
            </template>
            <template #[`cell.Approvalprocess`]="{ row, prop }">
              <FText>{{ getRuleName(row) }}</FText>
            </template>
            <template #[`cell.Name`]="{ row, prop }">
              <FText>{{ getModulePrimaryField(row) }}</FText>
            </template>
            <template #[`cell.action`]="{ row, prop }">
              <FContainer
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FButton
                  class="pointer"
                  appearance="secondary"
                  :iconButton="true"
                  iconGroup="navigation"
                  iconName="open-window"
                  @click="goToModuleSummary({ id: row.parentId })"
                >
                  {{
                    $t('approval_activities.open_summary', {
                      ns: 'approvals',
                    })
                  }}
                </FButton>
              </FContainer>
            </template>
          </FTable>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer v-else height="calc(100vh - 210px)">
      <FEmptyState
        :vertical="true"
        :title="
          $t('approval_activities.no_history_available', {
            ns: 'approvals',
          })
        "
        illustration="no-entries"
      >
      </FEmptyState>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { CommonList } from '@facilio/ui/new-app'
import {
  FContainer,
  FText,
  FButton,
  FSpinner,
  FIcon,
  FTable,
  FAvatar,
  FPagination,
  FEmptyState,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import {
  findRouteForModule,
  isWebTabsEnabled,
  pageTypes,
} from '@facilio/router'
import { getTimeZone } from '../../utils/formatter'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

const formatDate = function (date) {
  let timezone = getTimeZone()
  let dateformat = getDateFormat()
  let timeformat = getTimeFormat()
  return dayjs(date)
    .tz(timezone)
    .format(dateformat + ' ' + timeformat)
}

const getDateFormat = function () {
  return 'DD/MM/YYYY'
}

const getTimeFormat = function () {
  return 'HH:mm a'
}

export default {
  props: ['modules', 'moduleName'],
  data() {
    return {
      activities: [],
      pageLoaded: false,
      loading: false,
      perPage: 10,
      viewDetail: {},
      column: [
        {
          displayName: this.$t('approval_activities.time', {
            ns: 'approvals',
          }),
          name: 'ttime',
          id: 1,
          fixed: true,
          alignment: 'center',
        },
        {
          displayName: this.$t('approval_activities.user', {
            ns: 'approvals',
          }),
          name: 'user',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: this.$t('approval_activities.actions', {
            ns: 'approvals',
          }),
          name: 'Actions',
          id: 3,
          resize: true,
          width: 200,
        },
        {
          displayName: this.$t('approval_activities.approvalprocess', {
            ns: 'approvals',
          }),
          name: 'Approvalprocess',
          id: 4,
          resize: true,
          width: 200,
        },
        {
          displayName: this.$t('approval_activities.name', {
            ns: 'approvals',
          }),
          name: 'Name',
          id: 5,
          resize: true,
          width: 200,
        },
      ],
      portalUserList: [],
      approvalRules: [],
      users: [],
      perPage: 25,
      page: 1,
      listcount: 0,
      isEmpty,
      formatDate,
    }
  },
  components: {
    FContainer,
    FText,
    FTable,
    FButton,
    FSpinner,
    CommonList,
    FIcon,
    FTable,
    FAvatar,
    FPagination,
    FEmptyState,
  },
  async created() {
    this.pageLoaded = true
    await this.loadActivities()
    await this.loadPortalUsers()
    await this.loadUsers()
    this.pageLoaded = false
  },
  computed: {
    currentView() {
      return this.$route.params.viewname || 'all'
    },
    toCount() {
      return this.page * this.perPage < this.listcount
        ? this.page * this.perPage
        : this.listcount
    },
  },
  watch: {
    moduleName(newVal) {
      if (!isEmpty(newVal)) {
        this.reload({ force: true })
      }
    },
  },
  methods: {
    async loadActivities() {
      this.loading = true

      let params = {
        moduleName: this.moduleName,
        page: this.page,
        perPage: this.perPage,
      }
      let { data, error } = await API.get('v2/approval/activityList', params)
      if (!error) {
        let { activityList, pickList, workflowRule } = data || {}
        this.activities = activityList || []
        this.primaryFields = pickList || []
        this.approvalRules = workflowRule || {}
      } else {
        this.activities = []
      }

      let response = await API.get('v2/approval/activityList', {
        ...params,
        fetchCount: true,
      })
      if (!response.error) {
        this.listcount = response?.data?.recordCount || null
      } else {
        this.listcount = 0
      }
      this.loading = false
    },
    async loadPortalUsers() {
      API.get('/setup/portalusers').then(({ error, data }) => {
        if (!error) this.portalUserList = data.users || []
      })
    },
    reload(force = false) {
      this.loadActivities({ force })
    },
    getRuleName(activity) {
      let ruleId = getProperty(activity, 'info.ruleId')
      let ruleName = this.approvalRules[ruleId]
      return ruleName || '---'
    },
    getModulePrimaryField(activity) {
      let recordId = getProperty(activity, 'parentId')
      let value = this.primaryFields[recordId]
      return value
    },
    async loadUsers() {
      let { data, error } = await API.get('/users')
      if (isEmpty(error)) {
        let { users } = data || []
        this.users = users
      }
    },
    getUserName(id) {
      if (id) {
        let user = null
        user = (this.users || []).find(us => us.ouid === id)

        if (user) {
          return user.name
        } else if (!isEmpty(this.portalUserList)) {
          user = (this.portalUserList || []).find(u => u.ouid === id)
          if (user) {
            return user.name
          } else {
            return '---1'
          }
        } else {
          return '---2'
        }
      } else {
        return '---3'
      }
    },
    goToModuleSummary(record) {
      let { moduleName, $router } = this
      let params = { viewname: 'all', id: record.id, moduleName }
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW)

      if (name) {
        let { href } = $router.resolve({ name, params }) || {}
        href && window.open(href, '_blank')
      }
    },
  },
}
</script>
