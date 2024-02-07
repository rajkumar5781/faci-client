<template>
  <FContainer display="flex" padding="containerXxLarge">
    <FAvatar
      style="margin-top: var(--spacing-containerMedium)"
      :userName="userName"
    />
    <FContainer
      border="solid 1px"
      borderColor="borderNeutralBaseSubtle"
      borderRadius="medium"
      marginLeft="containerXLarge"
      width="100%"
    >
      <CommentEditor
        ref="notesEditor"
        v-model="comment.bodyHTML"
        :placeholder="placeholder"
        :parentModule="CommentService.parentModule"
        :peopleFromRecordFields="CommentService.peopleFromRecordFields"
        :charLimit="charLimit"
        :expandTextBox="expandTextBox"
        :autofocus="isReply || autofocus"
        @focus="triggerFocus"
        @input="inputHandler"
        class="comment-box-input"
        :style="{ minHeight }"
      >
        <template #attachments>
          <FContainer v-if="!attachments.length" class="w-9/12"></FContainer>
          <FContainer
            v-if="attachments.length"
            class="w-9/12 flex flex flex-wrap"
            gap="containerLarge"
            marginTop="containerLarge"
          >
            <FTooltip
              v-for="(attachment, index) in attachments"
              :key="index"
              style="pointer-events: all"
            >
              <template slot="title">{{
                attachment.isUploading
                  ? 'Uploading...'
                  : attachment.isFailed
                  ? attachment.error || 'Failed to upload'
                  : prettyBytes(attachment.fileSize)
              }}</template>
              <FTags
                :text="
                  attachment.isFailed
                    ? '⚠ ' + attachment.fileName
                    : attachment.fileName
                "
                :disabled="attachment.isUploading"
                appearance="action"
                actionType="removable"
                @close="removeAttachment(index)"
              >
              </FTags>
            </FTooltip>
          </FContainer>
        </template>
      </CommentEditor>
      <FContainer
        v-if="expandTextBox"
        display="flex"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtle"
        padding="containerLarge"
        justifyContent="space-between"
        class="overflow-hidden"
      >
        <FContainer display="flex" gap="containerMedium">
          <FTooltip>
            <template slot="title">{{
              $t('comments.mention_people')
            }}</template>
            <FIcon
              v-if="toolbar?.mention_people == false ? false : true"
              @click="peopleMentionButton"
              size="16"
              group="text-edit"
              name="at"
              color="iconNeutralDefault"
            ></FIcon>
          </FTooltip>
          <FTooltip>
            <template slot="title">{{
              $t('comments.mention_record')
            }}</template>
            <FIcon
              v-if="toolbar?.mention_record == false ? false : true"
              @click="recordMentionButton"
              size="16"
              group="text-edit"
              name="record-mention"
              color="iconNeutralDefault"
            ></FIcon>
          </FTooltip>
          <FTooltip v-if="toolbar?.attach_files == false ? false : true">
            <template slot="title">{{ $t('comments.attach_files') }}</template>
            <label>
              <input
                class="hidden"
                type="file"
                multiple
                @change="filesChange($event.target.files)"
              />
              <FIcon
                size="16"
                group="text-edit"
                name="attachment"
                color="iconNeutralDefault"
              ></FIcon>
            </label>
          </FTooltip>
          <FTooltip v-if="toolbar?.markdowns == false ? false : true">
            <template slot="title">{{ $t('comments.markdowns') }}</template>
            <FIcon
              size="16"
              group="text-edit"
              name="markup"
              color="iconNeutralDefault"
              @click="markdownshow = true"
            ></FIcon>
          </FTooltip>
        </FContainer>
        <FContainer display="flex" gap="containerLarge">
          <CommentVisiblity
            v-model="commentSharing"
            :apps="CommentService.portalApps"
            v-if="
              toolbar?.comment_visibility == false || isReply ? false : true
            "
          >
            <FButton
              appearance="tertiary"
              size="small"
              iconGroup="default"
              iconName="eye-open"
            >
              {{
                commentSharing && commentSharing.length
                  ? $t('comments.sharing.public')
                  : $t('comments.sharing.private')
              }}
            </FButton>
          </CommentVisiblity>
          <template v-if="!hideActionButton">
            <FButton
              appearance="secondary"
              size="small"
              @click="close"
              :disabled="isAddingNotes"
            >
              {{ cancelBtn }}
            </FButton>
            <FButton
              size="small"
              @click="saveNote"
              :loading="isAddingNotes"
              :disabled="isFileUploading"
            >
              {{ saveBtn }}
            </FButton>
          </template>
        </FContainer>
      </FContainer>
    </FContainer>
    <CommentMarkdowns :markdownshow.sync="markdownshow" />
  </FContainer>
</template>

<script>
import {
  FContainer,
  FAvatar,
  FIcon,
  FButton,
  FTags,
  FTooltip,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import CommentEditor from './CommentEditor.vue'
import CommentMarkdowns from './CommentMarkdowns.vue'
import CommentVisiblity from './CommentVisiblity.vue'
import { prettyBytes } from '@facilio/utils/filters'
import { isEmpty } from '@facilio/utils/validation'
import { getCommentService } from './comment-service'
import cloneDeep from 'lodash/cloneDeep'
import { ftoast } from '@facilio/design-system'

const MENTIONS_TYPE_HASH = {
  people: 1,
  role: 2,
  team: 3,
  record: 4,
}
const SUGGESTIONS_TYPE = {
  PEOPLE: 'people',
  ROLE: 'role',
  TEAM: 'team',
  RECORD: 'record',
}

export default {
  name: 'CommentsInput',
  components: {
    FContainer,
    FAvatar,
    FIcon,
    FButton,
    FTags,
    FTooltip,
    CommentEditor,
    CommentMarkdowns,
    CommentVisiblity,
  },
  inject: {
    CommentService: {
      default: getCommentService(),
    },
    resizeNotesWidget: {
      default: () => {},
    },
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return { bodyHTML: '' }
      },
    },
    referer: {
      type: Object, //user
      default: () => {
        return {}
      },
    },
    parentNote: {
      type: Object,
    },
    placeholder: {
      type: String,
    },
    toolbar: {
      type: Object,
    },
    saveBtn: {
      type: String,
      default: 'Save',
    },
    cancelBtn: {
      type: String,
      default: 'Cancel',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    hideActionButton: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.init()
  },
  mounted() {
    if (this.isReply && !isEmpty(this.referer)) {
      this.$refs['notesEditor'].prefillMentionForReply(this.referer)
    }
    if (this.isEdit) {
      this.$refs['notesEditor'].editor?.commands.focus('end')
    }
  },
  data() {
    return {
      markdownshow: false,
      expandTextBox: false,
      isAddingNotes: false,
      isFileUploading: false,
      commentSharing: [],
      attachments: [],
      comment: { bodyHTML: '' },
    }
  },
  computed: {
    userName() {
      let { $account } = this || {}
      let { user } = $account || {}
      let { name } = user || {}
      return name
    },
    minHeight() {
      let { expandTextBox } = this
      return expandTextBox ? `70px` : `40px`
    },
    isFormComments() {
      return false
    },
    isReply() {
      let { parentNote } = this
      return !isEmpty(parentNote)
    },
    isEdit() {
      let { value } = this
      return !isEmpty(value?.id)
    },
    charLimit() {
      let { CommentService } = this
      return CommentService.forWO || CommentService?.module == 'ticketnotes'
        ? 1800
        : 900
    },
  },
  methods: {
    prettyBytes,
    init() {
      let { isReply, isEdit, value } = this
      if (isReply || isEdit) {
        this.expandTextBox = true
        if (isEdit) {
          this.cloneExistingComment(value)
        }
      }
    },
    cloneExistingComment(existingComment) {
      this.comment = cloneDeep(existingComment)
      this.attachments = cloneDeep(existingComment?.attachments || [])
      this.commentSharing = cloneDeep(existingComment?.commentSharing || [])
    },
    async saveNote() {
      let comment = this.setupNewComment()
      let { CommentService, isEdit } = this
      if (!comment || !comment.bodyHTML || !comment.body) return
      this.isAddingNotes = true
      let { error, data } = await CommentService.save(comment, isEdit)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        this.$emit('save', data)
        this.close()
      }
      this.isAddingNotes = false
    },
    inputHandler() {
      this.resizeNotesWidget(true)
    },
    peopleMentionButton() {
      this.$refs['notesEditor'].triggerPeopleMention()
      return null
    },
    recordMentionButton() {
      this.$refs['notesEditor'].triggerSlashMention()
      return null
    },
    async triggerFocus() {
      let { isFormComments } = this
      this.$emit('focus')
      this.expandTextBox = true
      await this.$nextTick()
      if (!isFormComments) this.resizeNotesWidget()
    },

    async filesChange(file) {
      this.isFileUploading = true
      let uploadingFileList = Array.from(file)

      if (!uploadingFileList.length) return

      let addFilePromises = []
      uploadingFileList.forEach(async file => {
        let attachment = {
          isUploading: true,
          isFailed: false,
          fileId: -1,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          error: null,
          previewUrl: null,
          type: 1,
        }
        this.attachments.push(attachment)
        addFilePromises.push(this.addFile(file, attachment))
      })

      await Promise.all(addFilePromises).then(
        () => (this.isFileUploading = false)
      )
    },
    async addFile(file, attachment) {
      let { CommentService } = this
      let { parentModule, record } = CommentService
      const formData = new FormData()
      formData.append('fileContent', file)
      await API.post(
        `/v2/files/${parentModule}/addCommentAttachments/${record.id}`,
        formData
      ).then(({ data, error }) => {
        if (error) {
          attachment.isFailed = true
          attachment.error = error?.message || 'Upload failed'
          attachment.isUploading = false
        } else {
          attachment.fileId = data.fileInfo.fileId
          attachment.isUploading = false
        }
      })
    },
    extractMentions() {
      let editor = this.$refs['notesEditor']?.editor || {}
      let mentions = []
      editor.getJSON()?.content?.forEach(element => {
        element?.content?.forEach(item => {
          if (item?.type === 'atMention' || item?.type === 'slashMention') {
            let MentionDetails = item?.attrs?.id.split('~')
            let MentionSource = MentionDetails[0]
            let recordId = MentionDetails[1]
            if (isNaN(MentionDetails[1])) {
              return
            }
            let mention = {
              mentionedRecordId: parseInt(recordId),
            }

            if (MentionSource in MENTIONS_TYPE_HASH) {
              this.$set(
                mention,
                'mentionType',
                MENTIONS_TYPE_HASH[MentionSource]
              )
            } else {
              this.$set(
                mention,
                'mentionType',
                MENTIONS_TYPE_HASH[SUGGESTIONS_TYPE.RECORD]
              )
              this.$set(mention, 'mentionedModuleName', MentionSource)
            }
            mentions.push(mention)
          }
        })
      })
      return mentions
    },

    removeAttachment(index) {
      this.attachments.splice(index, 1)
    },
    removeFailedAttachments(index) {
      this.failedFileList.splice(index, 1)
    },
    close() {
      let { isEdit, isReply } = this
      if (isEdit || isReply) {
        this.$emit('close')
      } else {
        this.expandTextBox = false
        this.resetComment()
        this.resizeNotesWidget()
      }
    },
    resetComment() {
      let { CommentService, referer, isEdit, isReply } = this
      let editor = this.$refs['notesEditor']?.editor
      if (editor) {
        editor.commands.clearContent()
      }
      this.comment = {}
      this.attachments = []
      this.failedFileList = []
      this.uploadingFileList = []
      this.init()
      if (isReply && !isEmpty(referer)) {
        this.$refs['notesEditor'].prefillMentionForReply(referer)
      } else if (!isEdit && CommentService.canShowSharing) {
        this.commentSharing = CommentService.defaultSharingApps
      }
    },
    setupNewComment() {
      let {
        comment,
        parentNote,
        attachments,
        commentSharing,
        extractMentions,
      } = this

      let editor = this.$refs['notesEditor']?.editor || {}

      if (!isEmpty(editor)) {
        if (!isEmpty(parentNote)) {
          comment.parentNote = parentNote
        }
        comment.body = editor.getText()
        comment.bodyHTML = editor.getHTML()
        comment.mentions = extractMentions()
        comment.attachments = attachments
        comment.commentSharing = commentSharing
      }
      return comment
    },
  },
}
</script>
