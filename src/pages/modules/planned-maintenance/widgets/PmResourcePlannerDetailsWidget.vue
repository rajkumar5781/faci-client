<template>
  <FContainer class="pmrp-details-container">
    <portal :to="titlePortal">
      <FContainer
        padding="containerLarge containerXLarge"
        height="40px"
        display="flex"
        alignItems="center"
      >
        <FText appearance="headingMed14">
          {{ resourcePlaceholder }}
        </FText>
      </FContainer>
    </portal>
    <FContainer v-if="isLoading" class="pmrp-details-spinner-position">
      <FSpinner :size="20" ref="content-container"></FSpinner>
    </FContainer>
    <FContainer v-else class="resourcePlannerScroll">
      <FTable
        :columns="column"
        :data="tableData"
        :striped="striped"
        :readOnly="readOnly"
        :hideBorder="hideBorder"
        :showSelectBar="showSelectBar"
        :rounded="rounded"
        :accordionType="accordionType"
        @recordSelected="handleSelection"
        @onCellClick="cellClicked"
        @rowMouseOver="rowMouseOverHandler"
      >
        <template #[`cell.itemType`]="{ row, resourceName }">
          <FText>{{ row[resourceName] }}</FText>
        </template>
      </FTable>
    </FContainer>

    <portal :to="footerPortal">
      <FContainer
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        paddingLeft="containerXLarge"
        paddingRight="containerXLarge"
        v-if="pageCount > 1"
      >
        <FPagination
          :total="totalCount"
          :pageCount="pageCount"
          :currentPage.sync="currentPage"
          :pageSize="perPage"
          :disabled="disabled"
          @nextClick="nextClicked"
          @prevClick="prevClicked"
          @currentChange="currentChanged"
        >
        </FPagination>
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { getRelatedFieldName } from '../util/relatedFieldUtil'
import CommonFieldList from '../../../../components/page-builder/widgets/fieldSummary/CommonFieldList.vue'
import {
  SCOPE_CATEGORY_PLACEHOLDER,
  SCOPE_CATEGORY_SINGULAR_PLACEHOLDER,
} from '../util/pm-utils.js'
import {
  FTabs,
  FTabPane,
  FContainer,
  FPagination,
  FTable,
  FText,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
import { eventBus } from '../../../../components/page-builder/event-bus.js'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  props: ['widget', 'titlePortal', 'footerPortal'],
  components: {
    FTabs,
    FTabPane,
    FContainer,
    CommonFieldList,
    FPagination,
    FTable,
    FText,
    FSpinner,
  },
  data: () => ({
    moduleName: 'pmResourcePlanner',
    selectedPlannerId: -1,
    plannerMap: {},
    pmv2Detail: {},
    isLoading: false,

    // pagination data fields
    perPage: 10,
    totalCount: 0,
    currentPage: 1,
    disabled: false,

    //table data fields
    striped: false,
    readOnly: false,
    hideBorder: true,
    showSelectBar: false,
    rounded: false,
    accordionType: '',

    column: [
      {
        displayName: `Resources`,
        name: 'resourceName',
        id: 1,
        resize: true,
        width: 200,
        alignment: 'left',
        type: 'link',
      },
      {
        displayName: 'Job Plan',
        name: 'jobPlan',
        id: 2,
        resize: true,
        width: 200,
        alignment: 'left',
        type: 'link',
      },
      {
        displayName: 'Assigned To',
        name: 'assignedTo',
        id: 3,
        resize: true,
        width: 200,
        alignment: 'left',
        type: 'avatar',
      },
    ],
    resourcePlannerList: [],
    tableData: [],
  }),
  computed: {
    recordId() {
      let { $route } = this
      let { params } = $route
      let { id } = params || {}
      return id
    },
    resourcePlaceholder() {
      let { pmv2Detail } = this || {}
      let { assignmentTypeEnum } = pmv2Detail || {}
      let placeholder = SCOPE_CATEGORY_PLACEHOLDER[assignmentTypeEnum]
      if (isEmpty(placeholder)) {
        return ''
      }
      return (
        placeholder + ' ' + this.$t('pm.planner', { ns: 'maintenance' }) ||
        this.$t('pm.resources', { ns: 'maintenance' })
      )
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.perPage)
    },
  },
  watch: {
    currentPage() {
      this.loadResources()
    },
    selectedPlannerId() {
      this.loadResources()
    },
    pmv2Detail() {
      // update column name
      this.column.forEach(col => {
        if (col.name === 'resourceName') {
          let { pmv2Detail } = this || {}
          let { assignmentTypeEnum } = pmv2Detail || {}
          let placeholder =
            SCOPE_CATEGORY_SINGULAR_PLACEHOLDER[assignmentTypeEnum]
          col.displayName = placeholder + ' Name'
        }
      })
    },
  },
  mounted() {
    eventBus.$on('updateResourcePlannerDetail', (plannerId, pmv2Detail) =>
      this.updateResourcePlannerDetail(plannerId, pmv2Detail)
    )
  },
  destroyed() {
    eventBus.$off('updateResourcePlannerDetail')
  },
  methods: {
    /**
     * handleTabClick function updates the selected Planner ID
     * @param {*} activeKey
     */
    handleTabClick(activeKey) {
      this.selectedPlannerId = activeKey
    },

    /**
     * loadResources function loads the resources of the selected Planner for the
     * currentPage, after which it serializes the data for table.
     */
    async loadResources() {
      let { moduleName, currentPage, selectedPlannerId } = this || {}
      this.isLoading = true
      let params = {
        page: currentPage,
        perPage: 10,
        withCount: true,
      }
      let relatedFieldName = getRelatedFieldName('pmPlanner', moduleName)
      let relatedConfig = {
        moduleName: 'pmPlanner',
        id: selectedPlannerId,
        relatedModuleName: moduleName,
        relatedFieldName,
        permissionModuleName: 'plannedmaintenance',
      }

      let { error, list, meta } = await API.fetchAllRelatedList(
        relatedConfig,
        params
      )
      if (!isEmpty(error)) {
        ftoast.critical(
          error.message ||
            this.$t('pm_creation.error_occurred', { ns: 'maintenance' })
        )
      } else {
        let { pagination } = meta || {}
        let { totalCount = 0 } = pagination || {}
        this.totalCount = totalCount
        this.resourcePlannerList = list
        let { supplements } = meta
        let data = this.serializeTableData(list, supplements)
        this.tableData = data
      }
      this.isLoading = false
    },

    /**
     * serializeTableData() function sets the data in the format that's required for rendering table
     * @param {*} resourcePlannerList
     * @param {*} supplements
     */
    serializeTableData(resourcePlannerList, supplements) {
      let tableData = []

      let { pmResourcePlanner } = supplements || {}
      let {
        resource: resourceSupplement = {},
        jobPlan: jobPlanSupplement = {},
        assignedTo: assignedToSupplement = {},
      } = pmResourcePlanner || {}

      resourcePlannerList.forEach(resourcePlanner => {
        let data = {
          resourceName: { text: '---' },
          jobPlan: { text: '---' },
          assignedTo: { name: '---' },
        }

        let { resourceId, assignedToId, jobPlan = {} } = resourcePlanner || {}
        let { id: jobPlanId } = jobPlan || {}

        if (!isEmpty(resourceId)) {
          let currentResource = resourceSupplement[`${resourceId}`]
          let { name } = currentResource || {}
          let linkObject = {
            text: name,
          }
          data['resourceName'] = linkObject || { text: '---' }
        }

        if (!isEmpty(assignedToId)) {
          let currentAssignedTo = assignedToSupplement[`${assignedToId}`]
          data['assignedTo'] = currentAssignedTo || { name: '---' }
        }

        if (!isEmpty(jobPlanId)) {
          let currentJobPlan = jobPlanSupplement[`${jobPlanId}`]
          let { name } = currentJobPlan || {}
          let linkObject = {
            text: name,
          }

          // Set the URL if route is available
          let { name: routeName } =
            findRouteForModule('jobplan', pageTypes.OVERVIEW) || {}

          if (!isEmpty(routeName)) {
            let { group, jobPlanVersion } = currentJobPlan || {}
            let { id: groupId } = group || {}

            let params = {
              viewname: 'all',
              id: groupId,
            }

            jobPlanVersion = `v${jobPlanVersion}` // Note

            let query = {
              jpversion: jobPlanVersion,
            }

            let { href: url } =
              this.$router.resolve({ name: routeName, params, query }) || {}

            linkObject = {
              ...linkObject,
              url,
            }
          }

          data['jobPlan'] = linkObject || { text: '---' }
        }

        tableData.push(data)
      })
      return tableData
    },

    /**
     * updateResourcePlannerDetail() function will be called on an emit event to update plannerId, pmv2Detail
     * @param {*} plannerId
     * @param {*} pmv2Detail
     */
    updateResourcePlannerDetail(plannerId, pmv2Detail) {
      this.selectedPlannerId = plannerId
      this.pmv2Detail = pmv2Detail
    },

    // Pagination methods
    nextClicked(event) {},
    prevClicked(event) {},
    currentChanged(event) {},
    rowMouseOverHandler(event) {},
    cellClicked(event) {},
    handleSelection(event) {},
  },
}
</script>
<style scoped lang="scss">
.resourcePlannerScroll {
  overflow: scroll;
  height: 386px;
}

.pmrp-details-container {
  height: 100%;
  .pmrp-details-spinner-position {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
