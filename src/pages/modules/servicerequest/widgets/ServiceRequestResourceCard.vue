<template>
  <FContainer>
    <FContainer
      v-if="!isEmpty(details.resource)"
      display="flex"
      justifyContent="space-between"
      gap="sectionLarge"
      padding="containerXLarge containerNone"
      marginRight="sectionLarge"
    >
      <FContainer
        :width="this.currentLocation ? '70%' : '100%'"
        height="100px"
        class="overflow-y-scroll"
      >
        <FContainer
          paddingLeft="containerXxLarge"
          paddingRight="containerXxLarge"
          width="100%"
          overflow="hidden"
          whiteSpace="nowrap"
        >
          <Glimpse
            :record="details"
            :field="fieldDetail"
            recordModuleName="serviceRequest"
            :canShowLink="true"
            :config="config"
            @redirectToSummary="redirectToSummary"
          />
        </FContainer>
        <FContainer padding="containerLarge containerXxLarge" width="100%">
          <FContainer
            v-for="(item, index) in hierarchyList"
            :key="index"
            width="100%"
          >
            <FContainer
              @click="redirect(item.routeParams)"
              v-if="redirectionCheck(index)"
              class="truncate"
            >
              <FTooltip placement="top" :mouseEnterDelay="1">
                <template slot="title">
                  {{ item.displayName }}
                </template>
                <FText appearance="bodyReg14" color="textMain">
                  {{ item.displayName }}
                  <!-- <FText v-if="showHierarchy(index)">, </FText> -->
                </FText>
              </FTooltip>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="inline-flex"
        flex-direction="column"
        gap="containerMedium"
        v-if="this.currentLocation"
      >
        <FIcon
          group="illustration"
          name="location"
          size="50"
          :pressable="false"
        ></FIcon>
        <FContainer display="flex" justifyContent="center">
          <FButton appearance="link" size="small">
            <a
              :href="getMapLink()"
              target="_blank"
              style="text-decoration: none"
              >{{ $t('service_request.map', { ns: 'servicerequest' }) }}
            </a>
          </FButton>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer v-else>
      <FContainer
        v-if="!isEmpty(site)"
        display="flex"
        padding="containerMedium"
        width="90%"
      >
        <FContainer
          padding="containerXLarge"
          @click="siteRoute()"
          width="70%"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          cursor="pointer"
        >
          <FTooltip placement="top" :mouseEnterDelay="1">
            <template slot="title">
              {{ getSiteName }}
            </template>
            <FText appearance="bodyReg14">
              {{ getSiteName }}
            </FText>
          </FTooltip>
        </FContainer>
        <FContainer padding="containerLarge" v-if="this.currentLocation">
          <FIcon
            group="illustration"
            name="location"
            :pressable="false"
            size="50"
          ></FIcon>
          <FContainer
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FButton appearance="link" size="small">
              <a
                :href="getMapLink()"
                target="_blank"
                style="text-decoration: none"
                >{{ $t('service_request.map', { ns: 'servicerequest' }) }}
              </a>
            </FButton>
          </FContainer>
        </FContainer>
      </FContainer>
      <div v-else-if="loading"><ServiceRequestResourceCardShimmer /></div>
      <FContainer
        v-else-if="!loading && isEmpty(site)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        padding="containerXLarge"
      >
        <div>
          <FIcon
            group="illustration"
            name="broken-location"
            size="60"
            :pressable="false"
          />
        </div>
        <FContainer marginTop="containerMedium">
          <FText color="textCaption" appearance="bodyReg14">
            {{
              $t(
                'service_request.no_location_specified_for_this_service_request',
                { ns: 'servicerequest' }
              )
            }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FIcon,
  FButton,
  ftoast,
  FEmptyState,
  FTooltip,
  FShimmer,
} from '@facilio/design-system'
import spaceCardMixin from '../../workorder/widgets/SpaceCardMixin'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { Glimpse } from '@facilio/ui/new-app'
import ServiceRequestResourceCardShimmer from './ServiceRequestResourceCardShimmer.vue'
import {
  findRouteForModule,
  pageTypes,
  isWebTabsEnabled,
  findRouteForTab,
} from '@facilio/router'
import { getBaseURL } from '../../../../utils/api/base-url'
import {
  getTimeZone,
  getDateFormat,
  getTimeFormat,
} from '../../../../utils/formatter'
import getProperty from 'dlv'
import FetchViews from '../../../../components/views/FetchViews.vue'
import { getUnRelatedModuleSummary } from '../../../../utils/relatedFieldUtil'

export default {
  props: ['moduleName', 'details'],
  mixins: [spaceCardMixin, FetchViews],
  components: {
    FContainer,
    FIcon,
    FText,
    FButton,
    Glimpse,
    ftoast,
    FEmptyState,
    FTooltip,
    FShimmer,
    ServiceRequestResourceCardShimmer,
  },
  data() {
    return {
      hierarchyList: [],
      loading: false,
      site: null,
      currentLocation: '',
      fieldDetail: {},
      widgetTitle: 'Resource',
      isEmpty,
    }
  },
  computed: {
    getSiteName() {
      let { site = {} } = this
      let { name = '---' } = site
      return name
    },
    getSpaceorAsset() {
      return this.details.resource?.name ? this.details.resource.name : '___'
    },
    multiCurrency() {
      let { $account } = this
      let { data } = $account || {}
      let { currencyInfo } = data || {}
      let { displaySymbol, currencyCode, multiCurrencyEnabled } =
        currencyInfo || {}
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
  },
  created() {
    this.loadResourceDetails()
    this.resolveSiteName()
  },
  methods: {
    async openAsset(id) {
      let viewname = await this.fetchView('asset')

      let { name } = findRouteForModule('asset', pageTypes.OVERVIEW) || {}

      if (name) {
        this.$router.push({ name, params: { viewname, id } })
      }
    },
    async loadResourceDetails() {
      this.loadServiceRequestsFields()
      this.hierarchyList = []
      let resource = getProperty(
        this.details,
        `${this.resourceFieldKey || 'resource'}`
      )
      if (!isEmpty(resource)) {
        let resourceId = resource.id
        if (resource.resourceType === 2) {
          this.loading = true
          let { data, error } = await API.get(
            `/v2/serviceRequest/assets/${resourceId}?fetchHierarchy=true`
          )
          if (error) {
            ftoast.critical(error.message || 'Error Occurred')
          } else if (data?.asset?.space) {
            this.hierarchyList = await this.initHierarchy(data?.asset?.space)
            this.currentLocation = data?.asset?.currentLocation
          }
          this.loading = false
        } else {
          this.loading = true
          let { data, error } = await API.get(
            `/v2/serviceRequest/basespaces/${resourceId}?fetchDeleted=true`
          )
          if (error) {
            ftoast.critical(error.message || 'Error Occurred')
          } else if (data?.basespace) {
            this.hierarchyList = await this.initHierarchy(data?.basespace)
            this.currentLocation = data?.basespace?.currentLocation
          }
          this.loading = false
        }
      }
    },
    siteRoute() {
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      let id = getProperty(this.site, 'id', null)

      if (name) {
        this.$router.push({
          name,
          params: {
            id,
            moduleName: 'site',
          },
        })
      }
    },
    async resolveSiteName() {
      this.loading = true
      let { details } = this
      let { siteId } = details || {}

      if (!isEmpty(siteId)) {
        let { site } = await getUnRelatedModuleSummary(
          'serviceRequest',
          'site',
          siteId
        )
        this.site = site || {}
      }
      this.loading = false
    },
    getMapLink() {
      let href = `https://www.google.com/maps/search/?api=1&query=${this.currentLocation}`
      return href
    },
    async loadServiceRequestsFields() {
      let params = {
        moduleName: 'serviceRequest',
      }
      let { data, error } = await API.get(`v2/modules/fields/fields`, params)
      if (!error) {
        this.ticketFields = data?.fields || {}
        this.fieldDetail = this.ticketFields.find(
          item => item.name === 'resource'
        )
        this.fieldDetail.lookupModuleName = 'resource'
      }
      return this.fieldDetail
    },
    async redirectToSummary(field) {
      let { details } = this
      let id = details.resource.id || {}
      let moduleName = 'asset'
      let viewname = await this.fetchView(moduleName)
      let routerPath = null
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({ name, params: { viewname, id } })
      }
      !!routerPath && window.open(routerPath?.href, '_blank')
    },
    redirectionCheck(index) {
      let { details, hierarchyList } = this
      let { resource } = details || {}
      let resourceType = getProperty(resource, 'resourceType', null)
      return resourceType === 2 || index != hierarchyList.length - 1
    },
    showHierarchy(index) {
      let { details, hierarchyList } = this
      let { resource } = details || {}
      let resourceType = getProperty(resource, 'resourceType', null)

      return (
        (resourceType === 2 && index !== hierarchyList.length - 1) ||
        (resourceType !== 2 &&
          hierarchyList.length > 1 &&
          index !== hierarchyList.length - 2)
      )
    },
  },
}
</script>
