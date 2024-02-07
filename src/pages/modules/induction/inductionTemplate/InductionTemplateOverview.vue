<script lang="jsx">
import InspectionTemplateSummary from '../../inspection/inspectionTemplate/inspectionTemplateOverview.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'

export default {
  name: 'InductionTemplateSummary',
  extends: InspectionTemplateSummary,
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
    async publishTemplate() {
      let { record } = this
      let { id } = record || {}
      let { error } = await API.post(`v3/qanda/template/publish?id=${id}`, {})
      if (error) {
        this.$message.error(error.message || 'Error Occured')
      } else {
        this.$message.success('Induction Template published successfully')
        window.location.reload()
      }
    },
  },
}
</script>
