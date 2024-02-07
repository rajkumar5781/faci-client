<script>
import SummaryFieldsWidget from '../../../../components/page-builder/widgets/fieldSummary/SummaryFieldsWidget.vue'
import { FieldsGroupV2 as FieldsGroup } from '@facilio/ui/new-app'
import dlv from 'dlv'
export default {
  extends: SummaryFieldsWidget,
  components: { FieldsGroup },
  data() {
    return {
      isV2: true,
    }
  },
  methods: {
    callResize() {},
    async init() {
      this.isLoading = true
      this.detailsLayout = dlv(this.widget, 'widgetDetail.groups') || []
      this.clippedLayout = this.detailsLayout
      await this.fetchSites()
      this.$nextTick(() => {
        this.isLoading = false
      })
    },
  },
}
</script>
