<template>
  <FContainer v-if="!loading">
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center">
        <FContainer paddingRight="containerMedium" v-if="!isEmpty(vendorQuotes)">
          <FButton appearance='secondary'  size="small" @click="addVendors">{{$t('rfq.add_vendor', { ns: 'procurement' })}}</FButton>
        </FContainer>
      </FContainer>
    </portal>
    <FTabs
      v-if="!isEmpty(vendorQuotes)"
      appearance="link"
      :tabsList="tabList"
      v-model="currentTabValue"
      :lazy="false"
    >
      <FTabPane activeKey="1">
        <FContainer
          borderTop="1px solid #eae9e9ff"
          padding="containerXxLarge containerXxLarge containerNone"
        >
          <FContainer
            v-for="(vendor, index) in awardedVendorQuotes"
            :key="index"
          >
            <VendorDetailCard
              :details="details"
              :vendorData="vendor"
              :isAwarded="canShowAwardedVendors"
              @openViewQuote="openViewQuote"
            />
          </FContainer>
        </FContainer>
      </FTabPane>
      <FTabPane activeKey="2">
        <FContainer
          borderTop="1px solid #eae9e9ff"
          padding="containerXxLarge containerXxLarge containerNone"
        >
          <FContainer v-for="(vendor, index) in vendorQuotes" :key="index">
            <VendorDetailCard
              :details="details"
              :vendorData="vendor"
              @openViewQuote="openViewQuote"
            />
          </FContainer>
        </FContainer>
      </FTabPane>
    </FTabs>
    <FContainer v-else display="flex" justifyContent="center" height="500px">
      <FEmptyState
        :title="$t('rfq.no_vendors_associated', { ns: 'procurement' })"
        vertical
        size="M"
        illustration="no-entries"
      >
      <template #buttons>
          <FButton appearance='secondary' @click="addVendors">{{$t('rfq.add_vendor', { ns: 'procurement' })}}</FButton>
        </template>
    </FEmptyState>
    </FContainer>
    <VendorQuotesModal
      v-if="openViewQuoteModal"
      :showQuoteModal="openViewQuoteModal"
      :quotesData="modalData"
      @cancel="closeDialog"
    />
    <LookupWizard
        v-if="canShowLookupWizard"
        :parentModuleName="moduleName"
        :field.sync="vendorMultiLookupData"
        :canShowLookupWizard.sync="canShowLookupWizard"
        @closeWizard="cancelLookupWizard"
        @setLookupFieldValue="selectVendors"
      ></LookupWizard>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTabs,
  FTabPane,
  ftoast,
  FEmptyState,
  FButton,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import { API } from '@facilio/api'
import VendorDetailCard from '../components/VendorDetailCard.vue'
import VendorQuotesModal from '../components/ViewQuotesModal.vue'
import LineItemsMixin from '../mixins/LineItemsMixin.vue'
import {  LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { dset as setProperty } from 'dset'
export default {
  props: ['widget', 'details','actionPortal'],
  mixins: [LineItemsMixin],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    VendorDetailCard,
    VendorQuotesModal,
    LookupWizard,
    FEmptyState,
    FButton,
  },
  data() {
    return {
      vendorQuotes: [],
      awardedVendorQuotes: [],
      modalData: [],
      loading: false,
      currentTabValue: '2',
      openViewQuoteModal: false,
      vendorMultiLookupData: {
        name: 'vendor',
        lookupModuleName: 'vendors',
        field: {
          lookupModule: {
            displayName: 'Vendors',
            name: 'vendors',
          },
        },
        multiple: true,
        forceFetchAlways: true,
        selectedItems: [],
      },
      canShowLookupWizard: false,
      
    }
  },
  created() {
    this.loadVendorQuotes()
  },
  computed: {
    canShowAwardedVendors() {
      return getProperty(this, 'details.isAwarded', false)
    },
    tabList() {
      let { awardedVendorQuotes } = this
      let tabs = []
      let vendorTab = { label: this.$t('rfq.all_vendors',{ns : 'procurement'}), value: '2' }
      let awardTabObj = { label: this.$t('rfq.awarded_vendors',{ns : 'procurement'}), value: '1' }
      if (!isEmpty(awardedVendorQuotes)) {
        tabs.push(awardTabObj)
      }
      tabs.push(vendorTab)
      return tabs
    },
    isRfqFinalized() {
      return getProperty(this, 'details.isRfqFinalized', false)
    },
    showAddVendor() {
      let { details = {}, isRfqFinalized } = this
      return !isRfqFinalized && !isEmpty(details.vendor)
    },
    moduleName() {
      return getProperty(this, 'details.moduleName', null)
    },
    vendorQuotesList() {
      let { vendorQuotes } = this
      let vendorQuotesArr = vendorQuotes.map(vendorQuote => {
        return {
          ...vendorQuote,
          primaryContactName: getProperty(
            vendorQuote,
            'vendor.primaryContactName',
            '---'
          ),
          emailId: getProperty(
            vendorQuote,
            'vendor.primaryContactEmail',
            '---'
          ),
          contactNumber: getProperty(
            vendorQuote,
            'vendor.primaryContactPhone',
            '---'
          ),
          vendorName: getProperty(vendorQuote, 'vendor.name', '---'),
          status: getProperty(vendorQuote, 'moduleState.displayName', null),
        }
      })
      return vendorQuotesArr
    },
  },

  methods: {
    isEmpty,
     cancelLookupWizard() {
      this.canShowLookupWizard = false
    },
    selectVendors(selectedVendorValues) {
      let selectedVendors = getProperty(
        selectedVendorValues,
        'field.selectedItems'
      )
      if (isEmpty(selectedVendors)) {
        ftoast.critical(
          this.$t('rfq.select_vendors_warning_message',{ns : 'procurement'})
        )
        return
      }
      let vendorsData = selectedVendors.map(vendor => {
        return {
          id: getProperty(vendor, 'value', null),
        }
      })
      this.updateVendors(vendorsData)
    },
    async updateVendors(vendor) {
      let { details, moduleName } = this
      let data = {
        id: details.id,
        data: {
          vendor,
        },
      }
      let { error } = await API.updateRecord(moduleName, data)
      if (error) {
        ftoast.critical(
          error.message ||
            this.$t('rfq.error_occured_while_selecting_vendors',{ns : 'procurement'})
        )
      } else {
        let successMsg = this.$t('rfq.selected_vendors_successfully',{ns : 'procurement'})
        ftoast.success(successMsg)
        this.canShowLookupWizard = false
        this.$attrs.reloadSummary()
      }
    },
    async loadVendorQuotes() {
      this.loading = true
      let { details = {} } = this
      let { isRfqFinalized, vendor = [] } = details
      if (isRfqFinalized) {
        let reqForQuotId = getProperty(details, 'id')
        let params = {
          filters: JSON.stringify({
            requestForQuotation: {
              operatorId: 36,
              value: [`${reqForQuotId}`],
            },
          }),
          getWithLineItems: true,
        }
        let { list, error } = await API.fetchAll('vendorQuotes', params)
        if (error) {
          ftoast.critical(
            error ||
              this.$t('rfq.error_loading_vendor_quotes', { ns: 'procurement' })
          )
        } else {
          this.vendorQuotes = list
          this.getAwardedVendorQuotes(cloneDeep(list))
        }
      } else {
        if (!isEmpty(vendor)) {
          let vendorIds = vendor.map(vendorObj => `${vendorObj?.id}`)

          let params = {
            filters: JSON.stringify({
              id: {
                operatorId: 9,
                value: vendorIds,
              },
            }),
          }
          let { list = [], error } = await API.fetchAll('vendors', params)
          if (error) {
            ftoast.critical(
              error || this.$t('rfq.error_occurred', { ns: 'procurement' })
            )
          } else {
            this.vendorQuotes = list.map(vendor => {
              return {
                vendor: vendor,
              }
            })
          }
        }
      }
      this.loading = false
    },
    closeDialog(val) {
      this.modalData = []
      this.openViewQuoteModal = val
    },
    openViewQuote(val) {
      this.openViewQuoteModal = true
      this.modalData = val
    },
    addVendors() {
      this.setSelectedVendors()
      this.canShowLookupWizard = true
    },
    setSelectedVendors() {
      let { details = {} } = this
      let { vendor } = details
      if (!isEmpty(vendor)) {
        let selectedVendors = vendor.map(vendor => ({
          value: vendor?.id,
        }))
        setProperty(this.vendorMultiLookupData, 'selectedItems', selectedVendors)
      }
    },
    getAwardedVendorQuotes(vendorQuoteRecords = []) {
      let awardedVendorQuotes = vendorQuoteRecords.filter(vendorQuote => {
        let { vendorQuotesLineItems = [] } = vendorQuote || {}
        let filteredVendorQuoteLineItems = vendorQuotesLineItems.filter(
          vendorQuoteLineItem => {
            return vendorQuoteLineItem.isLineItemAwarded
          }
        )
        vendorQuote.vendorQuotesLineItems = filteredVendorQuoteLineItems
        return !isEmpty(filteredVendorQuoteLineItems)
      })
      this.awardedVendorQuotes = awardedVendorQuotes
      if (!isEmpty(awardedVendorQuotes)) this.currentTabValue = '1'
    },
  },
}
</script>
