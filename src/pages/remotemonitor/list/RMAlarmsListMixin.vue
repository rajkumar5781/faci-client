<script>
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  data() {
    return {
      accentObject: {
        active: {
          accentColor: 'red',
          accentLevel: 'L2',
        },
        cleared: {
          accentColor: 'green',
          accentLevel: 'L2',
        },
      },
    }
  },
  methods: {
    getAlarmState(alarm) {
      let { clearedTime } = alarm || {}
      if (isEmpty(clearedTime)) {
        return {
          name: 'active',
          displayName: this.$t('active', { ns: 'remote_monitor' }),
        }
      } else {
        return {
          name: 'cleared',
          displayName: this.$t('clear', { ns: 'remote_monitor' }),
        }
      }
    },
    getAlarmStateDisplayName(alarm) {
      let { displayName } = this.getAlarmState(alarm) || {}
      return displayName
    },
    getAccentColor(alarm) {
      let { name } = this.getAlarmState(alarm) || {}
      return getProperty(this, `accentObject.${name}.accentColor`)
    },
    getAccentLevel(alarm) {
      let { name } = this.getAlarmState(alarm) || {}
      return getProperty(this, `accentObject.${name}.accentLevel`)
    },
  },
}
</script>
