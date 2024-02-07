<template>
    <iframe v-if="downloadUrl" :src="downloadUrl" style="display: none;"></iframe>
  </template>
  <script>
  import { API } from '@facilio/api'
  import { isEmpty } from '@facilio/utils/validation'
  import {ftoast} from '@facilio/design-system'
  
  export default {
    props: ['url', 'additionalInfo', 'isDownload'],
    data() {
      return {
        downloadUrl: null,
      }
    },
    watch: {
      isDownload: {
        handler(val) {
          let { url } = this
          if (!isEmpty(url) && val) {
            this.downloadPdf()
          }
        },
        immediate: true,
      },
    },
    methods: {
      downloadPdf() {
        let { url, additionalInfo } = this
        ftoast.success('Downloading..')
        API.post(`/v2/integ/pdf/create`, {
          url,
          additionalInfo,
        }).then(({ data, error }) => {
          if (error) {
            let { message = 'Unable to fetch download link' } = error
            ftoast.critical(message)
          } else {
            this.downloadUrl = (data || {}).fileUrl
          }
          this.$emit('closeDownload', false)
        })
      },
    },
  }
  </script>
  