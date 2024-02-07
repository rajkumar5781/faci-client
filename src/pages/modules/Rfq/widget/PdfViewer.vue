<template>
  <FContainer ref="pdfViewerContainer">
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="header justify-content-space"
    >
      <FContainer display="flex" gap="containerLarge">
        <FButton
          appearance="secondary"
          size="medium"
          :loading="btnloading"
          @click="downloadPdf"
        >
          <FIcon
            group="default"
            size="16"
            name="download"
            :pressable="false"
          ></FIcon
        ></FButton>

        <FButton
          appearance="secondary"
          size="medium"
          :loading="printPreviewBtnloading"
          @click="openPrintPreview"
        >
          <FIcon
            group="device"
            size="16"
            name="printer"
            :pressable="false"
          ></FIcon>
        </FButton>
      </FContainer>
    </portal>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      paddingTop="sectionMedium"
    >
      <FSpinner :size="30" />
    </FContainer>
    <PDFTemplateViewer
      v-else
      :id="templateId"
      :recordId="recordId"
      :moduleName="moduleName"
      @fitPage="resizeOnLoad"
    ></PDFTemplateViewer>
    <iframe
      v-if="downloadUrl"
      :src="downloadUrl"
      style="display: none"
    ></iframe>
  </FContainer>
</template>
<script lang="jsx">
import {
  FContainer,
  FSpinner,
  FEmptyState,
  ftoast,
  FIcon,
  FTooltip,
  FButton,
} from '@facilio/design-system'
import getProperty from 'dlv'
import PDFTemplateViewer from '../../../../components/pdf-template/PDFTemplateViewer.vue'
import { API } from '@facilio/api'
import { getPdfPreviewUrl } from '../utils/purchaseUtils'
export default {
  name: 'PdfViewer',
  props: ['widget', 'details', 'fitMyContent'],
  components: {
    FContainer,
    PDFTemplateViewer,
    FSpinner,
    FEmptyState,
    FIcon,
    FTooltip,
    FButton,
  },
  data() {
    return {
      templateId: null,
      loading: false,
      printPreviewBtnloading: false,
      btnloading: false,
      downloadUrl: null,
    }
  },
  computed: {
    recordId() {
      return getProperty(this, 'details.id', null)
    },
    moduleName() {
      return getProperty(this, 'details.moduleName', 'purchaseorder')
    },
  },
  created() {
    this.init()
  },
  methods: {
    resizeOnLoad() {
      this.fitMyContent()
    },
    async init() {
      let { moduleName, widget, details } = this
      let { id } = details || {}
      let { id: widgetId, widgetType } = widget || {}
      this.loading = true
      let { data, error } = await API.get(
        'v1/setup/customPage/widget/widgetDetail/get',
        {
          moduleName,
          id: widgetId,
          recordId: id,
          widgetType,
        }
      )
      if (error) {
        ftoast.critical(error?.message || 'Error Occurred')
      } else {
        let { widgetDetail } = data?.result || {}
        let { templateId } = widgetDetail || {}
        this.templateId = templateId
      }
      this.loading = false
    },
    openPrintPreview() {
      this.printPreviewBtnloading = true
      let { moduleName, templateId, details = {} } = this
      let { id } = details
      let url = getPdfPreviewUrl(moduleName, templateId, id)
      window.open(url, '_blank', 'noopener,noreferrer')
      this.printPreviewBtnloading = false
    },
    async downloadPdf() {
      this.btnloading = true
      let { moduleName, templateId, details = {} } = this
      let downloadInfoObj = {
        title: this.$t('purchase_order.downloading', { ns: 'procurement' }),
        manualClear: false,
        menuType: 'toast',
        timeout: 2000,
      }
      ftoast.information('', downloadInfoObj)
      let { id: recordId } = details

      let url = `v3/pdftemplates/download/${moduleName}/${recordId}`
      let param = { id: templateId }
      let { error = {}, data } = await API.get(url, param)
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'))
      } else {
        let { fileID } = data
        this.downloadUrl = '/api/v2/files/download/' + fileID
      }
      this.btnloading = false
    },
  },
}
</script>
