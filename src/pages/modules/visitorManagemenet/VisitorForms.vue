<script>
import ModuleForm from '../../form/ModuleForm.vue'
import getProperty from 'dlv'
import { isEmpty, isFunction } from '@facilio/utils/validation'

export default {
  extends: ModuleForm,
  computed: {
    visitorType() {
      let visitorTypeId =
        getProperty(this.$route, 'query.visitorTypeId') || null
      return { id: visitorTypeId }
    },
  },
  methods: {
    afterSerializeHook(response = {}) {
      let { data } = response
      let { visitorType } = this
      return { ...data, visitorType }
    },
  },
}
</script>
