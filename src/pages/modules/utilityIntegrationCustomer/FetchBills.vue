<template>
  <FModal
    :visible="true"
    :title="$t('utility.fetch_bills', { ns: 'energy' })"
    size="S"
    :hideFooter="false"
    @ok="fetchBills()"
    @cancel="closeDialog"
    :saveText="$t('utility.ok', { ns: 'energy' })"
  >
    <FContainer padding="containerLarge">
      <FContainer
        class="date-range-label"
        marginLeft="sectionXSmall"
        width="auto"
      >
        {{ $t('utility.date_range', { ns: 'energy' }) }}
      </FContainer>
      <FContainer
        class="date-range-container"
        padding="containerLarge"
        marginRight="sectionSmall"
      >
        <div class="date-picker-container">
          <FDatePicker
            v-model="fetchBillList"
            type="date-range"
            :value="dateValue"
            :placeholder="billDateRangePlaceholder"
            :timeFormat="{ is12Hour: true, interval: 15 }"
            displayFormat="YYYY-MM-DD HH:mm"
            :disabled="false"
            width="100%"
            height="auto"
            marginBottom="sectionMedium"
          />
        </div>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { FModal, FDatePicker, FContainer, ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'
import dayjs from 'dayjs'
import getProperty from 'dlv'

export default {
  props: ['meterID'],
  data: () => ({
    fetchBillList: null,
    isLoading: false,
    records: [],
    recordCount: null,
  }),
  components: { FModal, FDatePicker, FContainer },
  computed: {
    dateValue() {
      return new Date().getTime()
    },
    billDateRangePlaceholder() {
      return this.$t('utility.select_bill_date_range', { ns: 'energy' })
    },
  },
  methods: {
    getProperty,
    async fetchBills() {
      this.isLoading = true
      let startTime = ''
      let endTime = ''
      let [fromDate, endDate] = this.fetchBillList
      if (fromDate && endDate) {
        startTime = dayjs(fromDate).valueOf().toString()
        endTime = dayjs(endDate).valueOf().toString()
      }

      let { error, data } = await API.post(`v3/utilityIntegration/fetchBills`, {
        meterID: this.meterID,
        startTime,
        endTime,
      })
      if (error) {
        let { message } = error || {}
        let errorMessage = getProperty(error, message, this.$t('error_occured'))
        ftoast.critical(errorMessage)
        this.closeDialog()
      } else {
        ftoast.success(this.$t('utility.bills_fetched', { ns: 'energy' }))
        this.closeDialog()
        this.isLoading = false
      }
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
  },
}
</script>
