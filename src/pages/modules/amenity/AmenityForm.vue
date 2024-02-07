<script>
import ModuleForm from '../../form/ModuleForm.vue'

export default {
  extends: ModuleForm,
  name: 'AmenityForm',
  methods: {
    afterSaveHook(response) {
      this.redirectToList()
    },
  },
}
</script>
