<script>
import { API } from '@facilio/api'
import { findRouteForTab, pageTypes, isWebTabsEnabled } from '@facilio/router'
import { getApp } from '@facilio/router'
export default {
  data() {
    return {
      searchText: '',
      canShowListView: true,
      showType: false,
      recordCount: null,
      currentPageCount: null,
      perPage: 50,
      sortObj: {},
      selectedListItemsIds: [],
      selectedListItemsObj: [],
      showColumnSettings: false,
      isLoading: true,
      records: [],
      searchText: '',
    }
  },
  watch: {
    filters(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        if (!this.isListView) {
          this.reloadMapData()
        } else {
          this.refreshRecordDetails()
        }
      }
    },
  },
  computed: {
    getFormattedFile() {
      let { photos } = this
      let filePreviewList = []

      ;(photos || []).map(photo => {
        filePreviewList.push({
          contentType: 'image',
          previewUrl: photo.originalUrl,
          downloadUrl: this.$helpers.getFileDownloadUrl(photo.photoId),
        })
      })
      return filePreviewList
    },
    printQrUrl() {
      let url
      let { moduleName, record } = this
      let { id } = record || {}
      let appName = getApp().linkName
      url = `/legacy/${appName}/iframe/pdf/${moduleName}/${id}`
      return window.location.protocol + '//' + window.location.host + url
    },
  },
  methods: {
    summaryRouteName() {
      let { name = {} } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      return name
    },
    editRouteName() {
      let { name = {} } = findRouteForTab(pageTypes.PORTFOLIO_EDIT) || {}
      return name
    },
    createRouteName() {
      let { name = {} } = findRouteForTab(pageTypes.PORTFOLIO_CREATE) || {}
      return name
    },
    listRouteName() {
      let { name = {} } = findRouteForTab(pageTypes.PORTFOLIO_LIST) || {}
      return name
    },
    isZeroOrNull(val) {
      return val == null || val == 0
    },
    async downloadQR() {
      let { record } = this
      let { id: siteId } = record || {}
      let { data, error } = await API.get('v3/site/qr/download', { siteId })
      if (!error) {
        let { downloadURL } = data || {}
        this.downloadQRurl = downloadURL
      }
    },
  },
}
</script>
