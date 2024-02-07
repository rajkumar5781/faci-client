<template>
  <FContainer
    borderRadius="high"
    borderColor="borderNeutralBaseSubtle"
    height="50%"
    width="100%"
    marginTop="containerXLarge"
    display="flex"
    flexDirection="column"
    overflowY="scroll"
  >
    <FTable
      v-if="!isEmpty(meters)"
      :columns="columns"
      :data="meters"
      :showSelectBar="false"
      :hideBorder="true"
    >
      <template #[`cell.id`]="{ row }">#{{ row.id }}</template>
      <template #[`cell.isActivated`]="{ row }">
        <FText color="textMain" appearance="headingMed14">
          {{ getActivationStatus(row) }}
        </FText>
      </template>
      <template #[`cell.meterState`]="{ row }">
        <FTags
          v-if="getStatus(row)"
          appearance="status"
          :text="getStatus(row)"
          :statusType="getStatusType(row)"
        />
      </template>
      <template #[`cell.action`]="{ row }">
        <FContainer display="flex">
          <FIcon
            group="dsm"
            name="info"
            size="16"
            dataArrow="true"
            :title="$t('utility.more_details', { ns: 'energy' })"
            @click="toggleSummaryDetailsDialog(row)"
            class="visibility-hide-actions pointer"
            marginRight="containerXLarge"
          ></FIcon>
          <FContainer marginRight="containerLarge">
            <FButton appearance="primary" @click="addRelatedRecordsToggle(row)">
              {{ $t('utility.associate', { ns: 'energy' }) }}
            </FButton>
          </FContainer>
          <FContainer marginRight="containerLarge">
            <FButton
              v-if="showActivation(row)"
              appearance="primary"
              @click="activateMeter(row)"
            >
              {{ $t('utility.activate', { ns: 'energy' }) }}
            </FButton>
          </FContainer>
          <FContainer marginRight="containerLarge">
            <FButton
              v-if="showFetchBillButton(row)"
              appearance="primary"
              @click="fetchBills(row)"
            >
              {{ $t('utility.fetch_bill', { ns: 'energy' }) }}
            </FButton>
          </FContainer>
        </FContainer>
      </template></FTable
    >
    <FContainer v-else class="text-center p20">
      {{ $t('utility.no_meters_associated', { ns: 'energy' }) }}
    </FContainer>
    <LookupWizard
      v-if="associateRecordPopup"
      :canShowLookupWizard.sync="associateRecordPopup"
      @setLookupFieldValue="setLookupFieldValue"
      :field.sync="meterFieldObj"
    />
    <FetchBills
      v-if="canShowFetchBills"
      :meterID="meterID"
      @closeDialog="closeDialog"
    />
    <FModal
      v-if="canShowSummaryDetailsDialog"
      :title="$t('utility.more_details', { ns: 'energy' })"
      :visible="canShowSummaryDetailsDialog"
      size="M"
      :hideFooter="true"
      @cancel="handleCancel"
    >
      <FContainer
        display="grid"
        gridTemplateColumns="1fr 1fr 1fr"
        gridTemplateRows="1fr 1fr 1fr 1fr"
        gap="containerMedium"
        alignItems="flex-start"
        paddingTop="containerXxLarge"
        paddingLeft="sectionSmall"
        paddingBottom="containerXxLarge"
      >
        <template v-for="(field, index) in summaryFields">
          <FContainer
            :key="index"
            width="100%"
            flexDirection="column"
            justifyContent="center"
            gap="containerMedium"
            alignItems="flex-start"
            marginBottom="containerXxLarge"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerLarge"
              alignSelf="stretch"
            >
              <FText
                color="textMain"
                lineHeight="130%"
                appearance="captionMed12"
              >
                {{ getProperty(field, 'label', '') }}
              </FText>
            </FContainer>
            <FContainer
              display="flex"
              alignItems="center"
              paddingTop="containerMedium"
              alignSelf="stretch"
            >
              <FButton
                v-if="
                  field.label === 'Associated Meter Id' && field.value !== '---'
                "
                text-decoration="underline"
                cursor="pointer"
                appearance="link"
                @click="redirectToSummary(field.value)"
              >
                {{ getProperty(field, 'value', '') }}
              </FButton>
              <FContainer
                v-else
                class="not-clickable"
                color="inherit"
                cursor="default"
                textDecoration=" none"
                >{{ getProperty(field, 'value', '') }}</FContainer
              >
            </FContainer>
          </FContainer>
        </template>
      </FContainer>
    </FModal>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <FContainer
        height="sectionLarge"
        display="flex"
        padding="containerLarge"
        alignItems="center"
        width="100%"
      >
        <Pagination
          v-if="recordCount > 0 || !isEmpty(recordList)"
          :key="`pagination-${moduleName}`"
          :totalCount="recordCount"
          :currentPageNo.sync="page"
          :currentPageCount="recordList.length"
          :perPage="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import getProperty from 'dlv'
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { formatDate } from '../../../../utils/formatter'
import Pagination from '../../../list/Pagination.vue'

import {
  FContainer,
  FText,
  FTable,
  FTags,
  FIcon,
  FModal,
  FButton,
  ftoast,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import FetchBills from '../FetchBills.vue'

const STATUS = [
  { name: 'Unmapped', type: 'information' },
  {
    name: 'Pending for Activation',
    type: 'warning',
  },
  { name: 'Activated', type: 'success' },
  { name: 'Errored', type: 'danger' },
]
export const STATUS_ENUM = {
  1: 'UNMAPPED',
  2: 'PENDING',
  3: 'ACTIVATED',
  4: 'ERRORED',
}

const meterFieldObj = {
  isDataLoading: false,
  options: [],

  lookupModuleName: 'meter',
  field: {
    lookupModule: {
      name: 'meter',
      displayName: 'Meters',
    },
  },
  selectedItems: [],

  multiple: false,
}
export default {
  props: ['details', 'widget'],
  components: {
    FText,
    FContainer,
    LookupWizard,
    FetchBills,
    FTable,
    FTags,
    FIcon,
    FButton,
    FModal,
    Pagination,
  },
  data() {
    return {
      recordList: [],
      recordCount: null,
      page: 1,
      canShowSummaryDetailsDialog: false,
      associateRecordPopup: false,
      meterFieldObj,
      isLoading: false,
      canShowFetchBills: false,
      canShowActivate: false,
      canShowAssociate: false,
      meterID: null,
      recordId: null,
      STATUS,
      visibility: false,
      meters: [],
      list: [],
      columns: [
        {
          displayName: this.$t('utility.id', { ns: 'energy' }),
          name: 'id',
          id: 1,
          fixed: true,
          width: 50,
        },

        {
          displayName: this.$t('utility.utility_id', { ns: 'energy' }),
          name: 'utilityID',
          id: 2,
          fixed: true,
          resize: true,
          width: 100,
          clickable: true,
        },
        {
          displayName: this.$t('utility.is_activated', { ns: 'energy' }),
          name: 'isActivated',
          id: 3,
          width: 100,
        },
        {
          displayName: this.$t('utility.service_tariff', { ns: 'energy' }),
          name: 'serviceTariff',
          id: 5,
          width: 200,
        },
        {
          displayName: this.$t('utility.meterState', { ns: 'energy' }),
          name: 'meterState',
          id: 6,
          width: 200,
        },
      ],

      currentRecord: {},
      summaryFields: [],
      moduleName: 'utilityIntegrationMeter',
      moduleDisplayName: 'Meter Connections',
      viewname: 'hidden-all',
      perPage: 5,
    }
  },
  created() {
    this.getMeterList()
  },
  watch: {
    page() {
      this.getMeterList()
    },
  },

  methods: {
    getProperty,
    isEmpty,
    getActivationStatus(row) {
      let isActivated = getProperty(row, 'isActivated')
      return isActivated ? 'Yes' : 'No'
    },
    formattedDate(dateTime) {
      return formatDate(dateTime)
    },
    closeDialog() {
      this.canShowFetchBills = false
    },
    showFetchBillButton(record) {
      let meterState = getProperty(record, 'meterStateEnum', null)
      return meterState === 'ACTIVATED'
    },

    fetchBills(record) {
      let { id } = record || {}
      this.canShowFetchBills = true
      this.meterID = id
    },
    getStatus(row) {
      let { meterState } = row || {}
      if (meterState >= 1 && meterState <= STATUS.length) {
        let statusIndex = meterState - 1
        return getProperty(STATUS[statusIndex], 'name', null)
      } else {
        return null
      }
    },
    getStatusType(row) {
      let { meterState } = row || {}
      if (meterState >= 1 && meterState <= STATUS.length) {
        let statusIndex = meterState - 1
        return getProperty(STATUS[statusIndex], 'type', 'default')
      }
    },
    showActivation(record) {
      let meterState = getProperty(record, 'meterStateEnum', null)
      return meterState === 'UNMAPPED'
    },

    addRelatedRecordsToggle(record) {
      let { id } = record || {}
      this.meterID = id
      this.associateRecordPopup = !this.associateRecordPopup
    },
    async activateMeter(record) {
      this.isLoading = true
      let { id } = record || {}
      let { error, data } = await API.post(
        `v3/utilityIntegration/activateMeters`,
        {
          meterID: id,
        }
      )
      if (error) {
        ftoast.critical(this.$t('utility.error_occurred', { ns: 'energy' }))
      } else {
        ftoast.success(this.$t('utility.meter_activated', { ns: 'energy' }))

        this.getMeterList()
        this.isLoading = false
      }
    },
    async setLookupFieldValue(value) {
      let { field = {} } = value
      let { selectedItems } = field || {}
      let meterIds = selectedItems.map(item => item.value)

      const params = {
        id: this.meterID,
        meterIds: meterIds,
      }
      let { error, data } = await API.post(
        'v3/utilityIntegration/associateMeter',
        params
      )
      if (!error) {
        ftoast.success(
          this.$t('utility.meter_mapped_successfully', { ns: 'energy' })
        )
        this.getMeterList()
      } else {
        ftoast.critical(this.$t('utility.error_occured', { ns: 'energy' }))
      }
      this.meterFieldObj.selectedItems = []
      this.showLookupFieldWizard = false
    },

    async getMeterList() {
      this.isLoading = true
      let { details = {} } = this
      let { id } = details || {}

      let params = {
        filters: JSON.stringify({
          utilityIntegrationCustomer: {
            operatorId: 36,
            value: [`${id}`],
          },
        }),
      }
      let { list, meta, error } = await API.fetchAll(this.moduleName, params)
      if (isArray(list)) {
        this.recordList = list || []
        this.recordCount = getProperty(meta, 'pagination.totalCount', null)
        this.meters = list || []
      }
      if (error) {
        let { message } = error || {}

        ftoast.critical(
          message || this.$t('utility.error_occured', { ns: 'energy' })
        )
      } else {
        this.isLoading = false
      }
    },

    cancelDialog() {
      this.visibility = false
      this.showEditMode = false
    },

    refreshData() {
      this.getMeterList()
    },
    toggleSummaryDetailsDialog(rowData) {
      this.currentRecord = rowData
      this.canShowSummaryDetailsDialog = !this.canShowSummaryDetailsDialog
      const {
        createdTime,
        userEmail,
        meter,
        userUid,
        frequency,
        nextPrepay,
        nextRefresh,
        prepay,
        sysCreatedBy,
        sysCreatedTime,
        sysModifiedBy,
        sysModifiedTime,
      } = this.currentRecord || {}

      const defaultFieldValue = '---'

      const getFormattedDate = date =>
        date ? this.formattedDate(date) : defaultFieldValue

      let { id } = meter || {}

      if (rowData && getProperty(rowData, 'meter.id') !== null) {
        this.summaryFields = [
          {
            label: this.$t('utility.authorization_submitted_time', {
              ns: 'energy',
            }),
            value: getFormattedDate(createdTime),
          },
          {
            label: this.$t('utility.user_email', { ns: 'energy' }),
            value: userEmail || defaultFieldValue,
          },
          {
            label: this.$t('utility.associated_meter_id', { ns: 'energy' }),
            value: id || defaultFieldValue,
          },
          {
            label: this.$t('utility.user_uid', { ns: 'energy' }),
            value: userUid || defaultFieldValue,
          },
          {
            label: this.$t('utility.frequency', { ns: 'energy' }),
            value: frequency || defaultFieldValue,
          },
          {
            label: this.$t('utility.next_prepay', { ns: 'energy' }),
            value: getFormattedDate(nextPrepay),
          },
          {
            label: this.$t('utility.next_refresh', { ns: 'energy' }),
            value: getFormattedDate(nextRefresh),
          },
          {
            label: this.$t('utility.prepay', { ns: 'energy' }),
            value: prepay || defaultFieldValue,
          },
          {
            label: this.$t('utility.created_by', { ns: 'energy' }),
            value: sysCreatedBy?.name || defaultFieldValue,
          },
          {
            label: this.$t('utility.created_time', { ns: 'energy' }),
            value: getFormattedDate(sysCreatedTime),
          },
          {
            label: this.$t('utility.modified_by', { ns: 'energy' }),
            value: sysModifiedBy?.name || defaultFieldValue,
          },
          {
            label: this.$t('utility.modified_time', { ns: 'energy' }),
            value: getFormattedDate(sysModifiedTime),
          },
        ]
      }
    },

    handleCancel() {
      this.canShowSummaryDetailsDialog = false
    },
    redirectToSummary(id) {
      let { name } = findRouteForModule('meter', pageTypes.OVERVIEW) || {}
      if (!isEmpty(name)) {
        this.$router.push({
          name,
          params: { id, viewname: 'all' },
        })
      }
    },
  },
}
</script>
