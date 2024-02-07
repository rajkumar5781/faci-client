<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FButton } from '@facilio/design-system'
export default {
  extends: ModuleList,
  components: { FContainer, FButton },
  computed: {
    convertPrToRfqVisibility() {
      return (
        this.$access.hasPermission(`requestForQuotation:CREATE`) &&
        this.$access.isLicenseEnabled('REQUEST_FOR_QUOTATION')
      )
    },
    convertPrVisibility() {
      let vendorid = null
      let { selectedListItemsIds } = this
      selectedListItemsIds.map(item => {
        let { vendor = {} } = item || {}
        let { id } = vendor
        if (vendor && id) {
          if (vendorid !== null) {
            if (vendorid !== id) {
              return false
            }
          } else {
            vendorid = id
          }
        }
      })
      return true
    },
  },
  methods: {
    convertPr(moduleName) {
      let { viewname } = this
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE)
      if (!isEmpty(name)) {
        let route = {
          name,
          params: {
            viewname: viewname,
          },
          query: {
            isConvertPr: true,
            recordIds: JSON.stringify(this.selectedListItemsIds),
          },
        }
        this.$router.push(route)
      }
    },
    bulkActionButtons() {
      let {
        convertPrVisibility,
        convertPrToRfqVisibility,
        selectedListItemsIds,
      } = this
      return (
        <FContainer display="flex">
          <FContainer>
            <FButton
              appearance="secondary"
              size="medium"
              vOn:click={() => this.deleteRecords(selectedListItemsIds)}
            >
              {this.$t('delete', 'Delete', { ns: 'common' })}
            </FButton>
          </FContainer>
          {convertPrVisibility && (
            <FContainer padding="containerNone containerMedium">
              <FButton
                appearance="secondary"
                size="medium"
                vOn:click={() => this.convertPr('purchaseorder')}
              >
                {this.$t('purchase_request.convert_prs_to_po', {
                  ns: 'procurement',
                })}
              </FButton>
            </FContainer>
          )}
          {convertPrToRfqVisibility && (
            <FContainer paddingRight="containerMedium">
              <FButton
                appearance="secondary"
                size="medium"
                vOn:click={() => this.convertPr('requestForQuotation')}
              >
                {this.$t('purchase_request.convert_prs_to_rfq', {
                  ns: 'procurement',
                })}
              </FButton>
            </FContainer>
          )}
        </FContainer>
      )
    },
  },
}
</script>
