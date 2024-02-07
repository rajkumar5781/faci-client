<template>
  <div>
    <FModal
      title="Job Plan Version History"
      :visible.sync="showVersionHistory"
      size="M"
      @ok="handleOk"
      @cancel="close"
      :hideFooter="true"
    >
      <FContainer
        padding="sectionMedium sectionMedium"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        v-if="loading"
      >
        <FSpinner :size="40" />
      </FContainer>
      <FContainer v-else-if="isEmpty(versionHistory)">
        <FContainer
          alignItem="center"
          display="flex"
          padding="sectionMedium sectionMedium"
        >
          <FEmptyState
            title="No Job Plan History"
            description="It seems that there are no Job Plan history"
            vertical
            size="S"
            illustration="add-item"
          >
          </FEmptyState>
        </FContainer>
      </FContainer>
      <FContainer v-else height="100%" minHeight="200px">
        <FTable
          :rounded="false"
          :columns="column"
          :hideBorder="true"
          :data="versionHistory"
          @onCellClick="goToJobplan"
        >
          <template #[`cell.subject`]="{ row }">
            <FText color="textMain">{{ row.subject }}</FText>
          </template>
          <template #[`cell.sysCreatedTime`]="{ row }">
            <FText color="textMain">{{ formatDate(row.sysCreatedTime) }}</FText>
          </template>
          <template #[`cell.jpStatus`]="{ row }">
            <FTags
              appearance="status"
              :text="getStatusName(row.jpStatus)"
              :disabled="false"
              :statusType="getStatusType(row.jpStatus)"
            />
          </template>
          <template #[`cell.sysCreatedBy`]="{ row }">
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerMedium"
            >
              <FAvatar size="S" :userName="getSysCreatedName(row)"></FAvatar>
              <FContainer>
                <FText color="textMain"> {{ getSysCreatedName(row) }}</FText>
              </FContainer>
            </FContainer>
          </template>
          <template #[`cell.action`]="{ row }">
            <div style="display: flex">
              <FButton
                appearance="link"
                size="medium"
                iconGroup="dsm"
                iconName="open-window"
                iconPosition="prefix"
                @click="redirectToJobplan(row)"
              >
                View
              </FButton>
            </div>
          </template>
        </FTable>
      </FContainer>
    </FModal>
  </div>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import router from '../../../../router'
import { formatDate } from '../../../../utils/formatter'
import { PUBLISHED_STATUS, PUBLISHED_STATUS_TYPE } from './pm-utils'
import {
  FModal,
  FTextArea,
  FContainer,
  FEmptyState,
  FTable,
  FText,
  FAvatar,
  FTags,
  FIcon,
  FButton,
  FSpinner,
} from '@facilio/design-system'
import getProperty from 'dlv'
import {
  findRouteForModule,
  pageTypes,
  isWebTabsEnabled,
} from '@facilio/router'
export default {
  name: 'JobplanVersionHistory',
  props: ['moduleName', 'jobPlanId', 'showVersionHistory'],
  data() {
    return {
      isEmpty,
      loading: false,
      column: [
        {
          displayName: 'Version',
          name: 'jobPlanVersion',
          id: 1,
          width: 100,
          clickable: true,
        },
        {
          displayName: 'Publish State',
          name: 'jpStatus',
          id: 2,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Created By',
          name: 'sysCreatedBy',
          id: 3,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Created on',
          name: 'sysCreatedTime',
          id: 4,
          resize: true,
          width: 200,
        },
      ],
      versionHistory: [],
    }
  },
  created() {
    this.getJobplanHistory()
  },
  components: {
    FModal,
    FTextArea,
    FContainer,
    FTable,
    FEmptyState,
    FText,
    FAvatar,
    FTags,
    FIcon,
    FButton,
    FSpinner,
  },
  computed: {
    currModuleName() {
      return 'jobplan'
    },
    widgetTitle() {
      return 'Job Plan Version History'
    },
  },
  methods: {
    formatDate,
    goToJobplan(row) {
      let { jobPlanId, moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let version = `v${row.jobplanVersion}`
      let params = { id: jobPlanId }
      let query = { jpversion:version }
      let { href } =
        router.resolve({
          name,
          params,
          query,
        }) || {}
      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    getSysCreatedName(row) {
      return row?.sysCreatedBy?.name ? row?.sysCreatedBy?.name : ''
    },
    getStatusName(id) {
      return PUBLISHED_STATUS[id]
    },
    getStatusType(id) {
      return PUBLISHED_STATUS_TYPE[id]
    },
    async getJobplanHistory() {
      this.loading = true
      let { jobPlanId, moduleName } = this
      let params = { jobPlanId }
      let { data, error } = await API.get('v3/jobPlan/versionHistory', params)
      if (!error) {
        let { result } = data || {}
        this.versionHistory = result
      } else {
        console.log('error')
        ftoast.critical(error?.message || 'Error Fetching Version History')
      }
      this.loading = false
    },
    redirectToJobplan(record) {
      let { group, jobPlanVersion: version } = record || {}
      let groupId = getProperty(group, 'id', null)
      let { moduleName } = this
      let route = {}

      version = `v${version}`
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      route = {
        name,
        params: {
          viewname: 'all',
          id: groupId,
        },
        query: { jpversion:version },
      }
      let { href } = router.resolve(route) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    close() {
      console.log('close')
      this.$emit('onclose')
    },
    handleOk() {
      this.close()
    },
  },
}
</script>
<style scoped>
.fc-task-remarks-dia {
  padding: 24px 16px;
}
</style>
