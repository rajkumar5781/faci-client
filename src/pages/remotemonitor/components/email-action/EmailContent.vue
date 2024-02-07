<template>
  <FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      minHeight="150px"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else>
      <template v-if="!isEmpty(subject)">
        <FContainer display="flex" padding="containerXxLarge sectionSmall">
          <FText appearance="headingMed14" color="textCaption" width="10%">
            {{ `${$t('email_action.subject', { ns: 'remote_monitor' })} :` }}
          </FText>
          <FText appearance="headingMed14" color="textDescription">
            {{ subject }}
          </FText>
        </FContainer>
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
      </template>
      <template v-if="canShowEmailContent">
        <FContainer
          v-html="sanitize(emailContent)"
          padding="sectionSmall"
          width="75%"
        />
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
      </template>
      <FContainer
        v-if="canShowAttachments"
        padding="containerXLarge sectionSmall"
      >
        <FContainer marginBottom="containerXLarge">
          <FText appearance="headingMed14" color="textDescription">
            {{ $t('field_names.attachments') }}
          </FText>
        </FContainer>

        <FContainer
          display="flex"
          flexWrap="wrap"
          rowGap="containerLarge"
          columnGap="containerLarge"
          marginBottom="containerXLarge"
        >
          <template v-for="(attachment, index) in attachmentList">
            <FContainer
              v-if="!isEmpty(attachment.fileName)"
              padding="containerXLarge"
              border="1px dashed"
              borderColor="borderNeutralBaseLight"
            >
              {{ getProperty(attachment, 'fileName') }}
            </FContainer>
          </template>
        </FContainer>
        <FContainer display="flex" flexDirection="column">
          <template v-for="(attachment, index) in attachmentList">
            <FContainer
              v-if="!isEmpty(attachment.urlString)"
              padding="containerXLarge containerNone"
            >
              <FButton
                appearance="link"
                @click="openClickedLink(attachment.urlString)"
              >
                {{ attachment.urlString }}
              </FButton>
            </FContainer>
          </template>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { sanitize } from '@facilio/utils/sanitize'
import {
  FContainer,
  FSpinner,
  FDivider,
  FText,
  FButton,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  props: ['emailStructureId'],
  components: { FContainer, FSpinner, FDivider, FText, FButton },
  data() {
    return {
      subject: '',
      emailContent: '',
      attachmentList: [],
      emailTemplate: null,
      loading: false,
    }
  },
  computed: {
    canShowEmailContent() {
      let { emailContent } = this
      return !isEmpty(emailContent)
    },
    canShowAttachments() {
      let { attachmentList } = this
      return !isEmpty(attachmentList)
    },
  },
  watch: {
    emailStructureId() {
      this.loadEmailTemplate()
    },
  },
  created() {
    this.loadEmailTemplate()
  },
  methods: {
    isEmpty,
    getProperty,
    sanitize,
    async loadEmailTemplate() {
      this.loading = true
      let { emailStructureId } = this
      if (!isEmpty(emailStructureId) && emailStructureId > 0) {
        let { data, error } = await API.get('v2/template/email/view', {
          id: emailStructureId,
        })
        if (isEmpty(error)) {
          this.subject = getProperty(data, 'emailStructure.subject', '')
          this.emailContent = getProperty(data, 'emailStructure.message', '')
          this.attachmentList = getProperty(
            data,
            'emailStructure.attachments',
            []
          )
        }
        this.emailTemplate = data
      }
      this.loading = false
    },
    openClickedLink(url) {
      window.open(url, '_blank')
    },
  },
}
</script>
