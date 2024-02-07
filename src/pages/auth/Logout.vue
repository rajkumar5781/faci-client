<template>
  <div></div>
</template>
<script>
import { API } from '@facilio/api'
import router from 'vue-router'
import { logout } from '../../utils/helpers/index.js'

export default {
  beforeRouteEnter() {
    API.get('logout', null, { force: true })
      .then(() => {
        let { currentRoute: { query = {} } = {} } = router
        logout(query.redirect || null)
      })
      .catch(function (error) {
        if (error) {
          console.error(error)
        }
      })
  },
}
</script>
