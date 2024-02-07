<template>
  <FContainer height="100%">
    <!-- Widget TopBar Section -->
    <template v-if="isActive">
      <portal :to="portalName" :key="portalName + '-portalwrap'" slim>
        <FContainer
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
        >
          <FInput
            v-if="showSearch"
            v-model="searchText"
            placeholder="search"
            appearance="default"
            size="small"
            clearable
            :clearValue="clearSearchText"
            @enterPress="listRefresh"
          >
            <template #prefix>
              <FIcon
                group="action"
                name="search"
                size="16"
                :pressable="false"
                @click="showSearch = false"
              ></FIcon> </template
          ></FInput>
          <FIcon
            v-if="!showSearch"
            group="action"
            name="search"
            size="14"
            @click="showSearch = true"
          ></FIcon>
          <FDivider height="24px" margin="containerNone containerXLarge" />
          <FIcon
            group="action"
            name="refresh"
            size="16"
            @click="listRefresh"
          ></FIcon>
        </FContainer>
      </portal>
    </template>
    <portal v-if="!isEmpty(list)" :to="`footer-${widget.id}-${widget.name}`">
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerLarge"
        backgroundColor="backgroundCanvas"
        marginTop="containerLarge containerXLarge"
        width="100%"
        justifyContent="flex-start"
        position="sticky"
        bottom="0"
      >
        <FPagination
          v-if="!isEmpty(list)"
          :total="totalCount"
          :pageCount="pageCount()"
          :currentPage.sync="page"
          :pageSize="5"
        ></FPagination>
      </FContainer>
    </portal>

    <FContainer
      v-if="loading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(list)"
      paddingTop="containerMedium"
      height="100%"
    >
      <FDivider width="100%"></FDivider>

      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer height="100%" display="flex" justifyContent="center">
          <FContainer
            display="flex"
            justifyContent="center"
            width="500px"
            height="100%"
          >
            <FEmptyState
              title="No Readings Available."
              vertical
              size="S"
              illustration="no-entries"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>

    <FContainer v-else height="100%">
      <FTable
        :rounded="false"
        :hideBorder="true"
        :columns="column"
        :data="list"
      >
        <template #[`cell.value`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            displayReadings(row.field, row.value, row.actualValue)
          }}</FText>
        </template>
        <template #[`cell.ttime`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">
            {{ getTimeFromNow(row) }}</FText
          >
        </template>
        <template #[`cell.analytics`]="{ row }">
          <FButton appearance="link" @click="analyse(row)">
            {{ $t('asset.readings.analyse', { ns: 'asset' }) }}
          </FButton>
        </template>

        <template #[`cell.add`]="{ row }">
          <FContainer>
            <template>
              <FContainer v-if="canShowAddReading(row)">
                <FButton
                  appearance="link"
                  size="small"
                  @click="
                    showAddReadingDialog(row.field.module.name, row.field)
                  "
                >
                  {{ $t('meter.readings.add', { ns: 'energy' }) }}</FButton
                >
              </FContainer>
              <FContainer
                v-if="row.controllable"
                class="visibility-hide-actions"
              >
                <!-- more actions -->
              </FContainer>
            </template>
          </FContainer>
        </template>
      </FTable>
    </FContainer>

    <AddMeterReadings
      v-if="showReadingDialog"
      :reading="editObj"
      :saveAction="updateReadings"
      :closeAction="closePopup"
      :recordId="meterId"
    ></AddMeterReadings>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FTable,
  FInput,
  FAvatar,
  FPagination,
  FButton,
  FSpinner,
  FIcon,
  FEmptyState,
  FButtonGroup,
  FDivider,
} from '@facilio/design-system'
import {
  isBooleanField,
  isDecimalField,
  isEnumField,
  isDateField,
  isDateTimeField,
} from '@facilio/utils/field'
import { isEmpty, isNullOrUndefined } from '@facilio/utils/validation'
import { formatDate, fromNow } from '../../../../utils/formatter'
import { API } from '@facilio/api'
import AddMeterReadings from './AddMeterReadings.vue'
import { goToAnalytics } from '/src/pages/analytics/util.js'

export default {
  components: {
    FContainer,
    FText,
    FTable,
    FInput,
    FAvatar,
    FPagination,
    FButton,
    FSpinner,
    FIcon,
    FEmptyState,
    FDivider,
    FButtonGroup,
    AddMeterReadings,
  },
  props: [
    'type',
    'url',
    'isActive',
    'portalName',
    'meterId',
    'resize',
    'reset',
    'details',
    'moduleName',
    'widget',
  ],

  mounted() {
    this.loadData()
    this.loadCount()
  },

  data() {
    return {
      loading: false,
      list: null,
      page: 1,
      showSearch: false,
      searchText: '',
      totalCount: null,
      canShowAllReadings: true,
      defaultListSize: 5,
      editObj: {},
      showReadingDialog: false,
      column: [
        { displayName: 'Name', name: 'name', id: 1, fixed: true },
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
        {
          displayName: 'Analytics',
          name: 'analytics',
          id: 4,
          type: 'status',
          width: 270,
        },
        {
          displayName: '',
          name: 'add',
          id: 5,
          type: 'status',
          width: 270,
        },
      ],
    }
  },
  computed: {
    filteredList() {
      let sortedList = [...this.list].sort((a, b) => {
        if (
          a.field.displayName.toLowerCase() > b.field.displayName.toLowerCase()
        ) {
          return 1
        }
        if (
          b.field.displayName.toLowerCase() > a.field.displayName.toLowerCase()
        ) {
          return -1
        }
        return 0
      })

      if (this.canShowAllReadings) {
        return sortedList
      } else {
        return sortedList.slice(0, this.defaultListSize)
      }
    },
    canShowViewMore() {
      return (
        this.list &&
        this.list.length > 0 &&
        this.list.length > this.defaultListSize
      )
    },
    showMoreLinkText() {
      return this.canShowAllReadings ? 'View Less' : 'View More'
    },
    hasModuleAddReadingPermission() {
      if (['site', 'building', 'space'].includes(this.moduleName)) {
        if (this.$access.hasPermission('space:ADD_READING')) return true
        return false
      }
      return true
    },
  },

  methods: {
    isEmpty,
    pageCount() {
      return Math.ceil(this.totalCount / this.defaultListSize)
    },
    toggleVisibility() {
      this.canShowAllReadings = !this.canShowAllReadings

      this.$nextTick(() => {
        if (this.canShowAllReadings) {
          this.resize()
        } else {
          this.reset()
        }
      })
    },

    clearSearchText() {
      this.searchText = ''
      this.listRefresh()
    },
    updateAction(field) {
      let { isControllable } = field || {}
      isControllable = !isControllable
      field = { ...field, isControllable }
      this.controlActionChangeStatus(field, this.meterId, isControllable)
    },

    async loadData() {
      this.loading = true
      let { type, page, defaultListSize, searchText } = this
      let params = {
        readingType: type,
        page,
        perPage: defaultListSize,
      }
      if (!isEmpty(searchText)) {
        params = { ...params, search: searchText }
      }

      let url = `/v2/readings/meter/latestdata/${this.meterId}`
      let { data } = await API.get(url, params)
      let readingValues = data?.readingValues || []
      let list = readingValues.map(reading => ({
        name: reading.field.displayName,
        ...reading,
      }))
      this.list = list
      this.loading = false
    },

    async loadCount() {
      this.loading = true
      let { type, searchText } = this
      let params = {
        readingType: type,
        fetchCount: true,
      }
      if (!isEmpty(searchText)) {
        params = { ...params, search: searchText }
      }
      
      let url = `v2/readings/meter/latestdata/${this.meterId}`
      let { data } = await API.get(url, params)
      this.totalCount = data?.count
    },

    isValueEmpty(field, value, actualValue) {
      if (isBooleanField(field))
        return (
          value === null ||
          value === undefined ||
          isNullOrUndefined(actualValue)
        )
      else if (Number(value) === -1) return true
      else return isEmpty(value)
    },

    displayReadings(field, value, actualValue) {
      if (Number(value) === -1) {
        return '--'
      } else if (isDecimalField(field)) {
        let unit = field.unit ? field.unit : ''
        return value.toFixed(2) + ' ' + unit
      } else if (isDateTimeField(field)) {
        return formatDate(value)
      } else if (isDateField(field)) {
        return formatDate(value, true)
      } else if (isBooleanField(field)) {
        if (
          isNullOrUndefined(value) ||
          value === -1 ||
          isNullOrUndefined(actualValue)
        )
          return '--'
        return value ? field.trueVal || 'True' : field.falseVal || 'False'
      } else if (isEnumField(field)) {
        return field.enumMap[parseInt(value)]
      } else {
        return value
      }
    },

    showAddReadingDialog(readingName, field) {
      this.editObj.readingName = readingName
      this.editObj.field = field
      this.showReadingDialog = true
    },
    closePopup() {
      this.showReadingDialog = false
      this.resetReadingObj()
    },
    resetReadingObj() {
      this.editObj = {
        ttime: null,
        value: null,
      }
    },

    updateReadings() {
      this.loadData()
      this.loadCount()
      this.closePopup()
    },

    canShowAddReading(reading) {
      return (
        Number(reading.inputType) === 1 && this.hasModuleAddReadingPermission
      )
    },
    listRefresh() {
      this.loadData()
      this.loadCount()
    },
    getTimeFromNow(reading) {
      if (!isEmpty(reading)) {
        let { actualValue, ttime } = reading || {}
        return !isEmpty(actualValue) ? fromNow(ttime) : '---'
      }
      return '---'
    },
    analyse(reading) {
      let { details } = this
      let {
        id,
        moduleName,
        utilityType,
        utilityTypeModuleName: parentModuleName,
      } = details || {}
      let { id: categoryId } = utilityType || {}
      let meterDetails = {
        moduleName,
        id,
        categoryId,
        parentModuleName,
      }
      goToAnalytics(reading, meterDetails)
    },
  },
  watch: {
    page() {
      this.loadData()
    },
  },
}
</script>
<style scoped>
.refresh-icon {
  position: absolute;
  top: 6px;
  right: 12px;
}
</style>
