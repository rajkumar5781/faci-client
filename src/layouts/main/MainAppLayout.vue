<template>
  <div>
    <div v-if="!hasMetaLoaded">
      <Loader />
    </div>
    <MainLayout
      v-else-if="!isAppEmpty"
      :app="application"
      :selectedTab="selectedTab"
      :selectedGroup="selectedTabGroup"
      :showSetup="showSetup"
      :showBanner="isSandboxDomain"
      @switchTab="switchTab"
      @onSetupClick="redirectToSetup"
    >
      <template #org-logo>
        <img class="fc-rebrand-logo" :src="brandConfig.logo" alt="Logo" />
      </template>
      <template #menubar>
        <GlobalSwitch />
        <NotificationPanel />
        <ProfilePanel />
      </template>
      <template #app-switch>
        <FPopover
          v-if="showAppSwitch"
          :showArrow="true"
          placement="right-end"
          trigger="clickToOpen"
          @show="updateIconColors(true)"
          @hide="updateIconColors(false)"
        >
          <div
            v-if="showPopover"
            style="width: 300px; max-height: 450px"
            slot="content"
          >
            <FContainer
              borderBottom="solid 1px"
              height="49px"
              padding="containerXxLarge containerXLarge"
              borderColor="borderNeutralGrey02Light"
              class="flex justify-between"
            >
              <FText appearance="headingMed14">
                {{ $t('my_app.switch_app', 'Switch App', { ns: 'account' }) }}
              </FText>
              <FContainer
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <FButton
                  @click="closePopover"
                  appearance="tertiary"
                  height="100%"
                >
                  <FIcon
                    group="action"
                    name="cross"
                    size="16"
                    :pressable="false"
                  ></FIcon>
                </FButton>
              </FContainer>
            </FContainer>
            <FContainer
              padding="containerNone containerLarge"
              maxHeight="400px"
              overflow="scroll"
            >
              <FContainer v-for="app in myApps" :key="app.id">
                <FMenuItem :isSelected="app.isSelected" @click="switchApp(app)">
                  <FContainer display="flex" gap="containerLarge">
                    <FContainer
                      display="flex"
                      alignItems="flext-start"
                      justifyContent="center"
                    >
                      <fc-image
                        :name="app.iconName"
                        height="40"
                        width="40"
                      ></fc-image>
                    </FContainer>
                    <FContainer
                      display="flex"
                      flexDirection="column"
                      columnGap="containerSmall"
                    >
                      <FText appearance="headingMed14"> {{ app.name }} </FText>
                      <FText appearance="captionReg12" color="textCaption">{{
                        app.description
                      }}</FText>
                    </FContainer>
                  </FContainer>
                </FMenuItem>
              </FContainer>
            </FContainer>
          </div>
          <FContainer
            padding="containerLarge"
            borderRadius="medium"
            class="flex justify-center cursor-pointer"
            :backgroundColor="iconBackgroundColor"
            marginBottom="containerXLarge"
          >
            <fc-icon
              group="action"
              name="app-switcher"
              size="20"
              :color="iconColor"
            />
          </FContainer>
        </FPopover>
      </template>
      <router-view />
    </MainLayout>
  </div>
</template>

<script>
import { MainLayout } from '@facilio/ui/layouts'
import Loader from '../components/Loader.vue'
import HomeMixin from '../mixin/HomeMixin.vue'
import { findRouteForTab, getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import sortBy from 'lodash/sortBy'
import RouteIntializer from '../mixin/RouteIntializer.vue'
import ProfilePanel from '../common/ProfilePanel.vue'
import NotificationPanel from '../common/NotificationPanel.vue'
import GlobalSwitch from '../common/GlobalSwitch.vue'
import {
  FContainer,
  FPopover,
  FIcon,
  FMenuItem,
  FText,
  FButton,
} from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  name: 'MainAppLayout',
  mixins: [HomeMixin, RouteIntializer],
  components: {
    MainLayout,
    Loader,
    ProfilePanel,
    NotificationPanel,
    GlobalSwitch,
    FContainer,
    FPopover,
    FIcon,
    FMenuItem,
    FText,
    FButton,
  },
  data() {
    return {
      myApps: [],
      iconColor: 'var(--colors-iconNeutralDefault)',
      iconBackgroundColor: 'backgroundCanvas',
      showPopover: false,
    }
  },
  mounted() {
    setTimeout(() => {
      this.loadApps()
    }, 2000)
  },
  computed: {
    brandConfig() {
      return window.brandConfig
    },
    application() {
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
      return { ...getApp(), webTabGroups }
    },
    isAppEmpty() {
      let { application } = this || {}
      return isEmpty(application)
    },
    showSetup() {
      return getApp().hasSetupPermission
    },
    isSandboxDomain() {
      let { org } = this.$account || {}
      let { dataTypeEnum } = org || {}
      return dataTypeEnum === 'SANDBOX'
    },
    showAppSwitch() {
      let { myApps } = this || []
      return myApps.length > 1
    },
    currentAppLinkName() {
      return getApp()?.linkName
    },
  },
  methods: {
    switchTab(tab) {
      let { name, defaultParam } = findRouteForTab(tab.id)
      if (name) {
        this.$router.push({ name, params: { ...(defaultParam || {}) } })
      }
    },
    redirectToSetup() {
      let { linkName, orgSubDomain } = getApp() || {}
      let orgSubDomainPath = orgSubDomain ? `/${orgSubDomain}` : ''
      window.open(`${orgSubDomainPath}/setup/${linkName}/home`, '_blank')
    },
    updateIconColors(isPopoverVisible) {
      if (isPopoverVisible) {
        this.showPopover = true
        this.iconColor = 'var(--colors-iconNeutralInverse)'
        this.iconBackgroundColor = 'backgroundAccentVioletSelection'
      } else {
        this.showPopover = false
        this.iconColor = 'var(--colors-iconNeutralDefault)'
        this.iconBackgroundColor = 'backgroundCanvas'
      }
    },
    async loadApps() {
      let { data, error } = await API.get(
        `v2/application/list?fetchMyApps=true`
      )
      if (!error) {
        this.myApps = data.application || []
        let allowedAppCategory = ['FEATURE_GROUPING', 'WORK_CENTERS']
        this.myApps = this.myApps.filter(app =>
          allowedAppCategory.includes(app.appCategoryEnum)
        )
        let staticIconNames = ['iot', 'maintenance', 'rm', 'fsm', 'energy']
        this.myApps.forEach(app => {
          let linkName = app?.linkName || ''
          if (this.currentAppLinkName === linkName) app.isSelected = true
          else app.isSelected = false
          if (staticIconNames.includes(linkName)) app.iconName = linkName
          else app.iconName = 'custom'
        })
      }
    },
    switchApp(app) {
      let { linkName } = app || {}
      if (!isEmpty(linkName)) {
        window.location.href = `/${linkName}`
      }
    },
    closePopover() {
      this.showPopover = false
    },
  },
}
</script>
<style>
.fc-rebrand-logo {
  max-height: 32px;
  max-width: 96px;
  object-fit: contain;
  margin: var(--spacing-containerXLarge);
}
</style>
