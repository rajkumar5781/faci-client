<script>
import InventoryRelatedListWidget from '../../components/InventoryRelatedListWidget.vue'

export default {
  extends: InventoryRelatedListWidget,

  data() {
    return {
      columns: [
        {
          displayName: this.$t('name', {
            ns: 'inventory',
          }),
          name: 'name',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('type', {
            ns: 'inventory',
          }),
          name: 'type',
          id: 2,
          fixed: false,
        },
        {
          displayName: this.$t('inventory.category', {
            ns: 'inventory',
          }),
          name: 'category',
          id: 3,
          fixed: false,
        },
        {
          displayName: this.$t('inventory.department', {
            ns: 'inventory',
          }),
          name: 'department',
          id: 4,
          fixed: false,
        },
      ],
    }
  },

  computed: {
    moduleName() {
      return 'asset'
    },

    defaultFilter() {
      let itemId = this.details?.id
      let filter = {
        rotatingItem: {
          operatorId: 36,
          value: [itemId + ''],
        },
      }
      return filter
    },
  },
}
</script>
