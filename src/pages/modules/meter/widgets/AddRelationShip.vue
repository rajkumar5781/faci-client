<template>
  <FContainer>
    <FModal
      :title="$t('meter.add_meter', { ns: 'energy' })"
      :visible="canShowDialog"
      size="M"
      @cancel="handleCancel"
    >
      <FContainer
        height="45px"
        backgroundColor="backgroundMidgroundMedium"
        display="flex"
      >
        <FContainer
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="95%"
          marginLeft="sectionLarge"
        >
          <FSteps :steps="steps" :currentStep="currentStep" />
        </FContainer>
        <FContainer
          v-if="!isRelationShipTab"
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          width="5%"
          marginRight="containerXLarge"
        >
          <AdvancedSearch
            :key="`filter-meters`"
            moduleName="meter"
            moduleDisplayName="Meter"
            :hideQuery="true"
            :onSave="setAppliedFilter"
            :filters="appliedFilters"
          >
            <template #icon>
              <FIcon group="default" name="filter-outline" size="16"></FIcon>
            </template>
          </AdvancedSearch>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="isLoading"
        height="350px"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <FSpinner :size="30" />
      </FContainer>
      <FContainer height="350px" v-else>
        <FContainer
          v-if="isEmpty(tableData)"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FEmptyState
            vertical
            :title="emptyTitle"
            :description="emptyDescription"
            illustration="no-entries"
          />
        </FContainer>
        <FTable
          v-else
          :showSelectBar="false"
          :rounded="false"
          :hideBorder="false"
          :columns="columns"
          :data="tableData"
          :selectType="tableSelectType"
          :selectedList="tableSelectedData"
          @recordSelected="handleSelection"
        >
          <template #[`cell.utilityType`]="{ row }">
            {{ getProperty(row, 'utilityType.displayName', '---') }}
          </template>
          <template #[`cell.meterLocation`]="{ row }">
            {{ getProperty(row, 'meterLocation.name', '---') }}
          </template>
        </FTable>
      </FContainer>

      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="space-between"
        >
          <FContainer>
            <FPagination
              v-if="!isRelationShipTab"
              :pageSize="perPage"
              :total="totalCount"
              :currentPage="page"
              :disabled="disablePagination"
              @nextClick="pageChanged"
              @prevClick="pageChanged"
              @currentChange="pageChanged"
            />
          </FContainer>
          <FContainer>
            <FButton
              v-if="isRelationShipTab"
              appearance="secondary"
              size="medium"
              iconGroup="navigation"
              iconName="right"
              iconPosition="suffix"
              :disabled="isEmpty(relationShipId)"
              @click="moveToNext"
            >
              {{ $t('meter.next', { ns: 'energy' }) }}
            </FButton>
            <FContainer v-else display="flex" gap="containerMedium">
              <FButton
                appearance="secondary"
                size="medium"
                iconGroup="navigation"
                iconName="left"
                iconPosition="prefix"
                @click="moveToPrev"
              >
                {{ $t('meter.prev', { ns: 'energy' }) }}
              </FButton>
              <FButton
                appearance="primary"
                size="medium"
                :disabled="isEmpty(meterIds)"
                :loading="isAssociating"
                @click="associateMeter"
              >
                {{ $t('meter.associate_meters', { ns: 'energy' }) }}
              </FButton>
            </FContainer>
          </FContainer>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>

<script>
import {
  FSteps,
  FContainer,
  FModal,
  FSpinner,
  FTable,
  FButton,
  FEmptyState,
  FIcon,
  FPagination,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import AdvancedSearch from '../../../../components/search/AdvancedSearch.vue'

export default {
  name: 'AddRelationShip',
  components: {
    FContainer,
    FSteps,
    FModal,
    FSpinner,
    FTable,
    FButton,
    FEmptyState,
    FIcon,
    FPagination,
    AdvancedSearch,
  },
  props: ['canShowDialog', 'record', 'moduleName'],
  data: () => ({
    currentStep: 1,
    relations: [],
    relationShipId: null,
    meters: [],
    meterIds: null,
    isLoading: false,
    isAssociating: false,
    selectedMeters: [],
    selectedRelation: [],
    appliedFilters: null,
    page: 1,
    perPage: 10,
    totalCount: null,
  }),
  created() {
    this.init()
  },
  computed: {
    steps() {
      return [
        this.$t('meter.select_relationship', { ns: 'energy' }),
        this.$t('meter.associate_meters', { ns: 'energy' }),
      ]
    },
    isRelationShipTab() {
      let { currentStep } = this
      return currentStep === 1
    },
    columns() {
      let { isRelationShipTab } = this
      let relationColumns = [
        {
          displayName: this.$t('meter.relationship', { ns: 'energy' }),
          name: 'relationName',
          id: 1,
          width: 350,
        },
      ]

      let meterColumns = [
        {
          displayName: this.$t('name', { ns: 'energy' }),
          name: 'name',
          id: 1,
          width: 250,
        },
        {
          displayName: this.$t('type', { ns: 'energy' }),
          name: 'utilityType',
          id: 2,
          width: 200,
        },
        {
          displayName: this.$t('meter.location', { ns: 'energy' }),
          name: 'meterLocation',
          id: 3,
          width: 200,
        },
      ]

      return isRelationShipTab ? relationColumns : meterColumns
    },
    tableData() {
      let { isRelationShipTab, relations, meters } = this
      return isRelationShipTab ? relations : meters
    },
    emptyTitle() {
      let { isRelationShipTab, selectedRelation } = this
      let moduleName = getProperty(
        selectedRelation,
        '0.toModule.displayName',
        ''
      )
      return isRelationShipTab
        ? this.$t('meter.relation_empty', { ns: 'energy' })
        : this.$t('meter.association_empty', { ns: 'energy', moduleName })
    },
    emptyDescription() {
      let { isRelationShipTab, selectedRelation } = this
      let moduleName = getProperty(selectedRelation, '0.toModule.name', '')

      return isRelationShipTab
        ? this.$t('meter.relation_description', { ns: 'energy' })
        : this.$t('meter.meter_description', { ns: 'energy', moduleName })
    },
    tableSelectType() {
      let { isRelationShipTab, selectedRelation = [] } = this
      let activeRelation = getProperty(selectedRelation, `0`, {})
      let { relationTypeEnum } = activeRelation

      if (isRelationShipTab) {
        return 'single'
      }
      return relationTypeEnum === 'MANY_TO_ONE' ? 'single' : 'bulk'
    },
    tableSelectedData() {
      let { isRelationShipTab, selectedMeters, selectedRelation } = this
      return isRelationShipTab ? selectedRelation : selectedMeters
    },
    utilityTypeId() {
      return getProperty(this, 'record.utilityType.id', null)
    },
    recordId() {
      return getProperty(this, 'record.id', null)
    },
    disablePagination() {
      let { tableData, isLoading } = this
      return isEmpty(tableData) && isLoading
    },
  },
  watch: {
    relationShipId: {
      async handler() {
        this.selectedMeters = []
        this.meterIds = []
      },
      immediate: true,
    },
  },
  methods: {
    getProperty,
    isEmpty,
    async init() {
      this.isLoading = true
      await this.loadRelations()
      this.isLoading = false
    },
    handleCancel() {
      this.$emit('closeDialog')
    },
    async associateMeter() {
      this.isAssociating = true
      let { selectedRelation = [], recordId, meterIds = [], $route = {}, moduleName } = this
      let activeRelation = getProperty(selectedRelation, `0`, {})
      let { fromModuleName, toModuleName, forwardRelationLinkName } =
        activeRelation
      let url = ''
      if (moduleName === 'meter') {
        url = `v3/modules/${fromModuleName}/${recordId}/${moduleName}/relationship/${forwardRelationLinkName}`
      } else {
        url = `v3/modules/${fromModuleName}/${recordId}/relationship/${forwardRelationLinkName}`
      }
      let params = { data: { [toModuleName]: meterIds } }
      let { error } = await API.post(url, params)

      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred_short_message')
        )
      } else {
        let { selectedRelation } = this
        let modName = getProperty(
          selectedRelation,
          '0.toModule.displayName',
          ''
        )
        ftoast.success(
          this.$t('meter.meter_associated', { ns: 'energy', modName })
        )
        let meterTab = 'meters'
        let { query, fullPath } = $route
        let currentTab = getProperty(query, 'tabName', null)

        if (currentTab !== meterTab) {
          this.$router.replace({
            path: fullPath,
            query: { ...query, tabName: meterTab },
          })
        }
        this.$emit('saveDialog')
      }
      this.isAssociating = false
    },
    async loadRelations() {
      let { record = {}, moduleName } = this
      let { utilityTypeModuleName } = record
      let permissionModuleName = moduleName
      moduleName = moduleName === 'meter' ? utilityTypeModuleName : moduleName
      let url = ''
      if (permissionModuleName === 'meter') {
        url = `v2/relation/${permissionModuleName}/fetchMeterRelations/${moduleName}`
      } else {
        url = `v2/relation/fetchMeterRelations/${moduleName}`
      }
      let { data = {}, error } = await API.get(url)

      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred_short_message')
        )
      } else {
        let { relationList = [] } = data
        relationList = relationList.map((relation = {}) => {
          let { relMappingId } = relation
          return { ...relation, id: relMappingId }
        })
        this.relations = relationList
      }
    },
    setAppliedFilter({ filters = {} }) {
      this.appliedFilters = filters
      this.loadMeters(filters)
    },
    pageChanged(page) {
      this.page = page
      this.loadMeters()
    },
    async loadMeters(filters = {}) {
      this.isLoading = true
      let { recordId, selectedRelation, page, perPage, moduleName } = this
      let activeRelation = getProperty(selectedRelation, `0`, {})
      let { fromModuleName, toModuleName, reverseRelationLinkName } =
        activeRelation
      let url = ''
      if (moduleName === 'meter') {
        url = `v3/modules/${fromModuleName}/${recordId}/${moduleName}/relationship/${reverseRelationLinkName}`
      } else {
        url = `v3/modules/${fromModuleName}/${recordId}/relationship/${reverseRelationLinkName}`
      }
      let params = {
        page,
        perPage,
        unAssociated: true,
        withCount: true,
      }

      if (!isEmpty(filters)) {
        params = { ...params, filters: JSON.stringify(filters) }
      }

      let { data = {}, meta = {}, error = {} } = await API.get(url, params)
      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred_short_message')
        )
      } else {
        let { [toModuleName]: records = [] } = data
        this.meters = records
        this.totalCount = getProperty(meta, 'pagination.totalCount', 0)
      }
      this.isLoading = false
    },
    handleSelection(record = {}) {
      let { isRelationShipTab, selectedRelation = [] } = this
      let activeRelation = getProperty(selectedRelation, `0`, {})
      let { relationTypeEnum } = activeRelation

      if (isRelationShipTab) {
        if (!isEmpty(record)) {
          this.selectedRelation = [record]
          this.relationShipId = getProperty(record, 'id', null)
        } else {
          this.selectedRelation = []
          this.relationShipId = null
        }
      } else {
        if (!isEmpty(record)) {
          if (relationTypeEnum === 'MANY_TO_ONE') {
            this.selectedMeters = [record]
            this.meterIds = [getProperty(record, 'id', null)]
          } else {
            this.selectedMeters = record
            this.meterIds = record.map(meter => meter.id)
          }
        } else {
          this.selectedMeters = []
          this.meterIds = []
        }
      }
    },
    moveToNext() {
      let { currentStep } = this
      this.currentStep = currentStep + 1
      this.loadMeters()
    },
    moveToPrev() {
      let { currentStep } = this
      this.currentStep = currentStep - 1
    },
  },
}
</script>
