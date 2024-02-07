<template>
  <FContainer height="100%">
    <FContainer
      v-if="isLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      ><FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(quotationList)"
      display="flex"
      justifyContent="center"
      height="100%"
      borderRadius="high"
      border="1px solid"
      borderColor="backgroundMidgroundDark"
    >
      <FEmptyState
        title="No Quotes Generated"
        description="Quotes are not yet generated for this Work Order yet."
        vertical
        size="S"
        illustration="no-result"
      >
        <template #buttons>
          <FButton
            v-if="allowQuoteCreation"
            appearance="secondary"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            size="small"
            @click="openQuoteConvert"
          >
            Generate Quote
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
        v-for="quote in quotationList"
        :key="quote.id"
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
        @click="redirectToQuote(quote)"
      >
        <FContainer
          width="100%"
          height="50%"
          backgroundColor="backgroundMidgroundMedium"
        >
          <FContainer position="relative" top="12px" left="12px">
            <FTags
              appearance="status"
              :text="getStatusFromMeta(quote.moduleState)"
              :disabled="false"
              statusType="information"
            />
          </FContainer>
          <FContainer
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <fc-illustration name="quote" size="M"></fc-illustration>
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
              :userName="getContactFromMeta(quote)"
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
              >{{ `#` + quote.localId }}</FText
            ></FContainer
          >
          <FContainer marginTop="containerMedium" display="flex">
            <FTooltip placement="top">
              <template slot="title"> {{ quote.subject }} </template>
              <FText
                appearance="headingMed14"
                color="textMain"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                display="block"
                >{{ quote.subject }}</FText
              >
            </FTooltip></FContainer
          >
          <FContainer v-if="quote.description" marginTop="containerMedium">
            <FText
              color="backgroundNeutralGrey01Dark"
              appearance="captionReg12"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              display="block"
              >{{ quote.description }}</FText
            ></FContainer
          >
          <FContainer marginTop="containerMedium">
            <FText
              color="backgroundNeutralGrey01Dark"
              appearance="captionReg12"
              >{{ currency + quote.totalCost }}</FText
            ></FContainer
          >
          <FContainer
            display="flex"
            alignItems="center"
            gap="containerMedium"
            marginTop="containerMedium"
          >
            <FContainer
              v-if="quote.billDate"
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
                >{{ formatDate(quote.billDate, true) }}</FText
              >
              <FDivider height="16px" width="0px" />
            </FContainer>
            <FTags
              appearance="simple"
              :text="getQuoteType(quote)"
              :disabled="false"
          /></FContainer>
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
          :records="quotationList"
          :moduleName="activeTab"
          selectType=""
          :idSlotValue="idSlotValue"
          :hideBorder="true"
          :mainFieldAction="mainFieldAction"
        >
        </CommonList>
      </FContainer>
    </FContainer>
    <QuoteTypeDialogue
      :details="workorder"
      :visibility="showConvertType"
      :options="quoteOptions"
      @closeConvertType="closeConvertType"
      :moduleName="moduleName"
    ></QuoteTypeDialogue>
    <portal to="financial-create-buttons">
      <FContainer
        display="flex"
        gap="containerLarge"
        alignItems="center"
        v-if="allowQuoteCreation && !isEmpty(quotationList)"
      >
        <FButton
          appearance="secondary"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          size="medium"
          @click="openQuoteConvert"
        >
          Generate Quote
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
import { findRouteForModule, pageTypes } from '@facilio/router'
import router from '../../../../router'
import { API } from '@facilio/api'

import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'
import { CommonList } from '@facilio/ui/new-app'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import QuoteTypeDialogue from '../widgets/InvoiceTypeDialogue.vue'

const quoteTypeLookup = {
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
    'allowQuoteCreation',
  ],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    FEmptyState,
    FButton,
    CommonList,
    FIcon,
    FText,
    FDivider,
    FAvatar,
    FTags,
    FTooltip,
    FSpinner,
    QuoteTypeDialogue,
  },

  data() {
    return {
      isEmpty,
      activeTab: 'quote',
      quotationList: [],
      quotePDF: [],
      meta: null,
      moduleName: 'quote',
      viewDetail: {},
      idSlotValue: 'localId',
      isLoading: false,
      showConvertType: false,
      quoteOptions: [],
    }
  },
  created() {
    this.loadWorkorderQuotations()
    this.loadViewDetails()
  },
  async mounted() {
    // Load PDF preview data for each quote
    await Promise.all(
      this.quotationList.map(quotationList =>
        this.loadAndSetPdfData(quotationList.id)
      )
    )
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
  },
  methods: {
    formatDate,
    createQuote() {
      let { name } = findRouteForModule('quote', pageTypes.CREATE) || {}
      let { href } =
        router.resolve({
          name,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    async loadWorkorderQuotations(force = false) {
      this.isLoading = true
      let { workorder } = this
      let { id } = workorder || {}
      let relatedFieldName = getRelatedFieldName('workorder', 'quote')
      let relatedConfig = {
        moduleName: 'workorder',
        id,
        relatedModuleName: 'quote',
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
        this.quotationList = list
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
          response = await API.get(`v2/views/quote/all`, {
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
    redirectToQuote(quote, e) {
      let { id } = quote
      let routerPath = null
      let { name } = findRouteForModule('quote', pageTypes.OVERVIEW) || {}
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
        clickAction: (field, e) => this.redirectToQuote(record, e),
        ...value,
      }
    },
    getStatusFromMeta(recordState) {
      let { meta } = this
      let moduleState = getProperty(meta, 'supplements.quote.moduleState', null)
      let statusName = moduleState[recordState?.id]?.displayName || 'No Status'
      return statusName
    },
    getContactFromMeta(quote) {
      if (!isEmpty(quote)) {
        let { meta } = this
        let contactName
        if (quote.customerTypeEnum === 'TENANT') {
          let tenant = getProperty(meta, 'supplements.quote.tenant', null)
          let { id = -1 } = quote?.tenant || {}
          contactName = tenant[id]?.name || null
        }
        if (quote.customerTypeEnum === 'VENDOR') {
          let { id = -1 } = quote?.vendor || {}
          let vendor = getProperty(meta, 'supplements.quote.vendor', null)
          contactName = vendor[id]?.name || null
        }
        if (quote.customerTypeEnum === 'CLIENT') {
          let { id = -1 } = quote?.client || {}
          let client = getProperty(meta, 'supplements.quote.client', null)
          contactName = client[id]?.name || null
        }
        return contactName
      }
      return null
    },
    closeConvertType() {
      this.showConvertType = false
    },
    getQuoteType(quote) {
      let { customerTypeEnum = null } = quote
      return quoteTypeLookup[customerTypeEnum] || 'Other'
    },
    openQuoteConvert() {
      let { workorder, $access } = this
      let quoteOptionsArray = []
      if (workorder.vendor != null) {
        quoteOptionsArray.push({ label: 'Vendor Quote', value: 3 })
      }
      if (workorder.tenant != null) {
        quoteOptionsArray.push({ label: 'Tenant Quote', value: 1 })
      }
      if (workorder.client != null) {
        quoteOptionsArray.push({ label: 'Client Quote', value: 2 })
      }
      if (quoteOptionsArray.length === 0) {
        if ($access.isLicenseEnabled('VENDOR')) {
          quoteOptionsArray.push({ label: 'Vendor Quote', value: 3 })
        }
        if ($access.isLicenseEnabled('TENANTS')) {
          quoteOptionsArray.push({ label: 'Tenant Quote', value: 1 })
        }
        if ($access.isLicenseEnabled('CLIENT')) {
          quoteOptionsArray.push({ label: 'Client Quote', value: 2 })
        }
      }
      if (quoteOptionsArray.length === 1) {
        this.createQuote(quoteOptionsArray[0])
      } else {
        this.quoteOptions = quoteOptionsArray
        this.showConvertType = true
      }
    },
    async createQuote(option) {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}
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
