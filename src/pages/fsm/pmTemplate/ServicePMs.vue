<template>
  <FContainer height="100%">
    <FContainer
      v-if="isLoading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FTable
      v-else-if="!isEmpty(servicePMList)"
      :columns="columns"
      :data="servicePMList"
      :rounded="false"
      :hideBorder="true"
    >
    </FTable>

    <FContainer
      v-else
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FEmptyState
        :title="$t('service_pm.service_pm_tite', { ns: 'fsm' })"
        :description="$t('service_pm.service_pm_description', { ns: 'fsm' })"
        vertical
        size="M"
        illustration="no-result"
      >
      </FEmptyState>
    </FContainer>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <FContainer
        padding="containerLarge"
        width="100%"
        position="sticky"
        bottom="0"
      >
        <FPagination
          :pageSize="perPage"
          :total="count"
          :currentPage.sync="page"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTable,
  ftoast,
  FEmptyState,
  FSpinner,
  FModal,
  FButton,
  FText,
  FDivider,
  FCheckbox,
  FPagination,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'ServiceOrders',
  props: ['widget', 'filters'],
  components: {
    FContainer,
    FTable,
    FEmptyState,
    FSpinner,
    FButton,
    FModal,
    FText,
    FDivider,
    FCheckbox,
    FPagination,
  },
  data() {
    return {
      page: 1,
      perPage: 20,
      count: null,
      pageCount: null,
      isEmpty,
      currentButton: null,
      currentRecord: null,
      reschedulePopUpVisibility: false,
      rescheduleSubsequent: false,
      confirmLoading: false,
      isLoading: false,
      systemButtons: {},
      rescheduleDate: null,
      servicePMList: [],
      columns: [
        {
          displayName: 'Name',
          name: 'pmName',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Type',
          name: 'pmTypeEnum',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Site',
          name: 'site',
          id: 3,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Space',
          name: 'space',
          id: 4,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Asset',
          name: 'asset',
          id: 5,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Recurring Schedule Information',
          name: 'servicePMTrigger',
          id: 6,
          resize: true,
          width: 250,
        },
        {
          displayName: 'Lead ime',
          name: 'leadTime',
          id: 7,
          width: 200,
        },
        {
          displayName: 'Preview Period',
          name: 'previewPeriod',
          id: 8,
          width: 200,
        },
        {
          displayName: 'Next Run',
          name: 'nextRun',
          id: 9,
          width: 200,
        },
        {
          displayName: 'Last Run',
          name: 'lastRun',
          id: 10,
          width: 200,
        },
      ],
    }
  },
  created() {
    this.getServicePMCount()
    this.getServicePMs()
  },
  methods: {
    currentChange(page) {
      this.page = page
      this.getServicePMs()
    },
    async getServicePMCount() {
      let { filters } = this
      let params = {
        viewName: 'all',
        moduleName: 'servicePlannedMaintenance',
        filters: JSON.stringify(filters),
      }
      let url = 'v3/modules/data/count'
      let { data, error } = await API.get(url, params)
      if (error) {
        let { message } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        let { count } = data || {}
        this.count = count
        this.pageCount = Math.floor(count / 50)
      }
    },
    async getServicePMs() {
      this.isLoading = true
      let { page, perPage, filters } = this
      let params = {
        filters: JSON.stringify(filters),
        force: true,
        page,
        perPage,
      }
      let { list, error } = await API.fetchAll(
        'servicePlannedMaintenance',
        params
      )
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        this.servicePMList = list.map(servicePlannedMaintenance => {
          let { nextRun, lastRun, servicePMTrigger, site, space, asset } =
            servicePlannedMaintenance || {}
          return {
            ...servicePlannedMaintenance,
            servicePMTrigger: this.getName(servicePMTrigger),
            site: this.getName(site),
            space: this.getName(space),
            asset: this.getName(asset),
            nextRun: this.getTime(nextRun),
            lastRun: this.getTime(lastRun),
          }
        })
        this.isLoading = false
      }
    },
    getName(site) {
      let { primaryValue = '---' } = site || {}
      return primaryValue
    },
    getTime(time) {
      if (!isEmpty(time)) {
        let options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }
        let formattedDate = new Intl.DateTimeFormat('en-US', options).format(
          time
        )
        return formattedDate
      }
      return '---'
    },
  },
}
</script>
