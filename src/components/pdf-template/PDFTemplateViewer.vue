<template>
  <FContainer padding="sectionXSmall sectionSmall">
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      paddingTop="sectionMedium"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      display="flex"
      justifyContent="center"
      marginTop="sectionLarge"
      v-else-if="templateError"
    >
      <FEmptyState
        :title="$t('pdf.empty_state_title', { ns: 'procurement' })"
        :description="$t('pdf.empty_state_description', { ns: 'procurement' })"
        vertical
        size="M"
        illustration="end-of-list"
      />
    </FContainer>
    <div
      class="preview-templates"
      :class="isSummary && 'print-preview'"
      v-else
    ></div>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import {
  FSpinner,
  ftoast,
  FContainer,
  FEmptyState,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { santitizeWithUnescapeHTML } from '../../utils/sanitize'

export default {
  name: 'PDFTemplateViewer',
  props: {
    id: {
      type: Number,
    },
    moduleName: {
      type: String,
    },
    recordId: {
      type: Number,
    },
    templateLoading: {
      type: Boolean,
    },
    isSummary: {
      type: Boolean,
    },
  },
  data() {
    return {
      loading: false,
      previewData: '',
      templateError: false,
    }
  },
  components: {
    FSpinner,
    FContainer,
    FEmptyState,
  },
  computed: {
    unescapedContent() {
      return santitizeWithUnescapeHTML(this.previewData)
    },
  },
  created() {
    this.loadPdfPreviewData()
  },
  methods: {
    mountShadowDOM() {
      const host = this.$el.querySelector('.preview-templates')

      if (!host) {
        console.error(`Host element not found using selector: ${host}`)
        return
      }

      const shadow = host.attachShadow({ mode: 'closed' })
      const parsedDOM = new DOMParser().parseFromString(
        this.unescapedContent,
        'text/html'
      )

      // Process style node
      const styleNode = parsedDOM.querySelector('style')
      const cssText = styleNode.textContent.replace(/:root/g, ':host')
      styleNode.remove()

      const sheet = new CSSStyleSheet()
      sheet.replaceSync(cssText)
      shadow.adoptedStyleSheets = [sheet]

      // Append the body content to the shadow DOM
      shadow.appendChild(parsedDOM.querySelector('body').cloneNode(true))
    },
    async loadPdfPreviewData() {
      this.loading = true
      let { id, moduleName, recordId } = this
      let url = `v3/pdftemplates/preview/${moduleName}/${recordId}`
      let param = { id }
      try {
        let { data, error } = await API.get(url, param)
        if (error) {
          this.templateError = true
          ftoast.critical(error.message || this.$t('error_occurred'))
        } else {
          this.previewData = getProperty(data, 'pdfTemplateHTML', '')
          this.$nextTick(setTimeout(this.mountShadowDOM.bind(this)))
        }
      } catch (err) {
        this.templateError = true
        ftoast.critical(err.message || this.$t('error_occurred'))
      } finally {
        this.loading = false
        this.$nextTick(() => {
          this.$emit('fitPage')
        })
      }

      this.loading = false
    },
  },
}
</script>
<style scoped>
.preview-templates.print-preview {
  border: solid 1px #ccc;
  width: 900px;
  margin: 0 auto;
  height: 100vh;
  padding: 12px;
}
@media print {
  .preview-templates.print-preview {
    border: none;
    padding: 0;
  }
}
</style>
