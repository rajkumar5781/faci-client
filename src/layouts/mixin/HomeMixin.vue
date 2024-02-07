<script>
import { mapState, mapActions } from 'pinia'
import webtabStore from '../../store/webtabs'
import homeStore from '../../store/home'
import Vue from 'vue'
import Utils from '../../utils/index'
import { isEmpty } from '@facilio/utils/validation'
import helpers from '../../utils/helpers'
import { connect } from '@facilio/wms-client'
import { setConnectedAppsInstance } from '@facilio/ui/connected-app'
import { initializeTrackers } from '../../utils/trackers/index.js'
import { handleInterfaceAction } from '../../utils/connectedAppActions'

export default {
  data: () => ({
    isHelpersIntialized: true,
  }),
  computed: {
    ...mapState(webtabStore, [
      'getTabGroups',
      'getTabs',
      'selectedTabGroup',
      'selectedTab',
    ]),
    ...mapState(homeStore, ['loginRequired', 'account', 'features']),
    hasMetaLoaded() {
      let { isHelpersIntialized, account, features } = this || {}
      let { user } = account || {}
      let hasMeta = !isEmpty(user) && !isEmpty(features)

      return hasMeta && isHelpersIntialized
    },
  },
  watch: {
    loginRequired(val) {
      if (val) {
        helpers.logout(window.location.pathname, true)
      }
    },
  },
  async created() {
    let account = await this.fetchAccount()
    Vue.use(Utils, { account })
    await this.fetchLicense()
    this.initializeMeta()
    this.initializeWMS()
    this.initializeConnectedApp()
    initializeTrackers(account, this)
  },
  mounted() {
    document.addEventListener('click', this.fetchNotificationCount)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.fetchNotificationCount)
  },
  methods: {
    ...mapActions(webtabStore, ['setTab', 'setTabGroup']),
    ...mapActions(homeStore, [
      'fetchAccount',
      'fetchLicense',
      'fetchUnseenNotificationCount',
    ]),
    initializeMeta() {
      // initialize meta
    },
    initializeWMS() {
      let { account } = this
      if (account?.config?.new_ws_endpoint) {
        try {
          connect({
            endpoint: account?.config?.new_ws_endpoint,
            log: true,
          })
        } catch (error) {
          console.log('error in wms connect: ', error)
        }
      }
    },
    initializeConnectedApp() {
      let { account } = this
      if (account) {
        setConnectedAppsInstance({
          user: account.user,
          org: account.org,
          app: account.app,
          customInterfaceHandler: handleInterfaceAction,
        })
      }
    },
    async fetchNotificationCount() {
      await this.fetchUnseenNotificationCount()
    },
  },
}
</script>
