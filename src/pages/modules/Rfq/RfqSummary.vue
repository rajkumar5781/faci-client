<script lang="jsx">
import {
  FButton,
  FText,
  FPopover,
  FModal,
  FIcon,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import { getPdfPreviewUrl } from './utils/purchaseUtils'
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import AwardVendor from './components/AwardVendor.vue'
import getProperty from 'dlv'
import ActionButton from '../../summary/components/ActionButton.vue'
import ApprovalBar from '../../../components/page-builder/approval-bar/ApprovalBar.vue'
const STATUS_ENUM_MAP = {
  'Awarded':'success',
  'Discarded':'danger',
  'Ready to Award':'warning',
  'Unpublished':'default',
  'Closed':'success'
}
export default {
  extends: ModuleSummary,
  props: ['viewname'],
  components: {
    FButton,
    FText,
    FPopover,
    FModal,
    FIcon,
    ActionButton,
    ApprovalBar,
  },
  data() {
    return {
      downloadUrl: null,
      selectedVendors: [],
      isButtonLoading: false,
      showAwardVendorsDialog: false,
      publishRfqButtonLoading: false,
      downloadPdfBtnLoading: false,
      printPreviewButtonLoading: false,
    }
  },
  computed: {
    templateId() {
      return getProperty(this, 'details.templateId', null)
    },
    tagProps() {
      let { record = {} } = this
      if (record.isStateFlowEnabled() && record.currentModuleState()) {
        return {
          text: record.currentModuleState(),
          appearance: 'status',
          statusType: getProperty(STATUS_ENUM_MAP,record.currentModuleState(),'information'),
        }
      } else {
        return {}
      }
    },
    systemBtnList() {
      return [
        {
          name: 'Publish RFQ',
          identifier: 'publishRfq',
          loading: this.publishRfqButtonLoading,
          clickAction: this.publishRfq,
        },
        {
          name: 'Close Submission',
          identifier: 'closeSubmission',
          loading: this.isButtonLoading,
          clickAction: this.receiveQuote,
        },
        {
          name: 'Assess & Award',
          identifier: 'assessAndAward',
          loading: this.isButtonLoading,
          clickAction: this.awardQuote,
        },
        {
          name: 'View Award Summary',
          identifier: 'viewAwardSummary',
          loading: this.isButtonLoading,
          clickAction: this.awardQuote,
        },
        {
          iconGroup: 'connectivity',
          iconName: 'download',
          iconButton: true,
          iconPosition: 'prefix',
          identifier: 'downloadPdf',
          loading: this.downloadPdfBtnLoading,
          clickAction: this.downloadPdf,
          appearance: 'secondary',
        },
        {
          iconGroup: 'device',
          iconName: 'printer',
          iconButton: true,
          iconPosition: 'prefix',
          identifier: 'printPdf',
          loading: this.printPreviewButtonLoading,
          clickAction: this.openPrintPreview,
          appearance: 'secondary',
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Edit Rfq',
          identifier: 'edit_summary',
          clickAction: this.editRecord,
        },
        {
          name: 'Discard Rfq',
          identifier: 'discardRfq',
          clickAction: this.discardQuote,
        },
      ]
    },
    isApprovalEnabled() {
      let { record, showClosedBidBanner } = this
      return getProperty(this , 'record.isDiscarded',false) || showClosedBidBanner || record.isApprovalEnabled()
    },
    notificationDetails() {
      let { record, showClosedBidBanner } = this
      let { isDiscarded } = record || {}
      if (isDiscarded) {
        return {
          title: this.$t('rfq.discard_banner_title', { ns: 'procurement' }),
          description: this.$t('rfq.discard_banner_description', {
            ns: 'procurement',
          }),
          hideCloseIcon: true,
        }
      } else if (showClosedBidBanner) {
        return {
          title: this.$t('rfq.closebid_title', { ns: 'procurement' }),
          description: this.$t('rfq.closebid_description', {
            ns: 'procurement',
          }),
          hideCloseIcon: true,
        }
      }
      return {
        description: this.approvalText,
        hideCloseIcon: true,
      }
    },
    isClosedBid() {
      return getProperty(this, 'record.rfqType', null) === 'CLOSED_BID'
    },
    showClosedBidBanner() {
      let { record, isClosedBid } = this
      if (isEmpty(record)) {
        return false
      }
      let { isQuoteReceived, isDiscarded, isRfqFinalized } = record || {}

      return !isQuoteReceived && isClosedBid && !isDiscarded && isRfqFinalized
    },
  },
  methods: {
    getProperty,
    updateVisibility() {
      this.showAwardVendorsDialog = false
    },
    actionButtons() {
      let {
        record = {},
        moduleName,
        POSITION,
        systemBtnList,
        systemButtonLoading,
      } = this
      let { isDiscarded } = record
      let sysBtnList = this.getActiveSystemButtons(systemBtnList)
      return (
        !isDiscarded && (
          <ActionButton
            record={record}
            moduleName={moduleName}
            position={POSITION.SUMMARY}
            disabled={record.isApprovalEnabled()}
            systemButtons={sysBtnList}
            systemButtonLoading={systemButtonLoading}
            vOn:refresh={this.refreshData}
            vOn:onError={() => {}}
            vOn:transitionSuccess={this.refreshData}
            vOn:transitionFailure={() => {}}
          ></ActionButton>
        )
      )
    },
    moreActionButtons() {
      let { moreButtonList ,record } = this
      let moreActionBtns = this.getActiveSystemButtons(moreButtonList)
      let { isDiscarded } = record

      return (
        !isDiscarded && (
        <FPopover trigger="hover" placement="bottom-end">
          {!isEmpty(moreActionBtns) && (
            <FIcon
              group="action"
              name="options-vertical"
              size="16"
              pressable={true}
              color="iconNeutralDefault"
              marginLeft="containerLarge"
              borderRadius="medium"
            />
          )}
          <FContainer
            slot="content"
            padding="containerLarge"
            overflow="scroll"
            maxHeight="200"
          >
            {moreActionBtns.map(btn => (
              <FButton
                key={btn.id}
                attrs={btn}
                appearance={btn.appearance || 'tertiary'}
                loading={btn.loading}
                disabled={btn.disabled}
                vOn:click={btn.clickAction}
              >
                {btn.name}
              </FButton>
            ))}
          </FContainer>
        </FPopover>
      )
      )
    },
    notificationButtons() {
      let { record = {} } = this
      let { isDiscarded } = record
      return  (
      <template>
        {!isDiscarded && (
          <ApprovalBar
          approvalText={this.approvalText}
          moduleName={this.moduleName}
          key={record.id + 'approval-bar'}
          record={record}
          hideApprovers={false}
          vOn:onSuccess={this.refreshData}
          vOn:onFailure={() => {}}
          class="approval-bar-shadow"
          {...{ on: { 'update:approvalText': this.updateApprovalText } }}
        ></ApprovalBar>
      )
    }
    </template>)
    },
    async downloadPdf() {
      this.downloadPdfBtnLoading = true
      let { moduleName, templateId, record = {} } = this
      let downloadInfoObj = {
        title: this.$t('purchase_order.downloading', { ns: 'procurement' }),
        manualClear: false,
        menuType: 'toast',
        timeout: 2000,
      }
      ftoast.information('', downloadInfoObj)
      let { id: recordId } = record
      let params = {
        moduleName,
        id: templateId,
        recordId,
      }
      let { error = {} } = await API.get(`v3/pdftemplates/download`, params)
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'))
      }
      this.downloadPdfBtnLoading = false
    },
    openPrintPreview() {
      this.printPreviewButtonLoading = true
      let { moduleName, templateId, record = {} } = this
      let { id } = record
      let url = getPdfPreviewUrl(moduleName, templateId, id)
      window.open(url, '_blank', 'noopener,noreferrer')
      this.printPreviewButtonLoading = false
    },
    defaultSpace() {
      return (
        <AwardVendor
          showAwardVendorModal={this.showAwardVendorsDialog}
          record={this.record}
          moduleName={this.moduleName}
          vOn:cancel={this.updateVisibility}
          vOn:saved={this.reloadBtnAndData}
        />
      )
    },
    setSelectedVendors() {
      if (!isEmpty(this.record.vendor)) {
        this.selectedVendors = this.record.vendor.map(vendor => vendor.id)
      }
    },
    reloadBtnAndData() {
      this.loadSystemButtons(true)
      this.loadRecord(true)
    },
    async publishRfq() {
      this.publishRfqButtonLoading = true
      this.setSelectedVendors()
      let selectedVendors = this.selectedVendors.map(vendor => ({
        id: vendor,
      }))
      if (isEmpty(selectedVendors)) {
        let option = {
          title: this.$t(`rfq.vendors_not_selected`, { ns: 'procurement' }),
        manualClear: false,
        menuType: 'toast',
        timeout: 3000,
      }
      ftoast.critical(this.$t(`rfq.cannot_finalize_rfq_with_no_vendors`, {
            ns: 'procurement',
          }) , option)
      } else {
        let data = {
          id: getProperty(this.record, 'id'),
          data: {
            vendor: selectedVendors,
          },
          params: {
            rfqFinalized: true,
          },
        }
        let { error } = await API.updateRecord(this.moduleName, data)
        if (error) {
          let { message } = error
          ftoast.critical(
            message ||
              this.$t('rfq.error_while_finalizing_rfq', { ns: 'procurement' })
          )
        } else {
          ftoast.success(
            this.$t('rfq.finalized_rfq_successfully', { ns: 'procurement' })
          )
          this.loadSystemButtons(true)
          this.loadRecord(true)
        }
      }
      this.publishRfqButtonLoading = false
    },
    async receiveQuote() {
      this.isButtonLoading = true
      let value = await this.closeSubmissionWarningDialog()
      if (value) {
        let data = {
          id: getProperty(this, 'record.id'),
          params: {
            receiveQuote: true,
          },
        }
        this.updateData(data, 'receive_quote')
      } else {
        this.isButtonLoading = false
      }
    },
    async updateData(data, action) {
      let { error } = await API.updateRecord(this.moduleName, data)
      if (error) {
        let { message } = error
        let errorMessage =
          action == 'receive_quote'
            ? this.$t('rfq.error_while_reciving_quotes', { ns: 'procurement' })
            : this.$t('rfq.error_while_discarding_rfq', { ns: 'procurement' })
        ftoast.critical(message || errorMessage)
      } else {
        let successMsg =
          action == 'receive_quote'
            ? this.$t('rfq.received_quotes', { ns: 'procurement' })
            : this.$t('rfq.discarded_rfq', { ns: 'procurement' })
        ftoast.success(successMsg)
        this.loadSystemButtons(true)
        this.loadRecord(true)
      }
      this.isButtonLoading = false
    },
    awardQuote() {
      this.isButtonLoading = true
      this.showAwardVendorsDialog = true
      this.isButtonLoading = false
    },
    discardQuote() {
      let data = {
        id: getProperty(this, 'record.id'),
        params: {
          discardQuote: true,
        },
      }
      this.updateData(data, 'discard_quote')
    },
    async closeSubmissionWarningDialog() {
      let value = await fDialog.warning({
        title: this.$t('rfq.confirm_close_submission', { ns: 'procurement' }),
        description: this.$t('rfq.close_submission_warning_msg', {
          ns: 'procurement',
        }),
        cancelText: this.$t('rfq.cancel', { ns: 'procurement' }),
        saveText: this.$t('rfq.confirm', { ns: 'procurement' }),
      })
      return value
    },
  },
}
</script>
