<template>
  <FContainer padding="containerXxLarge">
    <FacilityPhotosShimmer v-if="loading" />
    <div v-else>
      <FImageUploader
        v-model="photos"
        title=""
        :uploadFile="uploadFiles"
        :maxCount="maxCount"
        :removeFile="removeFileHandler"
        @onFileDownload="downloadFile"
        @onViewMoreClick="onMoreClick"
        @onImageClick="imageClick"
      />
    </div>
    <iframe
      v-if="exportDownLoadURL"
      :src="exportDownLoadURL"
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
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FEmptyState,
  FSpinner,
  FImageUploader,
  ftoast,
  FFilePreview,
} from '@facilio/design-system'
import FilePreview from '../../../../components/page-builder/widgets/fieldSummary/FilePreview.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import FacilityPhotosShimmer from './FacilityPhotosShimmer.vue'

export default {
  props: ['widget', 'details', 'fitMyContent'],
  components: {
    FContainer,
    FText,
    FEmptyState,
    FSpinner,
    FilePreview,
    FImageUploader,
    FFilePreview,
    FacilityPhotosShimmer,
  },
  data() {
    return {
      loading: true,
      photos: [],
      loading: true,
      imageAttachments: [],
      visibility: false,
      previewIndex: null,
      maxCount: 3,
      exportDownLoadURL: null,
      previewFileList: [],
      showPreview: false,
      preview: {},
    }
  },
  created() {
    this.init()
  },
  computed: {
    getImagesForPreview() {
      return this.imageAttachments.slice(0, 5)
    },
  },
  methods: {
    async init() {
      await this.loadPhotos()
      this.fitMyContent()
    },
    async loadPhotos() {
      this.loading = true
      let { id } = this.details
      let params = { module: 'facilityphotos', parentId: id }
      let { data, error } = await API.get(`/photos/get`, params)
      if (!isEmpty(error)) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else if (!isEmpty(data)) {
        let { photos = [] } = data || {}

        this.photos = photos.map(photo => {
          let { parentId, photoId, sysModifiedTime } = photo
          photo.uid = 'unique-id-' + parentId + '-' + photoId
          photo.lastModifiedTime = sysModifiedTime
          photo.lastModifiedDate = ''
          photo.name = 'Image'
          photo.type = 'image/png'
          photo.percent = 0
          photo.originFileObj = '[object File]'
          photo.contentType = 'image/png'
          return photo
        })
      }
      this.loading = false
    },
    openAttachmentsPreview(index) {
      this.previewIndex = index
      this.visibility = true
    },
    setPhotos(data) {
      this.imageAttachments = data
      this.loading = false
    },
    openPhotosUpdater() {
      this.$refs['photos-updater'].open()
    },
    async uploadFiles(files = []) {
      this.loading = true
      if (!isEmpty(files)) {
        let fileList = Array.from(files)
        if (!fileList.length) return

        let { details } = this
        let data = {
          parentId: details.id,
          module: 'facilityphotos',
        }
        let photosList = []
        files.map(async uploadFile => {
          let fileData = uploadFile?.originFileObj || {}

          const formData = new FormData()
          formData.append('file', fileData, fileData.name)

          for (let key in data) {
            this.setFormData(key, data[key], formData)
          }

          let { data: phi } = await API.post('v2/photos/upload', formData)

          let { photos } = phi || {}
          let photo = photos[0]
          let photoObj = {
            ...uploadFile,
            url: photo.url,
            id: photo.id,
            parentId: data.parentId,
            photoId: photo.photoId,
            contentType: 'image/png',
          }
          photosList.push(photoObj)
        })
        this.$nextTick(() => {
          this.loading = false
        })
        return photosList
      }
      this.loading = false
    },
    async removeFileHandler(file) {
      if (!isEmpty(file)) {
        this.loading = true
        let { id } = await API.post('v2/photos/delete', {
          id: file.id,
          photoId: file.photoId,
          module: 'facilityphotos',
          parentId: this.details.id,
        })
        if (!isEmpty(id)) {
          ftoast.critical('Error Occured')
        } else {
          await this.init()

          ftoast.success('Image Deleted Successfully!')
        }
        this.loading = false
      }
    },
    downloadFile(val) {
      let { url } = val

      if (this.exportDownloadUrl) {
        this.exportDownloadUrl = null
      }
      this.$nextTick(() => {
        this.exportDownloadUrl = url
      })
    },
    onMoreClick(val) {
      this.previewFileList = []
      let { photos } = this
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
    setFormData(prop, object, formdata) {
      if (typeof object === 'string' || object || object === false) {
        if (Array.isArray(object)) {
          object.forEach((element, index) => {
            this.setFormData(prop + '[' + index + ']', element, formdata)
          })
        } else if (typeof object === 'object') {
          if (isFileObject(object)) {
            if (object instanceof File) {
              formdata.append(prop + 'FileName', object.name)
            }
            formdata.append(prop + 'ContentType', object.type)
            formdata.append(prop, object, object.name)
          } else {
            for (let key in object) {
              if (
                typeof object[key] === 'string' ||
                object[key] ||
                object[key] === false
              ) {
                this.setFormData(prop + '.' + key, object[key], formdata)
              }
            }
          }
        } else {
          formdata.append(prop, object)
        }
      }
    },
  },
}
</script>
