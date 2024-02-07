<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import UtilityCategoryDialog from './UtilityCategoryDialog.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  extends: ModuleList,
  name: 'MeterList',
  data: () => ({
    canShowCategoryDialog: false,
  }),
  computed: {
    createBtnText() {
      return this.$t('meter.add_meter', { ns: 'energy' })
    },
  },
  methods: {
    defaultSpace() {
      return (
        this.canShowCategoryDialog && (
          <UtilityCategoryDialog
            canShowUtilityTypeDialog={this.canShowCategoryDialog}
            vOn:openCategoryForm={this.openCategoryForm}
            vOn:closeDialog={this.closeDialog}
          ></UtilityCategoryDialog>
        )
      )
    },
    redirectToFormCreation() {
      this.canShowCategoryDialog = true
    },
    closeDialog() {
      this.canShowCategoryDialog = false
    },
    async openCategoryForm(categoryId) {
      this.closeDialog()
      if (!isEmpty(categoryId)) {
        let { utilitytype, error } = await API.fetchRecord('utilitytype', {
          id: categoryId,
        })
        if (!error) {
          let { moduleName: categoryModuleName, id: utilityType } =
            utilitytype || {}
          let { name } = findRouteForModule('meter', pageTypes.CREATE) || {}
          name &&
            this.$router.push({
              name,
              query: {
                categoryModuleName,
                formDetails: JSON.stringify({ utilityType }),
              },
            })
        } else {
          ftoast.critical(error?.message || this.$t('error_occurred'))
        }
      }
    },
    async editModule(record) {
      let { id } = record || {}
      let { records } = this
      let meter = (records || []).find(meter => meter.id === id) || {}
      let { utilityType } = meter || {}
      let { id: categoryId } = utilityType || {}

      if (!isEmpty(categoryId)) {
        let { utilitytype, error } = await API.fetchRecord('utilitytype', {
          id: categoryId,
        })
        if (!error) {
          let { moduleName: categoryModuleName, id: utilityType } =
            utilitytype || {}
          let { name } = findRouteForModule('meter', pageTypes.EDIT) || {}
          name &&
            this.$router.push({
              name,
              params: {
                id,
              },
              query: {
                categoryModuleName,
                formDetails: JSON.stringify({ utilityType }),
              },
            })
        } else {
          ftoast.critical(error?.message || this.$t('error_occurred'))
        }
      }
    },
  },
}
</script>
