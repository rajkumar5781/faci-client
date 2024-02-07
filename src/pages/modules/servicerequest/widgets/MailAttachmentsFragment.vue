<template>
  <FContainer display="flex" flexWrap="wrap" paddingTop="containerLarge">
    <FContainer
      v-for="(attachment, index) in attachmentsDetails"
      @click="openAttachmentsPreview(attachment)"
      :key="`attachment-${index}`"
    >
      <FContainer
        class="fc-mailer-attachment-row"
        v-if="!isEmpty(attachment)"
        display="flex"
        width="90px"
        height="30px"
        border="solid 1px"
        borderColor="backgroundMidgroundDark"
        borderRadius="high"
        padding="containerMedium"
        marginBottom="containerLarge"
        marginRight="containerLarge"
      >
        <FContainer height="100%" display="flex" alignItems="center">
          <fc-icon
            group="file-upload-colored"
            :name="attachment.extension"
            size="16"
          >
          </fc-icon>
        </FContainer>
        <FContainer overflow="hidden">
          <FTooltip placement="top">
            <template slot="title"> {{ attachment.fileFileName }}</template>
            <FContainer
              paddingLeft="containerMedium"
              width="50px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              letterSpacing="0.5px"
            >
              <FText appearance="captionReg10">{{
                attachment.fileFileName
              }}</FText>
            </FContainer>
          </FTooltip>
        </FContainer>
        <FContainer @click="downloadAttachment(attachment)" cursor="pointer">
          <FIcon
            group="connectivity"
            name="download"
            size="12"
            :pressable="true"
          ></FIcon>
        </FContainer>
      </FContainer>
    </FContainer>
    <iframe
      v-if="exportDownloadUrl"
      :src="exportDownloadUrl"
      style="display: none"
    ></iframe>
    <div v-if="filePreviewVisibility">
      <FFilePreview
        :previewFile="previewFile"
        :openPreview="filePreviewVisibility"
        :files="attachmentsDetails"
        @close="onclose"
        @onFileDownload="downloadFile"
      ></FFilePreview>
    </div>
  </FContainer>
</template>
<script>
import FilePreview from '../../../../components/page-builder/widgets/fieldSummary/FilePreview.vue'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTooltip,
  FIcon,
  FFilePreview,
} from '@facilio/design-system'

export default {
  props: ['attachmentsList'],
  components: {
    FilePreview,
    FContainer,
    FText,
    FTooltip,
    FIcon,
    FFilePreview,
  },
  data: () => ({
    exportDownloadUrl: null,
    filePreviewVisibility: false,
    filePreviewAttachments: [],
    previewFile: null,
  }),
  created() {
    let { attachmentsList } = this || {}
    return attachmentsList.map(attachment => {
      let { fileFileName = '', fileUrl, fileContentType } = attachment
      let extension = this.getExtension(fileFileName)
      attachment.extension = extension
      attachment.uid = this.generateUniqueId()
      attachment.name = fileFileName
      attachment.percent = 0
      attachment.originFileObj = '[object File]'
      attachment.url = fileUrl
      attachment.contentType = fileContentType
      return attachment
    })
  },
  computed: {
    attachmentsDetails() {
      let { attachmentsList } = this || {}
      return attachmentsList.map(attachment => {
        let extension = this.getExtension(attachment.fileFileName)
        return { ...attachment, extension }
      })
    },
  },
  methods: {
    isEmpty,
    onclose() {
      this.filePreviewVisibility = false
    },
    downloadFile(val) {
      let { downloadUrl, url } = val

      if (this.exportDownloadUrl) {
        this.exportDownloadUrl = null
      }
      this.$nextTick(() => {
        this.exportDownloadUrl = downloadUrl || url
      })
    },
    openAttachmentsPreview(currentFile = {}) {
      this.previewFile = currentFile
      this.filePreviewVisibility = true
    },
    generateUniqueId() {
      const timestampWithMilliseconds = new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, '')
      const randomNumber = Math.floor(Math.random() * 1000)
      const uniqueId = `${timestampWithMilliseconds}_${randomNumber}`
      return uniqueId
    },
    attachmentsFormatter(record) {
      return {
        contentType: record?.fileContentType,
        downloadUrl: record?.fileDownloadUrl,
        fileName: record?.fileFileName,
        previewUrl: record?.fileUrl,
      }
    },

    downloadAttachment(file) {
      let { fileDownloadUrl: url } = file || {}

      if (this.exportDownloadUrl) {
        this.exportDownloadUrl = null
      }

      this.$nextTick(() => {
        this.exportDownloadUrl = url
      })
    },
    getExtension(fileName) {
      let contentArr = fileName.split('.')
      let format = contentArr[contentArr.length - 1]
      if (
        [
          'css',
          'doc',
          'docx',
          'gif',
          'html',
          'jpeg',
          'js',
          'json',
          'mp3',
          'mp4',
          'pdf',
          'png',
          'ppt',
          'pptx',
          'svg',
          'txt',
          'unsupported',
          'webp',
          'xlsx',
          'xml',
          'zip',
        ].includes(format)
      ) {
        return format
      } else if (format == 'pdf') {
        return 'pdf'
      } else if (['jpg', 'jpeg'].includes(format)) {
        return 'png'
      } else if (['docm', 'dot', 'dotx'].includes(format)) {
        return 'docx'
      } else if (['xls', 'xl', 'xll', 'xlm', 'xlsm'].includes(format)) {
        return 'xlsx'
      } else {
        return 'unsupported'
      }
    },
  },
}
</script>
