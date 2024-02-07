<template>
  <Error40X
    title="Not Supported"
    description=" You seem to have blocked cookies or your browser doesn't seem to
          support them. Make sure that cookies are allowed and your browser is
          updated."
  >
  </Error40X>
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
