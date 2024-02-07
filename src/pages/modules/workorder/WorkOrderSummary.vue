<script lang="jsx">
import {
  FContainer,
  FButton,
  FPageHeader,
  FSpinner,
  FDivider,
  FButtonGroup,
  ftoast,
} from '@facilio/design-system'
import ModuleSummary from '../../summary/ModuleSummary.vue'
import Page from '../../../components/page-builder/PageBuilder.vue'
import { isEmpty } from '@facilio/utils/validation'
import transformMixin from './workorderHelper'
import { mapState } from 'pinia'
import { API } from '@facilio/api'
import { getApp } from '@facilio/router'
import getProperty from 'dlv'
import ReportDowntime from '../asset/widgets/ReportDowntime.vue'
import InvoiceTypeDialogue from './widgets/InvoiceTypeDialogue.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import router from '../../../router'
import WorkOrderSummaryPdfOptions from './widgets/WorkOrderSummaryPdfOptions.vue'
import PDFdownload from './widgets/PDFdownload.vue'

export default {
  extends: ModuleSummary,
  props: ['viewname'],
  mixins: [transformMixin],
  components: {
    FContainer,
    FButton,
    FPageHeader,
    FSpinner,
    FDivider,
    Page,
    FButtonGroup,
    ReportDowntime,
    InvoiceTypeDialogue,
    WorkOrderSummaryPdfOptions,
    PDFdownload,
  },
  mounted() {
    this.$root.$on('reloadWO', async res => {
      if (res) {
        this.woBundle.workorder = res.wo
      } else {
        this.loadWorkorderSummary()
        this.surveyDetails = await loadSurveyForSurveyBar(
          false,
          this.moduleName,
          this.woId,
          this.surveyDetails
        )
      }
    })
  },
  data() {
    return {
      hasTransitionBtns: false,
      hasCustomButtons: false,
      notesModuleName: 'cmdnotes',
      attachmentsModuleName: 'cmdattachments',
      woBundle: null,
      loading: true,

      isActive: false,
      stateflows: [],
      invoiceOptions: [],
      primaryFields: [
        'name',
        'description',
        'category',
        'type',
        'siteId',
        'space',
      ],
      // POSITION: POSITION_TYPE,
      openTaskOptions: false,

      // asset breakdown reporting specific
      showAssetBreakdown: false,
      assetBDSourceDetails: {},

      editFormVisibilty: false,
      isDownloadOption: false,
      pdfUrl: '',
      workOrderSettingsRelatedData: {},
      showInvoiceConvert: false,
      downloadUrl:''
    }
  },
  computed: {
    moreButtonList() {
      let moreButtonList = [
        {
          name: 'Edit',
          identifier: 'editWorkorder',
          clickAction: this.editRecord,
        }, 
        // will be enabled after 
        
        {
          name: 'Print',
          identifier: 'printWorkorder',
          clickAction: this.openPrintOptionDialog,
        },
        {
          name: 'Download',
          identifier: 'downloadWorkorder',
          clickAction: this.openDownloadOptionDialog,
        },
        {
          name: 'Report Downtime',
          identifier: 'workorderAssetBreakdown',
          clickAction: this.openReportDowntime,
        },
      ]

      return moreButtonList
    },
    isPdfDownload: {
      get() {
        let { openTaskOptions, isDownloadOption, pdfUrl } = this
        return openTaskOptions && isDownloadOption && !isEmpty(pdfUrl)
      },
      set(newValue) {
        if (!newValue) {
          this.$set(this, 'pdfUrl', '')
        }
        this.$set(this, 'openTaskOptions', newValue)
      },
    },
    captionText() {
      let { record } = this
      return record ? `#${record.localId}` : ''
    },
    tagProps() {
      let { record } = this || {}
      if (record?.isStateFlowEnabled() && record.currentModuleState()) {
        return {
          text: record.currentModuleState(),
          appearance: 'status',
          statusType: 'information',
        }
      } else {
        return {}
      }
    },
  },
  methods: {
    defaultSpace() {
      return (
        <FContainer>
          {this.showAssetBreakdown && (
            <ReportDowntime
              assetBDSourceDetails={this.assetBDSourceDetails}
              visibility={this.showAssetBreakdown}
              v-on:closeDialog={this.closeReportDowntime}
            ></ReportDowntime>
          )}
          {this.showInvoiceConvert && (
            <InvoiceTypeDialogue
              details={this.record}
              visibility={this.showInvoiceConvert}
              invoiceOptions={this.invoiceOptions}
              v-on:closeInvoiceConvert={this.closeInvoiceConvert}
            ></InvoiceTypeDialogue>
          )}
          {this.openTaskOptions && (
            <WorkOrderSummaryPdfOptions
              workorders={[this.record && this.record.id]}
              visibility={this.openTaskOptions}
              viewName={this.viewname}
              isDownloadOption={this.isDownloadOption}
              pdfUrl={this.pdfUrl}
              isPdfDownload={this.isPdfDownload}
              v-on:onClose={this.closeDialog}
              v-on:updatepdfUrl={this.updatepdfUrl}
            />
          )}
          {this.downloadUrl && (
            <iframe src={this.downloadUrl} style="display: none;"></iframe>
          )}
        </FContainer>
      )
    },
    async updatepdfUrl(url){
      let { additionalInfo } = this
        ftoast.success('Downloading..')
        await API.post(`/v2/integ/pdf/create`, {
          url,
          additionalInfo,
        }).then(({ data, error }) => {
          if (error) {
            let { message = 'Unable to fetch download link' } = error
            ftoast.critical(message)
          } else {
            this.downloadUrl = (data || {}).fileUrl
          }
        })
        this.closeDownload(false)
    },
    closeDownload(isClose){
      this.isPdfDownload=isClose
    },
    handleViewResults() {
      this.$router.push({
        path: '',
        query: { ...this.$route.query, tab: 'timelog and metrics' },
      })
    },
    closeReportDowntime() {
      this.showAssetBreakdown = false
    },
    closeInvoiceConvert() {
      this.showInvoiceConvert = false
    },
    handleUpdateVisibility(data) {
      this.editFormVisibilty = data
    },
    openEditWODialog() {
      this.handleUpdateVisibility(true)
    },
    openAllSurveyDialog() {
      this.showSurveyDialog = true
    },
    loadWorkorderSummary(force = false, loadPage = true) {
      this.loading = loadPage
      //TODO: WORK_ORDER_FEATURE_SETTINGS license check
      if (this.isWorkOrderFeatureSettingsLicenseEnabled) {
        this.loadWorkorderSummaryWithWorkOrderFeatureSettingAPI(force)
      } else {
        // -- can be removed later --
        this.loadWorkorderSummaryOld(force)
        // -- can be removed later --
      }
    },
    closeDialog() {
      this.openTaskOptions = false
    },
    loadWorkorderSummaryOld(force) {
      API.fetchRecord(
        'workorder',
        {
          id: this.$route.params.id,
        },
        { force }
      )
        .then(res => {
          this.$set(this, 'woBundle', res)
          this.woBundle.id = this.woBundle.workorder.id
          this.$store.dispatch(
            'workorder/setCurrentWO',
            this.woBundle.workorder
          )
        })
        .then(() => {
          // filtering prerequisite sections
          this.woBundle.workorder.preReqSections = {}
          for (const sectionID in this.woBundle.workorder.taskSections) {
            const taskSection = this.woBundle.workorder.taskSections[sectionID]
            if (taskSection.preRequest) {
              this.woBundle.workorder.preReqSections[+sectionID] = taskSection
            }
          }
          let preReqSectionIDs = Object.keys(
            this.woBundle.workorder.preReqSections
          ).map(k => +k)
          // filtering prerequisite tasks
          this.woBundle.workorder.preReqTasks = {}
          for (const sectionID in this.woBundle.workorder.tasks) {
            if (preReqSectionIDs.includes(+sectionID)) {
              this.woBundle.workorder.preReqTasks[sectionID] =
                this.woBundle.workorder.tasks[sectionID]
            }
          }
          this.loading = false
        })
        .catch(error => {
          let { message = 'Error occured while fetching workorkder' } = error
          // this.$message.error(message)
        })
    },
    loadWorkorderSummaryWithWorkOrderFeatureSettingAPI(force) {
      API.fetchRecord(
        'workorder',
        {
          id: this.$route.params.id,
        },
        { force }
      )
        .then(res => {
          this.$set(this, 'woBundle', res)
          this.$set(this, 'record', res)
          this.woBundle.id = this.woBundle.workorder.id
          this.$store.dispatch(
            'workorder/setCurrentWO',
            this.woBundle.workorder
          )
        })
        .then(() => {
          // filtering prerequisite sections
          this.woBundle.workorder.preReqSections = {}
          for (const sectionID in this.woBundle.workorder.taskSections) {
            const taskSection = this.woBundle.workorder.taskSections[sectionID]
            if (taskSection.preRequest) {
              this.woBundle.workorder.preReqSections[+sectionID] = taskSection
            }
          }
          let preReqSectionIDs = Object.keys(
            this.woBundle.workorder.preReqSections
          ).map(k => +k)
          // filtering prerequisite tasks
          this.woBundle.workorder.preReqTasks = {}
          for (const sectionID in this.woBundle.workorder.tasks) {
            if (preReqSectionIDs.includes(+sectionID)) {
              this.woBundle.workorder.preReqTasks[sectionID] =
                this.woBundle.workorder.tasks[sectionID]
            }
          }
          this.loading = false
        })
        .then(async () => {
          if (!isEmpty(this.record)) {
            let { workorder } = this.record
            let route = 'v3/workorders/features/' + workorder.id
            return await API.get(route)
          }
        })
        .then(({ data, error }) => {
          if (!isEmpty(data)) {
            let { woBundle, workOrderSettingsRelatedData } = this
            workOrderSettingsRelatedData = {
              ...data,
            }
            woBundle = {
              ...woBundle,
              ...data,
            }
            this.$set(this, 'woBundle', woBundle)
            this.$set(
              this,
              'workOrderSettingsRelatedData',
              workOrderSettingsRelatedData
            )
          } else if (!isEmpty(error)) {
            // this.$message.error(
            //   error.message ||
            //     this.$t(
            //       common.workorder
            //         .error_occurred_while_fetching_work_order_feature_settings_message
            //     )
            // )
          }
        })
        .catch(error => {
          let { message = 'Error occured while fetching workorkder' } = error
          // this.$message.error(message)
        })
    },
    getCurrentModuleState() {
      let { woBundle } = this
      let { moduleState } = this.record || {}
      return moduleState
    },
    async refreshObj() {
      this.loadWorkorderSummary(true)
      this.surveyDetails = await loadSurveyForSurveyBar(
        true,
        this.moduleName,
        this.woId,
        this.surveyDetails
      )
    },
    loadStateflows(value) {
      this.stateflows = value
    },
    openPrintOptionDialog() {
      this.openTaskOptions = true
      this.isDownloadOption = false
    },
    openDownloadOptionDialog() {
      this.openTaskOptions = true
      this.isDownloadOption = true
    },
    canShowReportDownTime() {
      let { record, isNotPortal } = this
      let { resource } = record || {}
      let { resourceType, id } = resource || {}
      const ASSET = 2
      return isNotPortal && resourceType === ASSET && id !== -1
    },
    openReportDowntime() {
      this.openAssetBreakDown(
        this.record.resource.id,
        this.record.subject,
        this.record.id
      )
    },
    openInvoiceConvert() {
      let { record, $access } = this
      let invoiceOptionsArray = []
      if ($access.isLicenseEnabled('VENDOR') && record.vendor != null) {
        invoiceOptionsArray.push({ label: 'Vendor Invoice', value: 3 })
      }
      if ($access.isLicenseEnabled('TENANTS') && record.tenant != null) {
        invoiceOptionsArray.push({ label: 'Tenant Invoice', value: 1 })
      }
      if ($access.isLicenseEnabled('CLIENT') && record.client != null) {
        invoiceOptionsArray.push({ label: 'Client Invoice', value: 2 })
      }
      if (invoiceOptionsArray.length === 0) {
        ftoast.critical('Invoice can not be generated.')
      } else if (invoiceOptionsArray.length === 1) {
        this.createInvoice(invoiceOptionsArray[0])
      } else {
        this.invoiceOptions = invoiceOptionsArray
        this.showInvoiceConvert = true
      }
    },
    async createInvoice(option) {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { record } = this
      let invoiceType = option.value
      let query = { workorder: record.id, invoiceType }
      let { href } =
        router.resolve({
          name,
          query,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    // async refreshWoDetails() {
    //   this.loadWorkorderSummary()
    //   this.surveyDetails = await loadSurveyForSurveyBar(
    //     false,
    //     this.moduleName,
    //     this.woId,
    //     this.surveyDetails
    //   )
    // },
    // onTransitionSuccess() {
    //   this.woBundle.workorder.loadTimer = false
    //   this.refreshWoDetails()
    //   this.reloadRelatedRecords()
    //   this.loadTasks()
    // },
    // reloadRelatedRecords() {
    //   eventBus.$emit('refresh-related-list')
    // },
    // transitionFilter(transition) {
    //   let stateObj = this.$store.getters.getTicketStatus(
    //     transition.toStateId,
    //     'workorder'
    //   )
    //   let isDisallowedState =
    //     stateObj.type === 'CLOSED' && !hasWorkOrderClosePermission
    //   return !isDisallowedState
    // },
    // handleTranslate() {
    //   this.woDescriptiontranslate = !this.woDescriptiontranslate
    //   eventBus.$emit('woDescriptiontranslate', this.woDescriptiontranslate)
    //   this.isActive = !this.isActive
    // },
    // setCurrentState(id) {
    //   this.$setProperty(this, 'woBundle.workorder.moduleState.id', id)
    // },
    // debounceLoadWorkOrderSummary: debounce(function() {
    //   this.loadWorkorderSummary(true, false)
    // }, 1000),
  },
}
</script>
