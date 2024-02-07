<script>
import ColumnCustomization from './ColumnCustomization.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
export default {
  extends: ColumnCustomization,
  methods: {
    async loadFields() {
      let { moduleName } = this
      let { data, error } = await API.get(
        `v2/fields/approvaltab/config/viewFields/${moduleName}`
      )
      if (error) {
        ftoast.critical(this.$t('column_customization.error_message'))
      } else {
        this.columnFields = data?.fields || []
        this.constructFields()
      }
    },
  },
}
</script>
