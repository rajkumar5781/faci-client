<script>
import ItemAndToolTypeCardDetails from '/src/pages/modules/inventory/itemandtooltypes/widgets/ItemAndToolTypeCardDetails.vue'
let storeRoomCard = {
  leftField: {
    FieldName: 'storeRoom.name',
    DisplayName: 'Store Room',
  },
  rightField: {
    FieldName: 'lastPurchasedDate',
    DisplayName: 'Last Purchased Date',
    isDateField: 'true',
  },
}
let quantityCard = {
  leftField: {
    FieldName: 'currentQuantity',
    DisplayName: 'Current Balance',
  },
  midField: {
    FieldName: 'quantity',
    DisplayName: 'Available Balance',
  },

  rightField: {
    FieldName: 'minimumQuantity',
    DisplayName: 'Minimum Quantity',
  },
}
let rateDetailsCard = {
  leftField: {
    FieldName: 'rate',
    DisplayName: 'Rate Per Hour',
  },
  rightField: {
    FieldName: 'toolType.rotating',
    DisplayName: 'Induvidually Tracked',
  },
}
export default {
  extends: ItemAndToolTypeCardDetails,
  name: 'ToolDetailsCard',
  methods: {
    init() {
      let { widget } = this
      let { name } = widget || {}

      if (name.startsWith('storeroomdetailscard')) {
        this.cardDetails = storeRoomCard
      }
      if (name.startsWith('quantitydetailscard')) {
        this.cardDetails = quantityCard
      }
      if (name.startsWith('ratedetailscard')) {
        console.log(this.details)
        this.cardDetails = rateDetailsCard
      }
    },
  },
}
</script>
