<template>
  <FContainer
    padding="containerLarge"
    class="comment-body-style text-sm flex flex-col justify-between"
  >
    <EditorContent ref="NotesEditor" :editor="editor" />
    <div class="flex flex-row">
      <slot name="attachments"></slot>
      <FText
        appearance="captionReg12"
        color="textCaption"
        class="flex items-end justify-end w-1/4"
        v-if="editor && expandTextBox"
        >{{ editor.storage.characterCount.characters() }}/{{ charLimit }}
        {{ 'characters' }}
      </FText>
    </div>
  </FContainer>
</template>

<script>
import { FContainer, FText, FRow, FCol } from '@facilio/design-system'
import Mention from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-2'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import { PluginKey } from 'prosemirror-state'
import { getSuggestions } from './comment-suggestions'
import { isEmpty } from '@facilio/utils/validation'
import { sanitize } from '@facilio/utils/sanitize'
const PEOPLE_MENTION_CLASS = 'comment-mentions-people'
const RECORD_MENTION_CLASS = 'comment-mentions-record'
import './comment.css'
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    parentModule: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    charLimit: {
      type: Number,
    },
    expandTextBox: {
      type: Boolean,
    },
    autofocus: {
      type: Boolean,
    },
    peopleFromRecordFields: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  components: {
    FContainer,
    FText,
    FRow,
    FCol,
    EditorContent,
  },

  watch: {
    isRichTextFocused(isRichTextFocused) {
      if (isRichTextFocused) {
        this.$emit('focus')
      }
    },
  },

  data() {
    return {
      editor: null,
    }
  },
  computed: {
    content: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
    isRichTextFocused() {
      return this.editor?.isFocused || false
    },
    atMention() {
      const CommentSuggestions = getSuggestions(this)
      return Mention.extend({ name: 'atMention' }).configure({
        HTMLAttributes: {
          class: PEOPLE_MENTION_CLASS,
        },
        renderLabel({ node }) {
          return `@${node.attrs.label ?? node.attrs.id}`
        },
        suggestion: {
          ...CommentSuggestions,
          char: '@',
          pluginKey: new PluginKey('atKey'),
          items: () => {
            return {
              moduleName: 'people',
              peopleFromRecordFields: this.peopleFromRecordFields,
            }
          },
        },
      })
    },
    slashMention() {
      const CommentSuggestions = getSuggestions(this)
      return Mention.extend({ name: 'slashMention' }).configure({
        HTMLAttributes: {
          class: RECORD_MENTION_CLASS,
        },
        renderLabel({ node }) {
          return `/${node.attrs.label ?? node.attrs.id}`
        },

        suggestion: {
          ...CommentSuggestions,
          parent: this,
          char: '/',
          pluginKey: new PluginKey('slashKey'),
          items: () => {
            return {
              moduleName: this.parentModule,
            }
          },
        },
      })
    },
  },

  mounted() {
    this.init()
  },

  beforeUnmount() {
    this.editor.destroy()
  },
  methods: {
    init() {
      let { content, placeholder, onUpdate, atMention, slashMention } = this
      this.editor = new Editor({
        extensions: [
          StarterKit,
          Link,
          Placeholder.configure({
            emptyEditorClass: 'is-editor-empty',
            emptyNodeClass: 'is-empty',
            placeholder: this.placeholder || 'Add a comment',
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
          }),
          CharacterCount.configure({
            limit: this.charLimit,
          }),
          atMention,
          slashMention,
        ],
        content,
        onUpdate,
      })
      if (this.autofocus) {
        this.editor.chain().focus()
      }
    },
    onUpdate({ editor }) {
      let html = editor.getHTML()
      let isNotEmpty = !isEmpty(editor.getText)
      let hasChanged = sanitize(html) !== sanitize(this.content)

      if (isNotEmpty || hasChanged) {
        this.content = html
        this.$emit('input', isNotEmpty ? sanitize(html) : null)
      }
    },
    triggerPeopleMention() {
      this.editor.chain().insertContent('@').focus().run()
    },
    triggerSlashMention() {
      this.editor.chain().insertContent('/').focus().run()
    },
    setContent(content) {
      this.editor.setContent(content)
    },
    prefillMentionForReply(user) {
      if (!user || !user.peopleId || !user.name) {
        return
      }
      let moduleName = 'people'
      let props = {
        id: `${moduleName}~${user.peopleId}`,
        label: `${user.name}`,
      }
      this.editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'atMention',
            attrs: props,
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run()
    },
  },
}
</script>
