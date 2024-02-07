<template>
  <FContainer
    display="flex"
    flexDirection="column"
    rowGap="containerXxLarge"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
  >
    <FContainer display="flex">
      <FText appearance="headingMed14" color="textMain">
        {{ $t('field_names.attachments') }}
      </FText>
    </FContainer>
    <FContainer display="flex" flexDirection="column">
      <FileUpload
        v-model="attachments.files"
        type="file-multiple"
        :formModel="attachments"
        :field="fileField"
        :defaultFiles="defaultFiles"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText } from '@facilio/design-system'
import { FileUpload } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  components: {
    FContainer,
    FText,
    FileUpload,
  },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      dataDeserialized: false,
      defaultFiles: [],
      attachments: { files: [] },
      fileField: {
        name: 'files',
        displayTypeEnum: 'ATTACHMENT',
      },
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let files = getProperty(this, 'attachments.files', [])
      let fileIds = files.map(file => file?.fileId)
      if (!isEmpty(fileIds)) {
        return { fileIds }
      }
      return {}
    },
    deserializeData() {
      let { flaggedEventRule = {} } = this
      let { files = [] } = flaggedEventRule
      if (!isEmpty(files)) {
        files = files.map(file => {
          let name = file?.fileName
          return { ...file, name }
        })
      }
      this.defaultFiles = files
      this.attachments.files = files
      this.dataDeserialized = true
    },
  },
}
</script>
