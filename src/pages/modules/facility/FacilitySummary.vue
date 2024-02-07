<script>
import ModuleSummary from '../../../pages/summary/ModuleSummary.vue'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

export default {
  name: 'FacilitySummary',
  extends: ModuleSummary,
  computed: {
    systemBtnList() {
      let systemBtns = []

      let bookNowBtnObj = {
        name: 'Book Now',
        identifier: 'bookNow',
        clickAction: this.openBookingForm,
        appearance: 'primary',
      }
      let { $access: access, bookingModuleName } = this
      if (access.hasPermission(`${bookingModuleName}:CREATE`)) {
        systemBtns.push(bookNowBtnObj)
      }
      return systemBtns
    },
    bookingModuleName() {
      return 'facilitybooking'
    },
  },
  methods: {
    openBookingForm() {
      let { record = {} } = this
      let { id } = record
      let routeName
      if (isWebTabsEnabled()) {
        let { name } =
          findRouteForModule('facilitybooking', pageTypes.CREATE) || {}
        routeName = name
      } else {
        routeName = 'new-booking'
      }
      routeName &&
        this.$router.push({
          name: routeName,
          query: { facility: id },
        })
    },
  },
}
</script>
