<template>
  <FContainer style="height: 100%">
    <FContainer
      v-if="isLoading"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FSpinner :size="30"> </FSpinner>
    </FContainer>
    <FContainer
      v-else-if="isEmpty(this.hazardIds)"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FEmptyState
        description="Please add at least one hazard to view the precautions."
        :vertical="true"
        size="S"
        illustration="no-entries"
      />
    </FContainer>
    <NewPrecautionList
      v-else
      :moduleName="moduleName"
      :parenModuleName="$attrs.moduleName"
      :isHazardModule="isHazardModule"
      :moduleDisplayName="moduleDisplayName"
      v-bind="$attrs"
      :key="renderKey"
      :widget="widget"
      :detail="details"
      :widgetDetails="widgetDetails"
      :config="listConfiguration"
      :options="options"
      @hazardSelected="hazardFilter"
      viewname="hidden-all"
    ></NewPrecautionList>
  </FContainer>
</template>
<script>
import NewPrecautionList from './NewPrecautionList.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  ftoast,
  FContainer,
  FSpinner,
  FEmptyState,
} from '@facilio/design-system'
import { eventBus } from '../../../../components/page-builder/event-bus'
import getProperty from 'dlv'

export default {
  props: ['widget', 'details'],
  components: { NewPrecautionList, FContainer, FSpinner, FEmptyState },
  data() {
    return {
      hazardIds: [],
      isLoading: false,
      selectedHazard: null,
      options: [],
      isEmpty,
    }
  },
  computed: {
    moduleName() {
      return 'hazardPrecaution'
    },
    moduleDisplayName() {
      return 'Precautions of'
    },
    isHazardModule() {
      return getProperty(this, 'widget.widgetParams.isHazardModule', false)
    },
    loading() {
      return this.isLoading
    },
    filters() {
      let { widget, hazardIds, selectedHazard } = this
      let { relatedList } = widget || {}
      let { field } = relatedList || {}
      let fieldName = (field || {}).name || 'hazard'
      let filterObj = {}
      if (!isEmpty(selectedHazard)) {
        hazardIds = this.getStringifyHazards(selectedHazard)
      }
      if (!isEmpty(hazardIds)) {
        filterObj[fieldName] = { operatorId: 36, value: hazardIds }
      } else {
        filterObj[fieldName] = { operatorId: 36, value: ['0'] }
      }
      return filterObj
    },
    editConfig() {
      return {
        canHideEdit: true,
      }
    },
    deleteConfig() {
      return {
        canHideDelete: true,
      }
    },
    quickCreateConfig() {
      return {
        canHideAddBtn: true,
      }
    },
    widgetDetails() {
      let { moduleDisplayName } = this
      let emptyStateText = this.$t('common.safetyPlan.no_precaution_added', {
        moduleName: moduleDisplayName,
      })

      return {
        perPage: 7,
        emptyStateText,
        emptyStateBtnList: [],
      }
    },
    listConfiguration() {
      let {
        filters,
        editConfig,
        deleteConfig,
        columnCustomConfig,
        searchAndFilterConfig,
        quickCreateConfig,
      } = this

      return {
        expand: false,
        isSelectionEnabled: false,
        isIndexEnabled: false,
        filters,
        mainfieldAction: () => {},
        canHideFooter: true,
        ...(editConfig || {}),
        ...(deleteConfig || {}),
        ...(columnCustomConfig || {}),
        ...(quickCreateConfig || {}),
        ...(searchAndFilterConfig || {}),
        canEnableMainFieldAction: false,
      }
    },
    renderKey() {
      let { selectedHazard } = this
      if (!isEmpty(selectedHazard)) {
        return selectedHazard['value']
      }
      return 1
    },
  },
  created() {
    this.fetchSafetyPlanHazards()
    this.init()
  },
  mounted() {
    eventBus.$on('refresh-sf-precautions', this.refreshList)
  },
  methods: {
    init() {
      this.hazardIds = []
      this.selectedHazard = null
      if (this.isHazardModule) {
        this.hazardIds.push(this.details.id)
        this.selectedHazard = {
          value: this.details.id,
        }
      }
    },
    async refreshList() {
      this.init()
      await this.fetchSafetyPlanHazards(true)
    },
    hazardFilter(hazard) {
      if (hazard?.value != -99) this.selectedHazard = hazard
      else this.selectedHazard = null
    },
    getStringifyHazards(selectedHazard) {
      if (!isEmpty(selectedHazard)) {
        let hazards = [`${selectedHazard['value']}`]
        return hazards
      }
      return null
    },
    getParentModuleName() {
      let pageModuleName = this.$attrs.moduleName
      let baseSpaces = ['site', 'building', 'floor', 'space']
      if (baseSpaces.includes(pageModuleName)) {
        return 'space'
      } else {
        return pageModuleName
      }
    },
    async fetchSafetyPlanHazards(force = false) {
      if (!this.isHazardModule) {
        this.isLoading = true
        let parentModuleName = this.getParentModuleName()
        let filter = {
          [`${parentModuleName}`]: {
            operatorId: 9,
            value: [`${this.details?.id}`],
          },
        }
        let params = {
          withCount: true,
          filters: JSON.stringify(filter),
          moduleName: `${parentModuleName}Hazard`,
        }
        let { list, error } = await API.fetchAll(
          `${parentModuleName}Hazard`,
          params,
          {
            force,
          }
        )
        if (!error && list?.length > 0) {
          this.hazardIds = (list || [])
            .filter(data => {
              let { hazard } = data || {}
              let { id } = hazard || {}
              return !isEmpty(id)
            })
            .map(data => {
              let { hazard } = data || {}
              let { id } = hazard || {}
              return `${id}`
            })
        } else {
          this.isLoading = false
        }
        if (!isEmpty(this.hazardIds)) {
          await this.fetchHazardsPicklist(this.hazardIds)
        }
      }
    },
    async fetchHazardsPicklist(hazardIds) {
      let filter = {
        id: {
          operatorId: 36,
          value: hazardIds,
        },
      }
      let parsedFilters = encodeURIComponent(JSON.stringify(filter))

      let { data, error } = await API.get(
        `/v3/picklist/hazard?page=1&perPage=50&filters=${parsedFilters}&viewName=hidden-all`
      )

      if (error) {
        ftoast.critical(
          error?.message || 'Error occured while fetching hazards picklist'
        )
        this.isLoading = false
      } else {
        let pickList = data.pickList
        this.options.push({ label: 'All Hazards', value: -99 })
        for (let i = 0; i < pickList.length; i++) {
          let pickListzvalue = pickList[i]
          this.options.push(pickListzvalue)
        }
      }
      this.isLoading = false
    },
  },
}
</script>
