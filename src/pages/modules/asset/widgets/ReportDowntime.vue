<template>
  <FModal
    :title="$t('asset.report_downtime', 'Report Downtime', { ns: 'asset' })"
    :visible="visibility"
    :confirmLoading="isSaving"
    saveText="Save"
    centered="true"
    @ok="saveAssetBreakdown()"
    @cancel="closeDialog()"
    :hideFooter="false"
    size="S"
  >
    <FContainer
      display="flex"
      padding="containerXxLarge sectionLarge"
      marginLeft="sectionLarge"
      marginRight="sectionLarge"
      flexDirection="column"
      justifycontent="center"
      alignItems="flex-start"
      gap="sectionSmall"
    >
      <FContainer
        display="flex"
        width="351px"
        flexDirection="column"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">
            {{
              $t('asset.downtime_message', 'Downtime Message', { ns: 'asset' })
            }}</FText
          >
          <FContainer width="351px">
            <FInput
              v-model="breakdown.condition"
              :disabled="false"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer
        display="flex"
        width="351px"
        flexDirection="column"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">{{
            $t('asset.time', 'Time', { ns: 'asset' })
          }}</FText>
          <FContainer width="351px">
            <FDatePicker
              v-model="time"
              placeholder="Select time range"
              type="date-time-range"
              :timeFormat="{ is12Hour: true, interval: 15 }"
              :disabled="false"
              displayFormat="YYYY-MM-DD HH:mm"
              @change="pickerChange"
              :timeZone="timezone"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import {
  FContainer,
  FText,
  FDatePicker,
  FInput,
  FModal,
  ftoast,
} from '@facilio/design-system'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { formatCustomDate } from '../../../../utils/formatter'
import dlv from 'dlv'

export default {
  props: ['assetBDSourceDetails', 'visibility'],
  components: {
    FContainer,
    FText,
    FDatePicker,
    FInput,
    FModal,
  },
  data() {
    return {
      breakdown: {
        sourceId: null,
        condition: null,
        assetid: null,
        sourceType: null,
      },
      time: null,
      fromtime: null,
      totime: null,
      error: false,
      errorText: '',
      isSaving: false,
    }
  },
  mounted() {
    this.initAssetBreakDown()
  },
  computed:{
    timezone() {
      let { $account: account } = this
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      return timezone
    },
  },
  methods: {
    initAssetBreakDown() {
      this.breakdown = { ...this.assetBDSourceDetails }
    },
    pickerChange(value) {
      if (!isEmpty(value) && isArray(value)) {
        this.fromtime = value[0]
        this.totime = value[1]
        //this.time = value.map(val => this.getTimeInSystemZone(val))
      } else this.time = []
    },
    validation() {
      if (isEmpty(this.breakdown.condition)) {
        this.errorText = 'Please enter the conditions'
        this.error = true
      } else if (isEmpty(this.time)) {
        this.errorText = 'Please choose time'
        this.error = true
      } else {
        this.errorText = ''
        this.error = false
      }
    },

    saveAssetBreakdown() {
      this.validation()

      if (this.error) {
        ftoast.critical(this.errorText)
        return
      }

      let assetBDSourceDetails = { ...this.breakdown }
      let { fromtime, totime } = this
      assetBDSourceDetails.fromtime = fromtime
      assetBDSourceDetails.totime = totime

      this.isSaving = true

      API.post('/v2/assetbreakdown/addNew/workorder', { assetBDSourceDetails })
        .then(response => {
          if (!response.error) {
            ftoast.success('Asset breakdown saved successfully')
            this.$emit('onSave')
            this.closeDialog()
          } else {
            ftoast.critical(
              'Downtime has already been reported for this time period'
            )
          }
          this.isSaving = false
        })
        .catch(() => {
          ftoast.critical('Failed to record breakdown')
          this.closeDialog()
          this.isSaving = false
        })
    },
    getTimeInSystemZone(value) {
      return formatCustomDate(value, 'YYYY-MM-DD HH:mm:ss')
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
  },
}
</script>
