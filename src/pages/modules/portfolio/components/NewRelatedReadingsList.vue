<template>
  <FContainer style="height: 100%">
    <FContainer v-if="isLoading">
      <FSpinner size="30" />
    </FContainer>
    <FContainer v-else-if="isEmpty(readingsList)">
      <FEmptyState
        description="No Readings Available"
        title=""
        :vertical="true"
      />
    </FContainer>
    <FContainer v-else>
      <FTable
        :columns="columns"
        :data="readingsList"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.field`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">
            {{ getProperty(row, 'field.displayName', '---') }}
          </FText>
        </template>
        <template #[`cell.value`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            getReadingValue(row)
          }}</FText>
        </template>
        <template #[`cell.ttime`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            getTimeFromNow(row)
          }}</FText>
        </template>
        <template #[`cell.analytics`]="{ row }" v-if="hasAnalyticsPermission">
          <FText>
            <a class="f13 flex align-center" @click="goToAnalytics(row)"
              >{{ $t('asset.readings.go_to_analytics') }}
              <InlineSvg
                src="svgs/black-arrow-right"
                class="pointer flex mL5"
                iconClass="icon icon-xs"
              ></InlineSvg>
            </a>
          </FText>
        </template>
      </FTable>
    </FContainer>
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="portal-alignment-ws action-ws"
      style="position: absolute; top: 50px; right: 10px"
    >
      <FDropdown
        name="All Assets"
        @dropdown="filterResource"
        :options="options"
        :split="false"
        :loading="false"
        :buttonProps="{ appearance: 'secondary' }"
        contentWidth="200px"
      />
    </portal>
    <portal
      v-if="!isEmpty(readingsList)"
      paddingTop="sectionLarge"
      class="portal-alignment-ws"
      ref="footer-portal"
      :class="{ height2px: !showFooterDivider }"
      :to="`footer-${widget.id}-${widget.name}`"
      @change="footerChange"
    >
      <FContainer v-if="!isEmpty(readingsList) && recordsCount > 5">
        <FPagination
          :total="recordsCount"
          :pageCount="pageCount"
          :currentPage.sync="page"
          :pageSize="perPage"
        ></FPagination>
      </FContainer>
    </portal>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FSpinner,
  FTable,
  FText,
  FPagination,
  FEmptyState,
  FDropdown,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { fromNow } from './../../../../utils/formatter'
import isEqual from 'lodash/isEqual'
import $access from '../../../../utils/access/index'
import webtabs from '../../../../store/webtabs'
import getProperty from 'dlv'
const webTabStore = webtabs()
export default {
  components: {
    FText,
    FSpinner,
    FPagination,
    FContainer,
    FEmptyState,
    FTable,
    FDropdown,
  },
  props: [
    'resourceId',
    'portalName',
    'relDetail',
    'isActive',
    'widget',
    'resizeWidget',
    'moduleName'
  ],
  data() {
    return {
      isEmpty,
      readingsList: [],
      resourceMap: {},
      readingsMap: {},
      options: [],
      isLoading: false,
      page: 1,
      perPage: 5,
      recordsCount: 0,
      selectedResource: null,
      columns: [
        {
          displayName: 'Reading Name',
          name: 'field',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Value',
          name: 'value',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Last Recorded',
          name: 'ttime',
          id: 3,
          width: 250,
        },
        { displayName: 'Analytics', name: 'analytics', id: 4, type: 'link' },
      ],
    }
  },
  computed: {
    tableHeight() {
      let { $refs } = this
      let height = '250px'
      let tableContainer = $refs['related-readings-list']
      if (!isEmpty(tableContainer)) {
        let containerHeight = (tableContainer || {}).clientHeight
        height = `${containerHeight}px`
      }
      return height
    },
    pageCount() {
      return Math.ceil(this.recordsCount / this.perPage)
    },
    activeTab() {
      return this.$attrs.activeTab
    },
    hasAnalyticsPermission() {
      return (
        $access.isLicenseEnabled('ENERGY') &&
        webTabStore.tabHasPermission(
          'energy:CREATE_EDIT_REPORTS,VIEW_REPORTS,CREATE_EDIT_DASHBOARD,EXPORT_REPORTS'
        )
      )
    },
  },
  watch: {
    page(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.loadReadingsList()
      }
    },
  },
  methods: {
    async fetchCountAndData() {
      this.isLoading = true
      await this.loadReadingsCount()
      await this.loadReadingsList()
      this.isLoading = false
    },
    async loadReadingsCount() {
      let { relDetail, resourceId, page, perPage } = this
      let { reverseRelationLinkName: relMapLinkName } = relDetail || {}
      let params = {
        page,
        perPage,
        relMapLinkName,
        resourceId,
        readingType: 'all',
        fetchCount: true,
      }
      let { data, error } = await API.get(
        `v2/reading/latestdata/getRelatedData/${this.moduleName}`,
        params
      )
      if (!error) {
        let { count } = data || {}
        this.recordsCount = !isEmpty(count) ? count : 0
        if (count == 0) this.resizeWidget({ h: 5 })
      }
    },
    async loadReadingsList() {
      this.isLoading = true
      let { relDetail, resourceId, page, perPage } = this
      let { reverseRelationLinkName: relMapLinkName } = relDetail || {}
      let params = {
        page,
        perPage,
        relMapLinkName,
        resourceId,
        readingType: 'all',
      }
      let { data, error } = await API.get(
        `v2/reading/latestdata/getRelatedData/${this.moduleName}`,
        params
      )
      this.readingsList = []
      this.resourceMap = {}
      if (!error && !isEmpty(data)) {
        let { readingValues = [], resources = {} } = data || {}
        this.readingsList = !isEmpty(readingValues) ? readingValues : []
        this.resourceMap = !isEmpty(resources) ? resources : {}
        this.getOptions(this.resourceMap)
        this.readingsList.forEach(reading => {
          let fieldName = getProperty(reading, 'field.displayName', '---')
          let { resourceId } = reading
          reading.fieldName = fieldName
          reading.resourceName = this.resourceMap[resourceId].name
        })
      }
      this.isLoading = false
    },
    getOptions(resourceMap) {
      let keys = Object.keys(resourceMap)
      let resources = []
      for (let key of keys) {
        resources.push(resourceMap[key])
        this.options.push({
          label: resourceMap[key].name,
          value: resourceMap[key].id,
        })
      }
    },
    getReadingValue(readingRow) {
      let reading = readingRow
      if (!isEmpty(reading)) {
        let { actualValue } = reading
        let unit = getProperty(reading, 'field.unit', '')
        return !isEmpty(actualValue)
          ? `${actualValue} ${!isEmpty(unit) ? unit : ''}`
          : '---'
      }
      return '---'
    },
    getTimeFromNow(readingRow) {
      let reading = readingRow
      if (!isEmpty(reading)) {
        let { actualValue, ttime } = reading
        return !isEmpty(actualValue) ? fromNow(ttime) : '---'
      }
      return '---'
    },
    goToAnalytics(readingRow) {
      let reading = getProperty(readingRow, 'row')
      let assetId = (reading, 'resourceId')
      let fieldId = getProperty(reading, 'field.id')
      let dateFilter = {
        operatorId: 63,
        value: reading.ttime ? reading.ttime + '' : null,
      }

      let buildingId = this?.details?.space
        ? this?.details?.space?.buildingId
        : null
      let aggr =
        reading.field &&
        reading.field.unit &&
        ['currency', 'kwh', 'co2', 'kg', 'mwh'].includes(
          reading.field.unit.trim().toLowerCase()
        )
          ? 3
          : 2
      this.jumpReadingToAnalytics(
        assetId,
        fieldId,
        dateFilter,
        null,
        aggr,
        buildingId
      )
    },
    filterResource(resource) {
      this.selectedResource = resource.value
    },
  },
  created() {
    this.fetchCountAndData()
  },
}
</script>
