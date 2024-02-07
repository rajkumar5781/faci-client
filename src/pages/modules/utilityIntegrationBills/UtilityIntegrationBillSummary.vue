<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { isWebTabsEnabled, getApp } from '@facilio/router'
import {
  FContainer,
  FButton,
  FIcon,
  FButtonGroup,
} from '@facilio/design-system'

const statusTypeMap = {
  partiallyDisputed: 'warning',
  underdispute: 'danger',
  undisputed: 'success',
}

export default {
  extends: ModuleSummary,
  props: ['viewname'],
  data() {
    return {
      visible: true,
      downloadUrl: null,
    }
  },
  components: {
    FButtonGroup,
    FContainer,
    FButton,
    FIcon,
  },
  computed: {
    mainFieldKey() {
      return 'billUid'
    },
    tagProps() {
      let { record = {} } = this
      let { moduleState = {} } = record
      let { status, primaryValue } = moduleState

      if (!isEmpty(moduleState)) {
        return {
          text: primaryValue,
          variant: 'status',
          statusType: statusTypeMap[status] || 'default',
        }
      }
    },

    pdfUrl() {
      let { id } = this
      let url
      let appName = getApp().linkName
      url = `/${appName}/pdf/utilityBillspdf?billId=${id}`
      let { location } = window || {}
      let { protocol, host } = location || {}

      return `${protocol}//${host}${url}`
    },
  },
  methods: {
    openExternalBill() {
      let { record = {} } = this
      let sourceDownloadUrl = getProperty(record, 'sourceDownloadUrl')
      if (sourceDownloadUrl) {
        window.open(sourceDownloadUrl)
      }
    },
    openPrintPreview() {
      if (this.pdfUrl) {
        window.open(this.pdfUrl)
      }
    },
    async downloadPdf() {
      this.downloadUrl = null
      ftoast.information(this.$t('utility.downloading', { ns: 'energy' }))
      let additionalInfo = {
        showFooter: false,
        footerStyle: 'p {font-size:12px; marginLeft:500px}',
        footerHtml:
          '<p>Page  <span class="pageNumber"></span> / <span class="totalPages"></span></p>',
      }
      let { data, error } = await API.post(`/v2/integ/pdf/create`, {
        url: this.pdfUrl,
        additionalInfo,
      })

      if (error) {
        let {
          message = this.$t('utility.unable_to_fetch_download_link', {
            ns: 'energy',
          }),
        } = error
        ftoast.critical(
          message,
          this.$t('utility.error_occurred', { ns: 'energy' })
        )
      } else {
        let { fileUrl } = data || {}
        window.open(fileUrl, '_blank')
      }
    },
  },
}
</script>
