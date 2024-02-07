<template>
  <FContainer width="100%" height="100%" ref="micro-frame-container">
    <iframe
      v-if="url"
      :src="url"
      ref="microFrame"
      style="
        width: 100%;
        height: 100%;
        border: 0px;
        z-index: 1;
        position: relative;
      "
      :style="
        fullscreen &&
        'position:absolute;top:0;left:0;bottom:0;right:0;height:100%;width:100%;z-index:100000'
      "
    ></iframe>
    <div
      v-if="overlay"
      style="
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.45);
        height: 100%;
        width: 100%;
      "
    ></div>
  </FContainer>
</template>

<script>
import { FContainer } from '@facilio/design-system'
import NProgress from 'accessible-nprogress'
import { mapState } from 'pinia'
import webtabStore from '../../store/webtabs'
import homeStore from '../../store/home'

export default {
  props: ['name', 'url', 'context', 'handlers'],
  components: { FContainer },
  data() {
    return {
      overlay: false,
      fullscreen: false,
      microHandlers: {},
      target: null,
    }
  },
  computed: {
    ...mapState(webtabStore, ['selectedTab']),
    ...mapState(homeStore, ['features']),
  },
  mounted() {
    this.microHandlers = {
      ...this.handlers,
      setWindowOverlay: this.showOverlay,
      hideWindowOverlay: this.hideOverlay,
      disableFullScreen: this.disableFullScreen,
      enableFullScreen: this.enableFullScreen,
      startProgressLoader: this.startProgressLoader,
      endProgressLoader: this.endProgressLoader,
      legacyInit: this.sendInitialDetails,
    }
    window.addEventListener('message', this.handleEvent)
  },
  destroyed() {
    window.removeEventListener('message', this.handleEvent)
  },
  methods: {
    startProgressLoader() {
      NProgress.start()
    },
    endProgressLoader() {
      NProgress.done()
    },
    disableFullScreen() {
      this.fullscreen = false
    },
    enableFullScreen() {
      this.fullscreen = true
    },
    showOverlay() {
      this.overlay = true
    },
    hideOverlay() {
      this.overlay = false
    },
    sendInitialDetails() {
      let { selectedTab, context, $account, features } = this
      return {
        context: { selectedTab, features, ...(context || {}) },
        account: $account,
      }
    },
    _isValidEvent(event) {
      let data = event.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(event.data)
        } catch (e) {
          return false
        }
      }
      if (data.name != this.name) {
        return false
      }
      return this.$refs.microFrame.contentWindow === event.source
    },
    _namePrefix(key) {
      return this.name + '.' + key
    },
    _sendResponse(replyId, key, result, error) {
      let data = {
        id: replyId,
        key: key,
        result: result,
        error: error,
      }
      this.$refs.microFrame.contentWindow.postMessage(JSON.stringify(data), '*')
    },
    sendEvent(key, msg) {
      let data = {
        key: this._namePrefix(key),
        message: msg,
      }
      this.$refs.microFrame.contentWindow.postMessage(JSON.stringify(data), '*')
    },
    handleEvent(event) {
      if (!this._isValidEvent(event)) return

      let data = JSON.parse(event.data)

      const id = data.id
      const key = data.key
      const params = data.params

      let eventName = key

      if (eventName === 'handshake') {
        let { selectedTab, context, $account, features } = this

        this.sendEvent('loaded', {
          context: { selectedTab, features, ...(context || {}) },
          account: $account,
        })
        this.$emit('loaded', params)
      } else if (
        this.microHandlers &&
        this.microHandlers[eventName] &&
        typeof this.microHandlers[eventName] === 'function'
      ) {
        Promise.resolve(this.microHandlers[eventName](params))
          .then(response => {
            this._sendResponse(id, key, response, null)
          })
          .catch(error => {
            let errorMsg = error ? error.toString() : null
            this._sendResponse(id, key, null, errorMsg)
          })
      } else {
        this.$emit(eventName, params)
      }
    },
  },
}
</script>
