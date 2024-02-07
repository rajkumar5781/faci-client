<script>
import ModuleForm from '../../../form/ModuleForm.vue'

export default {
  name: 'ChartOfAccountForm',
  extends: ModuleForm,
  methods: {
    afterSaveHook() {
      this.redirectToList()
    },
  },
}
</script>