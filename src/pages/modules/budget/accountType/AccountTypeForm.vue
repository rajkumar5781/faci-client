<script>
import ModuleForm from '../../../form/ModuleForm.vue'

export default {
  name: 'AccountTypeForm',
  extends: ModuleForm,
  methods: {
    afterSaveHook() {
      this.redirectToList()
    },
  },
}
</script>