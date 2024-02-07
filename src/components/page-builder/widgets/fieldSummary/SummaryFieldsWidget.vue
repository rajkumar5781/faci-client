<template>
  <FContainer :height="!isLoading && 'fit-content !important'">
    <portal :to="footerPortal">
      <FContainer
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="containerLarge containerXLarge"
        color="borderPrimaryDefault"
        class="m-auto"
        v-if="showShowMore && !isEmpty(detailsLayout)"
      >
        <FContainer padding="containerMedium containerLarge">
          <FButton
            @click="toggleVisibility"
            appearance="link"
            size="medium"
            iconGroup="navigation"
            iconName="diagonal-expand"
            iconPosition="prefix"
          >
            {{ $t('summary.view_more', 'View More') }}
          </FButton>
        </FContainer>
      </FContainer></portal
    >
    <FContainer
      v-if="isLoading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="30" ref="content-container"></FSpinner>
    </FContainer>
    <FContainer v-else-if="isEmpty(detailsLayout)">
      <FEmptyState
        :title="
          $t(
            'summary.page_api_fail',
            'We were not able to show the required info, please retry later !!'
          )
        "
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </FContainer>
    <FContainer
      :padding="containerPadding"
      overflow="hidden"
      height="fit-content"
      v-else
    >
      <FieldsGroup
        style="overflow: hidden"
        ref="content-container"
        :title="widgetTitle"
        :detailsLayout="clippedLayout"
        :details="details"
        :config="config"
        :getRoute="getRoute"
        :sites="sites"
        :size="size"
        @mounted="callResize"
        @redirectToSummary="redirectToSummary"
        :getTimeZone="getTimeZone"
      ></FieldsGroup>
    </FContainer>
    <FModal
      :visible="canShowInPopOver"
      @cancel="() => (canShowInPopOver = !canShowInPopOver)"
      :title="widgetTitle"
      :hideFooter="true"
      size="L"
    >
      <FContainer
        padding="containerNone containerXxLarge"
        style="height:100%, overflow:hidden"
      >
        <FieldsGroup
          style="overflow: hidden"
          :title="widgetTitle"
          :detailsLayout="detailsLayout"
          :details="details"
          :config="config"
          :sites="sites"
          :insidePop="true"
          :getRoute="getRoute"
          :getTimeZone="getTimeZone"
          @redirectToSummary="redirectToSummary"
          @possibleOverflow="setShowMore"
        ></FieldsGroup>
      </FContainer>
    </FModal>

    <iframe
      v-if="exportDownloadUrl"
      :src="exportDownloadUrl"
      style="display: none"
    ></iframe>
    <PreviewFile
      :visibility.sync="showPreview"
      v-if="showPreview"
      :previewFile="previewFile"
      :files="[previewFile]"
    ></PreviewFile>
  </FContainer>
</template>
<script>
import { FieldsGroup } from '@facilio/ui/new-app'
import PreviewFile from './FilePreview.vue'
import { isEmpty } from '@facilio/utils/validation'
import { getFieldOptions } from '../../../../utils/picklist.js'
import { getBaseURL } from '../../../../utils/api/base-url.js'
import {
  FContainer,
  FSpinner,
  FText,
  FModal,
  FIcon,
  FEmptyState,
  FButton,
} from '@facilio/design-system'
import FetchViewsMixin from '../../../views/FetchViews.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import dlv from 'dlv'
import { getTimeFormat, getTimeZone } from '../../../../utils/formatter'

export default {
  props: [
    'layoutParams',
    'details',
    'moduleName',
    'primaryFields',
    'widget',
    'siteList',
    'calculateDimensions',
    'resizeWidget',
    'hideTitleSection',
    'footerPortal',
    'fitMyContent',
    'isContentOverflowed',
  ],
  mixins: [FetchViewsMixin],
  components: {
    FieldsGroup,
    PreviewFile,
    FContainer,
    FSpinner,
    FText,
    FModal,
    FIcon,
    FEmptyState,
    FButton,
  },
  data() {
    return {
      title: null,
      isLoading: false,
      exportDownloadUrl: null,
      showPreview: false,
      previewFile: null,
      needsShowMore: false,
      canShowInPopOver: false,
      sites: {},
      clippedLayout: [],
      contentHidden: false,
      detailsLayout: [],
      defaultWidgetHeight: (this.layoutParams || {}).h,
      isEmpty,
      visibleRowCount: 3,
      isV2: false,
      getTimeZone,
    }
  },
  created() {
    this.init()
  },
  computed: {
    multiCurrency() {
      let { displaySymbol, currencyCode, multiCurrencyEnabled } =
        this.$account.data.currencyInfo || {}
      return { displaySymbol, currencyCode, multiCurrencyEnabled }
    },
    containerPadding() {
      return !this.isV2
        ? 'containerNone containerXLarge containerXLarge containerXLarge'
        : ''
    },
    widgetTitle() {
      return this.widget?.displayName || ''
    },
    showShowMore() {
      let { needsShowMore, contentHidden } = this
      return contentHidden || needsShowMore
    },
    size() {
      let { size } = this.widget || {}
      return size || 'medium'
    },
    config() {
      let { multiCurrency, $account: account } = this
      let timeformat = getTimeFormat()
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      let dateformat = dlv(account, 'org.dateFormat') || 'DD/MM/YYYY'
      return {
        dateformat: dateformat,
        timezone: timezone,
        timeformat: timeformat,
        org: this.$account.org,
        multiCurrency,
        baseUrl: getBaseURL(),
      }
    },
  },
  methods: {
    async init() {
      this.isLoading = true
      this.detailsLayout = dlv(this.widget, 'widgetDetail.groups') || []
      this.visibleRowCount =
        dlv(this.widget, 'widgetDetail.visibleRowCount') || 3

      this.clipGroups()
      await this.fetchSites()
      this.$nextTick(() => {
        this.isLoading = false
      })
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW)
    },
    clipGroups() {
      let { detailsLayout, visibleRowCount } = this
      let rowCount = 0,
        isGroupCrippled = false
      let clippedLayout = []
      detailsLayout.forEach(group => {
        if (isGroupCrippled || rowCount === visibleRowCount) {
          isGroupCrippled = true
        } else {
          let { fields } = group
          let croppedFields = (fields || []).filter(field => {
            return field.rowIndex + rowCount <= visibleRowCount
          })
          isGroupCrippled = croppedFields.length < fields?.length
          let [lastField] = (fields || []).slice(-1)
          rowCount += lastField?.rowIndex
          clippedLayout.push({ ...group, fields: croppedFields })
        }
      })
      this.clippedLayout = clippedLayout
      this.contentHidden = isGroupCrippled
    },
    setShowMore() {
      this.contentHidden = true
    },
    callResize() {
      if (isEmpty(this.detailsLayout)) this.resizeWidget({ height: 264 })
      else this.autoResize()
    },
    async fetchSites() {
      let { details, moduleName } = this
      let siteId = details?.siteId || null

      if (isEmpty(siteId)) return
      if (isEmpty(this.siteList) && moduleName !== 'site' && !isEmpty(siteId)) {
        let { error, options } = await getFieldOptions({
          field: {
            lookupModuleName: 'site',
            skipDeserialize: true,
            name: 'siteId',
          },
          defaultIds: [siteId],
          perPage: 1,
          parentModuleName: this.moduleName,
        })
        if (!error && !isEmpty(options[siteId])) {
          this.sites = options
        }
      } else this.sites = this.siteList
    },
    async redirectToSummary(field) {
      let { moduleName, id } = field || {}
      let viewname = await this.fetchView(moduleName)
      let routerPath = null
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({
          name,
          params: { viewname, id, moduleName },
        })
      }
      !!routerPath && window.open(routerPath?.href, '_blank')
    },
    toggleVisibility() {
      this.canShowInPopOver = !this.canShowInPopOver
    },
    autoResize() {
      this.$nextTick(() => {
        this.fitMyContent()
        setTimeout(() => {
          this.isContentOverflowed(10) && this.setShowMore()
        }, 200)
      })
    },
  },
}
</script>
