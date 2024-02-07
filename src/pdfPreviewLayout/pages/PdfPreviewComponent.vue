<template>
  <FContainer>
    <FContainer>
      <PDFTemplateViewer
        :isSummary="true"
        :id="templateId"
        :recordId="recordId"
        :moduleName="moduleName"
      ></PDFTemplateViewer>
    </FContainer>
  </FContainer>
</template>
<script lang="jsx">
import { FContainer, FSpinner, FEmptyState } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import PDFTemplateViewer from '../../components/pdf-template/PDFTemplateViewer.vue'
export default {
  name: 'PdfPreViewer',
  components: { FContainer, PDFTemplateViewer, FSpinner, FEmptyState },
  computed: {
    recordId() {
      let recordId = getProperty(this, '$route.params.recordId', null)
      return parseInt(recordId)
    },
    moduleName() {
      return getProperty(this, '$route.params.moduleName', 'purchaseorder')
    },
    templateId() {
      let templateId = getProperty(this, '$route.query.id', null)
      return templateId ? parseInt(templateId) : null
    },
  },
  methods: {
    isEmpty,
  },
}
</script>
