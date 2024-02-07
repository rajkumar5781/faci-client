<template>
  <div>
    <div v-if="!hasMetaLoaded">
      <Loader />
    </div>
    <PortalLayout
      v-else
      :webTabGroup="webTabGroup"
      :selectedTabId="selectedTabId"
      :selectedGroupId="selectedGroupId"
      :account="$account"
      :i18nText="i18nText"
      :showBanner="isSandboxDomain"
      @switchTab="switchTab"
      @logoutApp="logoutApp"
      @profileRedirection="profileRedirection"
    >
      <template #org-logo>
        <FContainer tag="a" height="32px" cursor="pointer" @click="onLogoClick">
          <img
            v-if="hasLogo"
            :src="getLogoUrl($account.org)"
            height="100%"
            width="100%"
            class="object-scale-down"
          />
          <FacilioLogo v-else height="100%" width="100%"></FacilioLogo>
        </FContainer>
      </template>
      <template #notification>
        <NotificationPanel />
      </template>
      <template #poweredBy>
        <FContainer
          padding="containerMedium containerLarge"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="fit-content"
          style="margin: auto; white-space: nowrap"
        >
          <FText appearance="captionReg10" color="textDescription">
            Powered By
          </FText>
          <FacilioLogo height="16px" width="48px"></FacilioLogo>
        </FContainer>
      </template>
      <router-view />
    </PortalLayout>
  </div>
</template>
<script>
import { PortalLayout } from '@facilio/ui/layouts'
import Loader from '../components/Loader.vue'
import HomeMixin from '../mixin/HomeMixin.vue'
import { getApp, findRouteForTab } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import sortBy from 'lodash/sortBy'
import RouteIntializer from '../mixin/RouteIntializer.vue'
import getProperty from 'dlv'
import NotificationPanel from '../common/NotificationPanel.vue'
import { FContainer, FText } from '@facilio/design-system'
import FacilioLogo from '../../assets/facilio/logo.svg'

const env = import.meta.env

export default {
  mixins: [HomeMixin, RouteIntializer],
  components: {
    PortalLayout,
    Loader,
    FContainer,
    FText,
    NotificationPanel,
    FacilioLogo,
  },
  computed: {
    isSandboxDomain() {
      let { org } = this.$account || {}
      let { dataTypeEnum } = org || {}
      return dataTypeEnum === 'SANDBOX'
    },
    webTabGroup() {
      let { getTabGroups } = this
      let webTabGroups = getTabGroups().filter(
        g => g.route !== 'setup' && !isEmpty(g.webTabs)
      )
      webTabGroups = webTabGroups.map(group => {
        let { id: groupId } = group || {}
        let webTabs = this.getTabs(groupId)
        webTabs = sortBy(webTabs, ['order'])
        return { ...group, webTabs }
      })
      return webTabGroups
    },
    selectedTabId() {
      return this.selectedTab?.id || null
    },
    selectedGroupId() {
      return this.selectedTabGroup?.id || null
    },
    hasLogo() {
      return getProperty(this.$account, 'org.logoUrl')
    },
    i18nText() {
      return {
        collapse: this.$t('app_layout.collapse', 'Collapse'),
        expand: this.$t('app_layout.expand', 'Expand'),
        logout: this.$t('app_layout.logout', 'Logout'),
      }
    },
  },
  methods: {
    switchTab(tab) {
      let { name, defaultParam } = findRouteForTab(tab.id)
      if (name) {
        this.$router.push({ name, params: { ...(defaultParam || {}) } })
      }
    },
    logoutApp() {
      this.$router.push({ path: '/logout' })
    },
    onLogoClick() {
      this.$router.push({ path: '/' })
    },
    getLogoUrl(org) {
      if (org && org.logoUrl) {
        return this.prependBaseUrl(org.logoUrl)
      }
      return null
    },
    prependBaseUrl(url) {
      if (env.MODE === 'development') {
        return env.VITE_BASE_URL + url
      } else {
        return url
      }
    },
    profileRedirection() {
      let { linkName, orgSubDomain } = getApp() || {}
      this.$router.push({
        name: 'profile',
        params: { app: linkName, orgSubDomain },
      })
    },
    notificationRedirect() {
      let { linkName, orgSubDomain } = getApp() || {}
      this.$router.push({
        name: 'notification',
        params: { app: linkName, orgSubDomain },
      })
    },
  },
}
</script>
