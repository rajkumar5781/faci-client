<template>
  <FContainer>
    <LookupWizard
      v-if="activeModal === 'resourcesLookUpWizard'"
      :field.sync="selectorField"
      parentModuleName="pmResourcePlanner"
      :selectedResource="selectedResource"
      :canShowLookupWizard.sync="canShowLookupWizard"
      @closeWizard="cancelDialog"
      @setLookupFieldValue="setResourceSelection"
      :selectAllRecordProp="selectAllRecordProp"
    />
    <PlannerFieldSelector
      v-else-if="activeModal === 'plannerFieldSelector'"
      :moduleName="moduleName"
      :planner="planner"
      :pmRecord="pmRecord"
      :breadCrumbProps="currentPlannerFieldSelectorBreadCrumb"
      :path="activeModal"
      @closeDialog="cancelDialog"
      @reloadResourcePlanner="reloadResourcePlanner"
      :canShowPlannerFieldSelector.sync="canShowPlannerFieldSelector"
      :bulkCreateResources="resources => bulkCreateResources(resources)"
      :handlePath="val => handlePathChange(val)"
    />
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { getResourcePlaceholder } from './utils/pm-utils.js'
import { FContainer } from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import PlannerFieldSelector from './PlannerFieldSelector.vue'
import { isEmpty } from '@facilio/utils/validation'

const ASSIGNMENT_HASH = {
  ASSETS: 'asset',
  SPACES: 'space',
  ASSETCATEGORY: 'asset',
  SPACECATEGORY: 'space',
  SITES: 'site',
  BUILDINGS: 'building',
  FLOORS: 'floor',
}

export default {
  name: 'ResourcePlannerSelector',
  components: {
    FContainer,
    LookupWizard,
    PlannerFieldSelector,
  },

  mounted() {
    this.setSelectorField()
  },
  props: {
    planner: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      selectorField: {},
      canShowLookupWizard: false,
      canShowPlannerFieldSelector: false,
      activeModal: 'resourcesLookUpWizard',
      isBulkSelect: false,
      selectedResources: [],
      selectedResourceFilter: {},
      totalCount: 0,
      selectAllRecordProp: {
        canShow: true,
        allRecordsSelected: false,
      },
      selectedResource: { value: '', label: '' },
      permissionModuleName: 'plannedmaintenance',
    }
  },

  computed: {
    lookUpWizardTitle() {
      let { pmRecord } = this || {}
      let placeholder = getResourcePlaceholder(pmRecord, true)
      return `Select ${placeholder}`
    },
    plannerFieldSelectorTitle() {
      return 'Planner Fields'
    },

    title() {
      let { pmRecord } = this || {}
      let placeholder = getResourcePlaceholder(pmRecord, true)
      return `Select ${placeholder}`
    },
    currentPlannerFieldSelectorBreadCrumb() {
      let { allPlannerFieldSelectorBreadCrumb, activeModal } = this
      let paths = []
      for (let i = 0; i < allPlannerFieldSelectorBreadCrumb.length; i++) {
        let breadCrumb = allPlannerFieldSelectorBreadCrumb[i]
        if (breadCrumb.page === activeModal) {
          break
        } else {
          const path = {
            ...breadCrumb,
          }
          paths.push(path)
        }
      }

      return { path: paths }
    },
    allPlannerFieldSelectorBreadCrumb() {
      let { lookUpWizardTitle, plannerFieldSelectorTitle } = this
      let paths = [
        {
          name: lookUpWizardTitle,
          page: 'resourcesLookUpWizard',
        },
        {
          name: plannerFieldSelectorTitle,
          page: 'plannerFieldSelector',
        },
      ]
      return paths
    },
  },

  methods: {
    setSelectorField() {
      let { pmRecord, planner } = this || {}
      let { assignmentTypeEnum } = pmRecord
      let customParams = { plannerId: planner?.id }
      let name = ASSIGNMENT_HASH[assignmentTypeEnum] || 'site'
      let placeholder = getResourcePlaceholder(pmRecord, true)
      let sites = getProperty(this, 'pmRecord.sites')
      sites = sites.map(site => `${site.id}`)
      let filter = {
        site: { operatorId: 36, value: sites },
      }
      if (assignmentTypeEnum === 'SPACECATEGORY') {
        let spaceCategoryId = getProperty(pmRecord, 'spaceCategory.id')
        filter = {
          ...filter,
          spaceCategory: { operatorId: 36, value: [`${spaceCategoryId}`] },
        }
      } else if (assignmentTypeEnum === 'ASSETCATEGORY') {
        let assetCategoryId = getProperty(pmRecord, 'assetCategory.id')
        filter = {
          ...filter,
          category: { operatorId: 36, value: [`${assetCategoryId}`] },
        }
      }

      this.selectedResource = {
        value: name,
        label: placeholder,
      }

      this.selectorField = {
        name: 'resource',
        field: { lookupModule: { name: 'resource', displayName: placeholder } },
        actualModuleName: name,
        multiple: true,
        config: {},
        filters: filter,
        customParams,
      }
      this.canShowLookupWizard = true
    },

    setResourceSelection(data) {
      this.canShowLookupWizard = false
      let { field, isBulkSelect = false, totalCount } = data || {}
      let filters = getProperty(data, 'filters', {})
      if (isBulkSelect) {
        this.isBulkSelect = isBulkSelect
        let fieldFilters = getProperty(field, 'filters', {})
        this.selectedResourceFilter = { ...filters, ...fieldFilters }
        this.selectedResources = []
        this.totalCount = totalCount
        this.$emit('update:totalCount', totalCount)
      } else {
        let { selectedItems } = field || {}
        this.selectedResources = selectedItems
        this.isBulkSelect = false
        this.selectedResourceFilter = {}
      }
      this.$nextTick(() => {
        this.canShowPlannerFieldSelector = true
        this.activeModal = 'plannerFieldSelector'
      })
    },

    async bulkCreateResources(associations) {
      let { assignedTo, jobPlan } = associations || {}
      let {
        selectedResources,
        selectedResourceFilter,
        isBulkSelect,
        moduleName,
        pmRecord,
        planner,
        selectorField,
        permissionModuleName,
      } = this || {}
      let { id: pmId } = pmRecord || {}
      let { id: plannerId } = planner || {}

      let url = ''
      let params = {}

      if (isBulkSelect) {
        url = `v3/bulkAction/create/${permissionModuleName}`
        if (!isEmpty(selectedResourceFilter)) {
          selectedResourceFilter = encodeURIComponent(
            JSON.stringify(selectedResourceFilter)
          )
          selectedResourceFilter = url += `?filters=${selectedResourceFilter}`
        }
        let scopeModuleName = getProperty(selectorField, 'actualModuleName')
        params = {
          moduleName: scopeModuleName,
          dataModuleName: moduleName,
          data: {
            assignedTo: { id: assignedTo },
            jobPlan,
            pmId,
            planner: { id: plannerId },
          },
        }
      } else {
        selectedResources = selectedResources.map(resources => {
          let { value } = resources || {}
          return {
            resource: { id: value },
            assignedTo: { id: assignedTo },
            jobPlan,
            pmId,
            planner: { id: plannerId },
          }
        })

        url = `v3/modules/bulkCreate/${moduleName}`
        params = {
          data: { [moduleName]: selectedResources },
          moduleName,
        }
      }

      let response = await API.post(url, params)

      return response
    },

    // BreadCrumb
    setActiveModal(currModal, cancelDialog) {
      let { page } = currModal || {}
      this.activeModal = page || 'resourcesLookUpWizard'
      let { activeModal } = this
      if (activeModal === 'resourcesLookUpWizard') {
        this.canShowLookupWizard = true
      } else if (activeModal === 'plannerFieldSelector') {
        this.canShowLookupWizard = false
        this.plannedItemFormVisibility = false
        if (cancelDialog) {
          this.cancelDialog()
        }
      }
    },

    handlePathChange(path) {
      let { allPlannerFieldSelectorBreadCrumb } = this
      let { page = '' } = path
      allPlannerFieldSelectorBreadCrumb.forEach(breadCrumb => {
        if (page === breadCrumb.page) {
          this.setActiveModal(breadCrumb, false)
          //   this.activeModal = page
          //   this.canShowLookupWizard = true
          //   this.plannedItemFormVisibility = false
        }
      })
    },

    cancelDialog() {
      this.$emit('cancelDialog')
      this.$emit('onCloseResourcePlannerSelector')
    },
    reloadResourcePlanner() {
      this.$emit('reloadResourcePlanner')
    },
  },
}
</script>
