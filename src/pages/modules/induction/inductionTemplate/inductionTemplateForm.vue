<script lang="jsx">
import { API } from '@facilio/api'
import ModuleForm from '../../../form/ModuleForm.vue'

export default {
  name: 'InductionTemplateForm',
  extends: ModuleForm,

  methods: {
    afterSaveHook(response) {
      let { moduleName } = this
      let { [moduleName]: data } = response
      let { id } = data
      if (!this.isEdit) {
        this.createPage(id)
      }
      this.redirectToSummary(id)
    },
    async createPage(templateId) {
      let data = {
        name: 'Page 1',
        description: '',
        parent: templateId,
        position: 1,
      }
      await API.createRecord('qandaPage', {
        data,
      })
    },
  },
}
</script>
