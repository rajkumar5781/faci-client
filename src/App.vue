<template>
  <router-view />
</template>

<script>
import homeStore from './store/home'
import { mapState } from 'pinia'
import helpers from './utils/helpers'
export default {
  name: 'App',
  watch: {
    ...mapState(homeStore, ['loginRequired']),
    loginRequired(val) {
      console.log(val)
      if (val) {
        helpers.logout(window.location.pathname, true)
      }
    },
  },
}
</script>
