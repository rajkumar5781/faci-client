<template>
  <FModal
    title="Attachments"
    :visible="showAttachmentsDialogue"
    size="S"
    :hideFooter="true"
    padding="containerNone"
    @cancel="closeDialog"
  >
    <FTabs class="task-attachment-tabs" v-model="activeTab" :tabsList="tabs">
      <FTabPane
        class="task-attachment-tabs-content"
        v-for="tab in tabs"
        :activeKey="tab.value"
        :key="tab.value"
      >
      <FSpinner :size="20" v-if="loading"></FSpinner>
        <FImageUploader
          v-else-if="activeTab === 'before'"
          v-model="beforeTask"
          title=""
          description=""
          :uploadFile="uploadBeforeTask"
          :maxCount="maxCount"
          :removeFile="removeFile"
          @onFileDownload="downloadFile"
          @onViewMoreClick="onMoreClick"
          @onImageClick="imageClick"
          emptyCardTitle="No image uploaded yet"
          emptyCardDescription="Currently, there is no image uploaded."

        />
        <FImageUploader
          v-else-if="activeTab === 'after'"
          v-model="afterTask"
          title=""
          description=""
          :uploadFile="uploadAfterTask"
          :maxCount="maxCount"
          :removeFile="removeFile"
          @onFileDownload="downloadFile"
          @onViewMoreClick="onMoreClick"
          @onImageClick="imageClick"
          emptyCardTitle="No image uploaded yet"
          emptyCardDescription="Currently, there is no image uploaded."
        />
      </FTabPane>
    </FTabs>
    <iframe
      v-if="downloadUrl"
      :src="downloadUrl"
      style="display: none"
    ></iframe>
    <div v-if="showPreview">
      <FFilePreview
        :files="previewFileList"
        :openPreview="showPreview"
        :previewFile="preview"
        @close="onclose"
        @onFileDownload="downloadFile"
      />
    </div>
  </FModal>
</template>
<script>
import {
  FContainer,
  FModal,
  FImageUploader,
  fDialog,
  ftoast,
  FTabs,
  FTabPane,
  FFilePreview,
  FSpinner
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import FilePreview from '../../../../components/page-builder/widgets/fieldSummary/FilePreview.vue'

export default {
  props: [
    'isLockedState',
    'isTaskClosed',
    'showAttachmentsDialogue',
    'details',
  ],
  components: {
    FContainer,
    FModal,
    FImageUploader,
    FTabs,
    FTabPane,
    FilePreview,
    FFilePreview,
    FSpinner
  },
  data() {
    return {
      tabs: [
        {
          label: 'Before',
          value: 'before',
        },
        {
          label: 'After',
          value: 'after',
        },
      ],
      activeTab: 'before',
      beforeTask: [],
      afterTask: [],
      maxCount: 6,
      downloadUrl: null,
      loading: false,
      previewFileList: [],
      showPreview: false,
      preview: {},
      attachmentCount: -1,
    }
  },
  mounted() {
    this.loadAttachments()
  },
  methods: {
    async removeFile(attachment) {
      
      let { parentModule: parentModuleName } = this || {}
      let recordId = this.details.id
      let module = 'taskattachments'

      let obj = {
        attachmentId: [attachment.id],
        module: module,
        parentModuleName,
        recordId,
      }

      let promptValue = await fDialog.warning({
        title: 'Delete Attachment',
        description: 'Are you sure you want to delete this attachment',
        saveText: 'Delete',
        cancelText: 'Cancel',
      })
      if (promptValue) {
        let { error } = await API.post('/v2/attachments/delete', obj)
        if (!isEmpty(error)) {
          ftoast.critical(error.message || this.$t('error_occurred'))
        } else {
          ftoast.success('Attachment deleted successfully!')
          this.loadAttachments()
        }
      }
    },
    downloadFile(attachment) {
      if (attachment.downloadUrl) {
        this.downloadUrl = attachment.downloadUrl
      }
    },
    async uploadBeforeTask(files){
      return await this.filesChange(files, 1)
    },
    async uploadAfterTask(files){
      return await this.filesChange(files, 2)
    },
    async filesChange(files, attType) {
      this.loading = true
      let fileList = Array.from(files)
      if (!fileList.length) return

      const formData = new FormData()
      formData.append('module', 'taskattachments')
      formData.append('recordId', this.details.id)
      formData.append('attachmentType', attType)
      fileList.forEach(file => {
        const fileObject = file.originFileObj || file

        if (fileObject instanceof File) {
          formData.append('attachment', fileObject, fileObject.name)
        }
      })
      let { data, error } = await API.post('/attachment/add', formData)
      if (!isEmpty(error)) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Attachment added successfully')
        let { attachments } = data
        let attachmentsList = attachments.map(attachment => {
          return {
            ...attachment,
            url: attachment.previewUrl,
          }
        })
        await this.loadAttachments()
        return attachmentsList
      }
    },
    onMoreClick(val) {
      this.previewFileList = []
      let  photos  = this.beforeTask
      this.previewFileList = photos
      this.preview = photos[0]
      this.showPreview = true
    },
    imageClick(val) {
      this.previewFileList = []
      this.previewFileList.push(val)
      this.preview = val
      this.showPreview = true
    },
    onclose() {
      this.showPreview = false
    },
    closeDialog() {
      this.details.noOfAttachments = this.attachmentCount
      this.$emit('closeAttachment')
    },
    async loadAttachments() {
      this.loading = true
      let { parentModule: parentModuleName } = this || {}
      let recordId = this.details.id
      let module = 'taskattachments'

      let url = `/attachment`

      let param = {
        module,
        recordId,
      }
      if (!isEmpty(parentModuleName)) {
        param = { ...param, parentModuleName }
      }

      let { data, error } = await API.get(url, param)
      if (!isEmpty(error)) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { attachments } = data || {}
        this.attachmentCount = attachments.length
        let beforeData = attachments.filter(item => item.type === 1)

        this.beforeTask = beforeData.map(photo => {
          photo.uid = photo.fileId
          photo.lastModifiedTime = photo.sysModifiedTime
          photo.lastModifiedDate = ''
          photo.name = photo.fileName
          photo.size = 0
          photo.type = photo.contentType
          photo.url = photo.previewUrl
          photo.originFileObj = '[object File]'
          return photo
        })
        let afterData = attachments.filter(item => item.type === 2)
        this.afterTask = afterData.map(photo => {
          photo.uid = photo.fileId
          photo.lastModifiedTime = photo.sysModifiedTime
          photo.lastModifiedDate = ''
          photo.name = photo.fileName
          photo.size = 0
          photo.type = photo.contentType
          photo.url = photo.previewUrl
          photo.originFileObj = '[object File]'
          return photo
        })
        this.maxCount = attachments.length
      }
      this.loading = false
    },
  },
}
</script>
<style>
.task-attachment-tabs > div {
  padding: var(--spacing-containerSmall) var(--spacing-containerXLarge);
  border-bottom: 1px solid var(--colors-borderNeutralBaseSubtle);
}
.task-attachment-tabs-content {
  padding: var(--spacing-sectionSmall) !important;
}
</style>
