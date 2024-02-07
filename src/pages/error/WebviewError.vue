<template>
  <Error40X
    :errorCode="errorCode1"
    description="An error occurred while processing your request."
    :customEvent="true"
    @onGoHome="goHome"
  >
  </Error40X>
</template>
<script>
import Error40X from './Error40X.vue'
import ErrorMixin from './ErrorMixin'
import { emitEvent } from '../../utils/mobileapp.js'

export default {
  mixins: [ErrorMixin],
  components: { Error40X },
  methods: {
    goHome() {
      console.log('webview')
      emitEvent('goToHome', { goToHome: 'ok' })
      emitEvent('reloadConnectedApp', { reloadConnectedApp: 'true' })
    },
  },
}
</script>
