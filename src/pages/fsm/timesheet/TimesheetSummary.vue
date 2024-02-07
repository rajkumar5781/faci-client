<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'TimeSheetSummary',
  extends: ModuleSummary,
  data() {
    return {
      stopTimeSheetBtnLoading: false,
      notesModuleName: 'timeSheetnotes',
      attachmentsModuleName: 'timeSheetattachments',
      showConfirmationPopup: false,
      timeSheetBtnObj: null,
      timeSheetWarningData: null,
    }
  },
  components: {
    StopTimeSheetConfirmation: () =>
      import('./actions/StopTimeSheetConfirmation.vue'),
  },
  computed: {
    tagProps() {
      let { record } = this || {}
      if (record?.status) {
        return {
          appearance: 'status',
          text: record.status?.displayName || '',
          statusType: record.status?.color || '',
        }
      }
      return { appearance: 'status', text: '' }
    },
    systemBtnList() {
      let { stopTimeSheetBtnLoading } = this
      return [
        {
          name: 'Stop Time Sheet',
          identifier: 'stopTimeSheet',
          clickAction: this.openStopTimeSheetConfirmation,
          loading: stopTimeSheetBtnLoading,
        },
      ]
    },
  },
  methods: {
    defaultSpace() {
      return (
        <FContainer>
          {this.showConfirmationPopup && (
            <StopTimeSheetConfirmation
              record={this.record}
              loading={this.stopTimeSheetBtnLoading}
              data={this.timeSheetWarningData}
              btnObj={this.timeSheetBtnObj}
              vOn:stopTimeSheet={this.stopTimeSheet}
              vOn:cancel={this.closeStopTimeSheetConfirmation}
            ></StopTimeSheetConfirmation>
          )}
        </FContainer>
      )
    },
    openStopTimeSheetConfirmation(btnObj = null) {
      this.timeSheetBtnObj = btnObj
      this.showConfirmationPopup = true
    },
    closeStopTimeSheetConfirmation() {
      this.showConfirmationPopup = false
      this.timeSheetBtnObj?.onActionComplete()
    },
    async stopTimeSheet(btnObj = null, action = '', validate = true) {
      this.stopTimeSheetBtnLoading = true
      this.closeStopTimeSheetConfirmation()
      let { refreshData } = this || {}
      let params = {
        validate,
      }
      if (!isEmpty(action)) params.transitionToState = action
      let { error, data } = await this.invokeSystemButton(
        'stopTimeSheet',
        params
      )
      if (error) {
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        if (data?.timeSheetStatusActions) {
          let { message = '', title = '' } = data.timeSheetStatusActions
          ftoast.success(message, {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
          btnObj?.onActionComplete()
          this.closeStopTimeSheetConfirmation()
          refreshData()
        }
      }
      this.stopTimeSheetBtnLoading = false
    },
    async invokeSystemButton(buttonIdentifier, params = {}) {
      let { record } = this || {}
      let url = `v3/module/timeSheet/${record.id}/systemButton/${buttonIdentifier}`
      let { error, data } = await API.post(url, params)
      return { error, data }
    },
  },
}
</script>
