<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
export default {
  name: 'TripSummary',
  extends: ModuleSummary,
  data() {
    return {
      notesModuleName: 'tripnotes',
      attachmentsModuleName: 'tripattachments',
    }
  },
  computed: {
    tagProps() {
      let { record } = this || {}
      if (record?.status) {
        return {
          appearance: 'status',
          text: record.status?.displayName || '',
          statusType: record.status?.color || '',
        }
      }
      return { appearance: 'status', text: '' }
    },
  },
}
</script>
