<template>
  <FContainer margin="containerNone containerXxLarge">
    <FPopover trigger="clickToOpen" placement="bottom-end">
      <FAvatar
        :userName="userName"
        :avatarUrl="$account.user.avatarUrl"
        class="cursor-pointer"
      />
      <template #content>
        <FContainer width="322px">
          <!-- <ProfilePopoverBanner /> -->
          <FContainer
            padding="containerXLarge"
            class="flex cursor-pointer"
            borderBottom="solid 1px"
            borderColor="borderNeutralBaseSubtler"
            hover-backgroundColor="backgroundAccentBlueSubtle"
            @click="goToProfile"
          >
            <FAvatar
              size="XL"
              :userName="userName"
              :avatarUrl="$account.user.avatarUrl"
            />
            <FContainer
              marginLeft="containerLarge"
              gap="containerSmall"
              alignItems="flex-start"
              class="flex flex-col justify-center"
            >
              <FText appearance="headingMed16">{{ userName }}</FText>
              <FText appearanc="bodyReg14" color="textCaption">{{
                email
              }}</FText>
            </FContainer>
          </FContainer>
          <FContainer
            v-if="showOrgList"
            padding="containerXxLarge containerNone"
            margin="containerNone containerXLarge"
            borderBottom="solid 1px"
            borderColor="borderNeutralBaseSubtler"
          >
            <FText
              appearance="captionMed12"
              padding="containerMedium containerXLarge"
              >{{
                $t('orgs', 'Orgs', {
                  ns: 'account',
                })
              }}
            </FText>
            <FDropdownMenu
              :menuList="orgList"
              width="400px"
              :selectedValue="selectedOrg"
              @change="orgSelected"
            >
              <FMenuItem
                v-for="org in orgList"
                :value="org.value"
                :key="org.value"
                >{{ org.label }}</FMenuItem
              >
            </FDropdownMenu>
          </FContainer>
          <FContainer
            padding="containerXxLarge containerXLarge"
            class="flex flex-wrap flex-col"
          >
            <FButton
              v-if="showVersionSwitchButton"
              appearance="tertiary"
              block
              size="medium"
              @click="deleteCurrentVersionCookie()"
              >{{
                $t(
                  'user_management.return_to_old_version',
                  'Return to Previous Version',
                  { ns: 'account' }
                )
              }}
            </FButton>
            <FMenuItem
              v-for="link in quickLinks"
              :key="link.iconName"
              @click="handleMenuClick(link)"
              style="width: 100%; height: 100%"
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

          <FContainer
            margin="containerNone containerLarge"
            padding="containerXLarge"
            backgroundColor="backgroundMidgroundSubtle"
            borderRadius="medium"
            class="flex justify-center items-center"
            gap="containerXxLarge"
          >
            <FText>{{
              $t('download_mobile_apps', 'Download our apps on', {
                ns: 'account',
              })
            }}</FText>
            <a :href="iosApplicationLink" target="_blank">
              <FIcon
                group="social"
                name="apple-logo"
                size="18"
                color="iconNeutralDefault"
              ></FIcon> </a
            ><a :href="androidApplicationLink" target="_blank">
              <FIcon
                group="social"
                name="google-play-logo"
                size="18"
                color="iconNeutralDefault"
              ></FIcon
            ></a>
          </FContainer>
          <FContainer padding="containerXLarge containerLarge">
            <FButton :block="true" appearance="secondary" @click="logoutApp">{{
              $t('logout', 'Logout', { ns: 'account' })
            }}</FButton>
          </FContainer>
        </FContainer>
      </template>
    </FPopover>
    <ShortcutsDialog
      v-if="showShortCutDialog"
      :showShortCutDialog="showShortCutDialog"
      @onClose="closeShortCutDialog"
    />
  </FContainer>
</template>

<script>
import {
  FAvatar,
  FContainer,
  FPopover,
  FText,
  FDropdownMenu,
  FMenuItem,
  FButton,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import helpers from '../../utils/helpers'
import { getApp } from '@facilio/router'
import ShortcutsDialog from '../../pages/profile/ShortcutsDialog.vue'
import Vue from 'vue'
// import ProfilePopoverBanner from '../../assets/patterns/profile-popover-banner.svg?component'

import getProperty from 'dlv'

export default {
  name: 'ProfilePanel',
  components: {
    FAvatar,
    FContainer,
    FPopover,
    FText,
    FDropdownMenu,
    FMenuItem,
    FButton,
    FIcon,
    // ProfilePopoverBanner,
    ShortcutsDialog,
  },
  data: () => ({
    orgs: [],
    selectedOrg: [],
    showShortCutDialog: false,
  }),
  computed: {
    userName() {
      let { $account } = this || {}
      let { user } = $account || {}
      let { name } = user || {}
      return name
    },
    email() {
      let { $account } = this || {}
      let { user } = $account || {}
      let { email } = user || {}
      return email
    },
    orgList() {
      let { orgs } = this || {}
      return (orgs || []).map(org => {
        return { ...org, label: org.name, value: `${org.id}` }
      })
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
    showOrgList() {
      let { orgList } = this
      return !isEmpty(orgList) && Object.keys(orgList).length > 1
    },
    iosApplicationLink() {
      let path = helpers.getAppDomain() + '/auth/apps/ios'
      return path
    },
    androidApplicationLink() {
      return helpers.getAppDomain() + '/auth/apps/android'
    },
    showVersionSwitchButton() {
      let currentVersion = Vue.cookie.get('fc.currentVersion')
      return !isEmpty(currentVersion) && currentVersion === 'revive'
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      await this.fetchOrgs()
      let { orgList, $account } = this
      let selectedOrg = orgList.find(org => org.id == $account.org.id)
      this.selectedOrg = [selectedOrg]
    },
    async fetchOrgs() {
      let response = await API.get('v2/getOrgs')
      this.orgs = getProperty(response, 'data.Orgs')
    },
    async orgSelected(org) {
      let { selectedOrg } = this || {}
      let [currentOrg] = org || []

      if (isEmpty(selectedOrg)) {
        this.selectedOrg = [currentOrg]
      } else if (!isEmpty(currentOrg) && selectedOrg[0].id !== currentOrg.id) {
        let { domain } = currentOrg || {}
        let { error } = await API.get(`switchaccount?switchOrgDomain=${domain}`)
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          window.location.href =
            window.location.protocol + '//' + window.location.host
        }
      }
    },
    goToProfile() {
       let { linkName, orgSubDomain } = getApp() || {}
      this.$router.push({
        name: 'profile',
        params: { app: linkName, orgSubDomain },
      })
    },
    logoutApp() {
      helpers.logout(window.location.pathname, true)
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
    closeShortCutDialog() {
      this.showShortCutDialog = false
    },
    deleteCurrentVersionCookie() {
      Vue.cookie.delete('fc.currentVersion')
      window.location.href = window.location.origin + window.location.pathname
    },
  },
}
</script>
