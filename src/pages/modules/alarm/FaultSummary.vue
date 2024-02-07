<script lang="jsx">
import CommonAlarmSummary from './CommonAlarmSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import { ftoast } from '@facilio/design-system'
export default {
  extends: CommonAlarmSummary,
  methods: {
    async loadRecord(force = false) {
      try {
        let { moduleName, id } = this
        this.isLoading = true
        let readingAlarmRecord = await this.modelDataClass.fetch({
          moduleName,
          id,
          force,
        })
        let { energyImpact, costImpact } = readingAlarmRecord || {}
        if (!isEmpty(energyImpact)) {
          readingAlarmRecord['energyImpact'] =
            parseFloat(energyImpact).toFixed(2)
        }
        if (!isEmpty(costImpact)) {
          readingAlarmRecord['costImpact'] = parseFloat(costImpact).toFixed(2)
        }
        this.record = readingAlarmRecord
      } catch (error) {
        ftoast.critical(
          error?.message ||
            'Error Occurred while fetching record detail summary'
        )
      }

      this.isLoading = false
    },
  },
}
</script>
