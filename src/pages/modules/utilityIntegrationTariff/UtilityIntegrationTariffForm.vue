<script lang="jsx">
import ModuleForm from '../../form/ModuleForm.vue'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { ftoast } from '@facilio/design-system'

export default {
  extends: ModuleForm,
  data() {
    return {
      moduleDisplayName: 'Tariff',
    }
  },
  methods: {
    afterSaveHook(response) {
      let { moduleName } = this
      let { [moduleName]: data } = response || {}
      this.redirectToList()
    },
    redirectToList() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      if (name) {
        this.$router.push({ name })
      }
    },
    
    async saveRecord(formModel) {
      let { formObj, afterSaveHook, afterSerializeHook } = this
      let { subFormData } = formModel || {}
      let { relations } = subFormData || {}
      let { utilityIntegrationTariffSlab } = relations || {}
      let [{ data }] = utilityIntegrationTariffSlab || []

      if (isEmpty(data)) {
        ftoast.critical(this.$t('utility.slab_needed', { ns: 'energy' }))
      } else {
        this.isSaving = true
        //same params as serialize method
        
        let response = await this.moduleData.save(
          formObj,
          formModel,
          afterSerializeHook
        )
        this.isSaving = false
        this.notificationHandler(response)
        let {error = {}} = response
        if (error) {
          return
         }
        if (!isEmpty(afterSaveHook) && isFunction(afterSaveHook)) {
          this.afterSaveHook(response)
        }
      }
    },
    
  },
}
</script>
