<script>
import { fDialog } from '@facilio/design-system'
import delay from 'lodash/delay'

export default {
  props: ['confirmations', 'onConfirm', 'onCancel'],
  data() {
    return {
      //   dialogVisible: false,
      activeDialog: null,
      currentIndex: 0,
      loadingOnConfirm: false,
    }
  },
  watch: {
    confirmations: {
      handler: 'startConfirmation',
      immediate: true,
    },
  },
  methods: {
    async startConfirmation() {
      let { confirmations, currentIndex } = this
      let dialog = confirmations[currentIndex]

      let dialogObj = {
        title: dialog.name,
        message: dialog.message,
        proceed: async () => {
          // If current dialog is the last then call the onConfirm handler and then call
          // done to keep the loading state active else proceed with the next dialog
          if (currentIndex === confirmations.length - 1) {
            this.loadingOnConfirm = true
            await this.onConfirm()
            this.loadingOnConfirm = false
            // this.dialogVisible = false
            this.currentIndex = 0
          } else {
            this.currentIndex += 1
            // this.dialogVisible = false
            delay(this.startConfirmation, 200)
          }
        },
        cancel: async () => {
          //   this.dialogVisible = false
          this.currentIndex = 0
          this.onCancel()
        },
      }

      this.activeDialog = dialogObj
      this.$nextTick(async () => {
        let { title, cancel, message, proceed } = this.activeDialog || {}
        let value = await fDialog.warning({
          title,
          description: message,
          saveText: 'Confirm',
          cancelText: 'Cancel',
        })
        if (value) proceed()
        else cancel()
        //   this.dialogVisible = true
      })
    },
  },
}
</script>
