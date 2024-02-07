<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import NewAlarmMixin from './mixins/NewAlarmMixin'
import AlarmModel from './AlarmModel.vue'
import {
  FDropdown,
  FContainer,
  FButton,
  FPageHeader,
  FModal,
} from '@facilio/design-system'
export default {
  extends: ModuleSummary,
  name: 'CommonAlarmSummary',
  components: {
    FDropdown,
    FContainer,
    FButton,
    FPageHeader,
    FModal,
    AlarmModel,
  },
  mixins: [NewAlarmMixin],
  data() {
    return {
      notesModuleName: 'basealarmnotes',
      attachmentsModuleName: 'basealarmattachments',
    }
  },
  computed: {
    options() {
      return [
        {
          label: this.isWoCreated(this.alarm)
            ? this.$t('alarm.view_workorder', 'View WorkOrder', { ns: 'alarm' })
            : this.$t('alarm.create_workorder', 'Create WorkOrder', {
                ns: 'alarm ',
              }),
          value: 'createWo',
        },
      ]
    },
    mainFieldKey() {
      return 'subject'
    },
    tagProps() {
      let { record, getAlarmDisplayName, getAccentColor, getAccentLevel } = this
      return {
        text: getAlarmDisplayName(record),
        appearance: 'accent',
        accentColor: getAccentColor(record),
        accentLevel: getAccentLevel(record),
      }
    },
    alarm() {
      return this.record
    },
    occurrence() {
      let { alarm } = this
      let { prevOccurrence } = alarm || {}
      return prevOccurrence
    },
    moreButtonList() {
      let { alarm, systemButtons = [] } = this || {}
      let { lastOccurrenceId, lastWoId: woId } = alarm || {}
      let moreButtonList = []
      systemButtons.forEach(systemButton => {
        let { identifier, name } = systemButton || {}
        if (identifier !== 'acknowledge_alarm') {
          let buttonObj = {
            name,
            identifier,
            loading: false,
          }
          if (identifier === 'alarm_create_workorder') {
            buttonObj['clickAction'] = () =>
              this.createWoDialog(lastOccurrenceId)
          } else if (identifier === 'alarm_view_workorder') {
            buttonObj['clickAction'] = () => this.openWorkorder(woId)
          } else if (identifier === 'bms_alarm_export_csv') {
            buttonObj['clickAction'] = () => this.exportSummary(1)
          } else if (identifier === 'bms_alarm_export_excel') {
            buttonObj['clickAction'] = () => this.exportSummary(2)
          }
          moreButtonList.push(buttonObj)
        }
      })
      return moreButtonList
    },
    systemBtnList() {
      let { systemButtons = [], alarm } = this || {}
      let systemBtnList = []
      systemButtons.forEach(systemButton => {
        let { name, identifier } = systemButton || {}
        if (systemButton.identifier === 'acknowledge_alarm') {
          systemBtnList.push({
            name,
            identifier,
            loading: false,
            clickAction: () => this.acknowledgeAlarms(alarm, 'summary'),
          })
        }
      })
      return systemBtnList
    },
  },
  methods: {
    confirmWoModel() {
      this.dialogVisible = false
      this.refreshData()
    },
    refreshData() {
      this.loadRecord(true)
      this.loadSystemButtons(true)
    },
    defaultSpace() {
      return (
        <AlarmModel
          modalVisible={this.dialogVisible}
          woIds={this.createWoIds}
          moduleName={this.moduleName}
          vOn:confirmWoModel={this.confirmWoModel}
          vOn:closeWoDialog={this.closeWoDialog}
        />
      )
    },
  },
}
</script>
