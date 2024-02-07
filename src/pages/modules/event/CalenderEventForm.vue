<script lang="jsx">
import { API } from '@facilio/api'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { ftoast } from '@facilio/design-system'
import ModuleForm from '../../form/ModuleForm.vue'

export default {
  extends: ModuleForm,
  methods: {
    async loadModuleData({ moduleDataId, moduleName }) {
      let { error, [moduleName]: record } = await API.fetchRecord(moduleName, {
        id: moduleDataId,
      })
      if (error) {
        let { message } = error || {}
        ftoast.critical(message)
      } else {
        let record = await this.modelDataClass.fetch({
          moduleName,
          id: moduleDataId,
        })
        let { name, description, id } = record || {}
        this.moduleData = new this.modelDataClass({
          name,
          description,
          id,
          eventConfiguration: { ...record },
          moduleName,
        })
      }
    },
    modifyFieldPropsHook(field) {
      // Overriding field object in consuming component

      //For Calender Event
      let { displayTypeEnum } = field || {}
      if (displayTypeEnum === 'CALENDAR_EVENT_CONFIGURATION') {
        return { ...field, displayName: '' }
      }
    },
    redirectToSummary(id) {
      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}
        name &&
          this.$router.push({
            name,
          })
      } else {
        this.$router.push({
          name: 'calendarEvent',
        })
      }
    },
  },
}
</script>
