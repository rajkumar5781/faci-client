<script>
import ModuleForm from '../../form/ModuleForm.vue'
export default {
  extends: ModuleForm,
  methods: {
    modifyFieldPropsHook(field) {
      let { name } = field || {}
      if (name === 'workPermitType' && this.isEdit) {
        return { ...field, isDisabled: true }
      }
    },
  },
}
</script>
