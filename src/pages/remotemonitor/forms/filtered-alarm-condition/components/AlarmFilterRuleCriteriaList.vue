<template>
  <FContainer
    v-if="loading || alarmTypeLoading"
    height="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FSpinner :size="40" />
  </FContainer>
  <FContainer
    v-else-if="canShowEmptyState"
    height="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FEmptyState
      :title="
        $t('alarm_filter_rule.empty_state_header', { ns: 'remote_monitor' })
      "
      :description="
        $t('alarm_filter_rule.empty_state_message', { ns: 'remote_monitor' })
      "
      illustration="no-result"
      :vertical="true"
      class="!w-full"
    >
    </FEmptyState>
  </FContainer>
  <FContainer v-else position="relative" height="100%">
    <template v-if="isNormalCriteriaType">
      <FContainer
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding="containerXLarge containerXxLarge"
        height="40px"
      >
        <!-- page details and bulk button  -->
        <FContainer
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <FText marginRight="containerXLarge" fontWeight="bold">
            {{ criteriaListPageCountDetails }}
          </FText>
          <FDivider height="25px" backgroundColor="backgroundMidgroundDark" />
          <FContainer
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginLeft="containerXLarge"
          >
            <FCheckbox v-model="selectAll"> </FCheckbox>
            <FText>{{ $t('actions.select_all') }} </FText>
          </FContainer>
        </FContainer>
        <!-- pagination  -->
        <FPagination
          :pageSize="perPage"
          :currentPage="currentPage"
          :total="totalCount"
          @nextClick="updateCurrentPage"
          @prevClick="updateCurrentPage"
          @currentChange="updateCurrentPage"
        />
      </FContainer>
      <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
    </template>

    <FContainer height="calc(100% - 40px)" overflow="scroll">
      <AlarmFilterRuleCriteria
        v-if="isNormalCriteriaType"
        v-for="(criteriaObj, index) in filterRuleCriteriaList"
        :ref="`alarm-filter-rule-criteria-${index}`"
        :criteria="criteriaObj"
        :ruleType="ruleType"
        :alarmApproach="alarmApproach"
        :index="index"
        :criteriaTypeOptionsList="criteriaTypeOptionsList"
        @updateCriteria="setCriteria"
        @recordSelectionUpdate="updateSelectedRecordCount"
        :key="`alarm-filter-rule-criteria-${index}`"
      />
      <RollupAlarmCriteria
        v-if="isRollupOrSiteOffline"
        :ref="`rollup-criteria-${index}`"
        v-for="(criteriaObj, index) in filterRuleCriteriaList"
        :index="index"
        :criteria="criteriaObj"
        :ruleType="ruleType"
        @updateCriteria="setCriteria"
        @updateRelationMapping="setCriteria"
        @resetCriteria="setCriteria"
        @recordSelectionUpdate="updateSelectedRecordCount"
        :key="`rollup-criteria-${index}`"
      />
    </FContainer>
    <FContainer
      v-if="canShowBulkToolBar"
      position="absolute"
      bottom="15px"
      left="calc(50% - 160px)"
      right="calc(50% - 160px)"
    >
      <FBulkToolbar :recordCount="selectedRecordCount" @close="resetSelectAll">
        <FButton
          size="small"
          appearance="secondary"
          @click="updateBulkUpdateDialogVisibility(true)"
        >
          {{ $t('apply_criteria', { ns: 'remote_monitor' }) }}
        </FButton>
      </FBulkToolbar>
    </FContainer>
    <FilterCriteriaBulkUpdateDialog
      v-if="showBulkUpdateDialog"
      :criteriaTypeOptionsList="criteriaTypeOptionsList"
      :alarmApproach="alarmApproach"
      :ruleType="ruleType"
      @closeBulkUpdateDialog="updateBulkUpdateDialogVisibility(false)"
      @bulkUpdateCriteria="updateCriteriaForSelectedRecords"
    />
  </FContainer>
</template>
<script>
import {
  FContainer,
  FCheckbox,
  FText,
  FDivider,
  FPagination,
  FBulkToolbar,
  FButton,
  FEmptyState,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import view from '../../../../../store/views.js'
import AlarmFilterRuleCriteria from './AlarmFilterRuleCriteria.vue'
import RollupAlarmCriteria from './RollupAlarmCriteria.vue'
import FilterCriteriaBulkUpdateDialog from './FilterCriteriaBulkUpdateDialog.vue'
import rmHelpers from '../utils/rmHelpers'
import getProperty from 'dlv'

export default {
  name: 'AlarmFilterRuleCriteriaList',
  components: {
    FContainer,
    FCheckbox,
    FText,
    FDivider,
    FPagination,
    AlarmFilterRuleCriteria,
    RollupAlarmCriteria,
    FBulkToolbar,
    FButton,
    FilterCriteriaBulkUpdateDialog,
    FEmptyState,
    FSpinner,
  },
  props: [
    'isNew',
    'criteriaTypeOptionsList',
    'alarmType',
    'clientId',
    'alarmApproach',
    'ruleType',
    'criteriaList',
    'alarmTypeLoading',
  ],
  data() {
    return {
      currentPage: 1,
      perPage: 10,
      totalCount: 0,
      controllerTypesAsMap: {},
      filterRuleCriteriaList: [],
      selectCriteria: false,
      selectAll: false,
      loading: false,
      selectedRecordCount: 0,
      showBulkUpdateDialog: false,
      visitedPageRecordMap: {},
    }
  },
  computed: {
    criteriaListPageCountDetails() {
      let { currentPage, perPage, totalCount } = this
      if (totalCount > 0) {
        let endRecord = currentPage * perPage
        let startRecord = endRecord - (perPage - 1)
        if (endRecord > totalCount) {
          endRecord = totalCount
        }
        return `${startRecord} - ${endRecord} of ${totalCount}`
      }
      return 'No Records'
    },
    canShowEmptyState() {
      let {
        alarmType,
        ruleType,
        filterRuleCriteriaList,
        isNormalCriteriaType,
        isRollupOrSiteOffline,
      } = this
      if (isEmpty(ruleType)) {
        return true
      } else if (isNormalCriteriaType) {
        return isEmpty(alarmType) || isEmpty(filterRuleCriteriaList)
      } else if (isRollupOrSiteOffline) {
        return isEmpty(filterRuleCriteriaList)
      }
    },
    canShowBulkToolBar() {
      let { selectedRecordCount } = this
      return selectedRecordCount > 0
    },
    isNormalCriteriaType() {
      let { ruleType } = this
      return ['INDIVIDUAL', 'CONTROLLER_OFFLINE'].includes(ruleType)
    },
    isControllerOfflineType() {
      let { ruleType } = this
      return ruleType === 'CONTROLLER_OFFLINE'
    },
    isSiteOfflineRuleType() {
      let { ruleType } = this
      return ruleType === 'SITE_OFFLINE'
    },
    isRollupRuleType() {
      let { ruleType } = this
      return ruleType === 'ROLL_UP'
    },
    isRollupOrSiteOffline() {
      let { isRollupRuleType, isSiteOfflineRuleType } = this
      return isRollupRuleType || isSiteOfflineRuleType
    },
  },
  watch: {
    alarmType(newVal, oldVal) {
      if (newVal != oldVal) {
        this.basicRuleDetailsChangeHandler()
      }
    },
    clientId(newVal, oldVal) {
      if (newVal != oldVal) {
        this.basicRuleDetailsChangeHandler()
      }
    },
    alarmApproach(newVal, oldVal) {
      if (newVal != oldVal) {
        this.basicRuleDetailsChangeHandler()
      }
    },
    ruleType(newVal, oldVal) {
      if (newVal != oldVal) {
        this.filterRuleCriteriaList = []
        if (newVal == 'INDIVIDUAL') {
          this.loadAlarmDefinitionTagging()
        } else if (newVal === 'ROLL_UP') {
          this.addRollupCriteria(true)
        } else if (newVal === 'SITE_OFFLINE') {
          this.addSiteOfflineCriteria(true)
        }
      }
    },
    currentPage(newVal, oldVal) {
      let {
        visitedPageRecordMap,
        filterRuleCriteriaList,
        isNormalCriteriaType,
        isRollupRuleType,
        isSiteOfflineRuleType,
      } = this
      let visitedPages = Object.keys(visitedPageRecordMap)
      if (oldVal > 0) {
        this.visitedPageRecordMap[oldVal] = filterRuleCriteriaList
      }
      if (newVal != oldVal) {
        if (visitedPages.includes(`${newVal}`)) {
          this.filterRuleCriteriaList = visitedPageRecordMap[newVal]
          this.visitedPageRecordMap[newVal] = []
        } else {
          this.filterRuleCriteriaList = []
          if (isNormalCriteriaType) {
            this.loadAlarmDefinitionTagging()
          } else if (isRollupRuleType) {
            this.addRollupCriteria()
          } else if (isSiteOfflineRuleType) {
            this.addSiteOfflineCriteria()
          }
        }
      }
    },
    selectAll(newVal) {
      this.selectedRecordCount = 0
      let { filterRuleCriteriaList } = this
      this.filterRuleCriteriaList = (filterRuleCriteriaList || []).map(
        criteria => {
          if (newVal) {
            this.selectedRecordCount += 1
          } else {
            this.selectedRecordCount = 0
          }
          return { ...criteria, selected: newVal }
        }
      )
    },
  },
  created() {
    this.rmHelpers = rmHelpers
    this.init()
  },
  beforeDestroy() {
    let { currentPage, visitedPageRecordMap, filterRuleCriteriaList } = this
    let storeValue = visitedPageRecordMap
    storeValue[currentPage] = filterRuleCriteriaList
  },
  methods: {
    async init() {
      this.loading = true
      let { data = {}, error } = await API.get(
        '/v3/alarmCorrelationRule/controllerTypesMap'
      )
      if (isEmpty(error)) {
        let { controllerTypeMap } = data
        this.controllerTypesAsMap = controllerTypeMap
      }

      let { isNormalCriteriaType, isRollupRuleType, isSiteOfflineRuleType } =
        this
      if (isNormalCriteriaType) {
        await this.loadAlarmDefinitionTagging()
      } else if (isRollupRuleType) {
        this.addRollupCriteria()
      } else if (isSiteOfflineRuleType) {
        this.addSiteOfflineCriteria()
      }
      this.loading = false
    },
    getSerializedData() {
      let {
        filterRuleCriteriaList = [],
        isNormalCriteriaType,
        isRollupOrSiteOffline,
      } = this
      let invalid = false
      filterRuleCriteriaList.forEach((_, index) => {
        let filterRuleCriteria = {}
        if (isNormalCriteriaType) {
          filterRuleCriteria = getProperty(
            this,
            `$refs.alarm-filter-rule-criteria-${index}.0`
          )
        } else if (isRollupOrSiteOffline) {
          filterRuleCriteria = getProperty(
            this,
            `$refs.rollup-criteria-${index}.0`,
            {}
          )
        }

        if (!isEmpty(filterRuleCriteria)) {
          let { invalid: currentCriteriaInvalid } =
            filterRuleCriteria.getSerializedData()
          invalid = invalid || currentCriteriaInvalid
        }
      })
      if (invalid) {
        return { invalid: true }
      }
      let criteriaList = this.getAllCriteriaInSingleList(filterRuleCriteriaList)
      criteriaList = this.getValidCriteriaList(criteriaList)
      return criteriaList
    },
    basicRuleDetailsChangeHandler() {
      this.selectedRecordCount = 0
      this.currentPage = 1
      let { isNormalCriteriaType } = this
      if (isNormalCriteriaType) {
        this.filterRuleCriteriaList = []
        this.loadAlarmDefinitionTagging()
      }
    },
    setCriteria(criteria) {
      let index = criteria?.index
      this.$set(this.filterRuleCriteriaList, `${index}`, criteria)
    },
    updateBulkUpdateDialogVisibility(value) {
      this.showBulkUpdateDialog = value
    },
    updateSelectedRecordCount(valueObj) {
      let { criteria, value } = valueObj
      this.setCriteria(criteria)
      if (value) {
        this.selectedRecordCount += 1
      } else {
        this.selectedRecordCount -= 1
        if (this.selectedRecordCount == 0) {
          this.selectAll = false
        }
      }
    },
    updateCriteriaForSelectedRecords(criteriaObj) {
      this.filterRuleCriteriaList = (this.filterRuleCriteriaList || []).map(
        criteria => {
          if (criteria?.selected) {
            return { ...criteria, ...criteriaObj, selected: false }
          }
          return criteria
        }
      )
      this.selectAll = false
      this.selectedRecordCount = 0
      this.showBulkUpdateDialog = false
    },
    updateCurrentPage(page) {
      this.currentPage = page
    },
    resetSelectAll() {
      this.selectAll = false
      this.selectedRecordCount = 0
      this.filterRuleCriteriaList = this.filterRuleCriteriaList.map(
        criteria => {
          return { ...criteria, selected: false }
        }
      )
    },
    async loadAlarmDefinitionTagging() {
      this.loading = true
      let { alarmType, clientId } = this
      if (!isEmpty(alarmType) && !isEmpty(clientId)) {
        //this filter used to fetch only asset tagging of selected client and alarm type
        let filters = {
          alarmType: { operatorId: 36, value: [`${alarmType}`] },
          client: { operatorId: 36, value: [`${clientId}`] },
          oneLevelLookup: {},
        }
        let params = {
          page: this.currentPage,
          perPage: this.perPage,
          withCount: true,
          filters: JSON.stringify(filters),
        }
        let {
          data = {},
          error,
          meta = {},
        } = await API.get(
          '/v3/alarmCorrelationRule/alarmTypeMappingList',
          params
        )
        if (!isEmpty(error)) {
          let errorMessage =
            error?.message || this.$t('error_occurred_short_message')
          ftoast.critical(errorMessage)
        } else {
          let { pagination = {} } = meta
          let { totalCount = 0 } = pagination
          this.totalCount = totalCount

          let { visitedPageRecordMap = {}, currentPage } = this
          if (!isEmpty(visitedPageRecordMap[currentPage])) {
            this.filterRuleCriteriaList = visitedPageRecordMap[currentPage]
            this.visitedPageRecordMap[currentPage] = []
          } else {
            let { alarmTypeMapping = [] } = data
            this.constructAlarmFilterCriteriaList(alarmTypeMapping)
          }
        }
      } else {
        this.totalCount = 0
        this.filterRuleCriteriaList = []
      }
      this.loading = false
    },

    addRollupCriteria(isRuleTypeChange = false) {
      let { isNew, criteriaList } = this
      if (isNew || isRuleTypeChange || isEmpty(criteriaList)) {
        let rollupCriteria = {
          assetCategoryId: null,
          relationshipId: null,
          alarmDuration: null,
          alarmCount: null,
          percentage: null,
          message: null,
        }
        let criteriaList = []
        criteriaList.push(rollupCriteria)
        this.filterRuleCriteriaList = criteriaList
      } else {
        this.filterRuleCriteriaList = criteriaList
      }
    },
    addSiteOfflineCriteria(isRuleTypeChange = false) {
      let { isNew, criteriaList } = this
      if (isNew || isRuleTypeChange || isEmpty(criteriaList)) {
        let siteOfflineCriteria = {
          alarmDuration: null,
          alarmCount: null,
          percentage: null,
          message: null,
        }
        let criteriaList = []
        criteriaList.push(siteOfflineCriteria)
        this.filterRuleCriteriaList = criteriaList
      } else {
        this.filterRuleCriteriaList = criteriaList
      }
    },
    constructAlarmFilterCriteriaList(alarmDefinitionTaggingList) {
      let {
        controllerTypesAsMap = {},
        criteriaList = [],
        isControllerOfflineType,
      } = this
      let criteriaObj = {
        filterCriteria: null,
        alarmDuration: null,
        alarmCount: null,
        alarmCountPeriod: [],
        alarmClearPeriod: [],
        message: null,
        selected: false,
      }
      if (isControllerOfflineType) {
        criteriaObj = {
          ...criteriaObj,
          filterCriteria: 'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD',
        }
      }
      this.filterRuleCriteriaList = (alarmDefinitionTaggingList || []).map(
        alarmDefinitionTagging => {
          let { controllerType: controllerTypeIndex = 0 } =
            alarmDefinitionTagging
          let alarmDefinition = getProperty(
            alarmDefinitionTagging,
            'alarmDefinition',
            null
          )
          let alarmDefinitionId = getProperty(
            alarmDefinitionTagging,
            'alarmDefinition.id',
            null
          )
          let controllerTypeObj =
            controllerTypesAsMap[controllerTypeIndex] || {}
          let controllerTypeLabel = controllerTypeObj?.value
          if (!isEmpty(controllerTypeLabel)) {
            if (!isEmpty(criteriaList)) {
              let matchedCriteria = this.checkForExistingCriteria(
                alarmDefinitionId,
                controllerTypeIndex
              )
              if (!isEmpty(matchedCriteria)) {
                return {
                  message: null,
                  ...matchedCriteria,
                  alarmDefinition,
                  controllerTypeLabel,
                  selected: false,
                }
              }
            }
            return {
              alarmDefinition,
              controllerType: controllerTypeIndex,
              ...criteriaObj,
              controllerTypeLabel,
            }
          }
          return { ...alarmDefinitionTagging, ...criteriaObj }
        }
      )
    },
    checkForExistingCriteria(alarmDefinitionId, controllerTypeIndex) {
      let { isControllerOfflineType } = this
      if (!isEmpty(alarmDefinitionId) && !isEmpty(controllerTypeIndex)) {
        let { criteriaList = [] } = this
        let matchedCriteria = criteriaList.find(criteria => {
          let currentCriteriaDefinitionId = getProperty(
            criteria,
            'alarmDefinition.id'
          )
          let currentCriteriaControllerType = getProperty(
            criteria,
            'controllerType'
          )
          let { criteriaTypeOptionsList } = this
          let filterCriteria = getProperty(criteria, 'filterCriteria')
          let validFilterCriteria = criteriaTypeOptionsList.some(
            filterCriteriaTypeObj => {
              return filterCriteriaTypeObj.value == filterCriteria
            }
          )
          return (
            currentCriteriaDefinitionId === alarmDefinitionId &&
            currentCriteriaControllerType === controllerTypeIndex &&
            (validFilterCriteria || isControllerOfflineType)
          )
        })
        return matchedCriteria || {}
      }
    },
    getAllCriteriaInSingleList(newList) {
      let { visitedPageRecordMap = [] } = this
      let visitedPageRecordList = Object.values(visitedPageRecordMap)
      visitedPageRecordList = visitedPageRecordList.flat()
      let criteriaList = [...visitedPageRecordList, ...newList]
      return criteriaList
    },
    getValidCriteriaList(criteriaList = []) {
      let {
        rmHelpers = {},
        isNormalCriteriaType,
        isRollupRuleType,
        isSiteOfflineRuleType,
      } = this
      if (isNormalCriteriaType) {
        let filteredCriteriaList = criteriaList.filter(criteria => {
          let { alarmApproach } = this
          let {
            id,
            filterCriteria,
            alarmDuration,
            alarmCount,
            alarmCountPeriod,
            alarmClearPeriod,
          } = criteria
          if (!isEmpty(id) && isEmpty(filterCriteria)) {
            return true
          }
          if (!isEmpty(filterCriteria)) {
            if (isEmpty(filterCriteria)) {
              return true
            }
            if (
              rmHelpers.isDurationFieldNeeded(criteria) &&
              isEmpty(alarmDuration)
            ) {
              return false
            }
            if (
              rmHelpers.isAlarmCountFieldNeeded(criteria) &&
              (isEmpty(alarmCount) || isEmpty(alarmCountPeriod))
            ) {
              return false
            }
            if (
              rmHelpers.isClearPeriodNeeded(criteria, alarmApproach) &&
              isEmpty(alarmClearPeriod)
            ) {
              return false
            }
            return true
          }
          return false
        })
        criteriaList = filteredCriteriaList.map(criteria => {
          let { alarmApproach } = this
          let { id, filterCriteria } = criteria
          if (!rmHelpers.isDurationFieldNeeded(criteria)) {
            criteria = { ...criteria, alarmDuration: null }
          }
          if (!rmHelpers.isAlarmCountFieldNeeded(criteria)) {
            criteria = {
              ...criteria,
              alarmCount: null,
              alarmCountPeriod: null,
            }
          }
          if (!rmHelpers.isClearPeriodNeeded(criteria, alarmApproach)) {
            criteria = { ...criteria, alarmClearPeriod: null }
          }
          if (!isEmpty(id) && isEmpty(filterCriteria)) {
            criteria = { id }
          }
          return criteria
        })
      }
      if (isRollupRuleType) {
        let filteredCriteriaList = criteriaList.filter(criteria => {
          let {
            relationshipId,
            alarmDuration,
            alarmCount,
            canShowWeightageField,
            message,
            percentage,
          } = criteria
          if (
            canShowWeightageField &&
            isEmpty(alarmCount) &&
            isEmpty(percentage)
          ) {
            return false
          }
          return [relationshipId, alarmDuration, message].every(
            prop => !isEmpty(prop)
          )
        })
        criteriaList = filteredCriteriaList.map((criteria = {}) => {
          let { canShowWeightageField } = criteria
          if (!canShowWeightageField) {
            criteria = {
              ...criteria,
              alarmCount: 1,
              percentage: null,
            }
          }
          return criteria
        })
      }
      if (isSiteOfflineRuleType) {
        criteriaList = criteriaList.filter((criteria = {}) => {
          let { alarmDuration, alarmCount, message, percentage } = criteria
          return !(
            isEmpty(message) ||
            isEmpty(alarmDuration) ||
            (isEmpty(alarmCount) && isEmpty(percentage))
          )
        })
      }
      return criteriaList
    },
  },
}
</script>
