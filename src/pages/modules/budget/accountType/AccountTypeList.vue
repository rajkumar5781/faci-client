<script>
import ModuleList from '../../../list/ModuleList.vue'

export default {
  name: 'AccountTypeList',
  extends: ModuleList,
  methods: {
    mainFieldRedirection({ record, value }) {
      let { id = null } = record || {}

      return {
        text: value,
        id,
        ...value,
      }
    },
  },
}
</script>
