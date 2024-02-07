import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import { setInstance } from '@facilio/api'
import http from './utils/api/http'
import loadWebTabs from './utils/initializers/webtabs'
import VueCookie from 'vue-cookie'
import { createPinia, PiniaVuePlugin } from 'pinia'
import titleMixin from './global/title'
import { initTolgee } from './utils/tolgee'
import PortalVue from 'portal-vue'
import GmapVue, { components } from 'gmap-vue'
import { defineCustomElements as fcIcon } from '@facilio/icons/dist/loader'
import moment from 'moment-timezone'
import './index.css'
import dayjs from 'dayjs'
fcIcon(window)

Vue.config.productionTip = false

Vue.mixin(titleMixin)

Vue.use(VueCookie)
Vue.use(PiniaVuePlugin)
Vue.use(PortalVue)
Vue.use(GmapVue, {
  load: {
    key: 'AIzaSyAJ9myxeE3qCem4Yx-ksyp0TVR7jvBAHFA',
    libraries: 'places,visualization,drawing',
    v: 3.42,
  },
  installComponents: true,
})

Vue.component('gmap-cluster', components.Cluster)

const pinia = createPinia()

setInstance(http)
initTolgee()

loadWebTabs().then(() => {
  new Vue({
    router,
    pinia,
    render: h => h(App),
  }).$mount('#app')
})
