<script lang="jsx">
import CommonAlarmSummary from './CommonAlarmSummary.vue'
import { ftoast } from '@facilio/design-system'
export default {
  extends: CommonAlarmSummary,
  methods: {
    async loadRecord(force = false) {
      try {
        let { moduleName, id } = this
        this.isLoading = true
        let sensorAlarmRecord = await this.modelDataClass.fetch({
          moduleName,
          id,
          force,
        })
        let { readingField } = sensorAlarmRecord || {}
        let { displayName } = readingField || {}
        sensorAlarmRecord['readingFieldId'] = displayName
        this.record = sensorAlarmRecord
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
