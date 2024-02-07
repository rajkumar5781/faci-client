<script>
import ModuleSummary from '../../summary/ModuleSummary.vue'

export default {
  extends: ModuleSummary,

  computed: {
    systemBtnList() {
      return [
        {
          name: 'Edit',
          identifier: 'clientModuleEditButton',
          clickAction: this.editRecord,
          iconName: 'edit-line',
          iconGroup: 'edit',
          iconPosition: 'prefix',
          appearance: 'tertiary',
        },
      ]
    },
    moreButtonList() {
      return []
    },
  },
}
</script>
