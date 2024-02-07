<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import {
  findRouteForModule,
  pageTypes,
  isWebTabsEnabled,
} from '@facilio/router'
import InvoiceVersionHistory from './widgets/InvoiceVersionHistory.vue'
import { CustomModuleData } from '../../../data/CustomModuleData'
import { ftoast, fDialog } from '@facilio/design-system'
import router from '../../../router'
import { dset as setProperty } from 'dset'
import { getPdfPreviewUrl } from '../Rfq/utils/purchaseUtils'
import InvoiveTermsAndConditions from './widgets/InvoiveTermsAndConditions.vue'
import ConvertInvoiceDialogue from './widgets/ConvertInvoiceDialogue.vue'
import { getApp } from '@facilio/router'

import {
  FContainer,
  FButton,
  FPopover,
  FMenuItem,
} from '@facilio/design-system'

const INVOICE_STATUS = {
  DELIVERED: 2,
  CANCELLED: 5,
  PAYMENT_ACKNOWLEDGED: 6,
}

const INVOICE_STATUS_TAG = {
  DRAFT: 'default',
  DELIVERED: 'warning',
  REJECTED: 'danger',
  APPROVED: 'information',
  CANCELLED: 'danger',
  PAYMENT_ACKNOWLEDGED: 'success',
  REVISED: 'neutral',
}
export default {
  name: 'InvoiceSummary',
  components: {
    FContainer,
    FButton,
    FPopover,
    FMenuItem,
    InvoiceVersionHistory,
    InvoiveTermsAndConditions,
    ConvertInvoiceDialogue,
  },
  extends: ModuleSummary,
  data() {
    return {
      invoiceId: null,
      versionHistory: [],
      showVersionHistory: false,
      btnloading: false,
      printPreviewBtnloading: false,
      showTandCModel: false,
      clientInvoiceType: 2,
      showInvoiceConvert: false,
      invoiceOptions: [],
      invoiceTemplates: null,
      pdfActiontype: '',
    }
  },
  computed: {
    modelDataClass() {
      return this.$attrs.modelDataClass || CustomModuleData
    },
    version() {
      let { record } = this
      return record.invoiceVersion || 1
    },
    captionText() {
      let { record, invoiceTag } = this
      return record ? `${invoiceTag}` : ''
    },
    localId() {
      let { record, id } = this
      return record.localId || id
    },
    invoiceTag() {
      let { version, localId } = this
      return `#${localId} / v${version}`
    },
    tagProps() {
      let { record } = this || {}
      if (record?.isStateFlowEnabled() && record.currentModuleState()) {
        return {
          text: record.currentModuleState(),
          appearance: 'status',
          statusType: 'default',
        }
      }
      return {
        text: this.invoiceStatusEnumList[this.invoiceStatus],
        appearance: 'status',
        statusType: this.statusTagType,
      }
    },
    statusTagType() {
      let { invoiceStatusEnum } = this.record
      return INVOICE_STATUS_TAG[invoiceStatusEnum] || 'default'
    },
    invoiceStatusField() {
      let { fields = [] } = this.metaInfo || {}
      let statusFieldObj = fields.find(field => field.name === 'invoiceStatus')
      return statusFieldObj
    },
    invoiceStatusEnumList() {
      return this.invoiceStatusField?.enumMap || {}
    },
    invoiceStatus() {
      return this.record.invoiceStatus
    },
    isStateFlowEnabled() {
      let { module } = this.metaInfo || {}
      let { stateFlowEnabled } = module
      return stateFlowEnabled
    },
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'edit_summary',
          clickAction: this.editRecord,
        },
        {
          name: 'Revise Invoice',
          identifier: 'reviseInvoice',
          clickAction: this.reviseInvoice,
        },
        {
          name: 'Clone Invoice',
          identifier: 'cloneInvoice',
          clickAction: this.cloneInvoice,
        },
        {
          name: 'View History',
          identifier: 'invoiceHistory',
          clickAction: this.getInvoiceHistory,
        },
        {
          name: 'Associate Terms',
          identifier: 'associateTermsInvoice',
          clickAction: this.openAssociateTermDialog,
        },
        {
          name: 'Invoice the Customer',
          identifier: 'invoiceCustomer',
          clickAction: this.openInvoiceConvert,
        },
        {
          name: 'Cancel Invoice',
          identifier: 'cancelInvoice',
          clickAction: this.cancelInvoiceConfirm,
        },
      ]
    },
    systemBtnList() {
      let buttonList = [
        {
          name: 'Dispatch Invoice',
          identifier: 'dispatchInvoice',
          clickAction: () =>
            this.updateInvoiceStatus(INVOICE_STATUS['DELIVERED']),
        },
        {
          name: 'Acknowledge Payment',
          identifier: 'acknowledgePayment',
          clickAction: () =>
            this.updateInvoiceStatus(INVOICE_STATUS['PAYMENT_ACKNOWLEDGED']),
        },
      ]

      return buttonList
    },
    isRevised() {
      let { isInvoiceRevised } = this.record
      return isInvoiceRevised || false
    },
    isCancelled() {
      let { invoiceStatusEnum } = this.record
      return invoiceStatusEnum === 'CANCELLED'
    },
    isVendorInvoice() {
      let { invoiceTypeEnum } = this.record
      return invoiceTypeEnum === 'VENDOR'
    },
    isApprovalEnabled() {
      let { record } = this
      return record?.isApprovalEnabled() || this.isCancelled
    },
    notificationDetails() {
      if (this.isCancelled) {
        return {
          description: this.$t('invoice.invoice_cancel_info', {
            ns: 'invoice',
          }),
          hideCloseIcon: true,
        }
      }
      return {
        description: this.approvalText,
        hideCloseIcon: true,
      }
    },
  },
  methods: {
    async init() {
      await this.loadRecord(true)
      await this.loadSystemButtons(true)
      await this.loadPdfTemplatesList()
    },
    async loadRecord(force = false) {
      try {
        let { moduleName, id } = this
        this.isLoading = true
        this.record = await this.modelDataClass.fetch({
          moduleName,
          id,
          force,
        })
      } catch (error) {
        ftoast.critical(
          error?.message ||
            this.$t('invoice.error_summary_fetch', { ns: 'invoice' })
        )
      }
      this.isLoading = false
    },
    defaultSpace() {
      return (
        <FContainer>
          {this.showVersionHistory && (
            <InvoiceVersionHistory
              showVersionHistory={this.showVersionHistory}
              moduleName={this.moduleName}
              invoiceId={this.id}
              isStateFlowEnabled={this.isStateFlowEnabled}
              invoiceStatusEnumList={this.invoiceStatusEnumList}
              vOn:onclose={this.closeShowVersionHistory}
            />
          )}
          {this.showInvoiceConvert && (
            <ConvertInvoiceDialogue
              details={this.record}
              visibility={this.showInvoiceConvert}
              invoiceOptions={this.invoiceOptions}
              v-on:closeInvoiceConvert={this.closeInvoiceConvert}
            ></ConvertInvoiceDialogue>
          )}
          <InvoiveTermsAndConditions
            showTandCModel={this.showTandCModel}
            record={this.record}
            vOn:updateTermsVisibility={this.updateTermsVisibility}
            vOn:savedInvoiceTermsCondition={this.savedInvoiceTermsCondition}
          ></InvoiveTermsAndConditions>
        </FContainer>
      )
    },

    async reviseInvoice() {
      let { moduleName, id } = this
      let params = { invoiceId: id }
      let { data, error } = await API.post('v3/invoice/revise', params)
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        let { result } = data || {}
        let { invoiceVersion, invoiceId } = result || {}
        this.redirectToInvoice(invoiceId, invoiceVersion)
      }
    },
    async reviseInvoiceConfirm() {
      let value = await fDialog.warning({
        title: this.$t('invoice.reviseInvoice', { ns: 'invoice' }),
        description: this.$t('invoice.reviseInvoice_description', {
          ns: 'invoice',
        }),
        saveText: this.$t('invoice.proceed', { ns: 'invoice' }),
        cancelText: this.$t('invoice.cancel', { ns: 'invoice' }),
      })
      if (value) {
        this.reviseInvoice()
      }
      return
    },
    async cancelInvoiceConfirm() {
      let value = await fDialog.warning({
        title: this.$t('invoice.cancelInvoice', { ns: 'invoice' }),
        description: this.$t('invoice.cancelInvoice_description', {
          ns: 'invoice',
        }),
        saveText: this.$t('invoice.proceed', { ns: 'invoice' }),
        cancelText: this.$t('invoice.abort', { ns: 'invoice' }),
      })
      if (value) {
        this.updateInvoiceStatus(INVOICE_STATUS['CANCELLED'])
      }
      return
    },
    getInvoiceHistory() {
      this.showVersionHistory = true
    },
    closeShowVersionHistory() {
      this.showVersionHistory = false
    },
    async cloneInvoice() {
      let { id, moduleName } = this
      let apiParams = { invoiceId: id }
      let { data, error } = await API.post('v3/invoice/clone', apiParams)
      if (!error) {
        let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
        let { result } = data || {}
        let { id, invoiceVersion } = result.invoiceList || {}
        this.redirectToInvoice(id, invoiceVersion)
      }
    },
    openInvoiceConvert() {
      let { invoiceOptions, $access } = this
      if ($access.isLicenseEnabled('TENANTS')) {
        invoiceOptions.push({ label: 'Tenant Invoice', value: 1 })
      }
      if ($access.isLicenseEnabled('CLIENT')) {
        invoiceOptions.push({ label: 'Client Invoice', value: 2 })
      }
      if (invoiceOptions.length === 0) {
        ftoast.critical(
          this.$t('invoice.invoice_conversion_error', { ns: 'invoice' })
        )
      } else if (invoiceOptions.length === 1) {
        this.convertInvoice(invoiceOptions[0])
      } else {
        this.showInvoiceConvert = true
      }
    },
    async convertInvoice(type) {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { id } = this
      let query = { invoiceId: id, conversionType: type.value }
      let { href } =
        router.resolve({
          name,
          query,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    closeInvoiceConvert() {
      this.invoiceOptions = []
      this.showInvoiceConvert = false
    },
    async updateInvoiceStatus(invoiceStatus) {
      let { moduleName, id } = this
      let { error = {} } = await API.updateRecord(moduleName, {
        id: id,
        data: { invoiceStatus },
      })
      if (error) {
        let { message } = error
        ftoast.critical(message || 'Error Occurred')
      } else {
        ftoast.success(this.$t('invoice.update_success', { ns: 'invoice' }))
        this.loadRecord(true)
      }
    },
    openPrintPreview() {
      this.printPreviewBtnloading = true
      let { moduleName, templateId, record = {} } = this
      let { id } = record
      let url = getPdfPreviewUrl(moduleName, templateId, id)
      window.open(url, '_blank', 'noopener,noreferrer')
      this.printPreviewBtnloading = false
    },
    async downloadPdf() {
      this.btnloading = true
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
      this.btnloading = false
    },
    async loadPdfTemplatesList() {
      let { id: appId } = getApp() || {}
      let { moduleName, record = {} } = this
      let templatesList = []
      let { data, error = {} } = await API.get(
        `v3/pdftemplates/customPage/${moduleName}/${appId}/${record.id}`
      )
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'))
      } else {
        let templates = data.pdfTemplates
        templates.forEach(template => {
          let { id, name } = template || {}
          let templateOption = {
            value: id,
            label: name,
          }
          templatesList.push(templateOption)
        })
      }
      this.invoiceTemplates = templatesList || []
    },
    updateTermsVisibility(value) {
      this.showTandCModel = value
    },
    openAssociateTermDialog() {
      this.showTandCModel = true
    },
    savedInvoiceTermsCondition() {
      this.showTandCModel = false
      this.loadRecord(true)
    },
    redirectToInvoice(id, invoiceVersion) {
      let { moduleName } = this
      let version = `v${invoiceVersion}`
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let route = {
        name,
        params: {
          viewname: 'all',
          id,
        },
        query: { version },
      }
      let { href } = router.resolve(route) || {}
      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
  },
}
</script>
