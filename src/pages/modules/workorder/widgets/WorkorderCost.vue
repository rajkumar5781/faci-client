<template>
  <FContainer>
    <FContainer>
      <FContainer padding="containerLarge containerXLarge" gap="containerLarge">
        <!-- temporarily commented the code  -->
        <!-- <FContainer v-if="!showMaintenanceCost">
          <FContainer padding="containerMedium containerNone">
            <FText appearance="headingMed14" textAlign="center" color="textMain"
              >Maintenance cost</FText
            >
          </FContainer>
          <FContainer padding="containerMedium containerNone">
            <FText line-height="18.2px" appearance="bodyReg14" color="textMain">
              ${{
                isEmpty(this.details.totalCost) ? 0 : this.details.totalCost
              }}
            </FText>
          </FContainer>
        </FContainer> -->
        <WOMaintenanceCostCard
        
          :workorder="workorder"
          :plannedMaintenance="plannedMaintenance"
          :actualMaintenance="actualMaintenance"
          :isLoading="isLoading"
          @updateActualGrossTotal="updateActualGrossTotal"
        />
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FButton,
  FTags,
  FDivider,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import module from '../../../../store/module'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes, getApp } from '@facilio/router'
import WOMaintenanceCostCard from './NewWOMaintenanceCostCard.vue'
import getProperty from 'dlv'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'

const moduleStore = module()

export default {
  name: 'Quotation',
  components: {
    WOMaintenanceCostCard,
    FContainer,
    FText,
    FTags,
    FButton,
    FDivider,
  },
  props: ['moduleName', 'details'],
  data() {
    return {
      isEmpty,
      quotationList: {},
      downloadUrl: null,
      isLoading: false,
      summaryLoading: true,
      dialogVisible: false,
      quotationSummaryDetails: {},
      plannedMaintenance: {
        plannedToolsCost: null,
        plannedItemsCost: null,
        plannedServicesCost: null,
        plannedLabourCost: null,
        grossAmount: null,
      },
      actualMaintenance: {
        itemCost: null,
        toolCost: null,
        serviceCost: null,
        grossAmount: null,
      },
    }
  },
  created() {
    this.workorder = this.details
    this.init()
    moduleStore.loadTicketStatus('quote')
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Quotation'
    },
    workorder() {
      return this.details
    },
    showMaintenanceCost() {
      let { $access } = this
      let { isLicenseEnabled } = $access || {}

      return (
        isLicenseEnabled('PLANNED_INVENTORY') && isLicenseEnabled('INVENTORY')
      )
    },
    showQuote() {
      let { $access } = this
      let { isLicenseEnabled } = $access || {}

      return isLicenseEnabled('QUOTATION')
    },
    quoteTitle() {
      let { quotationList } = this
      return (quotationList || []).length > 1
        ? this.$t('maintenance.wr_list.quotes')
        : this.$t('maintenance.wr_list.quote')
    },
  },
  methods: {
    async init() {
      this.isLoading = true
      let { showMaintenanceCost, showQuote } = this
      if (showQuote) {
        await this.loadWorkorderQuotations()
      }
        await this.loadPlansCost()
        await this.loadActualsCost()

      this.isLoading = false
    },
    pdfUrl(record) {
      let appName = getApp().linkName
      return `${window.location.protocol}//${window.location.host}/${appName}/pdf/quotationpdf?quotationId=${record.id}`
    },
    isApprovalEnabled(record) {
      let { approvalFlowId, approvalStatus } = record || {}
      return !isEmpty(approvalFlowId) && !isEmpty(approvalStatus)
    },

    getTicketStatusDetails(record) {
      return (
        moduleStore.getTicketStatus(
          getProperty(record, 'moduleState.id', -1),
          'quote'
        ) || {}
      )
    },
    async loadWorkorderQuotations(force = false) {
      let { workorder } = this
      let { id } = workorder || {}
      let relatedFieldName = getRelatedFieldName('workorder', 'quote')
      let relatedConfig = {
        moduleName: 'workorder',
        id,
        relatedModuleName: 'quote',
        relatedFieldName,
      }
      let { error, list } = await API.fetchAllRelatedList(
        relatedConfig,
        {},
        {
          force,
        }
      )

      if (!error) {
        if (!isEmpty(list)) {
          this.quotationList = list
        }
      } else {
        ftoast.critical(error.message || 'Error Occured')
      }
    },
    redirectToQuotationForm() {
      let url = `/app/tm/quotation/new`
      let query = {
        workorder: this.workorder.id,
        workorderLabel: this.workorder.subject,
      }
      if (!isEmpty(getProperty(this.workorder, 'tenant.id', -1))) {
        query['customerType'] = 1
        query['tenant'] = this.workorder.tenant.id
        query['tenantLabel'] = this.workorder.tenant.name
      }

      if (!isEmpty(getProperty(this.workorder, 'client.id', -1))) {
        query['customerType'] = 2
        query['client'] = this.workorder.client.id
        query['clientLabel'] = this.workorder.client.name
      }
      if (!isEmpty(this.workorder.siteId)) {
        query['siteId'] = this.workorder.siteId
      }
      if (this.$account.org.id === 320) {
        if (
          !isEmpty(this.workorder.data) &&
          !isEmpty(this.workorder.data.unit)
        ) {
          query['unit'] = this.workorder.data.unit.id
          query['unitLabel'] = this.workorder.data.unit.name
        }
        if (
          !isEmpty(this.workorder.resource) &&
          !isEmpty(this.workorder.resource.building)
        ) {
          query['building'] = this.workorder.resource.building.id
          query['buildingLabel'] = this.workorder.resource.name
        }
      } else {
        query['subject'] = this.workorder.subject
        query['description'] = this.workorder.description
      }

      let { name } = findRouteForModule('quote', pageTypes.CREATE) || {}

      name &&
        this.$router.push({
          name,
          query,
        })
    },
    async openQuotationPreview(record) {
      this.dialogVisible = true
      this.summaryLoading = true
      let { quote, error } = await API.fetchRecord('quote', {
        id: (record || {}).id,
      })
      if (!isEmpty(error)) {
        let { message = 'Error Occured while fetching Quote' } = error
       ftoast.critical(message)
      } else {
        this.quotationSummaryDetails = quote
      }
      this.summaryLoading = false
    },
    downloadQuotation(record) {
      this.downloadUrl = null
      this.$message({
        message: 'Downloading...',
        showClose: true,
        duration: 0,
      })
      API.post(`/v2/integ/pdf/create`, {
        url: this.pdfUrl(record),
      }).then(({ data, error }) => {
        this.$message.closeAll()
        if (error) {
          let { message = 'Unable to fetch quote download link' } = error
         ftoast.critical(message)
        } else {
          let { fileUrl } = data || {}
          this.downloadUrl = fileUrl || null
        }
      })
    },
    async openQuotationSummary({ id }) {
      let routerPath = ''

      let viewname = await this.fetchView('quote')
      let { name } = findRouteForModule('quote', pageTypes.OVERVIEW) || {}

      if (name) {
        let { href } =
          this.$router.resolve({ name, params: { viewname, id } }) || {}
        routerPath = href
      }
      window.open(routerPath, '_blank')
    },
    async loadPlansCost() {
      let { workorder } = this
      let { id } = workorder || {}
      let url = '/v3/workOrderPlansCost/cost'
      let params = {
        workOrderId: id,
      }
      let { data, error } = await API.get(url, params)

      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'))
      } else {
        let {
          plannedToolsCost,
          plannedItemsCost,
          plannedServicesCost,
          plannedLabourCost,
        } = data || {}
        let grossAmount =
          plannedItemsCost +
          plannedToolsCost +
          plannedServicesCost +
          plannedLabourCost

        this.plannedMaintenance = {
          Labour: plannedLabourCost,
          Items: plannedItemsCost,
          Tools: plannedToolsCost,
          Services: plannedServicesCost,
          grossAmount,
        }
      }
    },
    async loadActualsCost(force) {
      let { workorder } = this
      let { id } = workorder || {}
      let relatedFieldName = getRelatedFieldName('workorder', 'workorderCost')
      let relatedConfig = {
        moduleName: 'workorder',
        id,
        relatedModuleName: 'workorderCost',
        relatedFieldName,
      }
      let { error, list } = await API.fetchAllRelatedList(
        relatedConfig,
        {},
        {
          force,
        }
      )
      if (!isEmpty(error)) {
        ftoast.critical(
          error.message || this.$t('error_occurred')
        )
      } else {
        let customCostList = list.filter(
          element => element.costTypeEnum === 'custom'
        )
        let laboursCostObj = list.find(element => element.costName === 'Labour')
        let itemsCostObj = list.find(element => element.costName === 'Items')
        let toolsCostObj = list.find(element => element.costName === 'Tools')
        let servicesCostObj = list.find(
          element => element.costName === 'Service'
        )
        let labourCost = getProperty(laboursCostObj, 'cost', 0)
        let itemCost = getProperty(itemsCostObj, 'cost', 0)
        let toolCost = getProperty(toolsCostObj, 'cost', 0)
        let serviceCost = getProperty(servicesCostObj, 'cost', 0)

        let actualMaintenance = {
          Labour: labourCost,
          Items: itemCost,
          Tools: toolCost,
          Services: serviceCost,
          customCostList,
        }
        this.updateActualGrossTotal(actualMaintenance)
      }
    },
    updateActualGrossTotal(actualObj) {
      let { customCostList, Labour, Items, Tools, Services } = actualObj || {}
      let grossAmount = Labour + Items + Tools + Services
      let totalCostOfCustomCost = 0

      if (!isEmpty(customCostList)) {
        customCostList.forEach(element => {
          let { cost } = element || {}
          totalCostOfCustomCost += Number(cost)
        })
        grossAmount += totalCostOfCustomCost
      }
      actualObj = { ...actualObj, grossAmount }
      this.actualMaintenance = actualObj
    },
    getTicketStatusColor(record) {
      let statusObj = this.getTicketStatusDetails(record) || {}
      let { status } = statusObj || {}

      return status === 'Sent'
        ? 'fc-tag-status-bg-green'
        : 'fc-tag-status-bg-grey'
    },
  },
}
</script>
