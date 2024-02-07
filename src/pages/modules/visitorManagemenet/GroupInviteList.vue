<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import VisitsAndInvitesForm from './VisitsAndInvitesForm.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  props: ['moduleName'],
  extends: ModuleList,
  components: { VisitsAndInvitesForm },
  data() {
    return {
      showFormVisibility: false,
      formMode: 'bulk',
      parentModuleName: 'invitevisitor',
    }
  },
  methods: {
    defaultSpace() {
      return (
        <div>
          {this.showFormVisibility && (
            <VisitsAndInvitesForm
              moduleName={this.parentModuleName}
              formMode={this.formMode}
              vOn:onClose={this.closeAccessDialog}
            ></VisitsAndInvitesForm>
          )}
        </div>
      )
    },
    redirectToFormCreation() {
      this.showFormVisibility = true
    },
    closeAccessDialog() {
      this.showFormVisibility = false
    },
    editModule(row = {}) {
      let { moduleName, formMode } = this
      let { id = null, formId = null, visitorTypeId = null } = row
      let query = {
        formId: formId,
        formMode,
        visitorTypeId,
      }
      let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
      name && this.$router.push({ name, params: { id }, query })
    },
  },
}
</script>
