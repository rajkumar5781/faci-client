<script lang="jsx">
import InspectionResponseSummaryWidget from '../../../inspection/inspectionResponse/widgets/inspectionResponseSummaryWidget.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'

export default {
  name: 'InductionResponseSummaryWidget',
  extends: InspectionResponseSummaryWidget,
  methods: {
    openQAndABuilder() {
      let customPath = this.$router.resolve({
        name: 'induction-builder',
        query: { pageNo: 1 },
      }).href

      this.$router.push({ path: customPath })
    },
    async executeTrigger() {
      let { record } = this
      let { creationType, id } = record
      if (creationType === 2) {
        this.canShowExecuteWizard = true
      } else {
        let { moduleName } = this
        let { error } = await API.post(
          `v3/qanda/template/execute?moduleName=${moduleName}&id=${id}`,
          {}
        )
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          ftoast.success(`Induction Template is executed`)
        }
      }
    },
  },
}
</script>
