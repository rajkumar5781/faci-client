<template>
  <FContainer height="100%">
    <FContainer
      v-if="isLoading"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer v-else height="100%" ref="safetyPlan-desc">
      <FContainer v-if="workOrderSafetyPlan">
        <portal
          :to="`action-${widget.id}-${widget.name}`"
          class="portal-alignment-ws action-ws"
        >
          <FButton @click="deleteRecord()" appearance="tertiary" size="small">
            <FIcon group="action" name="delete" size="16"></FIcon>
          </FButton>
        </portal>
      </FContainer>

      <FContainer
        v-if="workOrderSafetyPlan"
        padding="containerXxLarge"
        display="flex"
        flexDirection="column"
        gap="containerXxLarge"
      >
        <FContainer>
          <FTags appearance="simple" text="General Information" />
        </FContainer>
        <FContainer display="flex" gap="sectionLarge">
          <FContainer gap="sectionSmall">
            <FText appearance="captionMed12" color="textMain">
              {{
                $t('workorder.name', 'Name', {
                  ns: 'workorder',
                })
              }}
            </FText>
            <FContainer>
              <FText appearance="bodyReg14" color="textDescription">
                {{ getName(workOrderSafetyPlan) }}
              </FText>
            </FContainer>
          </FContainer>
          <FContainer>
            <FText appearance="captionMed12" color="textMain">
              {{
                $t('workorder.site', 'Site', {
                  ns: 'workorder',
                })
              }}
            </FText>
            <FContainer>
              <FText appearance="bodyReg14" color="textDescription">
                {{ getSiteName }}
              </FText>
            </FContainer>
          </FContainer>
        </FContainer>

        <FContainer>
          <FContainer>
            <FText appearance="captionMed12" color="textMain">{{
              $t('workorder.description', 'Description', { ns: 'workorder' })
            }}</FText>
          </FContainer>
          <FContainer>
            <FText appearance="bodyReg14" color="textDescription">
              {{ getDescription(workOrderSafetyPlan) }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer v-else display="flex" justifyContent="center" height="100%">
        <FContainer width="800px">
          <FEmptyState
            title="You have not added Safety plan"
            description="Uh-oh! It looks like there are no safety plan here yet."
            vertical
            size="S"
            illustration="no-data"
            type="wide"
            ><template #buttons>
              <FButton appearance="secondary" size="small" @click="showDialog()"
                >Add Safety Plan</FButton
              >
            </template></FEmptyState
          >
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer height="100%">
      <FModal
        title="Add Safety Plan"
        :visible.sync="showMsgPopup"
        saveText="Save"
        @ok="saveRecord()"
        @cancel="closeDialog()"
      >
        <FContainer height="300px" width="100%" display="flex" flexDirection="column">
          <FContainer padding="containerXLarge" width="100%" >
            <FTabs
              v-model="taskTab"
              appearance="button"
              :tabsList="tabsList"
              @change="fetchSafetyplan()"
            />
          </FContainer>
          <FContainer width="100%" height="100%" display="flex" justifyContent="center">
            <FContainer
              v-if="isFetchingSafetyPlan"
              height="100%"
              width="100%"
              display="flex"
              justifyContent="center"
            >
              <FSpinner :size="25"></FSpinner>
            </FContainer>

            <FContainer v-else width="100%">
              <FEmptyState
                v-if="isEmpty(safetyPlans)"
                title="You have not added Safety plan"
                description="Uh-oh! It looks like there are no safety plan here yet."
                vertical
                size="S"
                illustration="no-data"
                type="wide"
              ></FEmptyState>
              <FTable
                v-else
                :rounded="false"
                :columns="column"
                :data="safetyPlans"
                @recordSelected="selectedRecord"
                selectType="single"
              >
              </FTable>
            </FContainer>
          </FContainer>
        </FContainer>
      </FModal>
    </FContainer>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { eventBus } from '../../../../components/page-builder/event-bus'
import { getUnRelatedModuleSummary } from '../../../../utils/relatedFieldUtil'
import getProperty from 'dlv'
import {
  FContainer,
  FEmptyState,
  FSpinner,
  FTabs,
  FText,
  FTable,
  FPagination,
  FIcon,
  FDivider,
  FModal,
  fDialog,
  ftoast,
  FButton,
  FTags,
} from '@facilio/design-system'

const EQUALS_OPERATOR = 9

export default {
  props: ['moduleName', 'details', 'resizeWidget', 'widget', 'reloadSummary'],
  components: {
    FContainer,
    FEmptyState,
    FSpinner,
    FTabs,
    FText,
    FTable,
    FPagination,
    FIcon,
    FDivider,
    FModal,
    fDialog,
    ftoast,
    FButton,
    FTags,
  },
  data() {
    return {
      isLoading: false,
      isFetchingSafetyPlan: false,
      showMsgPopup: false,
      safetyPlans: [],
      selectedButton: 'all',
      selectedSafetyPlan: null,
      workOrderSafetyPlan: null,
      wizardFilterValue: null,
      clearAllFilters: false,
      moduleMetaInfo: null,
      showSearch: false,
      site: null,
      taskTab: '1',
      column: [
        { displayName: 'Name', name: 'name', id: 1, fixed: true },
        {
          displayName: 'Description',
          name: 'description',
          id: 2,
          resize: true,
          width: 200,
        },
      ],
    }
  },
  async created() {
    await this.fetchSiteDetails()
    this.fetchModuleMetaInfo()
  },
  mounted() {
    this.setWorkOrderSafetyPlan()
    this.autoResize()
  },
  computed: {
    getSiteName() {
      let { site = {} } = this
      return site ? site.name : '---'
    },
    tabsList() {
      return [
        {
          label: `All`,
          value: '1',
        },
        {
          label: `Workasset plans`,
          value: '2',
        },
      ]
    },
  },
  methods: {
    isEmpty,
    fetchSafetyplan() {
      if (this.taskTab == '1') {
        this.fetchAllSafetyPlan()
      } else {
        this.fetchAllWorkAssetSafetyPlan()
      }
    },
    selectedRecord(list) {
      this.selectedSafetyPlan = list.id
    },
    init() {
      this.workOrderSafetyPlan = null
      this.selectedSafetyPlan = null
      this.wizardFilterValue = null
      this.$set(this, 'clearAllFilters', true)
    },
    refresh(isSearchFilter) {
      if (this.selectedButton === 'all') this.fetchAllSafetyPlan()
      else if (this.selectedButton === 'all-workasset')
        this.fetchAllWorkAssetSafetyPlan(isSearchFilter)
    },
    applyFilter(filter) {
      if (!isEmpty(filter)) {
        this.wizardFilterValue = filter
        this.refresh(true)
      }
    },
    clearFilter() {
      this.wizardFilterValue = null
      this.$set(this, 'clearAllFilters', true)
      this.refresh()
    },
    fetchModuleMetaInfo() {
      API.get('/module/metafields?moduleName=' + 'safetyPlan')
        .then(response => {
          if (!isEmpty(response.data.meta))
            this.moduleMetaInfo = response.data.meta
          this.showSearch = true
        })
        .catch(() => {})
    },
    autoResize() {
      this.$nextTick(() => {
        setTimeout(() => {
          let container = this.$refs['safetyPlan-desc']
          let { workOrderSafetyPlan } = this
          if (container && workOrderSafetyPlan) {
            let height = container.scrollHeight || container.$el.scrollHeight
            height = height - 70
            let width = container.scrollWidth || container.$el.scrollWidth
            if (this.resizeWidget) {
              this.resizeWidget({ height: height, width })
            }
          }
        })
      })
    },
    async setWorkOrderSafetyPlan() {
      let { details } = this
      this.workOrderSafetyPlan = await getProperty(details, 'safetyPlan', null)
    },
    async fetchSiteDetails() {
      let { siteId } = this.details || {}
      let { site } = await getUnRelatedModuleSummary(
        'workorder',
        'site',
        siteId
      )
      this.site = site || null
    },
    showDialog() {
      this.init()
      this.showMsgPopup = true
      this.fetchAllSafetyPlan()
    },
    closeDialog() {
      this.showMsgPopup = false
      this.taskTab = '1'
    },
    getName(item) {
      const LENGTH = 20
      let name = getProperty(item, 'name', '---')

      if (name.length > LENGTH) {
        return name.slice(0, LENGTH) + '...'
      } else {
        return name
      }
    },
    getDescription(item) {
      let { showMsgPopup } = this
      const LENGTH = showMsgPopup ? 60 : 80
      let description = getProperty(item, 'description', '---')

      if (description.length > LENGTH) {
        return description.slice(0, LENGTH) + '...'
      } else {
        return description
      }
    },
    async deleteRecord() {
      let moduleDisplayName = 'Safety Plan'
      let value = await fDialog.warning({
        title: `${this.$t('custommodules.list.delete')} ${moduleDisplayName}`,
        description: 'Are you sure you want to delete this Safety Plan?',
      })
      if (value) {
        this.saveRecord()
        this.init()
      }
    },
    async saveRecord() {
      this.isLoading = true
      let { details, moduleName, selectedSafetyPlan } = this
      let { id } = details
      let response, message
      if (selectedSafetyPlan) {
        message = this.$t(
          'safety_plan_added',
          'Safety Plan added sucessfully',
          { ns: 'workorder' }
        )
        response = await API.updateRecord(moduleName, {
          id,
          data: {
            safetyPlan: {
              id: selectedSafetyPlan,
            },
          },
          params: {
            addSafetyPlanHazardPrecaution: true,
          },
        })
      } else {
        message = this.$t(
          'safety_plan_deleted',
          'Safety Plan deleted sucessfully',
          { ns: 'workorder' }
        )
        response = await API.updateRecord(moduleName, {
          id,
          data: {
            safetyPlan: null,
          },
          params: {
            addSafetyPlanHazardPrecaution: false,
          },
        })
      }
      let { error } = response
      if (!error) {
        ftoast.success(message)
        this.init()
        this.reloadSummary()
      } else {
        ftoast.critical(error.message || 'Error Occured')
      }
      this.isLoading = false
      this.closeDialog()
    },
    async fetchAllSafetyPlan(isSearchFilter) {
      let { wizardFilterValue, details = {} } = this
      if (!isSearchFilter) this.selectedButton = 'all'
      this.isFetchingSafetyPlan = true
      let params = {
        withCount: true,
      }
      let filter = {
        siteId: {
          operatorId: 9,
          value: [`${details.siteId}`],
        },
      }
      if (!isEmpty(wizardFilterValue)) {
        wizardFilterValue = { ...wizardFilterValue, ...filter }
        params['filters'] = JSON.stringify(wizardFilterValue)
      } else params['filters'] = JSON.stringify(filter)

      let { list, error } = await API.fetchAll('safetyPlan', params, {
        force: true,
      })
      if (!error) {
        if (isSearchFilter) return list
        this.safetyPlans = list
      }
      this.isFetchingSafetyPlan = false
    },

    async fetchAllWorkAssetSafetyPlan(isSearchFilter) {
      this.selectedButton = 'all-workasset'
      this.isFetchingSafetyPlan = true
      let { details } = this
      let { resource = {} } = details
      let { resourceTypeEnum, id } = resource
      let searchFilter = {}
      if (isEmpty(resource) || id < 0) {
        this.safetyPlans = []
      } else {
        if (isSearchFilter) {
          let safetyPlans = await this.fetchAllSafetyPlan(isSearchFilter)
          let safetyPlanIds = safetyPlans.map(plan => {
            return plan.id + ''
          })
          searchFilter = {
            safetyPlan: {
              operatorId: EQUALS_OPERATOR,
              value: safetyPlanIds,
            },
          }
        }
        let modulePlaceholder
        if (resourceTypeEnum === 'SPACE' && id > 0) {
          modulePlaceholder = 'space'
        } else if (resourceTypeEnum === 'ASSET' && id > 0) {
          modulePlaceholder = 'asset'
        }
        let filter = {
          ...searchFilter,
        }
        filter[`${modulePlaceholder}`] = {
          operatorId: EQUALS_OPERATOR,
          value: [`${id}`],
        }
        let params = {
          withCount: true,
          filters: JSON.stringify(filter),
        }

        let { list, error } = await API.fetchAll('workAsset', params, {
          force: true,
        })
        if (!error) {
          let safetyPlans = list
            .filter(resource => !resource.safetyPlan?.deleted)
            .map(resource => resource.safetyPlan)
          this.safetyPlans = safetyPlans
        }
      }
      this.isFetchingSafetyPlan = false
    },
  },
}
</script>
