<template>
  <FContainer class="h-full" padding="containerMedium">
    <portal :to="groupActionPortal">
      <FTooltip placement="top" v-if="attachments && attachments.length">
        <template #title>{{ uploadText }}</template>
        <FButton
          iconGroup="files"
          iconName="attach-file"
          appearance="tertiary"
          :iconButton="true"
        >
          <FContainer class="opacity-0" position="absolute">
            <input
              class="w-full"
              type="file"
              multiple
              @change="uploadFiles($event.target.files)"
            />
          </FContainer>
        </FButton>
      </FTooltip>
    </portal>
    <FContainer
      v-if="loading"
      class="h-full w-full"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(attachments)"
      class="h-full w-full"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <FEmptyState
        illustration="no-documents-found"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
      >
        <template #buttons>
          <FButton
            iconGroup="text-edit"
            iconName="upload"
            iconPosition="prefix"
            appearance="secondary"
            >{{ uploadText }}
            <FContainer class="opacity-0" position="absolute">
              <input
                class="w-full"
                type="file"
                multiple
                @change="uploadFiles($event.target.files)"
              />
            </FContainer>
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer v-else>
      <FCard
        v-for="(attachment, index) in attachments"
        :key="index"
        class="flex items-center p-2 my-2 justify-between attachment-card"
        :hideBorder="true"
      >
        <div class="flex gap-1.5" @click="openAttachmentsPreview(attachment)">
          <FContainer padding="containerMedium" v-if="attachment.status == 1">
            <FSpinner :size="24"></FSpinner>
          </FContainer>
          <FIcon
            v-else
            :pressable="false"
            group="file-upload-colored"
            :name="getExtension(attachment.fileName)"
            size="32"
          >
          </FIcon>
          <div class="flex flex-col justify-around gap-1">
            <FText class="cursor-pointer text-underline">
              {{ attachment.fileName }}
            </FText>
            <FText
              v-if="attachment.status == 3"
              color="textSemanticOrange"
              appearance="captionReg12"
              >Upload failed, please try again.
            </FText>
            <FText v-else color="textCaption" appearance="captionReg12">{{
              prettyBytes(attachment.fileSize)
            }}</FText>
          </div>
        </div>
        <div
          class="flex gap-1.5 attachment-card-actions"
          v-if="attachment.fileId && attachment.fileId > 0"
        >
          <FButton
            iconGroup="connectivity"
            iconName="download"
            appearance="tertiary"
            :iconButton="true"
            @click="downloadFile(attachment)"
          ></FButton>
          <FButton
            iconGroup="action"
            iconName="delete"
            appearance="tertiary"
            :iconButton="true"
            @click="removeFile(attachment)"
          ></FButton>
        </div>
      </FCard>
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
import { API } from '@facilio/api'
import {
  FContainer,
  FEmptyState,
  FAttachment,
  FButton,
  FSpinner,
  FCard,
  FIcon,
  FText,
  FTooltip,
  fDialog,
  ftoast,
  FFilePreview,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { prettyBytes } from '@facilio/utils/filters'
import { getBaseURL } from '../../../../utils/api/base-url'
const UPLOAD_STATUS = {
  UPLOADING: 1,
  SUCCESS: 2,
  FAILED: 3,
}
export default {
  name: 'Attachment',
  components: {
    FContainer,
    FEmptyState,
    FAttachment,
    FButton,
    FSpinner,
    FCard,
    FIcon,
    FText,
    FTooltip,
    FFilePreview,
  },
  props: [
    'module',
    'record',
    'parentModule',
    'resize',
    'groupActionPortal',
    'sectionName',
  ],
  data: () => ({
    filePreviewVisibility: false,
    loading: true,
    attachments: [],
    downloadUrl: null,
    previewFile: null,
  }),
  mounted() {
    this.loadAttachments()
  },
  watch: {
    record() {
      this.loadAttachments()
    },
  },
  computed: {
    filesList() {
      let { attachments = {} } = this || {}
      return attachments.map(attachment => {
        let extension = this.getExtension(attachment.fileName)
        let file = this.formattedFile(attachment)
        return { ...file, extension }
      })
    },
    uploadText() {
      return this.sectionName === 'attachments'
        ? 'Upload Attachments'
        : 'Upload Documents'
    },
    emptyStateTitle() {
      return this.sectionName === 'attachments'
        ? 'No attachments available'
        : 'No documents available'
    },
    emptyStateDescription() {
      return this.sectionName === 'attachments'
        ? 'There have been no attachments added as of now'
        : 'There have been no documents added as of now'
    },
  },
  methods: {
    isEmpty,
    prettyBytes,
    onclose() {
      this.filePreviewVisibility = false
    },
    async loadAttachments() {
      this.loading = true
      let { module, record, parentModule: parentModuleName } = this || {}
      let { id: recordId } = record || {}

      let url = `/attachment/${module}/${parentModuleName}/list/${recordId}`

      let param = {
        module,
        recordId,
      }
      if (!isEmpty(parentModuleName)) {
        param = { ...param, parentModuleName }
      }

      let { data, error } = await API.get(url)
      if (!isEmpty(error)) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { attachments } = data || {}
        this.attachments = attachments
      }
      this.resizeHeight()
      this.loading = false
    },
    openAttachmentsPreview(attachment = {}) {
      this.previewFile = this.formattedFile(attachment)
      this.filePreviewVisibility = true
    },
    async uploadFiles(files) {
      let fileList = Array.from(files)
      if (!fileList.length) return

      // Append the files to FormData
      const formData = new FormData()
      formData.append('module', this.module)
      formData.append('recordId', this.record.id)
      formData.append('parentModuleName', this.parentModule)

      fileList.forEach(file => {
        let { name, size, type } = file || {}
        let fileEntry = {
          fileId: -1,
          fileName: name,
          fileSize: size,
          contentType: type,
          status: UPLOAD_STATUS.UPLOADING,
          error: null,
          previewUrl: null,
          uploadedBy: this.$account.user.id,
          uploadedTime: Date.now(),
        }

        formData.append('attachment', file, name)
        this.attachments.unshift(fileEntry)
      })
      let url = `/attachment/${this.module}/${this.parentModule}/add/${this.record.id}`
      let { data, error } = await API.post(url, formData)
      if (!isEmpty(data)) {
        data.attachments.forEach(attachment => {
          let { fileId, fileName, fileSize } = attachment
          let attachmentIdx = this.attachments.findIndex(
            a => a.fileName === fileName && a.fileSize === fileSize
          )

          if (!isEmpty(attachmentIdx)) {
            let attachmentFile = this.attachments[attachmentIdx]

            if (fileId) {
              attachmentFile = {
                ...attachmentFile,
                ...attachment,
                status: UPLOAD_STATUS.SUCCESS,
              }
            } else {
              attachmentFile = {
                ...attachmentFile,
                status: UPLOAD_STATUS.FAILED,
                error: 'Upload failed.',
              }
            }

            this.$set(this.attachments, attachmentIdx, attachmentFile)
          }
        })
      } else {
        fileList.forEach(file => {
          let { name, size } = file || {}
          let attachmentIdx = this.attachments.findIndex(
            a => a.fileName === name && a.fileSize === size
          )

          if (!isEmpty(attachmentIdx)) {
            let attachmentFile = this.attachments[attachmentIdx]

            attachmentFile = {
              ...attachmentFile,
              status: UPLOAD_STATUS.FAILED,
              error: 'Upload failed.',
            }
            this.$set(this.attachments, attachmentIdx, attachmentFile)
          }
        })
      }
      this.resizeHeight()
    },
    async removeFile(attachment) {
      let { module, record, parentModule: parentModuleName } = this || {}
      let obj = {
        attachmentId: [attachment.id],
        module: module,
        parentModuleName,
        recordId: record?.id,
      }

      let promptValue = await fDialog.warning({
        title: 'Delete Attachment',
        description: 'Are you sure you want to delete this attachment',
        saveText: 'Delete',
        cancelText: 'Cancel',
      })
      let url = `/attachment/${module}/${parentModuleName}/delete/${record?.id}`
      if (promptValue) {
        let { error } = await API.post(url, obj)
        if (!isEmpty(error)) {
          ftoast.critical(error.message || this.$t('error_occurred'))
        } else {
          let attachmentIdx = this.attachments.findIndex(
            a => a.id === attachment.id
          )
          if (attachmentIdx >= 0) {
            ftoast.success('Attachment deleted successfully!')
            this.attachments.splice(attachmentIdx, 1)
            this.resizeHeight()
          }
        }
      }
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
    resizeHeight() {
      this.$nextTick(() => {
        let height = this.$el.scrollHeight + 50
        height = height > 250 && this.attachments.length ? height : 250
        this.resize({ height })
      })
    },
  },
}
</script>
<style scoped>
.attachment-card:hover {
  background: var(--colors-backgroundMidgroundSubtle);
}
.attachment-card:hover .attachment-card-actions {
  visibility: visible;
}
.attachment-card-actions {
  visibility: hidden;
}
.text-underline:hover {
  text-decoration: underline;
}
</style>
