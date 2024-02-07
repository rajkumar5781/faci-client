<script>
import RelatedList from './RelatedList.vue'
import dlv from 'dlv'

export default {
  extends: RelatedList,
  computed: {
    relatedListObj() {
      return dlv(this.widget, 'widgetDetail') || {}
    },
  },
}
</script>
