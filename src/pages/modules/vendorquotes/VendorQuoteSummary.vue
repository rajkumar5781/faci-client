<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import AddQuoteForm from './widgets/AddQuoteForm.vue'
import { FContainer, ftoast, fDialog } from '@facilio/design-system'
import { API } from '@facilio/api'
import { getApp } from '@facilio/router'
import dlv from 'dlv'
import FetchViews from '../../../../src/components/views/FetchViews.vue'
import {
  findRouteForModule,
  findRouteForReport,
  pageTypes,
} from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import Rfqmixins from './../../../pages/modules/Rfq/mixins/Rfqmixins'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { getTimeZone } from '../../../../src/utils/formatter'

dayjs.extend(timezone)
export default {
  extends: ModuleSummary,
  name: 'VendorQuoteSummary',
  components: {
    AddQuoteForm,
    FContainer,
  },
  mixins: [FetchViews],
  data() {
    return {
      showAddQuoteForm: false,
      btnloading: false,
      isSubmitButtonLoading: false,
      isNegotiateBtnLoading: false,
      button: null,
    }
  },
  computed: {
    recordMainField() {
      let { record } = this
      return dlv(record, 'requestForQuotation.name') || null
    },
    systemBtnList() {
      let systemBtnListArray = []

      let downloadBtn = {
        iconGroup: 'connectivity',
        iconName: 'download',
        iconButton: true,
        iconPosition: 'prefix',
        identifier: 'downloadRFQ',
        loading: this.btnloading,
        clickAction: this.downloadPdf,
        appearance: 'tertiary',
      }

      let negotiateBtn = {
        name: this.$t('vendor_quotes.negotiateQuote', {
          ns: 'vendor_quotes',
        }),
        identifier: 'negotiateQuote',
        clickAction: this.negotiate,
        appearance: 'primary',
        loading: this.isNegotiateBtnLoading,
      }

      let addQuoteBtn = {
        name: this.$t('vendor_quotes.addQuote', {
          ns: 'vendor_quotes',
        }),
        identifier: 'addQuote',
        clickAction: this.openAddQuoteForm,
        appearance: 'primary',
      }

      let updateQuoteBtn = {
        name: this.$t('vendor_quotes.updateQuote', {
          ns: 'vendor_quotes',
        }),
        identifier: 'updateQuote',
        clickAction: this.openAddQuoteForm,
        appearance: 'secondary',
      }

      let submitBtn = {
        name: this.$t('vendor_quotes.submitQuote', {
          ns: 'vendor_quotes',
        }),
        identifier: 'submitQuote',
        clickAction: this.finalizeQuote,
        appearance: 'primary',
        loading: this.isSubmitButtonLoading,
      }

      systemBtnListArray.push(downloadBtn)
      systemBtnListArray.push(negotiateBtn)
      // hardcoded check for icd, will be handled with system button feature in V2
      //let hideBtn = this.$org.id === 30

      if (this.checkPortalPermission) {
        if (this.checkLineItemHasQuotedUnitPrice) {
          systemBtnListArray.push(submitBtn)
          systemBtnListArray.push(updateQuoteBtn)
        } else {
          systemBtnListArray.push(addQuoteBtn)
        }
      }
      return systemBtnListArray
    },
    moreButtonList() {
      return [
        {
          name: 'Go To RFQ',
          identifier: 'goToRFQ',
          clickAction: this.overViewRFQ,
        },
      ]
    },
    checkLineItemHasQuotedUnitPrice() {
      let vendorQuotesLineItems = dlv(this.record, 'vendorQuotesLineItems')
      if (!isEmpty(vendorQuotesLineItems)) {
        let quotedVendorQuotesLineItems = vendorQuotesLineItems.filter(
          element => {
            let { counterPrice } = element || {}
            return !isEmpty(counterPrice)
          }
        )
        return !isEmpty(quotedVendorQuotesLineItems)
      }
      return false
    },
    isVendorPortal() {
      return getApp().linkName === 'vendor'
    },
    checkPortalPermission() {
      if (this.isVendorPortal) {
        return true
      }
      return !dlv(this.record, 'vendorPortalAccess') && !this.isClosedBid
    },
    isClosedBid() {
      let rfqType = dlv(this.record, 'requestForQuotation.rfqType')

      let { RFQ_TYPE } = Rfqmixins
      return rfqType === RFQ_TYPE.CLOSED_BID
    },
  },
  methods: {
    openAddQuoteForm(btn) {
      this.showAddQuoteForm = true
      this.button = btn
    },
    closeQuoteForm() {
      this.showAddQuoteForm = false
      this.button.onActionComplete()
    },
    async downloadPdf(btn) {
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
      btn.onActionComplete()
    },
    async overViewRFQ() {
      let id = dlv(this.record, 'requestForQuotation.id')
      let moduleName = 'requestForQuotation'
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

      if (name) {
        let viewname = await this.fetchView(moduleName)
        this.$router.push({
          name,
          params: {
            id,
            viewname,
          },
        })
      }
    },
    async finalizeQuote(btn) {
      this.isSubmitButtonLoading = true
      let { checkLineItemHasQuotedUnitPrice } = this
      let value = await this.submitQuoteWarningDialog()
      if (value) {
        if (!checkLineItemHasQuotedUnitPrice) {
          ftoast.warning(
            this.$t('vendor_quotes.quote_atleast_one_lineitem_warning_msg', {
              ns: 'vendor_quotes',
            })
          )
          this.isSubmitButtonLoading = false
          return
        } else {
          let currentmillis = dayjs().tz(getTimeZone()).valueOf()
          let data = {
            id: dlv(this.record, 'id'),
            data: {
              replyDate: currentmillis,
            },
            params: {
              finalizeVendorQuote: true,
            },
          }
          let { error } = await API.updateRecord(this.moduleName, data)
          if (error) {
            ftoast.critical(
              message ||
                this.$t('vendor_quotes.error_while_adding_quote_details', {
                  ns: 'vendor_quotes',
                })
            )
          } else {
            let successMsg = this.isVendorPortal
              ? this.$t(
                  'vendor_quotes.submit_quote_success_msg_vendor_portal',
                  {
                    ns: 'vendor_quotes',
                  }
                )
              : this.$t('vendor_quotes.submit_quote_success_msg', {
                  ns: 'vendor_quotes',
                })

            ftoast.success(successMsg)
            this.loadRecord(true)
          }
        }
      }
      this.isSubmitButtonLoading = false
      btn.onActionComplete()
    },

    async submitQuoteWarningDialog() {
      let val = await fDialog.warning({
        title: this.$t('vendor_quotes.confirm_submit_quote', {
          ns: 'vendor_quotes',
        }),
        description: this.$t('vendor_quotes.submit_quote_waring_message', {
          ns: 'vendor_quotes',
        }),
        saveText: this.$t('vendor_quotes.confirm', {
          ns: 'vendor_quotes',
        }),
        cancelText: this.$t('vendor_quotes.cancel', {
          ns: 'vendor_quotes',
        }),
      })
      return val
    },
    async negotiate(btn) {
      this.isNegotiateBtnLoading = true
      let data = {
        id: dlv(this.record, 'id'),
        params: {
          negotiation: true,
        },
      }

      let { error } = await API.updateRecord(this.moduleName, data)

      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('vendor_quotes.error_occurred', {
              ns: 'vendor_quotes',
            })
        )
      } else {
        ftoast.success(
          this.$t('vendor_quotes.negotiation_initiated', {
            ns: 'vendor_quotes',
          })
        )
        this.refreshData()
      }

      this.isNegotiateBtnLoading = false
      btn.onActionComplete()
    },
    defaultSpace() {
      return (
        <FContainer>
          {this.showAddQuoteForm ? (
            <add-quote-form
              record={this.record}
              visibility={this.showAddQuoteForm}
              moduleName="vendorQuotes"
              vOn:saved={this.closeQuoteForm}
              vOn:closed={this.closeQuoteForm}
            />
          ) : (
            {}
          )}
        </FContainer>
      )
    },
  },
}
</script>
