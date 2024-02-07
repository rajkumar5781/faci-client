<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
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
import TermsAndConditionModel from '../../modules/purchaseOrder/components/TermsAndConditionModel.vue'
import getProperty from 'dlv'
import { getPdfPreviewUrl } from '../Rfq/utils/purchaseUtils'
import module from '../../../store/module'
import cloneDeep from 'lodash/cloneDeep'
import router from '../../../router'
import { isEmpty } from '@facilio/utils/validation'

let moduleStore = module()
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
      showMarkupDialog: false,
      selectedRecord: null,
      isParentQuoteExists: false,
      childQuotes: [],
      quoteFormsList: [],
      isEmpty,
    }
  },
  components: {
    FButtonGroup,
    FText,
    FPopover,
    FModal,
    TermsAndConditionModel,
    FIcon,
  },
  created() {
    moduleStore.loadTicketStatus('quote')
  },
  mounted() {
    this.loadCustomerQuote()
    this.loadQuoteDependencies()
  },
  computed: {
    childQuote() {
      if (this.childQuotes.length) {
        return this.childQuotes[0]
      }
      return null
    },
    templateId() {
      return getProperty(this, 'details.templateId', null)
    },

    moreButtonList() {
      let systemBtnList = []
      systemBtnList.push({
        name: 'Manage Terms',
        identifier: 'associateTerms',
        clickAction: this.openAssociateTermDialog,
      })
      if (
        !this.isRecordLocked &&
        this.record.customerType === 4 &&
        !this.isParentQuoteExists
      ) {
        systemBtnList.push({
          name: 'Convert to User Quote',
          identifier: 'convertUserQuote',
          clickAction: this.createCustomerQuoteAction,
        })
      }
      if (this.showOptionViewCustomerQuote) {
        systemBtnList.push({
          name: 'View Customer Quote',
          identifier: 'viewCustomerQuote',
          clickAction: this.redirectToCustomerQuote,
        })
      }

      if (this.canShowRevise) {
        systemBtnList.push({
          name: 'Revise',
          identifier: 'reviseQuoute',
          clickAction: this.reviseQuotation,
        })
      } else {
        systemBtnList.push({
          name: 'Edit',
          identifier: 'edit',
          clickAction: this.editRecord,
        })
      }
      if (this.$access.isLicenseEnabled('INVOICE')) {
        systemBtnList.push({
          name: 'Invoice the Customer',
          identifier: 'invoiceCustomer',
          clickAction: this.createInvoice,
        })
      }

      return systemBtnList
    },
    moduleStateId() {
      return getProperty(this, 'record.moduleState.id')
    },
    canShowRevise() {
      let statusObj = moduleStore.getTicketStatus(this.moduleStateId, 'quote')
      console.log('statusObj', statusObj)
      if ('Sent' === statusObj.status) {
        return true
      }
      return false
    },
    currentView() {
      if (this.viewName) {
        return this.viewName
      }
      if (this.$route.params.viewname) {
        return this.$route.params.viewname
      }
      return 'all'
    },
    getCustomerTypeFromParent() {
      if (this.record?.workorder?.tenant?.id) {
        return 1
      } else {
        return 2
      }
    },
    showOptionViewCustomerQuote() {
      let { customerType } = this.record
      return !!(
        this.isParentQuoteExists &&
        this.childQuote !== null &&
        customerType === 4
      )
    },
    getWokorderTenant() {
      if (this.record?.workorder?.tenant?.id) {
        return this.record.workorder.tenant.id
      }
      return null
    },
    getWokorder() {
      if (this.record?.workorder?.id) {
        return this.record.workorder.id
      }
      return null
    },
    getWokorderClient() {
      if (this.record?.workorder?.client?.id) {
        return this.record.workorder.client.id
      }
      return null
    },
    moduleName() {
      return 'quote'
    },
  },
  methods: {
    getProperty,
    updateVisibility(value) {
      this.showTandCModel = value
    },
    reviseQuotation() {
      let { id, moduleName } = this
      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
        name &&
          this.$router.push({
            name,
            params: {
              id,
            },
            query: { revise: true },
          })
      } else {
        this.$router.push({
          path: `/app/tm/quotation/edit/${id}?revise=true`,
        })
      }
    },
    async createInvoice() {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { id } = this
      let query = { quote: id }
      let { href } =
        router.resolve({
          name,
          query,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    openAssociateTermDialog() {
      this.showTandCModel = true
      this.record.moduleName = 'quotation'
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
    downloadQuotation() {
      this.selectedRecord = null
      this.showMarkupDialog = false
      let record = this.customModuleData
      if (this.canShowMarkup(record)) {
        this.selectedRecord = record
        this.showMarkupDialog = true
      }
    },
    closemarkupDialog() {
      this.showMarkupDialog = false
      this.selectedRecord = false
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
    sendQuotationMail() {},
    isRecordLocked() {
      let { record, moduleName } = this

      if (!record?.isStateFlowEnabled) {
        return false
      } else {
        let moduleState = getProperty(record, 'moduleState.id')
        return (
          moduleState &&
          moduleStore.isStatusLocked(record.moduleState.id, moduleName)
        )
      }
    },
    isRequestedState() {
      let { record } = this
      let { approvalStatus } = record || {}

      if (isEmpty(approvalStatus)) {
        return false
      } else {
        let statusObj = moduleStore.getApprovalStatus(approvalStatus.id)
        return getProperty(statusObj, 'requestedState', false)
      }
    },
    async loadCustomerQuote() {
      let { page = 1, perPage = 1, moduleName } = this || {}
      let { id } = this
      let filters = {
        parentQuotationId: {
          operatorId: 36,
          value: [id + ''],
        },
        oneLevelLookup: {},
      }

      if (!isEmpty(filters)) {
        filters = JSON.stringify(filters)
      }

      let params = {
        includeParentFilter: true,
        page,
        perPage,
        moduleName: moduleName,
        withCount: true,
        filters,
      }

      let url = '/v3/modules/data/list'
      let { data } = await API.get(url, params)

      if (data?.quote && data.quote.length) {
        this.childQuotes = data.quote
        this.isParentQuoteExists = true
      }
    },
    async loadQuoteDependencies() {
      await this.loadQuoteForms()
    },
    async loadQuoteForms() {
      let url = `/v2/${this.moduleName}/forms?moduleName=${'quote'}`

      let { data, error } = await API.get(url)
      if (error) {
        let { message } = error
        ftoast.critical(message)
      } else {
        let { forms = [] } = data || {}
        this.quoteFormsList = forms
      }
    },

    async redirectToCustomerQuote() {
      if (isWebTabsEnabled()) {
        let { currentView, moduleName } = this
        let id = this.childQuote.id
        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
        console.log('---->', name, currentView, id, moduleName)
        name &&
          this.$router.push({
            name,
            params: {
              viewname: currentView,
              id: id,
            },
            query: this.$route.query,
          })
      }
    },
    createCustomerQuoteAction() {
      let quote = cloneDeep(this.record)

      let formId = this.getFormIdfromQuote(quote)

      let query = {
        customerType: 2,
        subject: quote.subject,
        description: quote.description || '',
        lineItems: quote.lineItems || [],
        siteId: quote.siteId,
        parentQuotationId: quote.id,
      }

      if (this.getWokorder !== null) {
        query['workorder'] = this.getWokorder
      }
      if (this.getWokorderTenant !== null) {
        query['tenant'] = this.getWokorderTenant
      }
      if (this.getWokorderClient !== null) {
        query['client'] = this.getWokorderClient
      }
      if (quote?.billDate) {
        query['billDate'] = quote.billDate
      }

      if (quote?.expiryDate) {
        query['expiryDate'] = quote.expiryDate
      }

      if (quote?.markup) {
        query['markup'] = quote.markup
      }

      if (formId) {
        query['formId'] = formId
      }

      query['customerType'] = this.getCustomerTypeFromParent

      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule('quote', pageTypes.CREATE) || {}

        name &&
          this.$router.push({
            name,
            query,
          })
      }
    },
    getFormIdfromQuote() {
      return this.getRedirectFormId(this.getCustomerTypeFromParent)
    },
    getRedirectFormId(cusType) {
      let customerType = this.record.customerType
      if (cusType) {
        customerType = cusType
      }
      if (customerType > -1) {
        let customerTypeToFormsMap = {
          1: 'tenantquoteform',
          2: 'clientquoteform',
          3: 'default_quote_web_maintenance',
          4: 'vendorquoteform',
        }
        if (customerType) {
          let form = this.quoteFormsList.find(rt => {
            if (rt.name === customerTypeToFormsMap[customerType]) {
              return rt
            } else {
              return null
            }
          })
          if (form?.id) {
            return form.id
          }
        }
      } else {
        if (
          this.quoteFormsList.length &&
          this.quoteFormsList[0] &&
          this.quoteFormsList[0].id
        ) {
          return this.quoteFormsList[0].id
        }
      }
      return null
    },
  },
}
</script>
