<template lang="">
  <div class="sfw-container">
    <FContainer v-if="isLoading" class="spinner-position">
      <FSpinner :size="30" ref="content-container"></FSpinner>
    </FContainer>
    <div v-else-if="isEmpty(detailsLayout)" class="sfw-empty-state-container">
      <FEmptyState
        title="        We were not able to show the required info, please retry later !!"
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </div>
    <FContainer
      padding="containerNone containerLarge"
      style="height: 100%"
      ref="content-container"
      v-else
    >
      <FieldsGroup
        style="overflow: hidden"
        :detailsLayout="detailsLayout"
        :details="details"
        :config="config"
        :sites="sites"
        :getRoute="getRoute"
        @mounted="emitMount"
        @redirectToSummary="redirectToSummary"
        :getTimeZone="getTimeZone"
      ></FieldsGroup>
    </FContainer>
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
  </div>
</template>
<script>
import { FieldsGroup } from '@facilio/ui/new-app'
import PreviewFile from './FilePreview.vue'
import { isEmpty } from '@facilio/utils/validation'
import { getFieldOptions } from '../../../../utils/picklist'
import { getBaseURL } from '../../../../utils/api/base-url'
import {
  FContainer,
  FSpinner,
  FText,
  FModal,
  FEmptyState,
} from '@facilio/design-system'
import FetchViewsMixin from '../../../views/FetchViews.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import dlv from 'dlv'
import { getTimeFormat, getTimeZone } from '../../../../utils/formatter'

export default {
  props: ['details', 'moduleName', 'detailsLayout', 'siteList'],
  mixins: [FetchViewsMixin],
  components: {
    FieldsGroup,
    PreviewFile,
    FContainer,
    FSpinner,
    FEmptyState,
  },
  data() {
    return {
      isLoading: false,
      exportDownloadUrl: null,
      showPreview: false,
      previewFile: null,
      sites: [],
      isEmpty,
      getTimeZone,
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    multiCurrency() {
      let { displaySymbol, currencyCode, multiCurrencyEnabled } =
        this.$account.data.currencyInfo || {}
      return { displaySymbol, currencyCode, multiCurrencyEnabled }
    },
    config() {
      let { multiCurrency, $account: account } = this
      let timeformat = getTimeFormat()
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      let dateformat = dlv(account, 'org.dateFormat')
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
      await this.fetchSites()
      this.$nextTick(() => {
        this.isLoading = false
      })
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW)
    },
    emitMount() {
      this.$emit('mounted')
    },
    async fetchSites() {
      let { details } = this
      let siteId = details?.siteId || null

      if (isEmpty(siteId)) return
      if (isEmpty(this.siteList) && !isEmpty(siteId)) {
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
  },
}
</script>
<style lang="scss">
.view-more {
  flex-grow: 1;
  padding: 12px;
  .view-text {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.sfw-container {
  .spinner-position {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .footer-part {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    padding: 10px;
  }
}
</style>
