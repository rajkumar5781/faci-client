<template>
  <FContainer height="100%">
    <FContainer
      v-if="cardLoading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="30"></FSpinner>
    </FContainer>
    <FContainer
      v-else-if="!emptyState"
      display="flex"
      flexDirection="column"
      maxHeight="calc(100vh - 75px)"
      overflow="auto"
      width="100%"
      class="portfolio-container"
      ref="portfolioContainer"
    >
      <FContainer height="100%">
        <FRow>
          <FCol :span="12">
            <FContainer padding="containerXxLarge" position="relative">
              <FBanner
                :headerObject="bannerObject"
                :disableFormCloseAction="true"
              >
                <template #image>
                  <FContainer position="absolute" class="banner-image">
                    <FIcon
                      height="150px"
                      padding="containerNone"
                      :group="'illustration'"
                      :name="'portfolio-banner'"
                      :size="'400'"
                      :pressable="false"
                      color="textDefault"
                    />
                  </FContainer>
                </template>
              </FBanner>
            </FContainer>
          </FCol>
        </FRow>
        <FContainer padding="containerXxLarge" v-if="cardRerender">
          <FRow>
            <FCol :span="3" v-for="(card, index) in cards" :key="index">
              <PortfolioCards
                :loading="cardLoading"
                :title="card.name"
                :count="card.value"
                :iconGroup="card.iconGroup"
                :iconName="card.iconName"
                :area="card?.value2"
              ></PortfolioCards>
            </FCol>
          </FRow>
        </FContainer>
        <portal to="viewheader">
          <FTabs
            appearance="button"
            v-model="selectedTab"
            :tabsList="tabsLists"
          >
            <FTabPane
              v-for="(tab, index) in tabsLists"
              :activeKey="tab.value"
              :key="index"
            >
            </FTabPane>
          </FTabs>
        </portal>
        <FContainer width="100%">
          <PortfolioList
            :tab="selectedTab"
            :moduleName="portfolioModuleName"
            :viewname="viewname"
          ></PortfolioList>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer
      v-else
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        illustration="portfolio"
        size="M"
        :title="
          $t('portfolio.banner.title', `Portfolio Management`, {
            ns: 'portfolio',
          })
        "
        :description="
          $t(
            'portfolio.banner.description',
            `Seamlessly manage your Organization’s Portfolio, including Sites, Buildings, Floors and Spaces with ease`,
            { ns: 'portfolio' }
          )
        "
        type="narrow"
        vertical
      >
        <template #buttons>
          <FButton appearance="primary" @click="redirectToFormCreation()">
            <FText
              fontsize="body3"
              fontWeight="medium"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {{
                $t('portfolio.buttons.new_site', 'New Site', {
                  ns: 'portfolio',
                })
              }}
            </FText>
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTabs,
  FTabPane,
  FRow,
  FCol,
  FBanner,
  FText,
  FIcon,
  FSpinner,
  FEmptyState,
  FButton,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import SpaceMixin from './portfolioMixin.vue'
import PortfolioList from './components/PortfolioList.vue'
import PortfolioCards from './components/PortfolioCards.vue'
import {
  isWebTabsEnabled,
  findRouteForTab,
  tabTypes,
  pageTypes,
} from '@facilio/router'
import { mapState, mapActions } from 'pinia'
import viewStore from '../../../store/views'
import getProperty from 'dlv'
export default {
  mixins: [SpaceMixin],
  props: ['viewname'],
  components: {
    FContainer,
    FCol,
    FTabs,
    FTabPane,
    FRow,
    FBanner,
    PortfolioList,
    PortfolioCards,
    FText,
    FEmptyState,
    FButton,
    FIcon,
    FSpinner,
  },
  data() {
    return {
      showForm: false,
      cardRerender: true,
      selectedTab: this.$route.params?.moduleName || 'site',
      cardLoading: false,
      showSearchBox: false,
      record: null,
      hasNoSites: false,
      cards: {
        sites: {
          name: 'Sites',
          value: 0,
          iconGroup: 'portfolio',
          iconName: 'location',
        },
        buildings: {
          name: 'Buildings',
          value: 0,
          iconGroup: 'portfolio',
          iconName: 'building',
        },
        floors: {
          name: 'Floors',
          value: 0,
          iconGroup: 'default',
          iconName: 'floorstack',
        },
        spaces: {
          name: 'Spaces',
          value: 0,
          iconGroup: 'default',
          iconName: 'workspace',
        },
      },
      bannerObject: {
        title: 'Portfolio management',
        description:
          "Seamlessly manage your Organization's Portfolio, including Territories, Sites, Buildings, Floors and Spaces with ease.",
        linearGradientObject: {
          direction: '344deg',
          startColor: '#311E77',
          endColor: '#7D63DC',
        },
      },
      tabsLists: [
        { label: 'Site', value: 'site' },
        { label: 'Building', value: 'building' },
      ],
    }
  },
  created() {
    this.init()
  },
  computed: {
    emptyState() {
      let { hasNoSites } = this || {}
      return hasNoSites
    },
    portfolioModuleName() {
      return getProperty(this, '$route.params.moduleName', 'site')
    },
    ...mapState(viewStore, {
      isViewLoading: 'isLoading',
      isViewDetailLoading: 'detailLoading',
    }),
  },
  watch: {
    selectedTab: {
      async handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.selectedTab = newVal
          let { name: listRouteName } =
            findRouteForTab(pageTypes.PORTFOLIO_LIST) || {}
          let { viewname } = this
          if (listRouteName) {
            this.$router.push({
              name: listRouteName,
              params: {
                groupName: `${newVal}s`,
                moduleName: `${newVal}`,
                viewname: viewname == 'mapView' ? viewname : null,
              },
            })
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(viewStore, ['loadViewDetail']),
    async init() {
      this.cardLoading = true
      let promises = [this.getCardData()]
      let resps = await Promise.all(promises)
      await this.getTotalArea(), this.prepareCardsData(resps)
      this.$nextTick(() => {
        this.cardLoading = false
      })
      this.selectedTab = this?.$route?.params?.moduleName || 'site'
      this.cardRerender = false
      this.$nextTick(() => {
        this.cardRerender = true
      })
    },
    scrollUp() {
      const container = this.$refs.portfolioContainer.$el
      container.scrollTop = container.scrollHeight
    },
    async getViewDetail() {
      await this.loadViewDetail({
        moduleName: this.selectedTab,
        viewName: this.viewname,
      })
    },
    async getTotalArea() {
      let totalAreaUrl = 'v2/site/totalArea'
      let { data, error } = await API.get(totalAreaUrl)
      if (data) {
        let area = data.totalArea
        if (area != null && area != 0) {
          let unit = data?.unit || 'sq.ft'
          this.cards['sites'].value2 = `${area} ${unit}`
        }
      }
      console.log(this.$refs, 'refs')
    },
    openRecordSummary(record) {
      let { id, siteId } = record
      let { selectedTab } = this
      let parentPath = this.findRoute()
      let viewname = this.viewname
      if (parentPath) {
        if (selectedTab === 'site') {
          this.$router.push(
            `${parentPath}/sites/${viewname}/site/${id}/overview`
          )
        } else if (selectedTab === 'building') {
          this.$router.push(
            `${parentPath}/buildings/${viewname}/site/${siteId}/building/${id}`
          )
        }
      }
    },
    redirectToFormCreation() {
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_CREATE) || {}

      name &&
        this.$router.push({
          name,
          params: {
            moduleName: `site`,
          },
        })
    },
    openNewForm() {
      let { selectedTab } = this || {}
      let { name: createRouteName } =
        findRouteForTab(pageTypes.PORTFOLIO_CREATE) || {}
      if (createRouteName) {
        this.$router.push({
          name: createRouteName,
          params: {
            moduleName: selectedTab,
          },
        })
      }
    },
    findRoute() {
      if (isWebTabsEnabled()) {
        let tabType = tabTypes.CUSTOM
        let config = { type: 'portfolio' }
        let route = findRouteForTab(tabType, { config }) || {}

        if (!isEmpty(route)) {
          return this.$router.resolve({ name: route.name }).href
        }
      } else {
        return '/app/home/portfolio'
      }
    },
    prepareCardsData(res) {
      if (res !== null && res.length) {
        let cardResult = res[0].data.cardResult
        if (cardResult['sites'] == 0) {
          this.hasNoSites = true
          this.cardLoading = false
        } else {
          let keys = Object.keys(cardResult)
          for (let key of keys) {
            this.cards[key].value = cardResult[key]
          }
        }
      }
    },
    async getCardData() {
      return await API.get('/v2/portfolio/cards')
    },
  },
}
</script>
<style>
.portfolio-banner .icon {
  height: 150px;
  width: 400px;
}

.row-height100 {
  height: 100%;
}

.banner-image {
  top: -86px;
  right: 20px;
}
</style>
