<template>
  <FContainer>
    <portal :to="`action-${widget.id}-${widget.name}`">
      <FContainer display="flex" alignItems="center">
        <!-- <MainFieldSearch
          v-if="!isEmpty(criteriaData) || !isEmpty(searchText)"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch> -->
        <!-- will be enabled after server update -->
      </FContainer>
    </portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else>
      <FContainer
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
        v-if="isEmpty(criteriaData)"
      >
        <FEmptyState
          :title="$t('controls.no_criteria', { ns: 'energy' })"
          illustration="no-entries"
          :vertical="true"
          size="S"
        />
      </FContainer>
      <FTable
        v-else
        :columns="columns"
        :data="criteriaData"
        hideBorder
        :showSelect="false"
      >
        <template #[`cell.fieldName`]="record">
          <FTooltip placement="top">
            <template slot="title">{{ getFieldName(record) }}</template>
            <FText cursor="pointer">
              {{ getFieldName(record) }}
            </FText>
          </FTooltip>
        </template>
        <template #[`cell.operatorId`]="record">
          <FText>
            {{ getOperatorDetails(record) }}
          </FText>
        </template>
        <template #[`cell.value`]="record">
          <FText v-if="isValueNotDefined(record.row)">
            {{ `N/A` }}
          </FText>
          <FContainer v-else>
            <FContainer
              v-if="isMultivalueField(record)"
              display="flex"
              gap="containerMedium"
            >
              <FTooltip placement="top" v-if="canShowDates(record)">
                <template slot="title"> {{ getDateInfo(record) }}</template>
                <FText cursor="pointer">
                  {{ getDateInfo(record) }}
                </FText>
              </FTooltip>
              <MultiLookupTag
                v-else-if="!isEmpty(getFormattedValue(record))"
                :values="getFormattedValue(record)"
                :toShow="1"
              />
            </FContainer>
            <FContainer
              v-else-if="isSinglevalueField(record)"
            >
              <FTooltip placement="top">
                <template slot="title">
                  {{ getStringFieldData(record) }}
                </template>
                <FText cursor="pointer">
                  {{ getStringFieldData(record) }}
                </FText>
              </FTooltip>
            </FContainer>
            <FContainer v-else display="flex" gap="containerLarge">
              <MultiLookupTag
                v-if="isLookupBehaviour(record)"
                :values="getDefaultFieldValues(record)"
                :toShow="1"
              />
              <FTooltip v-else placement="top">
                <template slot="title"> {{ getDefaultValue(record) }}</template>
                <FText cursor="pointer">
                  {{ getDefaultValue(record) }}
                </FText>
              </FTooltip>
            </FContainer>
          </FContainer>
        </template>
      </FTable>
    </FContainer>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <FContainer padding="containerLarge">
        <FPagination
          v-if="!isEmpty(recordCount) || !isEmpty(criteriaData)"
          :key="`pagination-${criteriaModuleName}`"
          :total="recordCount"
          :currentPage.sync="page"
          :pageCount="(criteriaData || []).length"
          :pageSize="perPage"
          @currentChange="loadCriteriaDetails"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import {
  FTable,
  FContainer,
  FText,
  FSpinner,
  FTags,
  FTooltip,
  FEmptyState,
  ftoast,
  FPagination,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import MainFieldSearch from '../../../../components/page-builder/widgets/relatedList/MainFieldSearch.vue'
import dayjs from 'dayjs'
import getProperty from 'dlv'
import { MultiLookupTag } from '@facilio/ui/tasks'

const DATE_FIELD = [61, 84, 85, 101, 103, 106, 107, 108]
const Multi_Value_Fields = [
  'LOOKUP',
  'ENUM',
  'MULTI_ENUM',
  'MULTI_LOOKUP',
  'STRING_SYSTEM_ENUM',
  'SYSTEM_ENUM',
  'DATE',
  'DATE_TIME',
]
const Single_Value_Fields = ['STRING', 'BIG_STRING', 'URL_FIELD']
export default {
  props: ['widget', 'details'],
  components: {
    FTable,
    FText,
    FContainer,
    FSpinner,
    FTags,
    FTooltip,
    FPagination,
    FEmptyState,
    MainFieldSearch,
    MultiLookupTag,
  },
  data() {
    return {
      columns: [
        { displayName: this.$t('controls.fields', { ns: 'energy' }), name: 'fieldName', id: 1 },
        { displayName:  this.$t('controls.operator', { ns: 'energy' }), name: 'operatorId', id: 2 },
        { displayName:  this.$t('controls.value', { ns: 'energy' }), name: 'value', id: 3 },
      ],
      data: [],
      page: 1,
      DATE_FIELD,
      Multi_Value_Fields,
      Single_Value_Fields,
      perPage: 10,
      criteriaData: null,
      lookupModuleFieldList: null,
      isLoading: false,
      searchText: '',
      recordCount: 10, // To be changed
      mainFieldObj: { dataTypeEnum: 'STRING', name: 'fieldName' },
    }
  },
  computed: {
    criteriaModuleName() {
      return this.getProperty(
        this,
        'widget.widgetParams.criteriaModuleName',
        ''
      )
    },
    criteriaFieldName() {
      return this.getProperty(this, 'widget.widgetParams.criteriaFieldName', '')
    },
    
  },
  watch: {
    searchText() {
      this.loadCriteriaDetails(true)
    },
  },
  created() {
    this.init()
  },
  methods: {
    getProperty,
    isEmpty,
    async init() {
      this.isLoading = true
      await this.loadCriteriaDetails()
      this.isLoading = false
    },
    async loadCriteriaDetails(force = false) {
      this.isLoading = true
      let {
        details,
        criteriaModuleName,
        page,
        perPage,
        searchText,
        criteriaFieldName,
      } = this
      if (!isEmpty(criteriaModuleName)) {
        let criteriaId = this.getProperty(details, criteriaFieldName, null)
        if (!isEmpty(criteriaId)) {
          let url = 'v2/criteria/getConditions'
          let params = {
            moduleName: criteriaModuleName,
            criteriaId,
            page,
            perPage,
            force,
            withCount: true,
          }
          if (!isEmpty(searchText)) {
            params = { ...params, search: searchText }
          }
          let { data, error } = await API.get(url, params)
          if (!error) {
            let { conditions } = data || {}
            this.criteriaData = conditions || []
          } else {
            ftoast.critical(error?.message || 'Error Occured')
          }
        }
      }
      this.isLoading = false
    },
    isMultivalueField(record) {
      let dataType = this.getDataType(record)
       return Multi_Value_Fields.includes(dataType)
    },
    isSinglevalueField(record) {
       let dataType = this.getDataType(record)
       return Single_Value_Fields.includes(dataType)
    },
    getFieldName(field) {
      let { row: record } = field || {}
      if (this.isOneLevelLookup(record)) {
        return this.getOneLevelFields(record)
      } else {
        return getProperty(record, 'displayName', '---')
      }
    },
    isValueNotDefined(record) {
      let { operatorId, value, criteriaValue } = record || {}
      if (operatorId === 35) {
        let { value } = criteriaValue || {}
        return isEmpty(value)
      }
      return !isEmpty(operatorId) && isEmpty(value)
    },
    getOperatorDetails(record) {
      let { row } = record || {}
      if (this.isOneLevelLookup(row)) {
        return this.getOneLevelOperatorDetails(row)
      } else {
        return this.getProperty(record, 'row.operator', '---')
      }
    },
    getOneLevelOperatorDetails(record) {
      return getProperty(record, 'criteriaValue.operator', '---')
    },
    canShowDates(record) {
      let { row } = record || {}
      let { operatorId, criteriaValue } = row || {}
      if (this.isOneLevelLookup(row)) {
        let { operatorId: oneLevelOperatorId } = criteriaValue || {}
        record = criteriaValue
        operatorId = oneLevelOperatorId
      }
      let dataType = this.getDataType(record)
      return (
        !DATE_FIELD.includes(operatorId) &&
        ['DATE', 'DATE_TIME'].includes(dataType)
      )
    },
    isOneLevelLookup(record) {
      let { operatorId } = record || {}
      return operatorId === 35
    },
    getOneLevelFields(record) {
      return `${getProperty(record, 'displayName', '---')} / ${getProperty(
        record,
        'criteriaValue.displayName',
        '---'
      )}`
    },
    getFormattedValue(record) {
      let { row } = record || {}
      let { value, operatorId } = row || {}
      if (this.isOneLevelLookup(row)) {
        let { criteriaValue } = row || {}
        let { value: oneLevelValue, operatorId: oneLevelOperatorId } =
          criteriaValue || {}
        value = oneLevelValue
        operatorId = oneLevelOperatorId
      }
      if (!isEmpty(value)) {
        if (DATE_FIELD.includes(operatorId))
          value = value.map(val => {
            return { name: val }
          })
        else
          value = value.map(val => {
            return { name: val.label }
          })
        return value
      }

      return null
    },
    getDateInfo(record) {
      let { row } = record || {}
      let { fieldName, value, operatorId } = row || {}
      if (this.isOneLevelLookup(row)) {
        let { criteriaValue } = row || {}
        let { value: oneLevelValue, operatorId: oneLevelOperatorId } =
          criteriaValue || {}
        value = oneLevelValue
        operatorId = oneLevelOperatorId
      }
      if (DATE_FIELD.includes(operatorId)) {
        return value
      }
      let dataType = this.getDataType(record)
      let modifiedValue = (value || []).map(val => {
        return dataType === 'DATE'
          ? dayjs(Number(val)).format('MMM-DD-YYYY')
          : dayjs(Number(val)).format('MMM-DD-YYYY HH:MM')
      })
      return modifiedValue.join(' to ')
    },
    getStringFieldData(record) {
      let { row } = record || {}
      let { fieldName, value, criteriaValue } = row || {}
      if (this.isOneLevelLookup(row)) {
        let { value: oneLevelValue } = criteriaValue || {}
        value = oneLevelValue
      }
      return getProperty(value, '0', '---')
    },
    getDataType(record) {
      let { row } = record || {}
      let { fieldName, dataType, criteriaValue } = row || {}
      if (this.isOneLevelLookup(row)) {
        let { dataType: oneLevelDataType } = criteriaValue || {}
        dataType = oneLevelDataType
      }
      return dataType
    },
    isLookupBehaviour(record) {
      let value = this.getDefaultFieldValues(record)
      return value?.length > 1
    },
    getDefaultValue(record) {
      let value = this.getDefaultFieldValues(record)
      return getProperty(value, '0', '---')
    },
    getDefaultFieldValues(record) {
      let { row } = record || {}
      let { fieldName, value, criteriaValue } = row || {}
      if (this.isOneLevelLookup(row)) {
        let { value: oneLevelValue } = criteriaValue || {}
        value = oneLevelValue
      }
      if (value?.length > 1) {
        value = value.map(val => {
          let { label } = val || {}
          return isEmpty(label) ? { name: val } : { name: label }
        })
      }
      return value
    },
  },
}
</script>
