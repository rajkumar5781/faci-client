<script lang="jsx">
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import CloseIssueReasonSelectDialog from './CloseIssueReasonSelectDialog.vue'
import TroubleShootingTipsDialog from './TroubleShootingTipsDialog.vue'
import InhibitReasonSelectDialog from './InhibitReasonSelectDialog.vue'
import AssignFlaggedEventDialog from './AssignFlaggedEventDialog.vue'
import SuspendAlarmDialog from './SuspendAlarmDialog.vue'

import {
  FContainer,
  FButton,
  ftoast,
  FTags,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'

export default {
  name: 'FlaggedEventSummary',
  components: {
    FContainer,
    FButton,
    FTags,
    FDivider,
    CloseIssueReasonSelectDialog,
    TroubleShootingTipsDialog,
    InhibitReasonSelectDialog,
    AssignFlaggedEventDialog,
    SuspendAlarmDialog,
  },
  extends: ModuleSummary,
  data() {
    return {
      availableSystemButtons: [],
      canShowCloseIssueReasonsDialog: false,
      currentBureauCloseIssueReasonList: [],
      canShowTroubleShootingTipsDialog: false,
      canShowAssignFlaggedEventDialog: false,
      troubleShootingTips: '',
      currentBureauInhibitReasonList: [],
      canShowInhibitReasonSelectDialog: false,
      canShowSuspendAlarmDialog: false,
      closeBtnConfig: {},
      flaggedEventBureauActions: {},
      systemBtnNameMap: {},
    }
  },
  computed: {
    flaggedEventId() {
      let flaggedEventId = getProperty(this, 'record.id', -1)
      return flaggedEventId
    },
    flaggedEventStatus() {
      let flaggedEventStaus = getProperty(
        this,
        'record.statusDisplayName',
        null
      )
      return flaggedEventStaus
    },
    isBureauActionConfigExist() {
      let currentBureauActionDetail = getProperty(
        this,
        'record.currentBureauActionDetail',
        null
      )
      return !isEmpty(currentBureauActionDetail)
    },
    canShowTakeCustodyBtn() {
      let { availableSystemButtons } = this
      return (availableSystemButtons || []).includes(
        'flagged_event_take_custody'
      )
    },
    canShowSuspendAlarmButton() {
      let { availableSystemButtons = [] } = this
      return availableSystemButtons.includes('flagged_event_suspend_alarm')
    },
    canShowTakeActionBtn() {
      let { availableSystemButtons = [] } = this
      return availableSystemButtons.includes('flagged_event_take_action')
    },
    canShowForwardBtn() {
      let { availableSystemButtons } = this
      return (availableSystemButtons || []).includes(
        'pass_to_next_bureau_flagged_event_button'
      )
    },
    canShowInhibitBtn() {
      let { currentBureauInhibitReasonList, availableSystemButtons = [] } = this
      return (
        !isEmpty(currentBureauInhibitReasonList) &&
        availableSystemButtons.includes('inhibit_flagged_event_button')
      )
    },
    canShowCreateWoBtn() {
      let { availableSystemButtons = [] } = this
      return availableSystemButtons.includes('flagged_event_create_workorder')
    },
    canShowAssignBtn() {
      let { availableSystemButtons = [] } = this
      return availableSystemButtons.includes('flagged_event_assign_to')
    },
    canShowCloseEventBtn() {
      let canShowCloseEventBtn = getProperty(
        this,
        'closeBtnConfig.message.canClose',
        false
      )
      return canShowCloseEventBtn
    },
    closeWarnMessage() {
      let closeWarnMessage = getProperty(
        this,
        'closeBtnConfig.message.message',
        null
      )
      return closeWarnMessage
    },
    tagProps() {
      let { flaggedEventStatus } = this
      if (!isEmpty(flaggedEventStatus)) {
        let flaggedEventStatusProp = {
          appearance: 'status',
          text: flaggedEventStatus,
          statusType: 'information',
        }
        return flaggedEventStatusProp
      }
      return {}
    },
    systemBtnList() {
      let {
        canShowTakeCustodyBtn,
        canShowTakeActionBtn,
        canShowForwardBtn,
        canShowCloseEventBtn,
        canShowAssignBtn,
        systemBtnNameMap,
        canShowSuspendAlarmButton,
        canShowCreateWoBtn,
      } = this
      let flaggedAlarmStatusValue = getProperty(this, 'record.status', '')
      let systemBtnList = []
      if (canShowTakeCustodyBtn) {
        let name = systemBtnNameMap['flagged_event_take_custody']
        let btnConfig = {
          name,
          identifier: 'flagged_event_take_custody',
          loading: false,
          clickAction: this.takeCustody,
        }
        systemBtnList.push(btnConfig)
      }
      if (canShowTakeActionBtn) {
        let name = systemBtnNameMap['flagged_event_take_action']
        let btnConfig = {
          name,
          identifier: 'flagged_event_take_action',
          loading: false,
          clickAction: this.showTroubleShootingTipsDialog,
        }
        systemBtnList.push(btnConfig)
      }
      if (canShowForwardBtn) {
        let name = systemBtnNameMap['pass_to_next_bureau_flagged_event_button']
        let btnConfig = {
          name,
          identifier: 'pass_to_next_bureau_flagged_event_button',
          loading: false,
          clickAction: this.forward,
        }
        systemBtnList.push(btnConfig)
      }
      if (canShowCloseEventBtn) {
        let btnConfig = {
          name: 'Close',
          loading: false,
          identifier: 'close_action',
          clickAction: this.showCloseIssueReasonsDialog,
        }
        this.systemBtnDisplayNames['close_action'] = 'Close'
        systemBtnList.push(btnConfig)
      }
      if (canShowAssignBtn) {
        let name = systemBtnNameMap['flagged_event_assign_to']
        let btnConfig = {
          name,
          loading: false,
          identifier: 'flagged_event_assign_to',
          clickAction: this.showAssignFlaggedEventDialog,
        }
        systemBtnList.push(btnConfig)
      }
      if (canShowSuspendAlarmButton) {
        let name = systemBtnNameMap['flagged_event_suspend_alarm']
        let btnConfig = {
          name,
          loading: false,
          identifier: 'flagged_event_suspend_alarm',
          clickAction: this.showSuspendAlarmDialog,
        }
        systemBtnList.push(btnConfig)
      }
      return systemBtnList
    },
  },
  watch: {
    flaggedEventId() {
      this.loadModuleSummaryRelatedData()
    },
    systemButtons: {
      handler(newVal, oldVal) {
        if (!isEmpty(newVal)) {
          let systemBtnNameMap = {}
          this.availableSystemButtons = newVal.map(workflowRule => {
            let identifier = getProperty(workflowRule, 'identifier')
            systemBtnNameMap[identifier] = getProperty(workflowRule, 'name')
            return identifier
          })
          this.systemBtnNameMap = systemBtnNameMap
        } else {
          this.availableSystemButtons = []
          this.systemBtnNameMap = []
        }
      },
      deep: true,
    },
  },
  methods: {
    moreActionButtons() {},
    getActiveSystemButtons() {
      let { systemBtnList = [] } = this
      return systemBtnList || []
    },
    async loadModuleSummaryRelatedData() {
      this.isLoading = true
      await this.loadCurrentBureauActions()
      await this.loadClosButtonConfig()
      this.isLoading = false
    },
    async loadCurrentBureauActions() {
      let { isBureauActionConfigExist } = this
      if (isBureauActionConfigExist) {
        let flaggedEventBureauActionId = getProperty(
          this,
          'record.currentBureauActionDetail.id',
          null
        )
        let { data = {}, error } = await API.get(
          `/v3/unrelated/flaggedAlarm/fetch/flaggedEventBureauActions/${flaggedEventBureauActionId}`,
          null,
          { force: true }
        )
        if (isEmpty(error)) {
          let { flaggedEventBureauActions } = data
          this.flaggedEventBureauActions = flaggedEventBureauActions
          let currentBureauCloseIssueReasonList = getProperty(
            flaggedEventBureauActions,
            'closeIssueReasonOptionList',
            []
          )
          this.currentBureauCloseIssueReasonList =
            currentBureauCloseIssueReasonList.map(closeIssueReason => {
              let label = closeIssueReason?.name
              let value = closeIssueReason?.id
              return { label, value }
            })
          this.currentBureauInhibitReasonList = getProperty(
            flaggedEventBureauActions,
            'configuredinhibitReasonList',
            []
          )
          this.troubleShootingTips = getProperty(
            flaggedEventBureauActions,
            'troubleShootingTips',
            []
          )
        }
      }
    },
    async loadClosButtonConfig() {
      let { flaggedEventId } = this
      let { data, error } = await API.get(
        `/v3/flaggedEvent/${flaggedEventId}/closeButtonDetail`,
        {},
        { force: true }
      )
      if (isEmpty(error)) {
        this.closeBtnConfig = data
      } else {
        let message = error?.message || $t('error_occurred_short_message')
        ftoast.critical(message)
      }
    },
    async closeFlaggedEvent(closeReasonList = []) {
      let { flaggedEventId } = this
      let { error, data } = await API.patch(
        `/v3/flaggedEvent/${flaggedEventId}/close`,
        {
          closeIssueValues: closeReasonList,
        }
      )
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.close_success_message', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event.close_fail_message', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
      }
      this.reloadPage()
    },
    async takeCustody() {
      let { record } = this
      let { id: flaggedEventId } = record
      let { error } = await API.patch(
        `/v3/flaggedEvent/${flaggedEventId}/takecustody`
      )
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.take_custody_success_message', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event.take_custody_fail_message', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
      }
      this.reloadPage()
    },
    async forward() {
      let { flaggedEventId } = this
      let { error } = await API.patch(`/v3/flaggedEvent/${flaggedEventId}/pass`)
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.forward_success_message', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let defaultMessage = this.$t('flagged_event.forward_fail_message', {
          ns: 'remote_monitor',
        })
        ftoast.critical(error?.message || defaultMessage)
      }
      this.reloadPage()
    },
    async reloadPage() {
      this.isLoading = true
      this.canShowCloseIssueReasonsDialog = false
      this.canShowTroubleShootingTipsDialog = false
      this.canShowInhibitReasonSelectDialog = false
      this.canShowAssignFlaggedEventDialog = false
      this.canShowSuspendAlarmDialog = false
      await this.refreshData()
      await this.loadModuleSummaryRelatedData()
      this.isLoading = false
    },
    showCloseIssueReasonsDialog(btn) {
      let { currentBureauCloseIssueReasonList, closeWarnMessage } = this
      if (
        !isEmpty(currentBureauCloseIssueReasonList) ||
        !isEmpty(closeWarnMessage)
      ) {
        this.canShowCloseIssueReasonsDialog = true
      } else {
        this.closeFlaggedEvent()
      }
      btn.onActionComplete()
    },
    closeCloseReasonSelectDialog(reload) {
      this.canShowCloseIssueReasonsDialog = false
      if (reload) {
        this.reloadPage()
      }
    },
    showTroubleShootingTipsDialog(btn) {
      this.canShowTroubleShootingTipsDialog = true
      btn.onActionComplete()
    },
    showAssignFlaggedEventDialog() {
      this.canShowAssignFlaggedEventDialog = true
    },
    showSuspendAlarmDialog() {
      this.canShowSuspendAlarmDialog = true
    },
    closeSuspendAlarmDialog(reload) {
      this.canShowSuspendAlarmDialog = false
      if (reload) {
        this.reloadPage()
      }
    },
    closeAssignFlaggedEventDialog(reload) {
      this.canShowAssignFlaggedEventDialog = false
      if (reload) {
        this.reloadPage()
      }
    },
    closeTroubleShootingTipsDialog(reload) {
      this.canShowTroubleShootingTipsDialog = false
      if (reload) {
        this.reloadPage()
      }
    },
    showInhibitReasonSelectDialog() {
      this.canShowTroubleShootingTipsDialog = false
      this.canShowInhibitReasonSelectDialog = true
    },
    closeInhibitReasonSelectDialog(reload) {
      this.canShowInhibitReasonSelectDialog = false
      if (reload) {
        this.reloadPage()
      }
    },
    defaultSpace() {
      let {
        flaggedEventId,
        canShowCloseIssueReasonsDialog,
        currentBureauCloseIssueReasonList,
        canShowTroubleShootingTipsDialog,
        troubleShootingTips,
        canShowInhibitReasonSelectDialog,
        currentBureauInhibitReasonList,
        canShowCreateWoBtn,
        canShowInhibitBtn,
        closeWarnMessage,
        canShowAssignFlaggedEventDialog,
        canShowSuspendAlarmDialog,
      } = this
      if (canShowCloseIssueReasonsDialog) {
        return (
          <CloseIssueReasonSelectDialog
            canShowCloseIssueReasons={canShowCloseIssueReasonsDialog}
            flaggedEventId={flaggedEventId}
            closeIssueReasonList={currentBureauCloseIssueReasonList}
            closeWarnMessage={closeWarnMessage}
            v-on:closeFlaggedEventWithReason={this.closeFlaggedEvent}
            v-on:closeDialog={this.closeCloseReasonSelectDialog}
          />
        )
      } else if (canShowTroubleShootingTipsDialog) {
        return (
          <TroubleShootingTipsDialog
            canShowTroubleShootingTipsDialog={canShowTroubleShootingTipsDialog}
            flaggedEventId={flaggedEventId}
            troubleShootingTips={troubleShootingTips}
            canShowCreateWoBtn={canShowCreateWoBtn}
            canShowSkipWoCreationBtn={canShowInhibitBtn}
            v-on:skipWorkorderCreation={this.showInhibitReasonSelectDialog}
            v-on:closeDialog={this.closeTroubleShootingTipsDialog}
          />
        )
      } else if (canShowInhibitReasonSelectDialog) {
        return (
          <InhibitReasonSelectDialog
            canShowInhibitReasonSelectDialog={canShowInhibitReasonSelectDialog}
            flaggedEventId={flaggedEventId}
            inhibitReasonList={currentBureauInhibitReasonList}
            v-on:closeDialog={this.closeInhibitReasonSelectDialog}
          />
        )
      } else if (canShowAssignFlaggedEventDialog) {
        return (
          <AssignFlaggedEventDialog
            flaggedEventId={flaggedEventId}
            v-on:closeDialog={this.closeAssignFlaggedEventDialog}
          />
        )
      } else if (canShowSuspendAlarmDialog) {
        return (
          <SuspendAlarmDialog
            flaggedEventId={flaggedEventId}
            v-on:closeDialog={this.closeSuspendAlarmDialog}
          />
        )
      }
    },
  },
}
</script>
