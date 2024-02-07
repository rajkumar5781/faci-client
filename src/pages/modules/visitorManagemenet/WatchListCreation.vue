<script>
import ModuleForm from '../../form/ModuleForm.vue'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  extends: ModuleForm,
  data() {
    return {
      isEmpty,
      isFunction,
    }
  },
  methods: {
    async saveRecord(formModel) {
      let { formObj, afterSaveHook, afterSerializeHook } = this

      this.isSaving = true
      let response = await this.moduleData.save(
        formObj,
        formModel,
        afterSerializeHook
      )
      this.isSaving = false

      // Hook to handle notification after crud operation
      this.notificationHandler(response)

      let { name } = findRouteForModule('watchlist', pageTypes.LIST)
      name && this.$router.push({ name })
    },
  },
}
</script>
