<template>
  <FModal
    :title="$t('comments.markdown.text')"
    :visible="markdownshow"
    :hideFooter="true"
    size="S"
    @cancel="cancelForm"
  >
    <div class="comment-body-style h-full">
      <FTable
        :columns="columns"
        :data="data"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data">
          <FContainer style="display: flex">
            <FIcon
              group="files"
              name="copy"
              size="16"
              @click="copyLinkName(data.row.syntax)"
            ></FIcon>
          </FContainer>
        </template>
      </FTable>
    </div>
  </FModal>
</template>

<script>
import {
  FModal,
  FTable,
  FContainer,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import './comment.css'
export default {
  name: 'MarkdownList',
  props: ['markdownshow'],
  components: { FModal, FTable, FContainer, FIcon },
  data() {
    return {
      columns: [
        {
          displayName: this.$t('comments.markdown.element'),
          name: 'element',
          id: 1,
          alignment: 'center',
        },
        {
          displayName: this.$t('comments.markdown.syntax'),
          name: 'syntax',
          id: 3,
          alignment: 'center',
        },
      ],
      data: [
        {
          key: 'bold',
          element: 'Bold',
          output: '',
          syntax: '**Hi There**',
        },
        {
          key: 'h1',
          element: 'H1',
          output: '',
          syntax: '# Hi There',
        },
        {
          key: 'h2',
          element: 'H2',
          output: '',
          syntax: '## Hi There',
        },
        {
          key: 'italics',
          element: 'Italics',
          output: '',
          syntax: '*Hi There*',
        },
        {
          key: 'strike',
          element: 'Strike',
          output: '',
          syntax: '~~Hi There~~',
        },
        {
          key: 'underline',
          element: 'Underline',
          output: '',
          syntax: '++Hi There++',
        },
        {
          key: 'list',
          element: 'List',
          output: '',
          syntax: '- Hi There',
        },
        {
          key: 'blockquote',
          element: 'Blockquote',
          output: '',
          syntax: '> Hi There',
        },
        {
          key: 'hyperlink',
          element: 'Hyperlink',
          output: '',
          syntax: '[Hi There](URL)',
        },
        {
          key: 'highlight',
          element: 'Highlight',
          output: '',
          syntax: '`Hi There`',
        },
        {
          key: 'hr',
          element: 'Horizontal Line	',
          output: '',
          syntax: '---',
        },
      ],
    }
  },
  methods: {
    cancelForm() {
      this.$emit('update:markdownshow', false)
    },
    async copyLinkName(copy) {
      await navigator.clipboard.writeText(copy)
      ftoast.success('Copied to clipboard!')
    },
  },
}
</script>
