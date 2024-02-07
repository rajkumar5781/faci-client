<template>
  <FContainer>
    <FModal
      :visible="canShowResourcePlannerDialog"
      :title="dialogTitle"
      size="L"
      :confirmLoading="isSaving"
      @ok="handleOk"
      @cancel="cancelDialog"
      @path="handlePathChange"
    >
      <!-- Modal Content -->
      <FContainer display="flex" flexDirection="column" minHeight="491px">
        <!-- Resource Planner List Items -->
        <FContainer
          v-if="isLoading"
          height="500px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FSpinner :size="24"></FSpinner>
        </FContainer>
        <FContainer v-else class="resourcePlannerScroll">
          <FContainer
            v-if="totalCount <= 0"
            display="flex"
            justifyContent="center"
          >
            <FEmptyState
              :title="emptyStateTitle"
              :description="emptyStateDescription"
              vertical
              size="M"
              illustration="no-entries"
              type="narrow"
              :style="`height: 480px;overflow: scroll`"
            />
          </FContainer>
          <FTable
            v-else
            :columns="columns"
            :data="tableData"
            :striped="striped"
            :readOnly="readOnly"
            :hideBorder="hideBorder"
            selectType="bulk"
            :rounded="rounded"
            :accordionType="accordionType"
            @recordSelected="handleSelection"
            :selectedList="currentPageSelectedListItems"
            @onCellClick="cellClicked"
            @rowMouseOver="rowMouseOverHandler"
            :style="`height: 480px;overflow: scroll`"
          >
            <template #[`cell.resource`]="{ row }">
              <FText appearance="bodyReg14" color="textMain">
                {{ row?.resource?.name }}
              </FText>
            </template>

            <template #[`cell.jobPlan`]="{ row }">
              <FContainer>
                <FText
                  v-if="row?.jobPlan?.name"
                  appearance="bodyReg14"
                  color="textMain"
                >
                  {{ row?.jobPlan?.name }}
                </FText>
                <FText v-else appearance="bodyReg14" color="textCaption">
                  {{ $t('pm_creation.select_job_plan', { ns: 'maintenance' }) }}
                </FText>
              </FContainer>
            </template>

            <template #[`cell.assignedTo`]="{ row }">
              <FContainer>
                <FText
                  v-if="row?.assignedTo?.name"
                  appearance="bodyReg14"
                  color="textMain"
                >
                  {{ row?.assignedTo?.name }}
                </FText>
                <FText v-else appearance="bodyReg14" color="textCaption">
                  {{ $t('pm_creation.select_assignee', { ns: 'maintenance' }) }}
                </FText>
              </FContainer>
            </template>
          </FTable>
        </FContainer>

        <!-- Bulk Toolbar custom implementation -->
        <FContainer
          v-if="atLeastOneItemSelected"
          backgroundColor="backgroundContainerHalftone"
          backdropFilter="blur(16px)"
          height="56px"
          position="absolute"
          bottom="55px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          zIndex="999999"
          columnGap="containerXLarge"
          padding="containerLarge sectionSmall containerLarge sectionSmall"
        >
          <FContainer display="flex" alignItems="center">
            <FContainer
              display="flex"
              alignItems="center"
              justifyContent="left"
              columnGap="containerLarge"
            >
              <FContainer
                height="32px"
                minWidth="32px"
                backgroundColor="backgroundPrimaryDefault"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="medium"
                color="textInverseDefault"
                padding="containerLarge"
              >
                <FText>{{ selectedItemCountStr }}</FText>
              </FContainer>
              <FContainer>
                <FText appearance="headingMed14">
                  {{ $t('pm_creation.items_selected', { ns: 'maintenance' }) }}
                </FText>
              </FContainer>
            </FContainer>
            <FDivider marginLeft="containerLarge" height="24px" />
            <FContainer marginLeft="containerLarge">
              <FCheckbox
                v-model="isBulkSelectRecordsEnabled"
                @change="selectAllRecords"
              >
                <FText>{{ selectAllRecordsStr }}</FText>
              </FCheckbox>
            </FContainer>
          </FContainer>

          <FContainer
            backgroundColor="backgroundFrost"
            backdropFilter="blur(16px)"
          >
            <FShimmer
              v-if="isDeleting || isJobPlanAssigning || isAssigning"
              :height="32"
              :width="365"
            />
            <FButtonGroup v-else>
              <template #buttons>
                <FButton
                  appearance="secondary"
                  size="medium"
                  iconGroup="action"
                  iconName="delete"
                  :iconButton="false"
                  iconPosition="prefix"
                  @click="() => onClickDeleteResourcePlanners()"
                >
                  {{ $t('pm_creation.delete', { ns: 'maintenance' }) }}
                </FButton>

                <FButton
                  appearance="secondary"
                  size="medium"
                  iconGroup="modules"
                  iconName="job-plan"
                  :iconButton="false"
                  iconPosition="prefix"
                  @click="() => onClickUpdateJobPlan()"
                >
                  {{ $t('pm_creation.update_job_plan', { ns: 'maintenance' }) }}
                </FButton>

                <FPopover
                  trigger="clickToOpen"
                  :showArrow="true"
                  placement="top-end"
                  @input="userListPopOverListener"
                  @show="onShowUsersListPopOver"
                  @hide="onHideUsersListPopOver"
                >
                  <template slot="content">
                    <UsersListPopOver
                      v-if="isUsersListPopOverVisible"
                      :menuListItems="userOptions"
                      :isLoading="isLoadingUsers"
                      @onDropDownSelectedValueChange="updateAssignee"
                      @onSearch="onSearchAssignee"
                    />
                  </template>
                  <FButton
                    appearance="secondary"
                    size="medium"
                    iconGroup="webtabs"
                    iconName="vendor"
                    :iconButton="false"
                    iconPosition="prefix"
                    :disabled="isUsersListPopOverVisible"
                  >
                    {{
                      $t('pm_creation.update_assignee', { ns: 'maintenance' })
                    }}
                  </FButton>
                </FPopover>
              </template>
            </FButtonGroup>
          </FContainer>
        </FContainer>
      </FContainer>

      <!-- Modal Footer -->
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          :justifyContent="totalCount > perPage ? 'space-between' : 'flex-end'"
        >
          <FShimmer v-if="isLoading" :height="25" :width="150" />
          <FPagination
            v-else-if="!isLoading && totalCount > perPage"
            :total="totalCount"
            :pageCount="pageCount"
            :currentPage.sync="currentPage"
            :pageSize="perPage"
            :disabled="disabled"
            @nextClick="nextClicked"
            @prevClick="prevClicked"
            @currentChange="currentChanged"
          />

          <FContainer padding="containerXxLarge">
            <!-- Removing close button
            <FButton
              v-if="totalCount > 0"
              :disabled="isLoading"
              @click="onClickSaveButton"
              >{{ $t('pm_creation.close', { ns: 'maintenance' }) }}</FButton
            >
            <FButton
              v-if="totalCount == 0"
              appearance="secondary"
              @click="cancelDialog"
              >Close</FButton
            > 
             -->
          </FContainer>
        </FContainer>
      </template>
    </FModal>

    <!-- LookUp Wizard to show JobPlan-->
    <LookupWizard
      :field.sync="selectedLookupField"
      parentModuleName="pmResourcePlanner"
      :canShowLookupWizard.sync="canShowLookupWizard"
      :breadCrumbProps="currentBreadCrumbs"
      @closeWizard="cancelLookUpWizard"
      @setLookupFieldValue="setLookupFieldValue"
      @path="handlePathChange"
    />
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FSpinner,
  FModal,
  FPagination,
  FTable,
  FButton,
  FShimmer,
  FText,
  FBulkToolbar,
  FDivider,
  FCheckbox,
  FButtonGroup,
  FEmptyState,
  FPopover,
  ftoast,
} from '@facilio/design-system'
import UsersListPopOver from './UsersListPopOver.vue'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'
import { isEmpty } from '@facilio/utils/validation'
import { LookupWizard } from '@facilio/ui/new-forms'
import { JOB_PLAN_SCOPE, getCategoryFilter } from '../util/pm-utils.js'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { getApp } from '@facilio/router'

export default {
  name: 'ResourcePlannerDialog',
  components: {
    FContainer,
    FSpinner,
    FModal,
    FPagination,
    FTable,
    FButton,
    FShimmer,
    FText,
    FBulkToolbar,
    FDivider,
    FCheckbox,
    FButtonGroup,
    FEmptyState,
    LookupWizard,
    UsersListPopOver,
    FPopover,
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
    resourcesCount: {
      type: Number,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    dialogTitle: {
      type: String,
      required: true,
    },
    resourcePlaceholder: {
      type: String,
      required: true,
    },
    canShowResourcePlannerDialog: {
      type: Boolean,
      required: true,
    },
    selectAllRecordProp: {
      type: Object,
      // default: () => {
      //   return {
      //     canShow: false,
      //     allRecordsSelected: false,
      //   }
      // },
    },
  },

  data() {
    return {
      //table data fields
      striped: false,
      readOnly: false,
      hideBorder: true,
      rounded: false,
      accordionType: '',

      // pagination data fields
      perPage: 10,
      totalCount: 0,
      currentPage: 1,
      disabled: false,

      // Loading states
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isJobPlanAssigning: false,
      isAssigning: false,
      isLoadingUsers: false,

      //Visibility states
      isBulkSelectRecordsEnabled: false,
      canShowLookupWizard: false,
      isUsersListPopOverVisible: false,

      // Data
      resourcePlannerList: [], // holds all the resources in the current page
      selectedListItems: [], // holds all the selected item across pages
      tableData: [], // holds all the resources in the current page, in tableData format
      selectedLookupField: {},
      activeModal: 'resourcePlannerWizard',
      userOptions: [],
    }
  },

  watch: {
    currentPage() {
      this.loadResources()
    },
    selectedPlannerId() {
      this.loadResources()
    },
    selectedListItems(newVal) {
      if (!isEmpty(newVal)) {
        let selectedCount = newVal.length
        let {
          resourcePlannerList = [],
          totalCount,
          isBulkSelectRecordsEnabled,
        } = this
        if (
          isBulkSelectRecordsEnabled &&
          selectedCount !== resourcePlannerList.length
        )
          this.isBulkSelectRecordsEnabled = false
      } else {
        this.selectAllTotalRecords = false
      }
    },
  },

  computed: {
    columns() {
      let { resourcePlaceholder = 'Resources' } = this
      let columns = [
        {
          displayName: resourcePlaceholder,
          name: 'resource',
          id: 1,
          resize: true,
          width: 200,
          alignment: 'left',
          type: 'link',
        },
        {
          displayName: this.$t('pm.job_plan', { ns: 'maintenance' }),
          name: 'jobPlan',
          id: 2,
          resize: true,
          width: 200,
          alignment: 'left',
          type: 'link',
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

    selectedPlannerId() {
      let { planner } = this
      let { id } = planner || {}
      return id
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.perPage)
    },

    currentPageSelectedListItems() {
      let { selectedListItems, resourcePlannerList } = this || {}
      let moduleListIds = resourcePlannerList.map(item => item.id)
      selectedListItems = (selectedListItems || []).filter(item =>
        moduleListIds.includes(item.id)
      )
      return selectedListItems
    },
    selectedResourcePlannerIds() {
      let { selectedListItems = [] } = this || {}
      return selectedListItems.map(item => {
        return (item || {}).id
      })
    },

    selectedCount() {
      let { selectedListItems = [] } = this
      return selectedListItems.length
    },
    selectAllRecordsStr() {
      let { totalCount } = this
      return `Select all ${totalCount} Records`
    },
    selectedItemCountStr() {
      let { selectedCount, totalCount, isBulkSelectRecordsEnabled } = this
      if (isBulkSelectRecordsEnabled)
        return totalCount < 10 ? `0${totalCount}` : totalCount
      else return selectedCount < 10 ? `0${selectedCount}` : selectedCount
    },
    showSelectAllRecordFooter() {
      // return this.selectAllRecordProp?.canShow
      return true
    },
    bulkActionFilter() {
      let { planner } = this || {}
      let { id } = planner || {}
      return { planner: { operatorId: 36, value: [`${id}`] } }
    },
    atLeastOneItemSelected() {
      let { selectedListItems = [] } = this
      return selectedListItems.length > 0
    },

    emptyStateTitle() {
      let { resourcePlaceholder } = this
      return `${this.$t('pm_creation.resource_planners_empty_state_title_1', {
        ns: 'maintenance',
      })} ${resourcePlaceholder} ${this.$t(
        'pm_creation.resource_planners_empty_state_title_2',
        {
          ns: 'maintenance',
        }
      )}`
    },
    emptyStateDescription() {
      let { resourcePlaceholder } = this
      return `${this.$t(
        'pm_creation.resource_planners_empty_state_description_1',
        {
          ns: 'maintenance',
        }
      )} ${resourcePlaceholder} ${this.$t(
        'pm_creation.resource_planners_empty_state_description_2',
        {
          ns: 'maintenance',
        }
      )}`
    },

    lookupFields() {
      let { pmRecord } = this
      let { assignmentTypeEnum } = pmRecord || {}
      let scopeCategory = JOB_PLAN_SCOPE[assignmentTypeEnum]
      let fields = {
        user: {
          isDataLoading: false,
          options: [],
          lookupModuleName: 'users',
          field: {
            lookupModule: {
              name: 'users',
              displayName: 'Users',
            },
          },
          multiple: false,
          filters: {
            user: {
              operatorId: 15,
              value: ['true'],
            },
          },
        },
        jobplan: {
          name: 'jobPlan',
          isDataLoading: false,
          options: [],
          config: {},
          lookupModuleName: 'jobplan',
          moduleName: 'pmResourcePlanner',
          field: {
            lookupModule: {
              name: 'jobplan',
              displayName: 'Job Plan',
            },
          },
          filters: {
            jobPlanCategory: { operatorId: 54, value: [`${scopeCategory}`] },
            jpStatus: { operatorId: 54, value: ['2'] },
            ...getCategoryFilter(pmRecord, scopeCategory),
          },
          multiple: false,
        },
      }
      return fields
    },

    allBreadCrumbs() {
      let { dialogTitle } = this
      let paths = [
        {
          name: dialogTitle,
          page: 'resourcePlannerWizard',
        },
        {
          name: 'Update JobPlan',
          page: 'jobPlanLookUpWizard',
        },
      ]
      return paths
    },
    currentBreadCrumbs() {
      let { allBreadCrumbs, activeModal } = this
      let paths = []
      for (let i = 0; i < allBreadCrumbs.length; i++) {
        let breadCrumb = allBreadCrumbs[i]
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
  },

  created() {
    this.init()
    this.userSearch = debounce(this.loadUsers, 500)
  },

  methods: {
    // Helper method used to initialize objects required
    async init() {
      this.loadResources()
      let { selectAllRecordProp } = this
      if (!isEmpty(selectAllRecordProp)) {
        let { allRecordsSelected } = selectAllRecordProp || {}
        this.isBulkSelectRecordsEnabled = allRecordsSelected
      }
    },

    /**
     * Methods to make API calls
     */

    // loadResources function loads the resources of the selected Planner for the
    //  * currentPage, after which it serializes the data for table.
    async loadResources() {
      let {
        moduleName,
        currentPage,
        selectedPlannerId,
        perPage,
        selectAllRecordProp,
      } = this || {}
      this.isLoading = true
      let params = {
        page: currentPage,
        perPage: perPage,
        withCount: true,
      }
      let relatedFieldName = getRelatedFieldName('pmPlanner', moduleName)
      let relatedConfig = {
        moduleName: 'pmPlanner',
        id: selectedPlannerId,
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
        if (this.isBulkSelectRecordsEnabled) {
          this.selectAllRecords(this.isBulkSelectRecordsEnabled)
        }
      }
      this.isLoading = false
    },

    // makes patch API call to update the records in bulk
    async updateRecord(params, filters) {
      let { moduleName } = this || {}
      let url = `v3/bulkActionPatch/${moduleName}?filters=${filters}`
      let data = {
        moduleName,
        data: {
          [moduleName]: params,
        },
      }
      let response = await API.patch(url, data)
      return response
    },

    // makes delete API call to delete the records in bulk
    async deleteRecord(filters) {
      let { moduleName } = this || {}
      let url = `v3/bulkActionDelete/${moduleName}?filters=${filters}`
      let response = await API.delete(url, {})
      return response
    },

    // makes create API call to create the records in bulk - not in use
    async createRecord(params, filters) {
      let url = `v3/bulkAction/create?filters=${filters}`
      let response = await API.post(url, params)
      return response
    },

    // Function bulk assigns the Resource planners to the JobPlan with ID @param ID
    async updateJobPlans(id) {
      this.isJobPlanAssigning = true
      let {
        moduleName,
        selectedResourcePlannerIds,
        isBulkSelectRecordsEnabled,
        resourcePlaceholder,
      } = this || {}
      let successMessage =
        resourcePlaceholder +
        this.$t('pm_creation.resource_updated_message_suffix', {
          ns: 'maintenance',
        })
      let response = {}
      if (isBulkSelectRecordsEnabled) {
        let { bulkActionFilter } = this || {}
        let params = {
          jobPlan: { id },
        }
        let filters = encodeURIComponent(JSON.stringify(bulkActionFilter))
        response = this.updateRecord(params, filters)
        this.handleNotification(response, successMessage)
      } else {
        let params = {
          moduleName,
          data: {
            [moduleName]: selectedResourcePlannerIds.map(selectedId => {
              return { id: selectedId, jobPlan: { id } }
            }),
          },
        }
        response = await API.patch(`v3/modules/bulkPatch/${moduleName}`, params)
        this.handleNotification(response, successMessage)
      }
      let { error } = response || {}
      if (!error) {
        this.resetData()
        // this.loadResources()
        this.$emit('reloadResourcesForDialog')
      }
      this.isJobPlanAssigning = false
    },

    // Function bulk assigns the Resource planners to the user with ID @param ID
    async setBulkAssignedTo(id) {
      this.isAssigning = true
      let {
        moduleName,
        selectedResourcePlannerIds,
        isBulkSelectRecordsEnabled,
        resourcePlaceholder,
      } = this || {}
      let successMessage = `${resourcePlaceholder} ${this.$t(
        'pm_creation.details_have_saved_successfully',
        {
          ns: 'maintenance',
        }
      )}`
      let response = {}
      if (isBulkSelectRecordsEnabled) {
        let { bulkActionFilter } = this || {}
        let params = {
          assignedTo: { id },
        }
        let filters = encodeURIComponent(JSON.stringify(bulkActionFilter))
        response = this.updateRecord(params, filters)
        this.handleNotification(response, successMessage)
      } else {
        let params = {
          moduleName,
          data: {
            [moduleName]: selectedResourcePlannerIds.map(selectedId => {
              return { id: selectedId, assignedTo: { id } }
            }),
          },
        }
        response = await API.patch(`v3/modules/bulkPatch/${moduleName}`, params)
        this.handleNotification(response, successMessage)
      }

      let { error } = response || {}
      if (!error) {
        this.resetData()
        // this.loadResources()
        this.$emit('reloadResourcesForDialog')
      }
      this.isAssigning = false
    },

    // Function loads the users, searches users based on @param search
    async loadUsers(search) {
      this.isLoadingUsers = true
      let { id: appId } = getApp()
      let params = { appId, page: 1, perPage: 50, inviteAcceptStatus: true }

      if (!isEmpty(search)) {
        params = { ...params, search }
      }

      let { error, data } = await API.get(`/v2/application/users/list`, params)
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        let { users } = data || {}
        this.userOptions = (users || []).map(user => {
          let { name, id } = user || {}
          return {
            label: name,
            value: String(id),
          }
        })
      }
      this.isLoadingUsers = false
    },

    /**
     * Helper methods
     */

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
          id: resourcePlanner.id,
        }

        if (!isEmpty(resourcePlanner?.resource)) {
          data = {
            ...data,
            resource: resourceSupplement[`${resourcePlanner?.resource?.id}`],
          }
        }
        if (!isEmpty(resourcePlanner?.assignedTo)) {
          data = {
            ...data,
            assignedTo:
              assignedToSupplement[`${resourcePlanner?.assignedTo?.id}`],
          }
        }
        if (!isEmpty(resourcePlanner?.jobPlan)) {
          data = {
            ...data,
            jobPlan: jobPlanSupplement[`${resourcePlanner?.jobPlan?.id}`],
          }
        }

        tableData.push(data)
      })
      return tableData
    },

    /* 
      getNonCurrentList() takes in the globally selected items, and returns selected lists
      from currently selected items.
    */
    getNonCurrentList(selectedListItems) {
      let { resourcePlannerList = [] } = this || {}
      let currentResourcePlannerIds = resourcePlannerList.map(item => item.id)
      let currentResourcePlannerList = selectedListItems.filter(
        item => !currentResourcePlannerIds.includes(item.id)
      )

      return currentResourcePlannerList
    },

    // Helper function to show Toast Message
    handleNotification(response, successMessage) {
      let { error } = response || {}
      if (!isEmpty(error)) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        ftoast.success(successMessage)
        this.loadResources()
        // this.showBulkActionBar = false
      }
    },

    /**
     * Callback methods
     */

    handleOk() {},

    // Helper method to close the ResourcePlannerDialog
    cancelDialog() {
      this.$emit('update:canShowResourcePlannerDialog', false)
    },

    // Helper function to close the LookUp Wizard
    cancelLookUpWizard() {
      this.canShowLookupWizard = false
    },

    /* Triggers when selection is done in FTable rows are selected
       updates the globally saved selected items */
    handleSelection(selection) {
      let nonCurrentItems = this.getNonCurrentList(this.selectedListItems)
      let currentItems = selection || []

      // console.log(currentItems, nonCurrentItems)

      let selectionList = [...nonCurrentItems, ...currentItems]
      this.selectedListItems = selectionList
    },

    // Function used to select all the current items if bulkSelect option is chosen
    selectAllRecords(isBulkSelect) {
      let { tableData } = this
      if (isBulkSelect) {
        this.selectedListItems = [...tableData]
      } else {
        this.selectedListItems = []
      }
    },

    // Function used to reset the data
    resetData() {
      this.selectedListItems = []
      this.isBulkSelectRecordsEnabled = false
      this.isUsersListPopOverVisible = false
    },

    // Function to show the LookUpWizard
    showLookupWizard(field) {
      let { lookupFields } = this
      let selectedLookupField = cloneDeep(lookupFields[`${field}`] || {})

      this.$set(this, 'selectedLookupField', selectedLookupField)
      this.$set(this, 'canShowLookupWizard', true)
    },

    // Function to set the values selected in LookUpWizard
    setLookupFieldValue(props) {
      let { field } = props
      let { selectedItems = [], lookupModuleName } = field
      let selectedItemIds = []

      if (!isEmpty(selectedItems)) {
        selectedItemIds = (selectedItems || []).map(item => {
          return item.value
        })
      }
      let selectedValue = selectedItemIds[0]
      if (lookupModuleName === 'jobplan') {
        this.updateJobPlans(selectedValue)
      } else {
        this.setBulkAssignedTo(selectedValue)
      }
      this.selectedLookupField = null
      this.canShowLookupWizard = false
    },

    updateAssignee(selectedUser) {
      if (!isEmpty(selectedUser) && selectedUser.length == 1) {
        let { value } = selectedUser[0]
        // convert back the value to numerical
        this.setBulkAssignedTo(parseInt(value))
      }
    },

    /**
     * onClickListeners
     */

    // Triggers when Modal save button is clicked
    onClickSaveButton() {
      this.cancelDialog()
    },

    // Triggers when bulk action Delete button is clicked
    async onClickDeleteResourcePlanners() {
      this.isDeleting = true
      let {
        selectedResourcePlannerIds,
        moduleName,
        isBulkSelectRecordsEnabled,
        resourcePlaceholder,
      } = this || {}
      let successMessage = `${resourcePlaceholder} ${this.$t(
        'pm_creation.has_been_deleted_successfully',
        {
          ns: 'maintenance',
        }
      )} `
      let response = {}
      if (isBulkSelectRecordsEnabled) {
        let { bulkActionFilter } = this || {}
        let filters = encodeURIComponent(JSON.stringify(bulkActionFilter))
        response = await this.deleteRecord(filters)
      } else {
        response = await API.deleteRecord(moduleName, [
          ...selectedResourcePlannerIds,
        ])
      }

      let { error } = response || {}
      if (!error) {
        this.resetData()
        // this.loadResources()
        this.$emit('reloadResourcesForDialog')
      }
      this.handleNotification(response, successMessage)
      this.isDeleting = false
    },

    // Triggers when bulk action Update JobPlan button is clicked
    onClickUpdateJobPlan() {
      this.showLookupWizard('jobplan')
      this.handlePathChange({ page: 'jobPlanLookUpWizard' })
    },

    // Triggers when popover is opened and closed,
    // this function updates the isUsersListPopOverVisible flag used to disable the Assignee button
    userListPopOverListener(val) {
      this.isUsersListPopOverVisible = val ?? false
    },

    // Triggers when Assignee is selected in UserListPopOver
    onSearchAssignee(searchText) {
      this.loadUsers(searchText)
    },

    // Triggers when PopOver closes
    onHideUsersListPopOver() {
      // console.log('onHideUsersListPopOver')
    },

    // Triggers when PopOver opens
    onShowUsersListPopOver() {
      this.loadUsers('')
    },

    /**
     * Pagination methods
     */
    nextClicked(event) {},
    prevClicked(event) {},
    currentChanged(event) {},
    rowMouseOverHandler(event) {},
    cellClicked(event) {},

    /**
     * BreadCrumb
     */

    setActiveModal(currModal, cancelDialog) {
      let { page } = currModal || {}
      this.activeModal = page || 'resourcePlannerWizard'
      let { activeModal } = this
      if (activeModal === 'resourcePlannerWizard') {
        this.$emit('update:canShowResourcePlannerDialog', true)
        this.canShowLookupWizard = false
      } else if (activeModal === 'jobPlanLookUpWizard') {
        this.canShowLookupWizard = true
        // this.$emit('update:canShowResourcePlannerDialog', false)
        if (cancelDialog) {
          this.cancelDialog()
        }
      }
    },

    handlePathChange(path) {
      let { allBreadCrumbs } = this
      const { page = '' } = path
      allBreadCrumbs.forEach(breadCrumb => {
        if (page === breadCrumb.page) {
          this.setActiveModal(breadCrumb, false)
        }
      })
    },
  },
}
</script>
