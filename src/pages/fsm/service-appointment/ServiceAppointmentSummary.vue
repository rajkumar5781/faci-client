<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import {
  FContainer,
  FButton,
  FPopover,
  FMenuItem,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
export default {
  name: 'ServiceAppointmentSummary',
  components: {
    FContainer,
    FButton,
    FPopover,
    FMenuItem,
    ServiceAppointmentDispatch: () =>
      import('./actions/ServiceAppointmentDispatch.vue'),
    ServiceAppointmentMismatchWarning: () =>
      import('./actions/ServiceAppointmentMismatchWarning.vue'),
    ServiceAppointmentReschedule: () =>
      import('./actions/ServiceAppointmentReschedule.vue'),
    OngoingTimeSheetWarning: () =>
      import('./actions/OngoingTimeSheetWarning.vue'),
  },
  extends: ModuleSummary,
  data() {
    return {
      dispatchBtnObj: null,
      startWorkBtnLoading: false,
      completeWorkBtnLoading: false,
      cancelBtnLoading: false,
      showDispatchActionModel: false,
      showMismatchWarningModel: false,
      showRescheduleActionModel: false,
      showTimeSheetConflictWarningModel: false,
      timeConflictData: null,
      notesModuleName: 'serviceAppointmentNotes',
      attachmentsModuleName: 'serviceAppointmentAttachments',
    }
  },
  computed: {
    captionText() {
      let { record } = this
      let { code = '' } = record || {}
      return code
    },
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
      let { startWorkBtnLoading, completeWorkBtnLoading, cancelBtnLoading } =
        this
      return [
        {
          name: 'Dispatch',
          identifier: 'dispatch',
          clickAction: this.showDispatchAction,
        },
        {
          name: 'Start Work',
          identifier: 'startWork',
          clickAction: this.startWork,
          loading: startWorkBtnLoading,
        },
        {
          name: 'Complete Work',
          identifier: 'complete',
          clickAction: this.complete,
          loading: completeWorkBtnLoading,
        },
        {
          name: 'Cancel',
          identifier: 'cancel',
          clickAction: this.cancel,
          loading: cancelBtnLoading,
        }
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Redispatch',
          identifier: 'redispatch',
          clickAction: this.showDispatchAction,
        },
        {
          name: 'Reschedule',
          identifier: 'reschedule',
          clickAction: this.showRescheduleAction,
        },
        {
          name: 'Edit',
          identifier: 'edit_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
        },
      ]
    },
  },
  methods: {
    actionBar() {
      return
    },
    defaultSpace() {
      let {
        showDispatchActionModel,
        showMismatchWarningModel,
        showRescheduleActionModel,
        showTimeSheetConflictWarningModel,
      } = this
      return (
        <FContainer>
          {showDispatchActionModel && (
            <ServiceAppointmentDispatch
              record={this.record}
              vOn:dispatch={this.dispatchAction}
              vOn:cancel={this.cancelDispatchAction}
            ></ServiceAppointmentDispatch>
          )}
          {showMismatchWarningModel && (
            <ServiceAppointmentMismatchWarning
              dispatchWarningData={this.dispatchWarningData}
              vOn:dispatch={this.dispatchActionForce}
              vOn:cancel={this.cancelDispatchMismatchWarning}
            ></ServiceAppointmentMismatchWarning>
          )}
          {showRescheduleActionModel && (
            <ServiceAppointmentReschedule
              record={this.record}
              vOn:reschedule={this.rescheduleAction}
              vOn:cancel={this.cancelRescheduleAction}
            ></ServiceAppointmentReschedule>
          )}
          {showTimeSheetConflictWarningModel && (
            <OngoingTimeSheetWarning
              timeConflictData={this.timeConflictData}
              vOn:complete={this.startWorkForce}
              vOn:cancel={this.cancelTimeSheetConflictWarning}
            ></OngoingTimeSheetWarning>
          )}
        </FContainer>
      )
    },
    async invokeSystemButton(buttonIdentifier, params = {}) {
      let { record } = this || {}
      let url = `v3/module/serviceAppointment/${record?.id}/systemButton/${buttonIdentifier}`
      return await API.post(url, params)
    },
    async dispatchAction(formModel, skipValidation = false) {
      let { fieldAgent, scheduledStartTime, scheduledEndTime } = formModel
      let params = {}
      this.$set(params, 'skipValidation', skipValidation)
      if (!isEmpty(fieldAgent)) {
        this.$set(params, 'fieldAgentId', fieldAgent)
      }
      if (!isEmpty(scheduledStartTime) && !isEmpty(scheduledEndTime)) {
        this.$set(params, 'scheduledStartTime', scheduledStartTime)
        this.$set(params, 'scheduledEndTime', scheduledEndTime)
      }
      let { refreshData } = this || {}
      let { dispatchBtnObj } = this
      let { identifier = 'redispatch' } = dispatchBtnObj || {}
      let { error, data } = await this.invokeSystemButton(identifier, params)
      if (error) {
        let { errorData = {}, message = '', title = '' } = error
        if (!isEmpty(errorData)) {
          let {
            errorCode,
            errorTitle = '',
            errorMessage,
            errorSeverity = '',
            errorRelatedData,
            additionalErrors,
          } = errorData
          if (errorCode === 'SA_MISMATCH') {
            let additionalMessages = []
            additionalErrors.forEach(error =>
              additionalMessages.push(error.errorMessage)
            )
            let { fieldAgent, scheduledStartTime, scheduledEndTime } =
              errorRelatedData || {}
            this.dispatchWarningData = {
              title: errorTitle,
              severity: errorSeverity.toLowerCase(),
              message: errorMessage,
              additionalMessages,
              fieldAgent,
              scheduledStartTime,
              scheduledEndTime,
              formModel,
            }
            this.showDispatchMismatchWarning()
          } else {
            ftoast.critical(errorMessage || this.$t('error_occurred'), {
              title: errorTitle,
              menuType: 'alerts',
              timeout: 5000,
            })
          }
        } else {
          ftoast.critical(message || this.$t('error_occurred'), {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
          this.cancelDispatchMismatchWarning()
        }
        this.cancelDispatchAction()
      } else {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
        }
        this.cancelDispatchMismatchWarning()
        this.cancelDispatchAction()
        refreshData()
      }
    },
    async rescheduleAction(formModel) {
      let { scheduledStartTime, scheduledEndTime } = formModel
      let params = {}
      if (!isEmpty(scheduledStartTime) && !isEmpty(scheduledEndTime)) {
        this.$set(params, 'scheduledStartTime', scheduledStartTime)
        this.$set(params, 'scheduledEndTime', scheduledEndTime)
      }
      let { refreshData } = this || {}
      let { error, data } = await this.invokeSystemButton('reschedule', params)
      if (error) {
        let { message = this.$t('error_occurred'), title = '' } = error || {}
        ftoast.critical(message, {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
        this.showRescheduleActionModel = false
      } else {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
        }
        this.showRescheduleActionModel = false
        refreshData()
      }
    },
    dispatchActionForce(formModel) {
      this.dispatchAction(formModel, true)
    },
    showDispatchAction(btnObj = null) {
      this.dispatchBtnObj = btnObj
      this.showDispatchActionModel = true
    },
    cancelDispatchAction() {
      this.showDispatchActionModel = false
      this.dispatchBtnObj?.onActionComplete()
    },
    showDispatchMismatchWarning() {
      this.showMismatchWarningModel = true
    },
    cancelDispatchMismatchWarning() {
      this.showMismatchWarningModel = false
    },
    showTimeSheetConflictWarning() {
      this.showTimeSheetConflictWarningModel = true
    },
    cancelTimeSheetConflictWarning() {
      this.timeConflictData = null
      this.showTimeSheetConflictWarningModel = false
    },
    showRescheduleAction() {
      this.showRescheduleActionModel = true
    },
    cancelRescheduleAction() {
      this.showRescheduleActionModel = false
    },
    startWorkForce() {
      this.cancelTimeSheetConflictWarning()
      this.startWorkInvokeAction()
    },
    async startWork(buttonObj) {
      let val = await fDialog.warning({
        title: this.$t(
          'service_appointment.start_work_title',
          'Start Work on Appointment',
          { ns: 'fsm' }
        ),
        description: this.$t(
          'service_appointment.start_work_message',
          'Initiating work on this appointment will simultaneously start all associated tasks. Are you sure you want to start work?',
          { ns: 'fsm' }
        ),
        saveText: this.$t('service_appointment.start_work', 'Start Work', {
          ns: 'fsm',
        }),
        cancelText: this.$t('service_appointment.cancel', 'Cancel', {
          ns: 'fsm',
        }),
      })

      if (val) {
        this.startWorkInvokeAction()
        buttonObj.onActionComplete()
      }
    },

    async startWorkInvokeAction() {
      let { refreshData } = this || {}
      this.startWorkBtnLoading = true
      let { error, data } = await this.invokeSystemButton('startWork')
      this.startWorkBtnLoading = false

      if (error) {
        let { errorData = {}, message = '', title = '' } = error
        if (!isEmpty(errorData)) {
          let {
            errorCode,
            errorTitle = '',
            errorMessage,
            errorSeverity = '',
            errorRelatedData,
          } = errorData
          if (errorCode === 'TIMESHEET_ALREADY_RUNNING') {
            this.timeConflictData = {
              title: errorTitle,
              severity: errorSeverity.toLowerCase(),
              message: errorMessage,
              errorRelatedData,
            }
            this.showTimeSheetConflictWarning()
          } else {
            ftoast.critical(errorMessage || this.$t('error_occurred'), {
              title: errorTitle,
              menuType: 'alerts',
              timeout: 5000,
            })
            this.cancelTimeSheetConflictWarning()
          }
        } else {
          ftoast.critical(message || this.$t('error_occurred'), {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
          this.cancelTimeSheetConflictWarning()
        }
      } else {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
          this.cancelTimeSheetConflictWarning()
          refreshData()
        }
      }
    },

    async complete(buttonObj) {
      let { refreshData } = this || {}
      this.completeWorkBtnLoading = true
      let { error, data } = await this.invokeSystemButton('complete')
      this.completeWorkBtnLoading = false

      buttonObj.onActionComplete()

      if (error) {
        let { message = '', title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
          refreshData()
        }
      }
    },
    async cancel(buttonObj) {
      let { refreshData } = this || {}
      this.cancelBtnLoading = true
      let { error, data } = await this.invokeSystemButton('cancel')
      this.cancelBtnLoading = false

      buttonObj.onActionComplete()

      if (error) {
        let { message = '', title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
          refreshData()
        }
      }
    },
    async deleteSA() {
      let { record } = this
      let { id } = record || {}
      let moduleName = 'serviceAppointment'
      if (!isEmpty(id)) {
        let { error } = await API.deleteRecord(moduleName, id)
        if (error) {
          let { message = '', title = '' } = error
          ftoast.critical(message || this.$t('error_occurred'), {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
        } else {
          ftoast.success('Deleted successfully', {
            title: '',
            menuType: 'alerts',
            timeout: 5000,
          })
          this.getServiceTasksList()
        }
      }
    },
    refreshData() {
      this.loadRecord(true)
      this.loadSystemButtons()
    },
  },
}
</script>
