<template>
  <FContainer overflow="scroll">
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FEmptyState
      v-else-if="isEmpty(hierarchyList)"
      description="No location specified for this work order."
      vertical
      size="S"
      illustration="broken-location"
      type="narrow"
    />
    <FContainer
      v-else
      display="flex"
      justifyContent="space-between"
      gap="sectionLarge"
      padding="containerXxLarge containerNone"
      marginRight="sectionLarge"
    >
      <FContainer :width="this.currentLocation ? '70%' : '100%'">
        <FContainer
          class="cursor-pointer text-underline hover"
          padding="containerNone containerXxLarge"
          overflow="hidden"
          textOverflow="ellipsis"
          white-space="nowrap"
          @click="
            workorder.resource.resourceType === 2
              ? openAsset(workorder.resource.id)
              : redirect(hierarchyList[hierarchyList.length - 1].routeParams)
          "
        >
          <FTooltip placement="top" :mouseEnterDelay="1">
            <template #title>{{ workorder.resource.name }}</template>
            <FText appearance="headingMed14" color="backgroundPrimaryPressed">{{
              workorder.resource.name
            }}</FText>
          </FTooltip>
        </FContainer>

        <FContainer padding="containerLarge containerXxLarge" height="100%">
          <FContainer
            v-for="(item, index) in reversedhierarchyList"
            :key="index"
            width="100%"
            display="flex"
          >
            <FContainer
              v-if="
                workorder.resource.resourceType === 2 ||
                index != reversedhierarchyList.length
              "
              @click="redirect(item.routeParams)"
              marginRight="containerMedium"
              overflow="hidden"
              textOverflow="ellipsis"
              white-space="nowrap"
              class="cursor-pointer text-underline hover"

            >
              <FTooltip placement="top" :mouseEnterDelay="1">
                <template #title>{{ item.displayName }}</template>
                <FText
                  appearance="captionReg12"
                  color="backgroundPrimaryPressed"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  >{{ item.displayName }}</FText
                >
              </FTooltip>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="inline-flex"
        flex-direction="column"
        gap="containerMedium"
        marginTop="containerXxLarge"
      >
      <FContainer textAlign="center">
          <FIcon class="h-8 w-12" group="illustration" name="location"></FIcon>
        </FContainer> 
        <FContainer
          display="flex"
          marginTop="containerXLarge"
          justifyContent="center"
          v-if="this.currentLocation"
        >
          <FButton appearance="link" size="small">
            <a :href="getMapLink()" target="_blank">View on maps</a>
          </FButton>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FEmptyState,
  FText,
  FIcon,
  FButton,
  FTooltip,
  FSpinner,
} from '@facilio/design-system'
import spaceCardMixin from './SpaceCardMixin'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { Glimpse } from '@facilio/ui/new-app'
import { findRouteForModule, pageTypes ,isWebTabsEnabled} from '@facilio/router'
import { getBaseURL } from '../../../../utils/api/base-url'
import {
  getTimeZone,
  getDateFormat,
  getTimeFormat,
} from '../../../../utils/formatter'
import getProperty from 'dlv'
export default {
  props: ['moduleName', 'details'],
  mixins: [spaceCardMixin],
  components: {
    FContainer,
    FEmptyState,
    FIcon,
    FText,
    FButton,
    FTooltip,
    FSpinner,
  },
  data() {
    return {
      hierarchyList: [],
      loading: false,
      site: null,
      currentLocation: '',
      fieldDetail: {},
    }
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Resource'
    },
    workorder() {
      return this.details
    },
    getSpaceorAsset() {
      return this.details.resource?.name ? this.details.resource.name : '___'
    },
    multiCurrency() {
      let { displaySymbol, currencyCode, multiCurrencyEnabled } =
        this.$account.data.currencyInfo || {}
      return { displaySymbol, currencyCode, multiCurrencyEnabled }
    },
    config() {
      let { multiCurrency } = this
      return {
        dateformat: getDateFormat(),
        timezone: getTimeZone(),
        timeformat: getTimeFormat,
        org: this.$account.org,
        multiCurrency,
        baseUrl: getBaseURL(),
      }
    },
    reversedhierarchyList() {
      let copiedList = this.hierarchyList.slice()
      if (this.details.resource.resourceType !== 2) {
        copiedList.pop()
      }
      return copiedList.reverse()
    },
  },
  created() {
    this.loadResourceDetails()
    this.resolveSiteName()
  },
  methods: {
    isEmpty,
    async getUnRelatedModuleSummary(
      moduleName,
      unRelatedModuleName,
      id,
      params
    ) {
      let { force = false } = params || {}
      let url = `v3/unrelated/${moduleName}/fetch/${unRelatedModuleName}/${id}`
      let { error, data } = await API.get(url, params, { force })

      return { error, ...data }
    },
    async openAsset(id) {
      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule('asset', pageTypes.OVERVIEW) || {}

        if (name) {
          this.$router.push({ name, params: { id } })
        }
      }
    },
    async fetchView(moduleName) {
      try {
        let params = { moduleName, groupType: 1, viewType: 1 }
        let { data, error } = await API.get(`/v2/views/${moduleName}/viewList`, params)
        if (!error) {
          let { groupViews } = data || {}
          return this.getFirstView(groupViews)
        }
      } catch (error) {
        return 'all'
      }
    },

    getFirstView(groupViews) {
      let { views } =
        (groupViews || []).find(group => !isEmpty(group.views)) || {}
      let { name } = getProperty(views, '0', {})

      return name || 'all'
    },
    async loadResourceDetails() {
      this.loadWorkorderFields()
      this.hierarchyList = []
      let resource = getProperty(
        this.workorder,
        `${this.resourceFieldKey || 'resource'}`
      )
      if (!isEmpty(resource)) {
        let resourceId = resource.id
        if (resource.resourceType === 2) {
          this.loading = true
          let { data, error } = await API.get(
            `/v2/assets/${resourceId}?fetchHierarchy=true`
          )
          if (error) {
            this.$message.error(error.message || 'Error Occurred')
          } else if (data?.asset?.space) {
            this.hierarchyList = await this.initHierarchy(data?.asset?.space)
            this.currentLocation = data?.asset?.currentLocation
          }
          this.loading = false
        } else {
          this.loading = true
          let { data, error } = await API.get(
            `/v2/basespaces/${resourceId}?fetchDeleted=true`
          )
          if (error) {
            this.$message.error(error.message || 'Error Occurred')
          } else if (data?.basespace) {
            this.hierarchyList = await this.initHierarchy(data?.basespace)
            this.currentLocation = data?.basespace?.currentLocation
          }
          this.loading = false
        }
      }
    },
    siteRoute() {
      let parentPath = this.findRoute()

      if (parentPath) {
        this.$router.push({
          path: `${parentPath}/site/${this.workorder.siteId}/overview`,
        })
      }
    },

    openFloorplan(resource) {
      if (resource && resource.floorId && resource.id) {
        this.$set(this.floorPlanViewMode, 'floorId', resource.floorId)
        this.$set(this.floorPlanViewMode, 'focus', {
          spaceId: resource.id,
        })
        this.floorplanVisible = true
      }
    },
    async resolveSiteName() {
      let { workorder } = this
      let { siteId } = workorder || {}

      if (!isEmpty(siteId)) {
        let { site } = await this.getUnRelatedModuleSummary(
          'workorder',
          'site',
          siteId
        )
        this.site = site || {}
      }
    },
    getMapLink() {
      let href = `https://www.google.com/maps/search/?api=1&query=${this.currentLocation}`
      return href
    },
    async loadWorkorderFields() {
      let params = {
        moduleName: 'workorder',
      }
      let { data, error } = await API.get(`v2/modules/fields/fields`, params)
      if (!error) {
        this.ticketFields = data?.fields || {}
        this.fieldDetail = this.ticketFields.find(
          item => item.name === 'resource'
        )
        this.fieldDetail.lookupModuleName = 'resource'
        //this.$set(this.fieldDetail, 'field', field)
        return this.fieldDetail
      }
      return this.fieldDetail
    },
    async redirectToSummary(field) {
      let { workorder } = this
      let id = workorder.resource.id || {}
      let moduleName = 'asset'
      let viewname = await this.fetchView(moduleName)
      let routerPath = null
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({ name, params: { viewname, id } })
      }
      !!routerPath && window.open(routerPath?.href, '_blank')
    },
  },
}
</script>
<style>
.icon-class-map {
  width: 47px;
  height: 36px;
}
.text-underline:hover {
  text-decoration:underline;
  }
</style>
