<template>
  <FModal
    :append-to-body="true"
    :visible="true"
    size="S"
    :title="summaryData.name"
    @ok="onSave"
    @cancel="onCancel"
  >
    <template #header>
      <FContainer display="flex" alignItems="center" gap="containerLarge">
        <FText appearance="headingMed16" color="textMain">{{
          displayName
        }}</FText>
        <FTags
          v-if="!isEmpty(moduleState)"
          appearance="simple"
          :text="moduleState"
          :isClickable="false"
        ></FTags>
      </FContainer>
    </template>
    <template #close-icon>
      <FContainer display="flex" gap="containerMedium">
        <FIcon
          group="navigation"
          name="open-window"
          size="16"
          @click="onRedirect"
        ></FIcon>
        <FIcon group="default" name="close" size="14" @click="onCancel" />
      </FContainer>
    </template>
    <FContainer
      padding="containerXLarge sectionLarge"
      margin="containerNone sectionSmall"
      gap="containerXLarge"
      display="flex"
      flexDirection="column"
    >
      <FText appearance="headingMed14" color="textMain">{{
        $t('custommodules.list.details')
      }}</FText>
      <FContainer>
        <FText appearance="bodyReg14">{{
          viewDetails.startDateField.displayName
        }}</FText>
        <FDatePicker
          v-model="summaryData.workStart"
          type="date-time"
          :placeholder="$t('select')"
          :disabled="viewDetails.isLocked"
          :timeZone="timeZone"
          :timeFormat="{ is12Hour: true, interval: 15 }"
        />
      </FContainer>
      <FContainer v-if="!isEmpty(viewDetails.endDateField)">
        <FText>{{ viewDetails.endDateField.displayName }}</FText>
        <FDatePicker
          v-model="summaryData.actualWorkEnd"
          type="date-time"
          :placeholder="$t('select')"
          :disabled="viewDetails.isLocked"
          :timeZone="timeZone"
          :timeFormat="{ is12Hour: true, interval: 15 }"
        />
      </FContainer>
      <FContainer>
        <FText>{{ viewDetails.groupByField.displayName }}</FText>
        <FShimmer
          v-if="grpLoading"
          :rounded="false"
          :height="30"
          :width="350"
        ></FShimmer>
        <FSelect
          v-else
          v-model="summaryData.grpId"
          :placeholder="$t('select')"
          :options="groupList"
          :loading="grpLoading"
        />
      </FContainer>
      <FContainer v-if="!isEmpty(additionalFields)">
        <FShimmer v-if="loading" :height="50" :width="300"></FShimmer>
        <FieldsGroup
          v-else
          :config="config"
          :details="details"
          :hideGlimpse="true"
          :getRoute="() => {}"
          :detailsLayout="detailsLayout"
        ></FieldsGroup>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FText,
  FContainer,
  FSelect,
  FDatePicker,
  FModal,
  FShimmer,
  FTags,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import { FieldsGroup } from '@facilio/ui/new-app'
import { getTimeFormat, getTimeZone } from '../../../utils/formatter'
import getProperty from 'dlv'

export default {
  props: ['data', 'viewDetails', 'moduleName', 'viewname', 'additionalFields'],
  components: {
    FContainer,
    FText,
    FSelect,
    FDatePicker,
    FModal,
    FIcon,
    FShimmer,
    FTags,
    FieldsGroup,
    ftoast,
  },
  data() {
    return {
      isEmpty,
      summaryData: {},
      groupList: [],
      details: {},
      detailsLayout: [],
      grpLoading: false,
      loading: false,
    }
  },
  created() {
    this.summaryData = { ...(this.data || {}) }
    this.loadGroupingData()
    if (!isEmpty(this.additionalFields)) this.loadAdditionalData()
  },
  computed: {
    displayName() {
      let { displayName, name } = this.summaryData || {}
      return displayName || name
    },
    moduleState() {
      let { moduleState } = this.details || {}
      let { displayName, primaryValue } = moduleState || {}
      return displayName || primaryValue
    },
    timeZone() {
      return getTimeZone()
    },
    config() {
      let { $account: account } = this
      let timeformat = getTimeFormat()
      let timezone = this.timeZone
      let dateformat = getProperty(account, 'org.dateFormat') || 'DD/MM/YYYY'
      return {
        dateformat,
        timezone,
        timeformat,
        showDivider: false,
        org: account.org,
      }
    },
  },
  methods: {
    async loadGroupingData() {
      this.grpLoading = true
      let url = `/v3/timelineScheduledViewGroupData/${this.moduleName}/fetch`
      let params = {
        timelineModuleName: this.moduleName,
        timelineViewName: this.viewname,
        viewName: 'hidden-all',
      }
      let { error, data } = await API.get(url, params)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let {
          groupByField: { displayName },
        } = this.viewDetails
        let { pickList } = data || {}
        let unGroupList = {
          value: -1,
          label: `${this.$t('custommodules.list.no')} ${displayName}`,
        }

        this.groupList = pickList || []
        this.groupList.unshift(unGroupList)
      }
      this.grpLoading = false
    },
    async loadAdditionalData() {
      this.loading = true
      let { moduleName, data: dataObj } = this
      let { id } = dataObj || {}
      let { [moduleName]: data, error } = await API.fetchRecord(moduleName, {
        id,
      })

      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        this.details = data || {}
        this.detailsLayout = this.constructData()
      }
      this.loading = false
    },
    constructData() {
      let fields = (this.additionalFields || []).map(data => {
        let name = getProperty(data, 'dataTypeEnum._name', '')
        return { ...data, colSpan: 2, field: { dataTypeEnum: name } }
      })
      let name = this.$t('custommodules.list.additional_details')
      let data = [
        {
          columns: 4,
          fields,
          name,
          displayName: name,
        },
      ]

      return data
    },
    onSave() {
      let { grpId: oldGrpId } = this.data
      let { grpId: currentGrpId } = this.summaryData
      let grpId = [oldGrpId]

      if (this.oldGrpId !== currentGrpId) grpId.push(currentGrpId)
      this.summaryData = { ...this.summaryData, grpId }
      this.$emit('save', this.summaryData)
    },
    onCancel() {
      this.$emit('cancel')
    },
    onRedirect() {
      this.$emit('onRedirect', this.summaryData.id)
    },
  },
}
</script>
