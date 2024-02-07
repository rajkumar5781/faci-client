<template>
  <FModal
    :visible="true"
    size="XL"
    padding="containerNone"
    :hideFooter="true"
    @cancel="handleCancel"
  >
    <template #header>
      <FContainer
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexGrow="1"
      >
        <FText appearance="headingMed16" color="textMain">PDF Preview</FText>
      </FContainer>
    </template>
    <template #close-icon>
      <FContainer display="flex" gap="containerMedium" alignItems="center">
        <FIcon
          group="default"
          size="20"
          name="download"
          @click="downloadPdf"
        ></FIcon>
        <FIcon
          group="device"
          size="20"
          name="printer"
          @click="openPrintPreview"
        ></FIcon>
        <FIcon group="default" name="close" size="20" @click="handleCancel" />
      </FContainer>
    </template>
    <FContainer padding="containerXLarge sectionSmall" height="700px">
      <PDFTemplateViewer
        :id="templateId"
        :moduleName="moduleName"
        :recordId="recordId"
      ></PDFTemplateViewer>
      <iframe
        v-if="downloadUrl"
        :src="downloadUrl"
        style="display: none"
      ></iframe>
    </FContainer>
  </FModal>
</template>
<script>
import {
  FModal,
  FContainer,
  FText,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import PDFTemplateViewer from '../../pdf-template/PDFTemplateViewer.vue'
import { getPdfPreviewUrl } from '../../../pages/modules/Rfq/utils/purchaseUtils'
import { API } from '@facilio/api'

export default {
  props: ['selectedButton', 'moduleName', 'record'],
  components: { FModal, FContainer, FText, PDFTemplateViewer, FIcon },
  data() {
    return { downloadUrl: null }
  },
  computed: {
    recordId() {
      let { id = null } = this.record || {}
      return id
    },
    templateId() {
      let { config } = this.selectedButton || {}
      let { templateId = null } = config || {}
      return templateId
    },
  },
  methods: {
    handleCancel() {
      this.$emit('onClose')
    },
    async downloadPdf() {
      let { moduleName, templateId, recordId } = this
      let downloadInfoObj = {
        title: this.$t('purchase_order.downloading', { ns: 'procurement' }),
        manualClear: false,
        menuType: 'toast',
        timeout: 2000,
      }
      ftoast.information('', downloadInfoObj)
      let params = {
        moduleName,
        id: templateId,
        recordId,
      }
      let { error = {}, data } = await API.get(
        `v3/pdftemplates/download`,
        params
      )
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'))
      } else {
        let { fileID } = data
        this.downloadUrl = '/api/v2/files/download/' + fileID
      }
    },
    openPrintPreview() {
      let { moduleName, templateId, recordId } = this
      let url = getPdfPreviewUrl(moduleName, templateId, recordId)
      window.open(url, '_blank', 'noopener,noreferrer')
    },
  },
}
</script>
