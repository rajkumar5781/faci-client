<template>
  <FContainer
    v-if="hasMetaLoaded"
    class="h-screen flex flex-col overflow-hidden"
  >
    <FContainer
      padding="containerXLarge sectionSmall containerXLarge containerXLarge"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      height="56px"
    >
      <img
        class="fc-rebrand-logo cursor-pointer"
        :src="brandConfig.logo"
        alt="Logo"
        @click="goToApp"
      />
      <!-- <FButton
        @click="goToApp"
        appearance="tertiary"
        height="32px"
        width="32px"
      >
        <FIcon group="action" name="cross" size="16" :pressable="false"></FIcon>
      </FButton> -->
    </FContainer>
    <FContainer
      display="flex"
      gap="containerXxLarge"
      padding="containerLarge containerXxLarge sectionSmall sectionSmall"
      height="calc(100vh - 56px)"
    >
      <FContainer
        padding="containerXxLarge"
        height="100%"
        width="20%"
        overflow="scroll"
        border="1px solid"
        borderColor="borderNeutralBaseSubtler"
        borderRadius="high"
      >
        <FContainer
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <FContainer
            display="flex"
            gap="containerXLarge"
            flexDirection="column"
          >
            <div>
              <FContainer marginBottom="containerXLarge">
                <FText appearance="headingMed14">
                  {{ $t('profile.account', 'Account', { ns: 'account' }) }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="column"
                gap="containerMedium"
              >
                <FContainer
                  v-for="tab in accountList"
                  :key="tab.value"
                  :backgroundColor="
                    selectedRoute === tab.value
                      ? 'backgroundNeutralHovered'
                      : ''
                  "
                  :hover-backgroundColor="
                    selectedRoute === tab.value
                      ? ''
                      : 'backgroundNeutralHovered'
                  "
                  @click="() => changeAccountSetupRoute(tab)"
                  height="40px"
                  padding="containerLarge"
                  gap="containerXLarge"
                  borderRadius="medium"
                  class="cursor-pointer flex items-center"
                >
                  <FIcon
                    :group="tab.group"
                    :name="tab.iconName"
                    size="16"
                    :pressable="false"
                  />
                  <FText> {{ tab.label }}</FText>
                </FContainer>
              </FContainer>
            </div>
            <div>
              <FContainer marginBottom="containerXLarge">
                <FText appearance="headingMed14">
                  {{
                    $t(
                      'profile.management_and_integration',
                      'Management & Integration',
                      { ns: 'account' }
                    )
                  }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="column"
                gap="containerMedium"
              >
                <FContainer
                  v-for="tab in filteredIntegrationList"
                  :key="tab.value"
                  :backgroundColor="
                    selectedRoute === tab.value
                      ? 'backgroundNeutralHovered'
                      : ''
                  "
                  :hover-backgroundColor="
                    selectedRoute === tab.value
                      ? ''
                      : 'backgroundNeutralHovered'
                  "
                  @click="() => changeAccountSetupRoute(tab)"
                  height="40px"
                  padding="containerLarge"
                  gap="containerXLarge"
                  borderRadius="medium"
                  class="cursor-pointer flex items-center"
                >
                  <FIcon
                    :group="tab.group"
                    :name="tab.iconName"
                    size="16"
                    :pressable="false"
                  />
                  <FText> {{ tab.label }}</FText>
                </FContainer>
              </FContainer>
            </div>
          </FContainer>
          <FContainer>
            <FMenuItem
              v-for="link in quickLinks"
              :key="link.iconName"
              @click="handleMenuClick(link)"
            >
              <FContainer
                class="flex items-center justify-start cursor-pointer"
                gap="containerLarge"
              >
                <FIcon
                  :group="link.group"
                  :name="link.iconName"
                  size="16"
                  :pressable="false"
                />
                <FText appearance="bodyReg14">{{ link.displayName }}</FText>
              </FContainer>
            </FMenuItem>
          </FContainer>
        </FContainer>
      </FContainer>
      <div v-if="loading" class="flex w-4/5 items-center justify-center">
        <FSpinner :size="30" />
      </div>
      <router-view v-else class="w-4/5 h-full" />
    </FContainer>
    <ShortcutsDialog
      v-if="showShortCutDialog"
      :showShortCutDialog="showShortCutDialog"
      @onClose="close"
    />
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FMenuItem,
  FIcon,
  FSpinner,
  FButton,
} from '@facilio/design-system'
import { getApp } from '@facilio/router'
import { mapActions } from 'pinia'
import homeStore from '../../store/home'
import Utils from '../../utils/index.js'
import Vue from 'vue'
import ShortcutsDialog from './ShortcutsDialog.vue'
import HomeMixin from '../../layouts/mixin/HomeMixin.vue'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'Layout',
  mixins: [HomeMixin],
  components: {
    FContainer,
    FText,
    FMenuItem,
    FIcon,
    FSpinner,
    FButton,
    ShortcutsDialog,
  },
  data: () => ({
    accountList: [
      {
        label: 'Profile',
        value: 'profile',
        group: 'communication',
        iconName: 'profile',
      },
      {
        label: 'Notifications',
        value: 'notification',
        group: 'alert',
        iconName: 'notification',
      },
      {
        label: 'Security',
        value: 'security',
        group: 'action',
        iconName: 'security',
      },
    ],

    integrationList: [
      // {
      //   label: 'Delegates',
      //   value: 'delegates',
      //   group: 'user',
      //   iconName: 'team',
      // },
      {
        label: 'API Clients',
        value: 'apiclient',
        group: 'user',
        iconName: 'user-key',
      },
      {
        label: 'My Apps',
        value: 'myapp',
        group: 'action',
        iconName: 'apps-outline',
      },
    ],
    loading: false,
    showShortCutDialog: false,
  }),
  computed: {
    brandConfig() {
      return window.brandConfig
    },
    selectedRoute() {
      let { $route } = this || {}
      let { name } = $route || {}
      return name
    },
    quickLinks() {
      let quickLinks = []
      // let quickLinks = [
      //   {
      //     displayName: 'Shortcuts',
      //     group: 'webtabs',
      //     iconName: 'process',
      //   },
      // ]
      let { links } = window?.brandConfig || {}
      links?.map(link => {
        if (!isEmpty(link)) {
          if (link.linkTypeEnum === 'BLOG' && link.showInMenu) {
            quickLinks.push({
              displayName: link.name,
              group: 'files',
              iconName: 'document',
              externalURL: link.externalURL,
            })
          } else if (link.linkTypeEnum === 'ABOUT' && link.showInMenu) {
            quickLinks.push({
              displayName: link.name,
              group: 'action',
              iconName: 'info',
              externalURL: link.externalURL,
            })
          } else if (link.linkTypeEnum == 'HELP' && link.showInMenu) {
            quickLinks.push({
              displayName: link.name,
              group: 'navigation',
              iconName: 'question',
              externalURL: link.externalURL,
            })
          }
        }
      })
      return quickLinks
    },
    filteredIntegrationList() {
      let filteredList = this.integrationList.filter(tabs => {
        if (tabs.value == 'apiclient') {
          return (
            this.$access.isLicenseEnabled('DEVELOPER_SPACE') &&
            this.$account.isDev
          )
        }
        return true
      })
      return filteredList
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapActions(homeStore, ['fetchAccount']),
    goToApp() {
      let { linkName, orgSubDomain } = getApp() || {}

      if (orgSubDomain) {
        this.$router.push({ path: `/${orgSubDomain}/${linkName}` })
      } else this.$router.push({ path: `/${linkName}` })
    },
    async init() {
      this.loading = true
      let account = await this.fetchAccount()
      Vue.use(Utils, { account })
      this.loading = false
    },
    changeAccountSetupRoute(tab) {
      this.$router.push({ name: tab.value })
    },
    handleMenuClick(menu) {
      let { displayName } = menu || {}
      let { externalURL } = menu || {}
      if (displayName === 'Shortcuts') {
        this.showShortCutDialog = true
      } else {
        window.open(externalURL, '_blank')
      }
    },
    close() {
      this.showShortCutDialog = false
    },
  },
}
</script>

<style scoped lang="scss">
.background-container {
  width: 100%;
  border-radius: 18px;
}
.fc-rebrand-logo {
  max-height: 32px;
  max-width: 96px;
  object-fit: contain;
  margin: var(--spacing-containerXLarge);
}
</style>
