<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import VisitsAndInvitesForm from './VisitsAndInvitesForm.vue'

export default {
  props: ['moduleName'],
  extends: ModuleList,
  components: { VisitsAndInvitesForm },
  data() {
    return {
      showFormVisibility: false,
      formMode: 'single',
    }
  },
  methods: {
    defaultSpace() {
      return (
        <div>
          {this.showFormVisibility && (
            <VisitsAndInvitesForm
              moduleName={this.moduleName}
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
  },
}
</script>
