<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import router from '../../../router'
import { dset as setProperty } from 'dset'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
  getApp,
} from '@facilio/router'
import {
  FButtonGroup,
  FText,
  FPopover,
  FModal,
  FIcon,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import TermsAndConditionModel from './components/TermsAndConditionModel.vue'
import getProperty from 'dlv'
import { getPdfPreviewUrl } from '../Rfq/utils/purchaseUtils'
import { isEmpty } from '@facilio/utils/validation'
export default {
  extends: ModuleSummary,
  props: ['viewname'],
  data() {
    return {
      downloadUrl: null,
      showTandCModel: false,
      btnloading: false,
      gotoReceivablesBtnloading: false,
      completePoBtnloading: false,
      printPreviewBtnloading: false,
    }
  },
  components: {
    TermsAndConditionModel,
  },
  computed: {
    templateId() {
      return getProperty(this, 'details.templateId', null)
    },
    tagProps() {
      let { record = {} } = this
      if (
        !isEmpty(record) &&
        record.isStateFlowEnabled() &&
        record.currentModuleState()
      ) {
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
          clickAction: this.openAssociateTermDialog,
        },
        {
          name: 'Edit',
          identifier: 'edit_summary',
          clickAction: this.editRecord,
        },
        {
          name: 'Go to Receivables',
          identifier: 'gotoReceivables',
          loading: this.gotoReceivablesBtnloading,
          clickAction: this.goToReceivables,
        },
        {
          name: 'Complete PO',
          identifier: 'completePo',
          loading: this.completePoBtnloading,
          clickAction: this.completePo,
        },
        {
          name: 'Generate Invoice',
          identifier: 'generateInvoice',
          clickAction: this.convertInvoice,
        },
      ]
    },
    systemBtnList() {
      return [
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
  },
  methods: {
    getProperty,
    updateVisibility(value) {
      this.showTandCModel = value
    },
    openAssociateTermDialog() {
      this.showTandCModel = true
    },
    savedTermsCondition() {
      this.showTandCModel = false
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
    openPrintPreview() {
      this.printPreviewBtnloading = true
      let { moduleName, templateId, record = {} } = this
      let { id } = record
      let url = getPdfPreviewUrl(moduleName, templateId, id)
      window.open(url, '_blank', 'noopener,noreferrer')
      this.printPreviewBtnloading = false
    },
    async completePo() {
      this.completePoBtnloading = true
      let { moduleName, record } = this

      let value = await fDialog.warning({
        title: this.$t('purchase_order.complete_purchase_order', {
          ns: 'procurement',
        }),
        description: this.$t('purchase_order.complete_confirmation', {
          ns: 'procurement',
        }),
        saveText: this.$t('purchase_order._complete', { ns: 'procurement' }),
        cancelText: 'Cancel',
      })

      if (value) {
        let { error = {} } = await API.updateRecord(moduleName, {
          id: record.id,
          data: record,
          params: {
            completePO: true,
          },
        })

        if (error) {
          let { message } = error
          ftoast.critical(
            message ||
              this.$t('purchase_order.error_complete_po', { ns: 'procurement' })
          )
        } else {
          ftoast.success(
            this.$t(`purchase_order.success_complete_po`, { ns: 'procurement' })
          )
          this.loadSystemButtons(true)
          this.loadRecord(true)
        }
        this.completePoBtnloading = false
      }
    },
    goToReceivables() {
      this.gotoReceivablesBtnloading = true
      let { viewname, $route = {} } = this
      let { query } = $route
      let id = getProperty(this, 'record.receivableContext.id')
      if (id) {
        let { name } =
          findRouteForModule('receivable', pageTypes.OVERVIEW) || {}
        name &&
          this.$router.push({
            name,
            params: {
              id,
              viewname,
              query,
            },
          })
      }
      this.gotoReceivablesBtnloading = false
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
    async convertInvoice() {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { id } = this
      let query = { poId: id }
      let { href } =
        router.resolve({
          name,
          query,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
  },
}
</script>
