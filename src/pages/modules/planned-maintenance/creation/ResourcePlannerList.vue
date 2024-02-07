<template>
  <FContainer
    border="solid 1px"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    display="flex"
    flexDirection="column"
  >
    <FContainer
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding="containerLarge containerXLarge"
    >
      <FText appearance="headingMed14" color="textMain">{{ title }}</FText>
      <FButton
        appearance="tertiary"
        size="small"
        iconGroup="edit"
        iconName="edit-line"
        :iconButton="false"
        iconPosition="prefix"
        @click="onClickShowCustomizeResourcePlanner"
      >
        {{ $t('pm_creation.view_and_customise', { ns: 'maintenance' }) }}
      </FButton>
    </FContainer>

    <FContainer position="relative" class="table-parent">
      <FContainer
        backgroundColor="backgroundBlanket"
        alignItems="center"
        justifyContent="center"
        position="absolute"
        width="100%"
        height="100%"
        zIndex="11"
        class="blurred-table-view table-border-radius"
      >
        <FButton
          appearance="secondaryInverse"
          size="small"
          iconGroup="edit"
          iconName="edit-line"
          :iconButton="false"
          iconPosition="prefix"
          @click="onClickShowCustomizeResourcePlanner"
        >
          {{ $t('pm_creation.view_and_customise', { ns: 'maintenance' }) }}
        </FButton>
      </FContainer>
      <FTable
        :columns="columns"
        :data="tableData"
        :striped="false"
        :readOnly="false"
        :hideBorder="true"
        :rounded="false"
        accordionType=""
        :getFloatBar="false"
        class="table-border-radius"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil.js'
import { getResourcePlannerListPlaceholder } from './utils/pm-utils.js'
import {
  FContainer,
  FButton,
  FText,
  FTable,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'ResourcePlannerList',

  components: { FContainer, FButton, FText, FTable },

  props: {
    planner: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      required: true,
    },
    resourcesCount: {
      type: Number,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    // plannerTitle: {
    //   type: String,
    //   required: true,
    // },
    resourcePlaceholder: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      resourcePlannerList: [],
      tableData: [],
      currentPage: 1,
      perPage: 5,
      isLoading: true,
      totalCount: 0,
    }
  },

  created() {
    this.loadResources()
  },

  computed: {
    title() {
      let { pmRecord, resourcesCount } = this
      return getResourcePlannerListPlaceholder(pmRecord, resourcesCount)
    },
    plannerId() {
      let { planner } = this
      let { id } = planner || {}
      return id
    },
    columns() {
      let { resourcePlaceholder = 'Resources' } = this
      let columns = [
        {
          displayName: resourcePlaceholder,
          name: 'resourceName',
          id: 1,
          resize: true,
          width: 200,
          alignment: 'left',
          type: 'text',
        },
        {
          displayName: this.$t('pm.job_plan', { ns: 'maintenance' }),
          name: 'jobPlan',
          id: 2,
          resize: true,
          width: 200,
          alignment: 'left',
          type: 'text',
        },
        {
          displayName: this.$t('pm.assignedTo', { ns: 'maintenance' }),
          name: 'assignedTo',
          id: 3,
          resize: true,
          width: 200,
          alignment: 'left',
          type: 'avatar',
        },
      ]
      return columns
    },
  },

  methods: {
    /**
     * loadResources function loads the resources of the selected Planner for the
     * currentPage, after which it serializes the data for table.
     */
    async loadResources() {
      let { moduleName, currentPage, perPage, plannerId } = this || {}
      this.isLoading = true
      let params = {
        page: currentPage,
        perPage,
        withCount: true,
      }
      let relatedFieldName = getRelatedFieldName('pmPlanner', moduleName)
      let relatedConfig = {
        moduleName: 'pmPlanner',
        id: plannerId,
        relatedModuleName: moduleName,
        relatedFieldName,
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
          resourceName: '---',
          jobPlan: '---',
          assignedTo: '---',
        }
        let { resourceId, assignedToId, jobPlan = {} } = resourcePlanner || {}
        let { id: jobPlanId } = jobPlan || {}
        if (!isEmpty(resourceId)) {
          let currentResource = resourceSupplement[`${resourceId}`]
          let { name } = currentResource || {}
          data['resourceName'] = name
        }
        if (!isEmpty(assignedToId)) {
          let currentAssignedTo = assignedToSupplement[`${assignedToId}`]
          data['assignedTo'] = currentAssignedTo || { name: '---' }
        }
        if (!isEmpty(jobPlanId)) {
          let currentJobPlan = jobPlanSupplement[`${jobPlanId}`]
          let { name } = currentJobPlan || {}
          data['jobPlan'] = name
        }
        tableData.push(data)
      })
      return tableData
    },

    onClickShowCustomizeResourcePlanner() {
      this.$emit('onClickShowCustomizeResourcePlanner')
    },
  },
}
</script>
<style scoped lang="scss">
.table-parent:hover {
  .blurred-table-view {
    display: flex;
    // align-items: center;
    // justify-content: center;
    // position: absolute;
    // width: 100%;
    // height: 100%;
    // z-index: 11;
  }
}

.blurred-table-view {
  display: none;
}
.table-border-radius {
  border-radius: 0px 0px 8px 8px;
}
</style>
