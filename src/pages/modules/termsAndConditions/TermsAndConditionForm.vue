<script>
import { isEmpty } from '@facilio/utils/validation'
import ModuleForm from '../../form/ModuleForm.vue'
import getProperty from 'dlv'
import { API } from '@facilio/api/dist/index.mjs'
import { isFunction } from '@tiptap/core'
export default {
  extends: ModuleForm,
  computed: {
    isRevised() {
      let { $route } = this
      console.log($route)
      return getProperty(this, '$route.query.isRevised', false)
    },
  },
  methods: {
    async saveRecord(formModel) {
      let { formObj, moduleName, moduleDataId, isRevised, afterSaveHook } = this
      this.isSaving = true
      let { formId } = formModel
      let response = {}
      let customData = new this.modelDataClass()
      let data = customData.serialize(formObj, formModel)
      if (!isEmpty(formId)) {
        data.formId = formId
      }
      if (!isEmpty(moduleDataId)) {
        data.id = moduleDataId
      }
      this.isSaving = true
      if (isEmpty(moduleDataId) || isRevised) {
        let requestObj = { data }

        if (isRevised) {
          requestObj.data = { ...data, isPublished: true }
          requestObj.params = { revise: true }
        }
        response = await API.createRecord(moduleName, requestObj)
      } else {
        response = await API.updateRecord(moduleName, {
          id: moduleDataId,
          data,
        })
      }
      this.isSaving = false

      // Hook to handle notification after crud operation
      this.notificationHandler(response)

      // Hook to handle response after crud operation
      if (!isEmpty(afterSaveHook) && isFunction(afterSaveHook)) {
        this.afterSaveHook(response)
      }
    },
  },
}
</script>
