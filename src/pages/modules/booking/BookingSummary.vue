<script>
import ModuleSummary from '../../../pages/summary/ModuleSummary.vue'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

import dlv from 'dlv'
import { API } from '@facilio/api'
import {ftoast} from '@facilio/design-system'

export default {
  name: 'BookingSummary',
  extends: ModuleSummary,
  computed: {
    systemBtnList() {
      let systemBtns=[]
      let canShowCancel=dlv(this.record,'canShowCancel')
      if(canShowCancel){
        let cancelBookingObj={
          name: 'Cancel Booking',
          identifier: 'cancelBooking',
          clickAction: this.cancelBooking,
          appearance: 'secondary',
        }  
        systemBtns.push(cancelBookingObj)
      }
     return systemBtns
    },
    moreButtonList() {
      return []
    },
    mainFieldKey() {
      return 'facility.name'
    },
  },
  methods: {
    async cancelBooking() {
      let {
        moduleName,
        record: { id },
      } = this
      let { error } = await API.updateRecord(moduleName, {
        id,
        data: { id },
        params: { cancelBooking: true },
      })

      if (error) {
        ftoast.critical(error.message || this.$t('facility.booking.error_occured_while_cancelling',{ns:'facilitybooking'}))
      } else {
        this.refreshData()
      }
    },
  },
}
</script>
