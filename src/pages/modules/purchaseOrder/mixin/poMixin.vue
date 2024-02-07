<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  computed: {
    canShowBillToShowAddress() {
      let { details } = this
      let { vendor, billToAddress } = details || {}
      return !isEmpty(vendor) || this.isAddressFieldNotEmpty(billToAddress)
    },
    canShowShipToShowAddress() {
      let { details } = this
      let { storeRoom, shipToAddress } = details || {}
      return !isEmpty(storeRoom) || this.isAddressFieldNotEmpty(shipToAddress)
    },
  },
  methods: {
    getProperty,
    isAddressFieldNotEmpty(value) {
      let { city, state, street, country, zip } = value || {}
      return value && (city || state || street || country || zip)
    },
  },
}
</script>
