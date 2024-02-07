<template>
  <FContainer display="flex" flexWrap="wrap" paddingTop="containerXLarge" paddingLeft="containerXLarge" paddingRight="containerXLarge">
    <FContainer
      v-for="(attachment, index) in attachmentsDetails"
      :key="`attachment-${index}`"
    >
      <FContainer
        v-if="!isEmpty(attachment)"
        display="flex"
        width="90px"
        height="30px"
        border="solid 1px"
        borderColor="backgroundMidgroundDark"
        borderRadius="high"
        padding="containerMedium"
        marginBottom="containerXLarge"
        marginRight="containerXLarge"
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
            <template slot="title"> {{ attachment.name }}</template>
            <FContainer
              paddingLeft="containerMedium"
              width="50px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              letterSpacing="0.5px"
            >
              <FText appearance="captionReg10">{{ attachment.name }}</FText>
            </FContainer>
          </FTooltip>
        </FContainer>
        <FContainer @click="deleteAttachment(index)" cursor="pointer">
          <FIcon
            group="action"
            name="delete"
            size="12"
            :pressable="true"
          ></FIcon>
        </FContainer>
      </FContainer>
    </FContainer>
    <div v-if="!isEmpty(loadingFiles)">
    <FContainer 
      v-for="(attachment, index) in loadingFiles"
      :key="`loadingfiles-${index}`"
      cursor="not-allowed"
    >
      <FContainer
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
        opacity="0.5"
      >
        <FContainer height="100%" display="flex" alignItems="center">
          <FIcon
            group="file-upload-colored"
            name="unsupported"
            size="16"
            :pressable="false"
          >
        </FIcon>
        </FContainer>
        <FContainer overflow="hidden">
          <FTooltip placement="top">
            <template slot="title">
              <FText>
                {{ $t('service_request.uploading', { ns: 'servicerequest' }) }}
              </FText>
            </template>
            <FContainer
              paddingLeft="containerMedium"
              width="70px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              letterSpacing="0.5px"
            >
              <FText appearance="captionReg10">{{ attachment.name }}</FText>
            </FContainer>
          </FTooltip>
        </FContainer>
      </FContainer>
    </FContainer>
  </div>
  </FContainer>
</template>
<script>
import { FContainer, FText, FTooltip, FIcon } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['attachmentsList', 'loadingFiles'],
  components: {
    FContainer,
    FText,
    FTooltip,
    FIcon,
  },

  computed: {
    attachmentsDetails() {
      let { attachmentsList } = this || {}
      return attachmentsList.map(attachment => {
        let extension = this.getExtension(attachment.name)
        return { ...attachment, extension }
      })
    },
  },
  methods: {
    isEmpty,

    deleteAttachment(index) {
      this.$emit('deleteAttachment', index)
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
