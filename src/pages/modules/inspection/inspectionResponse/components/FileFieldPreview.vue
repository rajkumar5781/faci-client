<template>
  <div class="flex flex-col">
    <div
      class="flex flex-col"
      style="width: 50%"
      v-for="(attachment, index) in files"
      :key="`remarks-${index}-${attachment.id}`"
    >
      <template v-if="isImageType(attachment)">
        <div class="image-container" @click.stop="openFile(attachment)">
          <img
            :src="getImageUrl(attachment)"
            class="fc-avatar-square image-preview"
            v-bind:class="{ overlay: canShowOverlay(index) }"
          />
          <!-- Todo: We need to show images on demand when clicked on showMoreOverlay +icon -->
          <!-- <span v-if="canShowOverlay(index)" class="overlay-count f24"
            >+{{ hiddenAttachmentCount }}</span
          > -->
        </div>
      </template>
      <template v-else>
        <div class="position-relative cursor-pointer">
          <div v-if="canShowOverlay(index)" class="overlay-count">
            +{{ hiddenAttachmentCount }}
          </div>
          <div
            @click="openFile(attachment)"
            :class="[
              'file-icon flex flex-row p10',
              canShowOverlay(index) && 'svg-overlay',
            ]"
          >
            <InlineSvg
              :src="getFileIcon(attachment)"
              class="d-flex"
              iconClass="icon icon-40"
            >
            </InlineSvg>
            <div class="f14 primary-font font-bold mL10">
              {{ attachment.fileName }}
            </div>
          </div>
        </div>
      </template>
      <div v-if="attachment.remarks" class="remarks">
        {{ attachment.remarks }}
      </div>
    </div>
    <FilePreview
      :visibility.sync="previewVisiblity"
      v-if="previewVisiblity"
      :previewFile="attachment"
      :files="[attachment]"
    ></FilePreview>
  </div>
</template>

<script>
import FilePreview from '../../../../../components/page-builder/widgets/fieldSummary/FilePreview.vue'
import { isArray, isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { getBaseURL } from '../../../../../utils/api/base-url'

const FILE_TYPE_ICONS = [
  {
    path: 'svgs/community-file-types/default-file-icon',
    fileTypes: ['default'],
  },
  { path: 'svgs/community-file-types/doc-icon', fileTypes: ['word'] },
  { path: 'svgs/community-file-types/xls-icon', fileTypes: ['sheet', 'xls'] },
  { path: 'svgs/community-file-types/pdf-icon', fileTypes: ['pdf'] },
  { path: 'svgs/community-file-types/zip-icon', fileTypes: ['zip'] },
]
export default {
  props: ['attachments'],
  components: { FilePreview },
  data() {
    return {
      previewVisiblity: false,
      attachment: null,
      maxCount: 5,
    }
  },
  computed: {
    files() {
      let answer = getProperty(this, 'attachments')
      if (isArray(answer)) {
        let imageFiles = answer.filter(file =>
          file.contentType.includes('image')
        )
        let otherFiles = answer.filter(
          file => !file.contentType.includes('image')
        )
        return [...imageFiles, ...otherFiles]
      }
      return [answer]
    },
    previewAttachments() {
      let { files, maxCount } = this
      return files.slice(0, maxCount + 1)
    },
    hiddenAttachmentCount() {
      let { files: { length: length } = {}, maxCount } = this
      return Math.abs(length - maxCount)
    },
  },
  methods: {
    openFile(file) {
      let { contentType, fileName, url, previewUrl, downloadUrl } = file || {}

      let currentUrl = url || previewUrl
      this.previewVisiblity = true
      this.attachment = {
        contentType: contentType,
        fileName: fileName,
        previewUrl: currentUrl,
        downloadUrl,
      }
    },
    getFileIcon(attachment) {
      let { contentType } = attachment

      let selectedIndex = FILE_TYPE_ICONS.findIndex(icons => {
        let { fileTypes } = icons
        return fileTypes.some(type => contentType.includes(type))
      })

      if (isEmpty(selectedIndex)) return FILE_TYPE_ICONS[0].path
      return FILE_TYPE_ICONS[selectedIndex].path
    },
    getImageUrl(attachment) {
      let currentUrl = attachment.url || attachment.previewUrl
      // in local to display image remove getBaseURL
      return getBaseURL + currentUrl
    },
    canShowOverlay(index) {
      let { maxCount, hiddenAttachmentCount } = this
      return index === maxCount && hiddenAttachmentCount > 1
    },
    isImageType(attachment) {
      return getProperty(attachment, 'contentType', []).includes('image')
    },
  },
}
</script>

<style lang="scss" scoped>
.image-preview,
.file-icon {
  margin-right: 30px;
  margin-top: 10px;
  border: solid 1px #e2e8ee;
  border-radius: 5px;
  display: flex;
  align-items: center;
  &:hover {
    filter: brightness(0.5) !important;
    background-color: rgba(0, 0, 0, 0.5);
    position: relative;
  }
}

.image-container {
  position: relative;
  width: 65%;
  cursor: pointer;
}

.image-preview {
  width: 100%;
  height: auto;
  &.overlay {
    filter: brightness(0.7);
  }
}

.file-icon {
  height: 100px;
}
.remarks {
  line-height: 1.43;
  letter-spacing: 0.58px;
  color: #324056;
  font-size: 14px;
  margin-top: 15px;
  padding: 0px 30px 0px 20px;
}
.svg-overlay {
  filter: brightness(0.5);
  background-color: rgba(0, 0, 0, 0.5);
  position: relative;
}
.image-overlay {
  width: 50%;
  height: 97%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  position: absolute;
  top: 10px;
  cursor: pointer;
  border-radius: 5px;
}
.overlay-count {
  line-height: 0;
  color: #fff;
  position: absolute;
  top: 33.6px;
  left: 17.6px;
  z-index: 99;
}
.empty-notes-desc {
  font-size: 12px;
  letter-spacing: 0.34px;
  text-align: center;
  color: #b3afc9;
}
</style>
