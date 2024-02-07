<script>
import ModuleForm from '../../form/ModuleForm.vue'

export default {
  extends: ModuleForm,
  name: 'WorkorderForm',
  methods: {
    modifySectionPropsHook(sectionDetail){
      if (sectionDetail.fields.length === 1 && sectionDetail.fields[0].name === 'tasks') {
        sectionDetail.hideSection = true
    }
    else{
      sectionDetail.fields.forEach(field => {
        if (field.name === 'tasks') {
          field.hideField = true
        }
      })
     }
     },
  },
}
</script>
