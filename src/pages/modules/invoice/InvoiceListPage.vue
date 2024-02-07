<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'

export default {
  name: 'InvoiceList',
  props: ['moduleName'],
  extends: ModuleList,
  computed: {
    idSlotValue() {
      return 'localId'
    },
  },
}
</script>
