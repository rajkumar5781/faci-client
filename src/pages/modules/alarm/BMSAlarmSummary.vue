<script lang="jsx">
import CommonAlarmSummary from './CommonAlarmSummary.vue'
import BMSAlarmExportDialog from './BMSAlarmExportDialog.vue'
import { loadAssetReadingFields } from './util.js'
import { FContainer, FModal } from '@facilio/design-system'
import AlarmModel from './AlarmModel.vue'

export default {
  name: 'BMSAlarmSummary',
  extends: CommonAlarmSummary,
  components: {
    FContainer,
    FModal,
    AlarmModel,
    BMSAlarmExportDialog,
  },
  data() {
    return {
      assetFields: [],
      selectedFields: [],
      exportType: null,
      showAssetExport: false,
      exportDownloadUrl: null,
    }
  },
  watch: {
    id: {
      async handler() {
        this.exportDownloadUrl = null
      },
      immediate: true,
    },
  },
  methods: {
    closeExportDialog() {
      this.showAssetExport = false
      this.selectedFields = []
    },
    exportSummary(type) {
      let { alarm } = this
      let { resource } = alarm || {}
      let { id } = resource || {}
      this.exportType = type
      this.showAssetExport = true
      loadAssetReadingFields(id).then(fields => {
        this.assetFields = fields
      })
    },
    defaultSpace() {
      return (
        <FContainer>
          <AlarmModel
            modalVisible={this.dialogVisible}
            woIds={this.createWoIds}
            vOn:confirmWoModel={this.confirmWoModel}
            vOn:closeWoDialog={this.closeWoDialog}
          />
          <FModal
            title={this.$t(
              'alarm.export_alarm_summary',
              'Export Alarm Summary',
              { ns: 'alarm ' }
            )}
            saveText="Export Data"
            visible={this.showAssetExport}
            size="S"
            type="default"
            padding="containerNone"
            vOn:ok={this.exportEvent}
            vOn:cancel={this.closeExportDialog}
          >
            <FContainer padding="containerXLarge sectionSmall" height="400px">
              <BMSAlarmExportDialog
                ref="exportModel"
                v-model={this.selectedFields}
                assetFields={this.assetFields}
              />
            </FContainer>
          </FModal>
          {this.exportDownloadUrl && (
            <iframe src={this.exportDownloadUrl} style="display: none"></iframe>
          )}
        </FContainer>
      )
    },
  },
}
</script>
