<script>
import ModuleForm from '../../form/ModuleForm.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'

export default {
  extends: ModuleForm,
  name: 'MeterForm',
  methods: {
    async loadFormsList() {
      let { $route, moduleName } = this
      let { query } = $route || {}
      let { categoryModuleName } = query || {}
      let url = `/v2/${moduleName}/forms?moduleName=${categoryModuleName}&fetchExtendedModuleForms=${true}`

      this.isLoading = true
      let { data, error } = await API.get(url)
      if (error) {
        let { message } = error || {}
        ftoast.critical(message || this.$t('error_occurred'))
      } else {
        let { forms = [] } = data || {}
        this.$set(this, 'forms', forms)
      }
    },
  },
}
</script>
