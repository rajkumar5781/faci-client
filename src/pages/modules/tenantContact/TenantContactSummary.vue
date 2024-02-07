<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { ftoast, fDialog } from '@facilio/design-system'
import PortalAccess from '../../people/PortalAccess.vue'
export default {
  name: 'TenantContactSummary',
  extends: ModuleSummary,
  data() {
    return {
      showPortalAccess: false,
      button: null,
      systemBtns: [
        {
          name: 'Edit',
          identifier: 'edit',
          clickAction: this.editRecord,
          iconName: 'edit-line',
          iconGroup: 'edit',
          iconPosition: 'prefix',
          iconButton: true,
          appearance: 'tertiary',
        },
        {
          name: 'PortalAccess',
          identifier: 'tenantConatctModulePortalButton',
          clickAction: this.showPortals,
          iconName: 'access-management',
          iconGroup: 'modules',
          iconButton: true,
          iconPosition: 'prefix',
          appearance: 'tertiary',
        },
      ],
    }
  },
  components: { ftoast, fDialog, PortalAccess },
  computed: {
    systemBtnList() {
      return this.systemBtns
    },
    moreButtonList() {
      return []
    },
  },
  methods: {
    showPortals(btn) {
      this.showPortalAccess = true
      this.button = btn
    },
    defaultSpace() {
      return (
        <div>
          {this.showPortalAccess && (
            <PortalAccess
              showRolesAndAccess={this.showPortalAccess}
              user={this.record}
              moduleName={this.moduleName}
              linkName="tenant"
              vOn:onClose={this.closeAccessDialog}
              vOn:onSave={this.closeAccessDialog}
            />
          )}
        </div>
      )
    },
    closeAccessDialog() {
      this.showPortalAccess = false
      this.refreshData()
      this.button.onActionComplete()
    },
  },
}
</script>
