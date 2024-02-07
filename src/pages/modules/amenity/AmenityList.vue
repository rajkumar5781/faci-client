<script lang="jsx">
import ModuleList from '../../../../src/pages/list/ModuleList.vue'
import {
  FContainer,
  FSpinner,
  FModal,
  FText,
  ftoast,
  FTooltip,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import AmenityOverviewShimmer from './AmenityOverviewShimmer.vue'
const CATAGORY = {
  1: 'Utility',
  2: 'Pantry',
  3: 'Housekeeping',
}
const AMENITY_LOGO = { 1: 'network', 2: 'housekeeping', 3: 'others' }
export default {
  extends: ModuleList,
  name: 'AmenityList',
  components: {
    FContainer,
    FSpinner,
    FModal,
    FText,
    AmenityOverviewShimmer,
    FTooltip,
  },
  data() {
    return {
      loading: false,
      showAmenityOverview: false,
      amenityData: null,
    }
  },
  computed: {
    getAmenityName() {
      let { amenityData } = this
      let { name } = amenityData || {}
      return name || '---'
    },
    getAmenityDescription() {
      let { amenityData } = this
      let { description } = amenityData || {}
      return description || '---'
    },
    getAmenityCatagory() {
      let { amenityData } = this
      let { category } = amenityData || {}
      let catagoryValue = !isEmpty(category) ? CATAGORY[category] : '---'
      return catagoryValue
    },
    getAmenityLogo() {
      let { amenityData } = this
      let { amenityLogoEnum } = amenityData || {}
      let logo = !isEmpty(amenityLogoEnum) ? amenityLogoEnum.value : '---'

      return logo
    },
  },
  methods: {
    async getRecord(id) {
      this.loading = true
      let { error, data } = await API.get(
        '/v3/modules/data/summary?id=' + id + '&moduleName=amenity'
      )
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        let { amenity } = data || {}
        this.amenityData = amenity || {}
      }
      this.loading = false
    },
    redirectToOverview(id) {
      this.getRecord(id)
      this.showAmenityOverview = true
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, viewname } = this
      let { id } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname, id },
        }).href

        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.mainFieldClickAction(id, e),
          ...value,
        }
      }
    },
    mainFieldClickAction(id, e) {
      this.redirectToOverview(id)
      e.preventDefault()
    },
    body() {
      let { showLoading, viewname, records, showAmenityOverview } = this || {}
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
          {showAmenityOverview ? (
            <FContainer>
              <FModal
                title="Amenity"
                visible={showAmenityOverview}
                size="S"
                hideFooter={true}
                type="default"
                vOn:cancel={this.handleCancel}
              >
                {this.loading ? (
                  <FContainer height="50%">
                    <AmenityOverviewShimmer />
                  </FContainer>
                ) : (
                  <FContainer
                    paddingTop="containerXxLarge"
                    paddingBottom="containerXxLarge"
                    paddingLeft="sectionSmall"
                    paddingRight="sectionSmall"
                    height="50%"
                  >
                    <FContainer display="flex" width="100%">
                      <FContainer width="50%">
                        <div>
                          <FText
                            appearance="headingMed14"
                            color="backgroundNeutralInverseHovered"
                          >
                            {this.$t('amenity.name', { ns: 'facilitybooking' })}
                          </FText>
                        </div>
                        <FContainer width="70%" display="flex">
                          <FTooltip placement="top">
                            <template slot="title">
                              {this.getAmenityName}
                            </template>
                            <FText
                              appearance="bodyReg14"
                              color="backgroundNeutralInverse"
                              textOverflow="ellipsis"
                              overflow="hidden"
                              whiteSpace="nowrap"
                              cursor="pointer"
                            >
                              {this.getAmenityName}
                            </FText>
                          </FTooltip>
                        </FContainer>
                      </FContainer>
                      <div>
                        <div>
                          <FText
                            appearance="headingMed14"
                            color="backgroundNeutralInverseHovered"
                          >
                            {this.$t('amenity.catagory', {
                              ns: 'facilitybooking',
                            })}
                          </FText>
                        </div>
                        <div>
                          <FText
                            appearance="bodyReg14"
                            color="backgroundNeutralInverse"
                          >
                            {this.getAmenityCatagory}
                          </FText>
                        </div>
                      </div>
                    </FContainer>
                    <FContainer marginTop="containerXxLarge">
                      <div>
                        <FText
                          appearance="headingMed14"
                          color="backgroundNeutralInverseHovered"
                        >
                          {this.$t('amenity.description', {
                            ns: 'facilitybooking',
                          })}
                        </FText>
                      </div>
                      <div>
                        <FText
                          appearance="bodyReg14"
                          color="backgroundNeutralInverse"
                          textAlign="justify"
                        >
                          {this.getAmenityDescription}
                        </FText>
                      </div>
                    </FContainer>
                    <FContainer
                      marginTop="containerXxLarge"
                      marginBottom="containerLarge"
                    >
                      <div>
                        <FText
                          appearance="headingMed14"
                          color="backgroundNeutralInverseHovered"
                        >
                          {this.$t('amenity.amenity_logo', {
                            ns: 'facilitybooking',
                          })}
                        </FText>
                      </div>
                      <div>
                        <FText
                          appearance="bodyReg14"
                          color="backgroundNeutralInverse"
                        >
                          {this.getAmenityLogo}
                        </FText>
                      </div>
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
    handleCancel(val) {
      this.showAmenityOverview = false
    },
  },
}
</script>
