<template>
  <FContainer>
    <FContainer v-if="isEmpty(details.slotList)">
      <FEmptyState
        :illustration="'no-data'"
        :title="
          $t('facility.booking.no_slots_booked', { ns: 'facilitybooking' })
        "
        :vertical="false"
        :size="'S'"
      />
    </FContainer>
    <FContainer v-else>
      <FTable
        :columns="column"
        :data="datas"
        :rounded="false"
        :hideBorder="false"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FEmptyState, FTable } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate, getCurrency } from '../../../../utils/formatter'

export default {
  props: ['widget', 'details', 'fitMyContent'],
  components: {
    FContainer,
    FText,
    FEmptyState,
    FTable,
  },
  data() {
    return {
      column: [
        {
          displayName: 'Start Time',
          name: 'startTime',
          id: 1,
          width: 250,
          fixed: true,
        },
        {
          displayName: 'End Time',
          name: 'endTime',
          id: 2,
          width: 250,
        },
      ],
      datas: [],
    }
  },
  created() {
    this.getSlotInformationData()
  },
  mounted() {
    this.fitMyContent()
  },
  methods: {
    isEmpty,
    getSlotInformationData() {
      let { details } = this
      let { slotList, bookingAmount } = details || {}
      if (!isEmpty(bookingAmount)) {
        let costColumn = {
          displayName: 'Cost',
          name: 'cost',
          id: 3,
          width: 250,
        }
        this.column.push(costColumn)
      }
      ;(slotList || []).forEach(slot => {
        let data = {}
        let { slotStartTime, slotEndTime, slotCost } = slot || {}
        data.startTime = formatDate(slotStartTime)
        data.endTime = formatDate(slotEndTime)
        let currency = getCurrency()
        if (!isEmpty(bookingAmount)) {
          data.cost = currency + (slotCost || 0)
        }
        this.datas.push(data)
      })
    },
  },
}
</script>
