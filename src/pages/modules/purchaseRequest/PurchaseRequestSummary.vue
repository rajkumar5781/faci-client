<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import TermsAndConditionModel from '../purchaseOrder/components/TermsAndConditionModel.vue'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
  getApp,
} from '@facilio/router'
import { getPdfPreviewUrl } from '../Rfq/utils/purchaseUtils'
import {
  FButtonGroup,
  FText,
  FPopover,
  FIcon,
  ftoast,
} from '@facilio/design-system'
export default {
  extends: ModuleSummary,
  components: {
    FButtonGroup,
    FText,
    FPopover,
    TermsAndConditionModel,
    FIcon,
  },
  data() {
    return {
      visible: false,
      downloadUrl: null,
      showTandCModel: false,
      btnloading: false,
      printPreviewBtnloading: false,
      convertPrToRfqBtnloading: false,
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
          statusType: 'information',
        }
      } else {
        return {}
      }
    },
    moreButtonList() {
      return [
        {
          name: 'Manage Terms',
          identifier: 'associateTerms',
          clickAction: this.showTanCModal,
        },
        { name: 'Edit', identifier: 'edit_summary', clickAction: this.editRecord },
      ]
    },
    systemBtnList() {
      return [
        {
          name: 'Convert To Rfq',
          identifier: 'convertToRfq',
          loading: this.convertPrToRfqBtnloading,
          clickAction: this.convertPrToRfq,
        },
        {
          iconGroup: 'connectivity',
          iconName: 'download',
          iconButton: true,
          iconPosition: 'prefix',
          identifier: 'downloadPdf',
          loading: this.btnloading,
          clickAction: this.downloadPdf,
          appearance: 'secondary',
        },
        {
          iconGroup: 'device',
          iconName: 'printer',
          iconButton: true,
          iconPosition: 'prefix',
          identifier: 'printPdf',
          loading: this.printPreviewBtnloading,
          clickAction: this.openPrintPreview,
          appearance: 'secondary',
        },
      ]
    },
    convertPrToRfqVisibility() {
      return (
        this.$access.hasPermission(`requestForQuotation:CREATE`) &&
        this.$access.isLicenseEnabled('REQUEST_FOR_QUOTATION')
      )
    },
  },
  methods: {
    getProperty,
    updateVisibility(value) {
      this.showTandCModel = value
    },
    savedTermsCondition() {
      this.showTandCModel = false
      this.loadSystemButtons(true)
      this.loadRecord(true)
    },
    defaultSpace() {
      return (
        <TermsAndConditionModel
          showTandCModel={this.showTandCModel}
          record={this.record}
          vOn:updateVisibility={this.updateVisibility}
          vOn:savedRecord={this.savedTermsCondition}
        />
      )
    },
    showTanCModal() {
      this.showTandCModel = true
    },
    convertPrToRfq() {
      this.convertPrToRfqBtnloading = true
      let { viewname, id } = this
      let { name } = findRouteForModule('requestForQuotation', pageTypes.CREATE)
      name &&
        this.$router.push({
          name,
          params: {
            viewname: viewname,
          },
          query: {
            isConvertPr: true,
            recordIds: JSON.stringify([id]),
          },
        })
      this.convertPrToRfqBtnloading = false
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
      let { error } = await API.get(`v3/pdftemplates/download`, params)
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'))
      }
      this.btnloading = false
    },
  },
}
</script>
