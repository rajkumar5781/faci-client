<script>
import ModuleForm from '../../../form/ModuleForm.vue'
import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: ModuleForm,
  name: 'InventoryRequestForm',

  methods: {
    modifyFieldPropsHook(field) {
      let { $route } = this
      let {
        query: { requestedFromWorkOrder, woId, woLocalId: localId },
      } = $route
      woId = !isEmpty(woId) ? parseInt(woId) : null
      let { moduleDataId, $account } = this
      if (requestedFromWorkOrder && !isEmpty(woId) && !isEmpty(localId)) {
        let { user } = $account || {}
        let { id: userId } = user || {}
        let fieldValueObj = {
          name: {
            ...field,
            value: `${this.$t(
              'inventory.inventory_request.required_inventory_items_for_wo',
              {
                ns: 'inventory',
              }
            )}${localId}`,
          },
          requestedBy: { ...field, value: userId, isDisabled: true },
          requestedFor: { ...field, value: userId },
          workorder: { ...field, value: woId, isDisabled: true },
        }
        if (isEmpty(moduleDataId)) {
          let { name } = field || {}
          return fieldValueObj[name] || field
        }
      } else {
        let fieldValueObj = {
          requestedBy: { ...field, isDisabled: true },
          workorder: { ...field, isDisabled: true },
        }
        if (!isEmpty(moduleDataId)) {
          let { name } = field || {}
          return fieldValueObj[name] || field
        }
      }
    },
  },
}
</script>
