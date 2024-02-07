<script lang="jsx">
import { API } from '@facilio/api'
import ModuleList from '../../../list/ModuleList.vue'
import {
  FContainer,
  FSpinner,
  FModal,
  FText,
  ftoast,
  FTooltip,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import ChartOfAccountShimmer from './ChartOfAccountShimmer.vue'

export default {
  name: 'ChartOfAccountList',
  extends: ModuleList,
  components: {
    FContainer,
    FSpinner,
    FModal,
    FText,
    FTooltip,
    ChartOfAccountShimmer,
  },
  data() {
    return {
      chartOfAccountData: {},
      loading: false,
      showCOAOverview: false,
    }
  },
  computed: {
    description() {
      let { description } = this.chartOfAccountData || {}
      return description
    },
    coaName() {
      let { name } = this.chartOfAccountData || {}
      return name
    },
    coaCode() {
      let { code } = this.chartOfAccountData || {}
      return code
    },
    accountType() {
      let { type } = this.chartOfAccountData || {}
      let { name } = type || {}
      return name
    },
  },
  methods: {
    redirectToOverview() {},
    mainFieldClickAction(id, e) {
      this.redirectToOverview(id)
      e.preventDefault()
    },
    async getRecord(id) {
      this.loading = true
      let { error, data } = await API.get(
        '/v3/modules/data/summary?id=' + id + '&moduleName=chartofaccount'
      )
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        let { chartofaccount } = data || {}
        this.chartOfAccountData = chartofaccount || {}
      }
      this.loading = false
    },
    redirectToOverview(record) {
      let { id } = record || {}
      this.getRecord(id)
      this.showCOAOverview = true
    },
    handleCancel() {
      this.showCOAOverview = false
    },
    body() {
      let { showLoading, viewname, records, showCOAOverview } = this || {}
      return (
        <div>
          {showLoading ? (
            <FContainer
              height="calc(100vh - 210px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FSpinner size={30} />
            </FContainer>
          ) : isEmpty(viewname) ? (
            this.viewEmptyState()
          ) : isEmpty(records) ? (
            this.recordEmptyState()
          ) : (
            this.moduleTable()
          )}
          {showCOAOverview ? (
            <FContainer>
              <FModal
                title="Chart Of Account"
                visible={showCOAOverview}
                size="S"
                hideFooter={true}
                type="default"
                vOn:cancel={this.handleCancel}
              >
                {this.loading ? (
                  <FContainer height="50%">
                    <ChartOfAccountShimmer />
                  </FContainer>
                ) : (
                  <FContainer padding="containerXxLarge sectionSmall">
                    <FContainer
                      display="flex"
                      flexDirection="column"
                      gap="containerMedium"
                      paddingBottom="containerXxLarge"
                    >
                      <FText appearance="headingMed14">
                        {this.$t('chartOfAccount.description', {
                          ns: 'budget',
                        })}
                      </FText>
                      <FText>{this.description || '---'}</FText>
                    </FContainer>
                    <FContainer display="flex" height="38px">
                      <FContainer
                        display="flex"
                        flexDirection="column"
                        gap="containerMedium"
                        width="172px"
                        paddingRight="containerLarge"
                      >
                        <FText appearance="headingMed14">
                          {this.$t('chartOfAccount.name', { ns: 'budget' })}
                        </FText>
                        <FTooltip placement="top">
                          {!isEmpty(this.coaName) && (
                            <template slot="title">{this.coaName}</template>
                          )}
                          <FText overflow="hidden" textOverflow="ellipsis">
                            {this.coaName || '---'}
                          </FText>
                        </FTooltip>
                      </FContainer>
                      <FContainer
                        display="flex"
                        flexDirection="column"
                        gap="containerMedium"
                        width="157px"
                        paddingRight="containerLarge"
                      >
                        <FText appearance="headingMed14">
                          {this.$t('chartOfAccount.code', { ns: 'budget' })}
                        </FText>
                        <FTooltip placement="top">
                          {!isEmpty(this.coaCode) && (
                            <template slot="title">{this.coaCode}</template>
                          )}
                          <FText overflow="hidden" textOverflow="ellipsis">
                            {this.coaCode || '---'}
                          </FText>
                        </FTooltip>
                      </FContainer>
                      <FContainer
                        display="flex"
                        flexDirection="column"
                        gap="containerMedium"
                        width="157px"
                      >
                        <FText appearance="headingMed14">
                          {this.$t('chartOfAccount.type', { ns: 'budget' })}
                        </FText>
                        <FTooltip placement="top">
                          {!isEmpty(this.accountType) && (
                            <template slot="title">{this.accountType}</template>
                          )}
                          <FText overflow="hidden" textOverflow="ellipsis">
                            {this.accountType || '---'}
                          </FText>
                        </FTooltip>
                      </FContainer>
                    </FContainer>
                  </FContainer>
                )}
              </FModal>
            </FContainer>
          ) : (
            <div></div>
          )}
        </div>
      )
    },
  },
}
</script>
