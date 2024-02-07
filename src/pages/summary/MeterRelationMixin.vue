<script lang="jsx">
import AddRelationShip from '../modules/meter/widgets/AddRelationShip.vue'

export default {
  data: () => ({
    canShowMeterRelationshipDialog: false,
  }),
  methods: {
    addMeterRelationShip() {
      this.canShowMeterRelationshipDialog = true
    },
    defaultSpace() {
      let { record, moduleName, canShowMeterRelationshipDialog } = this
      return (
        canShowMeterRelationshipDialog && (
          <AddRelationShip
            canShowDialog={canShowMeterRelationshipDialog}
            record={record}
            moduleName={moduleName}
            vOn:saveDialog={this.saveMeterRelDialog}
            vOn:closeDialog={this.closeMeterRelDialog}
          />
        )
      )
    },
    closeMeterRelDialog() {
      this.canShowMeterRelationshipDialog = false
    },
    saveMeterRelDialog() {
      this.closeMeterRelDialog()
      this.refreshData()
    },
  },
}
</script>
