<template>
  <div class="service-catalog-list-container">
    <FContainer
      marginTop="containerLarge"
      marginRight="containerLarge"
      borderRadius="high"
    >
      <FContainer
        class="banner"
        backgroundRepeat="no-repeat"
        width="100%"
        backgroundSize="cover"
        backgroundPosition="center"
        borderRadius="high"
        paddingTop="sectionMedium"
        paddingBottom="sectionMedium"
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginBottom="containerXLarge"
      >
        <FContainer
          display="flex"
          alignItems="center"
          width="100%"
          justifyContent="center"
          position="relative"
          top="50px"
          flexDirection="column"
        >
          <FContainer
            paddingBottom="sectionMedium"
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <FContainer paddingBottom="containerMedium">
              <FText color="textInverseDefault" appearance="headingMed20">
                {{ $t('catalog.service_catalog', { ns: 'servicecatalog' }) }}
              </FText>
            </FContainer>
            <div>
              <FText color="textInverseDefault" appearance="bodyReg14">
                {{ $t('catalog.description', { ns: 'servicecatalog' }) }}
              </FText>
            </div>
          </FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            justifyContent="center"
            padding="containerXxLarge"
            backgroundColor="backgroundFrost"
            borderRadius="high"
            width="550px"
            class="background-blur"
          >
            <FContainer marginRight="containerLarge" width="100%">
              <FInput
                size="large"
                v-model="searchText"
                :placeholder="
                  $t('catalog.search_here', { ns: 'servicecatalog' })
                "
                :clearValue="removeSearch"
                :clearable="true"
              >
                <template #prefix>
                  <FIcon
                    group="action"
                    name="search"
                    size="16"
                    color="iconNeutralLight"
                    :pressable="false"
                  ></FIcon>
                </template>
              </FInput>
            </FContainer>
            <div>
              <FButton
                appearance="primary"
                @click="searchCatalogs(true)"
                size="large"
              >
                <FText>
                  {{ $t('catalog.search_catalog', { ns: 'servicecatalog' }) }}
                </FText>
              </FButton>
            </div>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer marginRight="containerLarge" paddingTop="containerXLarge">
      <FContainer
        width="100%"
        marginBottom="containerMedium"
        v-if="showTab"
        class="ftab-container"
        overflowX="scroll"
        whiteSpace="no-wrap"
        display="flex"
        paddingRight="sectionMedium"
        alignItems="center"
        ref="parentContainer"
      >
        <FTabs
          ref="childContainer"
          appearance="button"
          :tabsList="getTabList"
          value="1"
          :lazy="false"
          @change="setActiveCatalog"
          v-model="currentTab"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FTabPane
            v-for="tab in getTabList"
            :key="`${tab.id} ${tab.displayName}`"
            :activeKey="tab.label"
          >
          </FTabPane>
        </FTabs>
      </FContainer>
      <FContainer
        v-if="showEmptyState"
        display="flex"
        alignItems="center"
        justifyContent="center"
        :paddingTop="isEmpty(searchText) ? 'sectionLarge' : ''"
      >
        <FEmptyState
          :illustration="getIllustation"
          :title="getTitleForEmptyState"
          :description="getDescriptionForEmptyState"
          vertical
          size="M"
        />
      </FContainer>
      <v-infinite-scroll
        :loading="loadingMoreCatalogs"
        @bottom="loadCatalogsList({ loadMore: true })"
        :offset="2"
        v-if="!isEmpty(filteredCatalogItems)"
        class="catalog-scroll-container"
      >
        <FContainer
          v-if="isCatalogLoading"
          padding="containerLarge"
          display="flex"
          width="100%"
        >
          <FContainer
            v-for="index in loopedDivs"
            :key="index"
            width="200px"
            marginRight="containerXxLarge"
            marginBottom="containerXxLarge"
          >
            <catalog-card-shimmer />
          </FContainer>
        </FContainer>
        <div v-else>
          <FContainer
            paddingTop="containerLarge"
            display="flex"
            width="100%"
            flexWrap="wrap"
            overflowY="scroll"
          >
            <FContainer
              v-for="(item, index) in filteredCatalogItems"
              :key="index"
              width="200px"
              marginRight="containerXxLarge"
              marginBottom="containerXxLarge"
            >
              <catalog-card :catalogItem="item" />
            </FContainer>
          </FContainer>
          <FContainer
            v-if="loadingMoreCatalogs && filteredCatalogItems.length > 48"
            padding="containerLarge"
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FSpinner :size="30"></FSpinner>
          </FContainer>
        </div>
      </v-infinite-scroll>
    </FContainer>
  </div>
</template>
<script>
import {
  FContainer,
  FText,
  FButton,
  FInput,
  FEmptyState,
  FTabs,
  FTabPane,
  FSpinner,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import CatalogMixin from './CatalogMixin.vue'
import CatalogCardShimmer from './CatalogCardShimmer.vue'
import CatalogCard from './CatalogCard.vue'
import VInfiniteScroll from 'v-infinite-scroll'

export default {
  props: ['isApp'],
  mixins: [CatalogMixin],
  components: {
    FContainer,
    FText,
    FButton,
    FInput,
    FEmptyState,
    CatalogCardShimmer,
    CatalogCard,
    FTabPane,
    FTabs,
    FSpinner,
    VInfiniteScroll,
    FIcon,
  },
  created() {
    this.init()
  },
  watch: {
    searchText(newVal, oldVal) {
      if (newVal !== oldVal && isEmpty(newVal)) {
        this.init()
      }
    },
  },
  data() {
    return {
      catalogGroups: [],
      filteredCatalogItems: [],
      activeCatalog: null,
      searchText: null,
      isLoading: false,
      isCatalogLoading: false,
      loadingMoreCatalogs: false,
      perPage: 50,
      page: 1,
      allCatalogsLoaded: false,
      isEmptySearch: false,
      isEmpty,
      loopedDivs: [1, 2, 3],
      currentTab: '-1',
      groups: [],
    }
  },
  computed: {
    getTabList() {
      let { catalogGroups = [] } = this
      this.groups = catalogGroups.map(group => ({
        ...group,
        label: group.name,
        value: String(group.id),
      }))
      return this.groups
    },
    getIllustation() {
      let { searchText } = this
      return !isEmpty(searchText) ? 'no-result' : 'no-data'
    },
    getTitleForEmptyState() {
      let { searchText } = this
      return !isEmpty(searchText)
        ? this.$t('catalog.search_results_not_found', { ns: 'servicecatalog' })
        : this.$t('catalog.no_service_catalog_available', {
            ns: 'servicecatalog',
          })
    },
    getDescriptionForEmptyState() {
      let { searchText } = this
      return !isEmpty(searchText)
        ? this.$t('catalog.empty_msg', { ns: 'servicecatalog' })
        : ''
    },
    groupId() {
      let { $route } = this
      let { query } = $route
      let { groupId } = query
      return !isEmpty(groupId) ? Number(groupId) : null
    },
    showTab() {
      let { getTabList = [] } = this
      return !isEmpty(getTabList) && getTabList.length > 1
    },
    showEmptyState() {
      let { isCatalogLoading, filteredCatalogItems } = this
      return !isCatalogLoading && isEmpty(filteredCatalogItems)
    },
  },
  methods: {
    removeSearch() {
      this.searchText = ''
      this.init()
    },
    async init() {
      this.isCatalogLoading = true
      await this.loadCatalogsData()
      await this.loadCatalogsList()
      this.isCatalogLoading = false
    },
    setActiveCatalog() {
      let { currentTab, groups = [] } = this
      let group = groups.find(group => group.value === currentTab)
      this.$set(this, 'activeCatalog', currentTab)
      this.$set(this, 'page', 1)
      this.$set(this, 'allCatalogsLoaded', false)
      if (!isEmpty(group)) {
        this.activeCatalog = group
      }
      this.loadCatalogsList({})
    },
    isActiveCatalog(catalog = {}) {
      let { activeCatalog } = this
      let { id } = catalog
      if (!isEmpty(activeCatalog)) {
        return id === activeCatalog.id
      }
      return false
    },
    searchCatalogs(allowClear = false) {
      let { searchText } = this
      this.$set(this, 'page', 1)
      if (isEmpty(searchText) && allowClear) {
        this.loadCatalogsList({ forceFetch: true }).then(() => {
          this.$set(this, 'isEmptySearch', false)
        })
      } else if (searchText.length > 1) {
        this.loadCatalogsList({ forceFetch: true }).then(() => {
          let { filteredCatalogItems } = this
          this.$set(this, 'isEmptySearch', isEmpty(filteredCatalogItems))
        })
      }
    },
    getCatalogs(searchText) {
      this.searchText = searchText
      this.searchCatalogs(true)
    },
  },
}
</script>
<style lang="scss">
.service-catalog-list-container {
  height: 100%;
  .catalog-banner {
    width: 100%;
    height: auto;
    display: block;
  }
  .catalog-scroll-container {
    padding-bottom: 100px;
    overflow-y: scroll;
    height: calc(100vh - 350px);
  }
  .ftab-container {
    div {
      width: fit-content;
      overflow-x: scroll;
    }
  }
  .background-blur {
    backdrop-filter: blur(16px);
  }

  .banner {
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1346 207"><g clip-path="url(%23a)"><path fill="%233C229D" d="M0 8a8 8 0 0 1 8-8h1330c4.42 0 8 3.582 8 8v191a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8Z"/><g opacity=".7" style="mix-blend-mode:overlay"><mask id="b" width="1346" height="209" x="0" y="-2" maskUnits="userSpaceOnUse" style="mask-type:luminance"><path fill="%23fff" d="M0 207h1346V-1H0v208Z"/></mask><g mask="url(%23b)"><path fill="url(%23c)" d="M1400.24 354.529h-390.27c32.3-51.484 91.14-115.032 142.36-141.514C1209.54 183.44 1371 98.391 1371 98.391V75.023c17.33-4.786 29.24-7.063 29.24-7.063v286.569Z"/><path fill="url(%23d)" d="M1152.33 213.015c-51.22 26.481-110.06 90.01-142.36 141.514-3.76 6.012-7.19 11.869-10.202 17.492-66.101-2.783-330.528 24.03-330.528 24.03s20.098-25.373 52.249-60.299c59.734-64.929 161.12-162.936 252.86-192.979 141.121-46.211 254.241-59.17 321.631-120.169 16.58-15.021 29.53-26.948 39.64-36.444 31.01-29.088 35.36-35.081 35.36-35.081V98.39s-161.46 85.048-218.67 114.624h.02Z"/><path fill="url(%23e)" d="M1335.64-13.858c-10.11 9.495-23.06 21.442-39.63 36.443-67.39 61.019-180.52 73.958-321.638 120.169-91.739 30.043-193.125 128.069-252.859 192.979-75.821 3.016-194.633 4.845-194.633 4.845s19.199-31.19 56.794-72.109c60.122-65.435 167.268-155.737 318.231-183.036C1134.18 43.424 1245.68-3.546 1287.11-52.365a107.92 107.92 0 0 0 6.37-8.27c35.6-51.775 50.84-68.411 50.84-68.411l-8.68 115.149v.039Z"/><path fill="url(%23f)" d="M901.905 85.452c-150.987 27.298-258.133 117.6-318.231 183.036H362.893s4.568-8.931 13.584-23.563C416.065 180.676 541.583 6.24 745.548-8.82c43.135-3.19 81.143-5.33 114.995-7.101 162.647-8.503 229.187-8.445 307.057-74.25 94.07-79.523 119.49-94.31 119.49-94.31v132.135c-41.44 48.819-152.93 95.79-385.209 137.798h.024Z"/><path fill="url(%23g)" d="M860.519-15.94c-33.852 1.77-71.86 3.91-114.996 7.101-203.964 15.06-329.483 189.496-369.07 253.745h-98.447s69.6-232.945 266.007-284.254C597.89-53.416 642.678-58.825 681.78-60.44c37.4-1.556 69.6.37 99.588 1.498 18.081 4.553 27.728 10.002 27.728 10.002s-3.378-3.795-10.328-9.476c45.833 1.05 87.608-1.907 136.819-25.314 119.493-56.855 129.993 0 129.993 0s-94.95 29.633-205.037 67.77l-.024.02Z"/><path fill="url(%23h)" d="M315.069-2.749c-43.038 27.747-77.644 57.595-105.445 87.52-58.567 62.984-87.073 126.24-100.901 170.739l-98.008 12.978s-1.045-12.55 6.707-37.631c9.332-30.236 31.446-78.705 83.574-145.405C196.331-36.566 387.027-62.444 387.027-62.444L315.069-2.729v-.02Z"/><path fill="url(%23i)" d="M292.955 290.669s-1.604-15.429 11.859-45.763h-26.781s69.6-232.945 266.007-284.254c53.877-14.068 98.665-19.477 137.767-21.092 43.986-8.133 77.862-3.97 99.588 1.498 5.881.214 11.665.409 17.4.545-34.411-27.98-156.916-101.723-399.01 9.476a718.117 718.117 0 0 0-30.353 14.826c-19.441 10.06-37.522 20.547-54.314 31.366-43.039 27.746-77.644 57.594-105.445 87.52-58.568 62.983-87.074 126.239-100.901 170.738-11.495 37.028-12.832 61.058-12.832 61.058l197.039-25.879-.024-.039Z"/><path fill="url(%23j)" d="m-80.344 161.647-30.329 11.908V-13.47L84.13-23.062C-8.022 40.66-55.75 109.637-80.344 161.647Z"/><path fill="url(%23k)" d="M100.995 85.452c-52.127 66.7-74.217 115.169-83.573 145.405l-123.648 14.049s2.601-34.031 25.882-83.259C-55.751 109.638-8.022 40.661 84.13-23.063c3.864-2.665 7.752-5.33 11.786-7.977 190.696-125.714 291.111-31.424 291.111-31.424S196.331-36.585 100.995 85.433v.019Z"/></g></g></g><defs><linearGradient id="c" x1="1036.64" x2="1325.31" y1="167.845" y2="351.362" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="d" x1="717.19" x2="1189.85" y1="106.175" y2="454.15" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="e" x1="582.736" x2="1094.11" y1="34.643" y2="450.166" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="f" x1="426.042" x2="929.344" y1="-26.597" y2="452.781" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="g" x1="331.821" x2="725.23" y1="14.356" y2="423.054" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="h" x1="36.384" x2="341.328" y1="52.904" y2="214.801" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="i" x1="143.966" x2="601.307" y1="39.761" y2="392.89" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><linearGradient id="j" x1="-45.995" x2="150.677" y1="50.7" y2="-81.575" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset="1" stop-color="%23fff"/></linearGradient><linearGradient id="k" x1="-72.522" x2="279.546" y1="22.557" y2="260.074" gradientUnits="userSpaceOnUse"><stop stop-color="%23fff" stop-opacity="0"/><stop offset=".943" stop-color="%23fff"/></linearGradient><clipPath id="a"><path fill="%23fff" d="M0 8a8 8 0 0 1 8-8h1330c4.42 0 8 3.582 8 8v191a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8Z"/></clipPath></defs></svg>');
  }
}
</style>
