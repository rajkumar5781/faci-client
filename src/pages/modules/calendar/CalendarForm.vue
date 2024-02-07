<script lang="jsx">
import { ftoast } from '@facilio/design-system'
import ModuleForm from '../../form/ModuleForm.vue'
import getProperty from 'dlv'
export default {
  extends: ModuleForm,
  methods: {
    async loadModuleData({ moduleDataId, moduleName }) {
      try {
        let record = await this.modelDataClass.fetch({
          moduleName,
          id: moduleDataId,
        })
        let { calendarEventMappingContextList } = record
        this.moduleData = new this.modelDataClass({
          ...record,
          moduleName,
          id: moduleDataId,
          calendarEventList: calendarEventMappingContextList,
        })
      } catch (error) {
        ftoast.critical(getProperty(error, 'message', this.$t('error_occured')))
      }
    },
    modifyFieldPropsHook(field = {}) {
      // Overriding field object in consuming component
      //For Calender Event
      let { displayTypeEnum } = field
      if (displayTypeEnum === 'CALENDAR_CONFIGURATION') {
        return { ...field, displayName: '' }
      }
    },
  },
}
</script>
