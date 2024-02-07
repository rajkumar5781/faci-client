<template>
  <FModal
    :title="title"
    :visible="visibility"
    :confirmLoading="disableDownloadButton"
    :saveText="confirmButtonText"
    size="S"
    :hideFooter="false"
    @ok="isDownloadOption ? downloadWorkOrder() : printWorkOrder()"
    @cancel="closeDialog()"
    padding="containerLarge"
  >
    <FContainer
      padding="containerXxLarge"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
    >
      <FContainer marginLeft="containerLarge">
        <FCheckbox v-model="checked">{{
          this.$t('workorder.show_photo', 'Include Task photos', {
            ns: 'workorder',
          })
        }}</FCheckbox>
      </FContainer>
      <FContainer marginLeft="containerLarge">
        <FCheckbox v-model="showAttachement">{{
          this.$t(
            'workorder.prints_image_type',
            'only image type attachments will get printed',
            { ns: 'workorder' }
          )
        }}</FCheckbox>
      </FContainer>
      <FContainer marginLeft="containerLarge">
        <FCheckbox v-model="showComments">{{
          this.$t('workorder.show_comments', 'Include Work Order comments', {
            ns: 'workorder',
          })
        }}</FCheckbox>
      </FContainer>
      <FContainer marginLeft="containerLarge">
        <FCheckbox v-model="showHistory">{{
          this.$t('workorder.show_history', 'Include Work Order History', {
            ns: 'workorder',
          })
        }}</FCheckbox>
      </FContainer>
      <FContainer marginLeft="containerLarge">
        <FCheckbox v-model="useSiteLogo">{{
          this.$t('workorder.use_site_logo', 'Use Site Logo', {
            ns: 'workorder',
          })
        }}</FCheckbox>
      </FContainer>
      <FContainer marginLeft="containerLarge">
        <FCheckbox v-model="showSignature">{{
          this.$t('workorder.show_signature', 'Show Signature', {
            ns: 'workorder',
          })
        }}</FCheckbox>
      </FContainer>
    </FContainer>
    <FContainer> </FContainer>
  </FModal>
</template>
<script>
import {
  FContainer,
  FText,
  FCheckbox,
  FButton,
  FSelect,
  FModal,
  FTooltip,
  ftoast,
} from '@facilio/design-system'
import { getApp, isWebTabsEnabled } from '@facilio/router'
import { mapState } from 'pinia'
import webtabStore from '../../../../store/webtabs'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'

export default {
  components: {
    FContainer,
    FText,
    FCheckbox,
    FButton,
    FSelect,
    FModal,
    FTooltip,
  },
  props: {
    visibility: {
      type: Boolean,
      default: false,
    },
    workorders: {
      type: Array,
      default: () => [],
    },
    viewName: {
      type: String,
      default: '',
    },
    isDownloadOption: {
      type: Boolean,
      default: false,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    isPdfDownload: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checked: false,
      showAttachement: false,
      showComments: false,
      showHistory: false,
      useSiteLogo: false,
      showSignature: true,
      downloadUrl: null,
    }
  },
  computed: {
    ...mapState(webtabStore, {
      currentTab: 'selectedTab',
      currentGroup: 'selectedTabGroup',
    }),
    selected() {
      return this.data.checked
    },
    title() {
      let { isDownloadOption } = this
      if (isDownloadOption) {
        return this.$t(
          'workorder.download_options',
          'WORK ORDER DOWNLOAD OPTIONS',
          { ns: 'workorder' }
        )
      } else {
        return this.$t('workorder.print_options', 'WORK ORDER PRINT OPTIONS', {
          ns: 'workorder',
        })
      }
    },
    confirmButtonText() {
      let { isDownloadOption } = this
      if (isDownloadOption) {
        return this.$t('workorder.download', 'Download', { ns: 'workorder' })
      } else {
        return this.$t('workorder.print', 'Print', { ns: 'workorder' })
      }
    },
    disableDownloadButton() {
      let { isDownloadOption, isPdfDownload } = this
      return isDownloadOption && isPdfDownload
    },
  },
  methods: {
    closeDialog() {
      this.$emit('onClose')
    },
    getFileUrl() {
      let {
        workorders,
        checked,
        showAttachement,
        showComments,
        showHistory,
        useSiteLogo,
        showSignature,
        viewName,
      } = this
      let { linkName } = getApp()
      let appName = linkName === 'newapp' ? 'app' : linkName
      let query = new URLSearchParams()

      query.append('workorderId', workorders)
      query.append('showImage', checked)
      query.append('showAttachements', showAttachement)
      query.append('showComments', showComments)
      query.append('showHistory', showHistory)
      query.append('useSiteLogo', useSiteLogo)
      query.append('showSignature', showSignature)
      query.append('viewName', viewName)

      if (isWebTabsEnabled()) {
        let { currentTab, currentGroup } = this
        query.append('currentTabId', currentTab.id)
        query.append('currentGroupId', currentGroup.id)
      }

      let { location } = window || {}
      let { protocol, host } = location || {}

      let url = `${protocol}//${host}/legacy/${appName}/iframe/pdf/summarydownloadreport?${query.toString()}`

      return url
    },
    printWorkOrder() {
      let { getFileUrl } = this
      let url = getFileUrl()
      window.open(url)
    },
    downloadWorkOrder() {
      let { getFileUrl } = this
      this.downloadUrl = getFileUrl()
      this.$emit('updatepdfUrl', this.downloadUrl)
    },
    downloadPdf() {
      let { downloadUrl, additionalInfo } = this
      ftoast.success('Downloading..')
      API.post(`/v2/integ/pdf/create`, {
        downloadUrl,
        additionalInfo,
      }).then(({ data, error }) => {
        if (error) {
          let { message = 'Unable to fetch download link' } = error
          ftoast.critical(message)
        } else {
          this.downloadUrl = (data || {}).fileUrl
        }
        this.$emit('update:isDownload', false)
      })
    },
  },
}
</script>
