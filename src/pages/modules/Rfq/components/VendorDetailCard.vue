<template>
  <FContainer
    borderBottom="1px solid #eae9e9ff"
    paddingBottom="containerXxLarge"
  >
    <FContainer paddingBottom="containerXxLarge" display="flex">
      <FContainer
        display="flex"
        padding="containerXxLarge containerLarge containerNone"
      >
        <FText paddingRight="containerXxLarge" appearance="headingMed16">{{
          getProperty(vendor, 'vendorName', '---')
        }}</FText>
        <FTags
          v-if="vendor.status"
          appearance="status"
          :text="vendor.status"
          :disabled="false"
          :statusType="getStatusType"
        />
      </FContainer>
    </FContainer>
    <FContainer display="flex" width="100%">
      <FContainer
        padding="containerNone containerLarge"
        display="flex"
        flexDirection="column"
        width="20%"
      >
        <FText paddingBottom="containerMedium" appearance="captionMed12">{{
          $t('rfq.primary_contact_name', { ns: 'procurement' })
        }}</FText>
        <FText appearance="bodyReg14" color="textDescription">{{
          getProperty(vendor, 'primaryContactName', '---')
        }}</FText>
      </FContainer>
      <FContainer
        display="flex"
        flexDirection="column"
        width="20%"
        paddingRight="containerLarge"
      >
        <FText paddingBottom="containerMedium" appearance="captionMed12">{{
          $t('rfq.email_id', { ns: 'procurement' })
        }}</FText>
        <FText appearance="bodyReg14" color="textDescription">{{
          getProperty(vendor, 'emailId', '---')
        }}</FText>
      </FContainer>
      <FContainer
        display="flex"
        flexDirection="column"
        width="20%"
        paddingRight="containerLarge"
      >
        <FText paddingBottom="containerMedium" appearance="captionMed12">{{
          $t('rfq.contact_number', { ns: 'procurement' })
        }}</FText>
        <FText appearance="bodyReg14" color="textDescription">
          {{ getProperty(vendor, 'contactNumber', '---') }}</FText
        >
      </FContainer>
      <FContainer display="flex" justify-content="flex-end" width="40%">
        <FContainer display="flex" align-items="center">
          <FContainer @click="openViewQuote">
            <FIcon group="navigation" name="diagonal-expand" size="16" />
          </FContainer>
          <FContainer padding="containerNone containerXLarge">
            <FDivider height="24px" />
          </FContainer>
          <FContainer>
            <FButton
              appearance="link"
              size="medium"
              iconGroup="navigation"
              iconName="open-window"
              iconPosition="prefix"
              @click="redirectToVendorQuote(vendor)"
            >
              {{ $t('rfq.view_quote', { ns: 'procurement' }) }}
            </FButton>
          </FContainer>
          <FContainer v-if="isAwarded" padding="containerNone containerXLarge">
            <FDivider height="24px" />
          </FContainer>
          <FContainer v-if="isAwarded">
            <FButton
              v-if="canCreatePo"
              appearance="secondary"
              size="medium"
              @click="createPo(vendor.id)"
            >
              {{ $t('rfq.create_po', { ns: 'procurement' }) }}
            </FButton>
            <FButton
              v-if="canShowPo"
              appearance="secondary"
              size="medium"
              @click="redirectToPO(vendor)"
            >
              {{ $t('rfq.show_po', { ns: 'procurement' }) }}
            </FButton>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTags,
  FIcon,
  FDivider,
  FButton,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import getProperty from 'dlv'
const STATUS_ENUM_MAP = {
  'Awarded':'success',
  'Not awarded':'danger',
  'Ready to Award':'warning',
  'Under negotiation': 'warning',
}
export default {
  name: 'vendorDetailCard',
  props: ['vendorData', 'details', 'isAwarded'],
  components: {
    FContainer,
    FText,
    FTags,
    FIcon,
    FDivider,
    FButton,
  },
  computed: {
    canCreatePo() {
      let { details = {}, vendor = {} } = this
      let { isAwarded } = details
      let { purchaseOrder } = vendor
      return isEmpty(purchaseOrder) && isAwarded
    },
    getStatusType(){
      let status = getProperty(this , 'vendor.status','')
      return getProperty(STATUS_ENUM_MAP,status,'information')
    },
    canShowPo() {
      let { vendor = {} } = this
      let { purchaseOrder } = vendor
      return !isEmpty(purchaseOrder)
    },
    vendor() {
      let { vendorData } = this
      return {
        ...vendorData,
        primaryContactName: getProperty(
          vendorData,
          'vendor.primaryContactName',
          '---'
        ),
        emailId: getProperty(vendorData, 'vendor.primaryContactEmail', '---'),
        contactNumber: getProperty(
          vendorData,
          'vendor.primaryContactPhone',
          '---'
        ),
        vendorName: getProperty(vendorData, 'vendor.name', '---'),
        status: getProperty(vendorData, 'moduleState.displayName', null),
      }
    },
  },
  methods: {
    getProperty,
    createPo(vendorQuote) {
      let { name } = findRouteForModule('purchaseorder', pageTypes.CREATE)
      let requestForQuotation = getProperty(this, 'details.id', null)
      if (name) {
        this.$router.push({
          name,
          query: {
            convertToPo: true,
            vendorQuote: vendorQuote,
            requestForQuotation,
          },
        })
      }
    },
    openViewQuote() {
      let { vendor = {} } = this
      let { vendorQuotesLineItems } = vendor
      this.$emit('openViewQuote', vendorQuotesLineItems)
    },
    redirectToVendorQuote(vendor = {}) {
      let { id } = vendor
      let route
      let { name } =
        findRouteForModule('vendorQuotes', pageTypes.OVERVIEW) || {}

      if (name) {
        route = this.$router.resolve({
          name,
          params: { viewname: 'all', id },
        }).href
      }
      route && window.open(route, '_blank')
    },
    redirectToPO(vendorQuote) {
      let { purchaseOrder } = vendorQuote || {}
      let { id } = purchaseOrder || {}
      let route
      let { name } =
        findRouteForModule('purchaseorder', pageTypes.OVERVIEW) || {}

      if (name) {
        route = this.$router.resolve({
          name,
          params: { viewname: 'all', id },
        }).href
      }
      route && window.open(route, '_blank')
    },
  },
}
</script>
