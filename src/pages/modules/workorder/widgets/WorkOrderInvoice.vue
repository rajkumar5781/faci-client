<template>
  <FContainer height="100%" width="100%">
    <FContainer
      v-if="isLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      ><FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(invoiceList)"
      display="flex"
      justifyContent="center"
      height="100%"
      borderRadius="high"
      border="1px solid"
      borderColor="backgroundMidgroundDark"
    >
      <FEmptyState
        title="No Invoices Generated"
        description="Invoices are not yet generated for this Work Order yet."
        vertical
        size="S"
        illustration="no-result"
      >
        <template #buttons>
          <FButton
            v-if="allowInvoiceCreation && !isEmpty(invoiceList)"
            appearance="secondary"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            size="small"
            @click="openInvoiceConvert"
          >
            Generate Invoice
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else-if="displayType === '1'"
      padding="containerXLarge containerNone"
      display="flex"
      flexWrap="wrap"
    >
      <FContainer
        v-for="invoice in invoiceList"
        :key="invoice.id"
        border="1px solid"
        borderColor="backgroundMidgroundDark"
        margin="containerLarge"
        width="25%"
        height="270px"
        borderRadius="high"
        overflow="hidden"
        cursor="pointer"
        boxSizing="border-box"
        flex="0 0 calc(25% - 16px)"
        hover-boxShadow="lightMed"
        @click="redirectToInvoice(invoice)"
      >
        <FContainer
          width="100%"
          height="50%"
          backgroundColor="backgroundMidgroundMedium"
        >
          <FContainer position="relative" top="12px" left="12px">
            <FTags
              appearance="status"
              :text="tagProps(invoice)?.text"
              :disabled="false"
              :statusType="tagProps(invoice)?.statusType"
            />
          </FContainer>
          <FContainer display="flex" justifyContent="center">
            <fc-illustration name="invoice" size="M"></fc-illustration>
          </FContainer>
          <FContainer
            position="relative"
            bottom="25px"
            left="12px"
            width="40px"
            height="40px"
            borderRadius="high"
            backgroundColor="backgroundContainer"
            boxShadow="lightLow02"
          >
            <FAvatar
              size="L"
              shape="square"
              userStatus="nil"
              :userName="getContactFromMeta(invoice)"
            />
          </FContainer>
        </FContainer>
        <FContainer
          width="100%"
          height="50%"
          padding="containerLarge containerXLarge"
          display="flex"
          flexDirection="column"
          marginTop="containerXxLarge"
        >
          <FContainer>
            <FText
              appearance="captionReg12"
              color="backgroundNeutralGrey01Dark"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              display="block"
              >{{ `#` + invoice.localId }}</FText
            ></FContainer
          >
          <FContainer marginTop="containerMedium" display="flex">
            <FTooltip placement="top">
              <template slot="title"> {{ invoice.subject }} </template>
              <FText
                appearance="headingMed14"
                color="textMain"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                display="block"
                >{{ invoice.subject }}</FText
              >
            </FTooltip></FContainer
          >
          <FContainer v-if="invoice.description" marginTop="containerMedium">
            <FText
              color="backgroundNeutralGrey01Dark"
              appearance="captionReg12"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              display="block"
              >{{ invoice.description }}</FText
            ></FContainer
          >
          <FContainer marginTop="containerMedium">
            <FText
              color="backgroundNeutralGrey01Dark"
              appearance="captionReg12"
              >{{ currency + invoice.totalCost }}</FText
            ></FContainer
          >
          <FContainer
            display="flex"
            alignItems="center"
            gap="containerMedium"
            marginTop="containerMedium"
          >
            <FContainer
              v-if="invoice.billDate"
              display="flex"
              align-item="center"
              gap="containerMedium"
            >
              <FTooltip placement="bottom">
                <template slot="title"> Bill Date </template>

                <FIcon
                  group="time-date"
                  name="date"
                  :pressable="false"
                  size="14"
                  color="backgroundNeutralGrey01Dark"
                />
              </FTooltip>

              <FText
                color="backgroundNeutralGrey01Dark"
                appearance="captionReg12"
                >{{ formatDate(invoice.billDate, true) }}</FText
              >
              <FDivider height="16px" width="0px" />
            </FContainer>
            <FTags
              appearance="simple"
              :text="getInvoiceType(invoice)"
              :disabled="false"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer
      v-else-if="displayType === '2'"
      padding="containerXxLarge containerXxLarge"
      borderRadius="high"
      border="1px solid"
      borderColor="backgroundMidgroundDark"
    >
      <FContainer
        borderRadius="high"
        border="1px solid"
        borderColor="backgroundMidgroundDark"
        overflow="hidden"
      >
        <CommonList
          :viewDetail="viewDetail"
          :records="invoiceList"
          :moduleName="activeTab"
          selectType=""
          :idSlotValue="idSlotValue"
          :hideBorder="true"
          :mainFieldAction="mainFieldAction"
        >
        </CommonList>
      </FContainer>
    </FContainer>
    <InvoiceTypeDialogue
      :details="workorder"
      :visibility="showConvertType"
      :options="invoiceOptions"
      @closeConvertType="closeConvertType"
      :moduleName="moduleName"
    ></InvoiceTypeDialogue>
    <portal to="financial-create-buttons">
      <FContainer
        display="flex"
        gap="containerLarge"
        alignItems="center"
        v-if="allowInvoiceCreation && !isEmpty(invoiceList)"
      >
        <FButton
          appearance="secondary"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          size="medium"
          @click="openInvoiceConvert"
        >
          Generate Invoice
        </FButton>
        <FDivider height="24px" width="2px" />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTabs,
  FTabPane,
  FEmptyState,
  FButton,
  ftoast,
  FIcon,
  FText,
  FDivider,
  FAvatar,
  FTags,
  FTooltip,
  FSpinner,
} from '@facilio/design-system'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import router from '../../../../router'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'
import { CommonList } from '@facilio/ui/new-app'
import { API } from '@facilio/api'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import InvoiceTypeDialogue from '../widgets/InvoiceTypeDialogue.vue'

const INVOICE_STATUS_TAG = {
  DRAFT: 'default',
  DELIVERED: 'warning',
  REJECTED: 'danger',
  APPROVED: 'information',
  CANCELLED: 'danger',
  PAYMENT_ACKNOWLEDGED: 'success',
  REVISED: 'neutral',
}
const invoiceTypeLookup = {
  VENDOR: 'Vendor',
  TENANT: 'Tenant',
  CLIENT: 'Client',
}

export default {
  props: [
    'workorder',
    'config',
    'displayType',
    'systemButtonsList',
    'allowInvoiceCreation',
  ],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    FEmptyState,
    FButton,
    FIcon,
    FText,
    FDivider,
    FAvatar,
    FTags,
    FTooltip,
    CommonList,
    FSpinner,
    InvoiceTypeDialogue,
  },
  data() {
    return {
      isEmpty,
      invoiceList: [],
      meta: null,
      moduleName: 'invoice',
      viewDetail: {},
      activeTab: 'invoice',
      metaInfo: {},
      isLoading: false,
      idSlotValue: 'localId',
      showConvertType: false,
      invoiceOptions: [],
    }
  },
  async created() {
    await this.loadMetaInfo()
    this.loadWorkorderInvoices()
    this.loadViewDetails()
  },
  computed: {
    viewname() {
      return this.config?.viewname || 'hidden-all'
    },
    mainFieldAction() {
      return this.mainFieldRedirection
    },
    currency() {
      let { $account = {} } = this
      let { data = {} } = $account
      let { currencyInfo = {} } = data
      let { displaySymbol = '$' } = currencyInfo
      return displaySymbol
    },
    invoiceStatusField() {
      let { fields = [] } = this.metaInfo || {}
      let statusFieldObj = fields.find(field => field.name === 'invoiceStatus')
      return statusFieldObj
    },
    invoiceStatusEnumList() {
      return this.invoiceStatusField?.enumMap || {}
    },
    isStateFlowEnabled() {
      let { module } = this.metaInfo || {}
      let { stateFlowEnabled } = module
      return stateFlowEnabled
    },
  },
  methods: {
    formatDate,
    async loadMetaInfo() {
      this.isLoading = true
      if (this.config?.canHideColumnConfig) return

      let { moduleName } = this
      let { data, error } = await API.get('/module/meta', { moduleName })

      if (!error) {
        this.metaInfo = data?.meta || {}
      }
      this.isLoading = false
    },
    createInvoice() {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { href } =
        router.resolve({
          name,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    async loadWorkorderInvoices(force = false) {
      this.isLoading = true
      let { workorder } = this
      let { id } = workorder || {}
      let relatedFieldName = 'workorder'
      let relatedConfig = {
        moduleName: 'workorder',
        id,
        relatedModuleName: 'invoice',
        relatedFieldName,
      }
      let { error, list, meta } = await API.fetchAllRelatedList(
        relatedConfig,
        {},
        {
          force,
        }
      )
      if (!isEmpty(list) && !error) {
        this.invoiceList = list
        this.meta = meta
      } else if(error){
        ftoast.critical(error.message || 'Error Occured')
      }
      this.isLoading = false
    },
    async loadViewDetails() {
      let { wizardModuleName: moduleName, viewname } = this
      let { getViewDetails } = this.config || {}
      let response = {}

      this.viewLoading = true
      try {
        if (isFunction(getViewDetails)) {
          response = await getViewDetails()
        } else {
          response = await API.get(`v2/views/invoice/all`, {
            moduleName,
          })
        }
        let { error, data } = response || {}

        if (error) {
          throw error
        } else {
          this.viewDetail = data?.viewDetail || {}
        }
      } catch (errorMsg) {
        ftoast.critical('Cannot fetch view details')
      }
      this.viewLoading = false
    },
    redirectToInvoice(invoice, e) {
      let { id } = invoice
      let routerPath = null
      let { name } = findRouteForModule('invoice', pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({ name, params: { id } })
      }
      !!routerPath && window.open(routerPath?.href, '_blank')
      e.preventDefault()
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, viewname, moduleName } = this
      let { id = null } = record || {}

      let route = this.$router.resolve({
        name: routeName,
        params: { viewname, id, moduleName },
      }).href

      return {
        url: route,
        text: value,
        id,
        clickAction: (field, e) => this.redirectToInvoice(record, e),
        ...value,
      }
    },

    tagProps(record = {}) {
      if (this.isStateFlowEnabled) {
        return {
          text: getStatusFromMeta(record.moduleState),
          appearance: 'status',
          statusType: 'default',
        }
      }
      return {
        text: this.invoiceStatusEnumList[record.invoiceStatus],
        appearance: 'status',
        statusType: INVOICE_STATUS_TAG[record.invoiceStatusEnum],
      }
    },
    getStatusFromMeta(recordState) {
      let { meta } = this
      let moduleState = getProperty(
        meta,
        'supplements.invoice.moduleState',
        null
      )
      let statusName = moduleState[recordState?.id]?.displayName || 'No Status'
      return statusName
    },
    getInvoiceType(invoice) {
      let { invoiceTypeEnum = null } = invoice
      return invoiceTypeLookup[invoiceTypeEnum] || 'Unknown'
    },
    getContactFromMeta(invoice) {
      if (!isEmpty(invoice)) {
        let { meta } = this
        let contactName
        if (invoice.invoiceTypeEnum === 'TENANT') {
          let tenant = getProperty(meta, 'supplements.invoice.tenant', null)
          let { id = -1 } = invoice?.tenant || {}
          contactName = tenant[id]?.name || null
        }
        if (invoice.invoiceTypeEnum === 'VENDOR') {
          let { id = -1 } = invoice?.vendor || {}
          let vendor = getProperty(meta, 'supplements.invoice.vendor', null)
          contactName = vendor[id]?.name || null
        }
        if (invoice.invoiceTypeEnum === 'CLIENT') {
          let { id = -1 } = invoice?.client || {}
          let client = getProperty(meta, 'supplements.invoice.client', null)
          contactName = client[id]?.name || null
        }
        return contactName
      }
      return null
    },
    closeConvertType() {
      this.showConvertType = false
    },
    openInvoiceConvert() {
      let { workorder, $access } = this
      let invoiceOptionsArray = []
      if (workorder.vendor != null) {
        invoiceOptionsArray.push({ label: 'Vendor Invoice', value: 3 })
      }
      if (workorder.tenant != null) {
        invoiceOptionsArray.push({ label: 'Tenant Invoice', value: 1 })
      }
      if (workorder.client != null) {
        invoiceOptionsArray.push({ label: 'Client Invoice', value: 2 })
      }
      if (invoiceOptionsArray.length === 0) {
        if ($access.isLicenseEnabled('VENDOR')) {
          invoiceOptionsArray.push({ label: 'Vendor Invoice', value: 3 })
        }
        if ($access.isLicenseEnabled('TENANTS')) {
          invoiceOptionsArray.push({ label: 'Tenant Invoice', value: 1 })
        }
        if ($access.isLicenseEnabled('CLIENT')) {
          invoiceOptionsArray.push({ label: 'Client Invoice', value: 2 })
        }
      }
      if (invoiceOptionsArray.length === 1) {
        this.createInvoice(invoiceOptionsArray[0])
      } else {
        this.invoiceOptions = invoiceOptionsArray
        this.showConvertType = true
      }
    },
    async createInvoice(option) {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { workorder } = this
      let conversionType = option.value
      let query = { workorder: workorder.id, conversionType }
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
