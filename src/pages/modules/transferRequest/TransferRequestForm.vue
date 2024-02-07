<script>
import ModuleForm from '../../form/ModuleForm.vue'
import { isEmpty } from '@facilio/utils/validation'
export default {
  extends: ModuleForm,
  computed: {
    moduleName() {
      return 'transferrequest'
    },
    moduleDisplayName() {
      return this.$t('tr.header', { ns: 'procurement' })
    },
  },
  methods: {
    afterSerializeHook({ data }) {
      let { isStaged, isShipped, isCompleted } = data || {}
      if (isEmpty(isStaged)) {
        data['isStaged'] = false
      }
      if (isEmpty(isShipped)) {
        data['isShipped'] = false
      }
      if (isEmpty(isCompleted)) {
        data['isCompleted'] = false
      }
      return data
    },
  },
}
</script>
