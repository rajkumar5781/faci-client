<template>
  <FContainer display="flex" flexWrap="wrap" paddingTop="containerLarge">
    <FContainer
      v-for="(attachment, index) in attachmentsDetails"
      :key="`attachment-${index}`"
    >
      <FContainer
        v-if="!isEmpty(attachment)"
        @click="openAttachmentsPreview(attachment)"
        display="flex"
        maxWidth="200px"
        height="30px"
        border="solid 1px"
        borderColor="backgroundMidgroundDark"
        borderRadius="high"
        padding="containerMedium"
        marginBottom="containerLarge"
        marginRight="containerLarge"
        cursor="pointer"
      >
        <FContainer
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          class="flex items-center"
        >
          <FIcon
            :pressable="false"
            group="file-upload-colored"
            :name="attachment.extension"
            size="16"
          >
          </FIcon>
          <FTooltip placement="top">
            <template slot="title"> {{ attachment.fileName }}</template>
            <FContainer paddingLeft="containerMedium" display="flex">
              <FText appearance="captionReg10">{{ attachment.fileName }}</FText>
            </FContainer>
          </FTooltip>
        </FContainer>
      </FContainer>
    </FContainer>
    <iframe
      v-if="downloadUrl"
      :src="downloadUrl"
      style="display: none"
    ></iframe>
    <div v-if="filePreviewVisibility">
      <FFilePreview
        :files="filesList"
        :previewFile="previewFile"
        :openPreview="filePreviewVisibility"
        @close="onclose"
        @onFileDownload="downloadFile"
      ></FFilePreview>
    </div>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTooltip,
  FIcon,
  FFilePreview,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { getBaseURL } from '../../../../utils/api/base-url'

export default {
  props: ['attachments'],
  components: {
    FContainer,
    FFilePreview,
    FText,
    FTooltip,
    FIcon,
  },
  data: () => ({
    filePreviewVisibility: false,
    previewFile: null,
    downloadUrl: null,
  }),

  computed: {
    attachmentsDetails() {
      let { attachments } = this || {}
      return attachments.map(attachment => {
        let extension = this.getExtension(attachment.fileName)
        return { ...attachment, extension }
      })
    },

    filesList() {
      let { attachments = {} } = this || {}
      return attachments.map(attachment => {
        let extension = this.getExtension(attachment.fileName)
        let file = this.formattedFile(attachment)
        return { ...file, extension }
      })
    },
  },
  methods: {
    isEmpty,
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
    openAttachmentsPreview(attachment = {}) {
      this.previewFile = this.formattedFile(attachment)
      this.filePreviewVisibility = true
    },
    onclose() {
      this.filePreviewVisibility = false
    },
    formattedFile(attachment) {
      let { previewUrl, contentType, downloadUrl, fileName, extension } =
        attachment || {}
      previewUrl = previewUrl.split('/api')[1]
      let baseUrl = getBaseURL()

      return {
        name: fileName,
        contentType,
        downloadUrl: downloadUrl,
        url: `${baseUrl}${previewUrl}`,
        extension,
      }
    },
    downloadFile(attachment) {
      if (attachment.downloadUrl) {
        this.downloadUrl = attachment.downloadUrl
      }
    },
  },
}
</script>
