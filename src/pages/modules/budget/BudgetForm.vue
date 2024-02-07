<script>
import { isEmpty, isFunction } from '@facilio/utils/validation'
import ModuleForm from '../../form/ModuleForm.vue'

export default {
  name: 'BudgetForm',
  extends: ModuleForm,
  methods: {
      async saveRecord(formModel) {
      let { formObj, afterSaveHook, afterSerializeHook } = this

      this.isSaving = true
      //same params as serialize method
      let response = await this.moduleData.save(
        formObj,
        formModel,
        afterSerializeHook
      )
      this.isSaving = false

      this.notificationHandler(response)

      if (!isEmpty(afterSaveHook) && isFunction(afterSaveHook)) {
        this.afterSaveHook(response)
      }
    },
    afterSerializeHook({data}) {
        let { budgetamount } = data || {}
        budgetamount = (budgetamount || []).filter(budget => {
            let { id } = budget.account || {}
            return !isEmpty(id)
        })
        data.budgetamount = budgetamount
        return data
    },
  },
}
</script>