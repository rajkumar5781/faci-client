<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import AddReadingModal from '../../asset/widgets/AddReadingModal.vue'

export default {
  name: 'MeterReadingModal',
  extends: AddReadingModal,
  methods: {
    async addReadingValue() {
      this.isSaving = true
      let { readingObj, recordId } = this
      let { value, ttime, field, readingName } = readingObj || {}
      let { name: fieldName } = field || {}

      if (!isEmpty(value)) {
        let currentTimestamp = new Date().getTime()
        let readingVal = {
          parentId: recordId,
          ttime: ttime > currentTimestamp ? currentTimestamp : ttime,
          readings: { [`${fieldName}`]: value },
        }
        let data = {
          readingName: readingName,
          readingValues: [readingVal],
        }
        let { error } = await API.post('/v2/readings/meter/add', data)

        if (!error) {
          ftoast.success(
            this.$t('meter.reading_added_success', { ns: 'energy' })
          )
          this.saveAction(readingObj)
        } else {
          ftoast.critical(
            error?.message ||
              this.$t('meter.readings_added_failed', { ns: 'energy' })
          )
        }
        this.isSaving = false
        this.closeDialog()
      }
    },
  },
}
</script>
