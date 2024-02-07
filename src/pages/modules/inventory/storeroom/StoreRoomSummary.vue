<script lang="jsx">
import ModuleSummary from '/src/pages/summary/ModuleSummary.vue'
import { FTags } from '@facilio/design-system'

export default {
  name: 'StoreRoomSummary',
  extends: ModuleSummary,

  data() {
    return {
      notificationSettingsVisibility: false,
    }
  },
  computed: {
    moreButtons() {
      return [
        {
          name: 'Notification Preference',
          identifier: 'notificationPreferences',
          clickAction: this.showNotificationSettings,
        },
      ]
    },
  },
  methods: {
    showNotificationSettings() {
      this.notificationSettingsVisibility = true
    },
    hideNotificationSettings() {
      this.notificationSettingsVisibility = false
    },

    defaultSpace() {
      let {
        record,
        stockingFormVisibility,
        moduleName,
        closeStockingForm,
        notificationSettingsVisibility,
        returnItemsVisibility,
        adjustItemsVisibility,
      } = this
    },
  },
}
</script>
