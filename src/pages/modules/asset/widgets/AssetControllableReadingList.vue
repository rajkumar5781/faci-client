<template>
  <FContainer height="100%">
    <template v-if="isActive">
      <portal :to="portalName" :key="portalName + '-portalwrap'" slim>
        <FContainer @click="listRefresh">
          <FIcon group="action" name="refresh" size="16"></FIcon>
        </FContainer>
      </portal>
    </template>

    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer v-else-if="isEmpty(list)" height="98%">
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
              title="No readings available."
              :description="`Currently the ${moduleName} has no readings`"
              :vertical="false"
              size="S"
              illustration="no-entries"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>

    <FContainer v-else>
      <FTable :rounded="false" :columns="column" :data="list">
        <template #[`cell.subject`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            $getProperty(row, 'field.displayName', '---')
          }}</FText>
        </template>
        <template #[`cell.value`]="{ row }">
          <FContainer v-if="row.value == null">
            <FText color="textMain" appearance="bodyReg14">
              {{ row.value }}</FText
            >
          </FContainer>
          <FContainer v-else-if="isDecimalField(row.field)">
            <FText color="textMain" appearance="bodyReg14">
              {{ Number(row.value).toFixed(1) }}{{ row.field.unit }}
            </FText>
          </FContainer>
          <FContainer v-else-if="isBooleanField(row.field)">
            <FText color="textMain" appearance="bodyReg14">
              {{ row.value }}</FText
            >
          </FContainer>
          <FContainer v-else>
            <FText color="textMain" appearance="bodyReg14">
              {{ row.value }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.lastrecorded`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">
            {{ getTimeFromNow(row) }}</FText
          >
        </template>
        <template #[`cell.set`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">
            <a @click="showSetReadingDialog(row)" class="pL30">
              {{ $t('asset.readings.set','Set',{ns:'asset'}) }}
            </a></FText
          >
        </template>
      </FTable>
      <!-- <SetReadingPopup
        v-if="showSetDialog"
        :key="newReading.field.id"
        :reading="newReading"
        :saveAction="closePopup"
        :closeAction="closePopup"
        :recordId="details.id"
        :recordName="details.name"
      >
      </SetReadingPopup> -->
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FSpinner,
  FText,
  FTable,
  FPagination,
  FIcon,
  FEmptyState,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { fromNow } from '../../../../utils/formatter'
// import SetReadingPopup from 'src/components/readings/SetReadingValue.vue'
import { API } from '@facilio/api'
import { isBooleanField, isDecimalField } from '@facilio/utils/field'
export default {
  components: {
    // SetReadingPopup,
    FContainer,
    FSpinner,
    FText,
    FTable,
    FPagination,
    FIcon,
    FEmptyState,
    FDivider,
  },
  props: [
    'isActive',
    'portalName',
    'assetId',
    'resize',
    'reset',
    'details',
    'moduleName',
    'widget',
  ],

  mounted() {
    this.loadData()
  },
  created() {
    this.isBooleanField = isBooleanField
    this.isDecimalField = isDecimalField
  },
  data() {
    return {
      loading: false,
      list: null,
      showSetDialog: false,
      newReading: {
        field: null,
        value: null,
      },
      readingType: 'writable',
      column: [
        { displayName: 'Subject', name: 'name', id: 1, fixed: true },
        {
          displayName: 'Value',
          name: 'value',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Last Recorded',
          name: 'lastrecorded',
          id: 3,
          width: 250,
          clickable: true,
        },
        {
          displayName: '',
          name: 'set',
          id: 4,
          width: 250,
          clickable: true,
        },
      ],
    }
  },
  watch: {
    widget: {
      immediate: true,
      handler: 'loadData',
    },
  },

  methods: {
    isEmpty,
    async loadData(force) {
      this.loading = true
      let url = `/v2/reading/latestdata/${this.assetId}`
      let params = { readingType: this.readingType }
      let { data } = await API.get(url, params, { force })
      let list = (data.readingValues || []).map(reading => ({
        name: reading.field.displayName,
        ...reading,
      }))
      this.list = list
      this.loading = false
    },
    addEnumMapField(fields) {
      let enumMap = fields.values.reduce((acc, object) => {
        acc[object.index.toString()] = object.value
        return acc
      }, {})
      fields.enumMap = enumMap
      return fields
    },
    getTimeFromNow(reading) {
      if (!isEmpty(reading)) {
        let { actualValue, ttime } = reading
        return !isEmpty(actualValue) ? fromNow(ttime) : '---'
      }
      return '---'
    },
    showSetReadingDialog(reading) {
      let { newReading } = this
      newReading.field = reading.field
      newReading.value = reading.value
      this.showSetDialog = true
    },
    closePopup() {
      this.showSetDialog = false
      this.resetEditObj()
    },
    resetEditObj() {
      this.newReading = {
        field: null,
        value: null,
      }
    },
    listRefresh() {
      this.loadData(true)
    },
  },
}
</script>
