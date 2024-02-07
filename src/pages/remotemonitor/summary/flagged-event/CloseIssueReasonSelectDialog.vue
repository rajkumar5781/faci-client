<template>
  <FModal
    :title="
      $t('flagged_event.close_issue_reason_list', { ns: 'remote_monitor' })
    "
    :visible="canShowCloseIssueReasons"
    size="S"
    @cancel="closeReasonListDialog"
  >
    <FContainer
      display="flex"
      flexDirection="column"
      rowGap="containerXxLarge"
      padding="containerXxLarge sectionSmall"
    >
      <FContainer
        v-if="canShowWarningMessage"
        display="flex"
        flexDirection="column"
        rowGap="containerXxLarge"
      >
        <FContainer v-html="sanitize(closeWarnMessage)" />
      </FContainer>
      <FDivider
        v-if="canShowWarningMessage && canShowCloseIssueReasonSelctList"
        width="100%"
        backgroundColor="backgroundMidgroundDark"
      />
      <template v-if="canShowCloseIssueReasonSelctList">
        <FText appearance="headingMed14" color="textMain">Select Reasons</FText>
        <FCheckboxGroup
          v-model="selectedCloseIssueReasons"
          :options="closeIssueReasonList"
        />
      </template>
    </FContainer>
    <template #footer>
      <FContainer
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FButton
          appearance="primary"
          :loading="closeBtnLoading"
          size="medium"
          @click="closeWithReason"
        >
          {{ $t('actions.close') }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FModal,
  FContainer,
  FCheckboxGroup,
  FButton,
  FDivider,
  FText,
} from '@facilio/design-system'
import { sanitize } from '@facilio/utils/sanitize'
import { isEmpty } from '@facilio/utils/validation'

export default {
  components: { FModal, FContainer, FCheckboxGroup, FButton, FDivider, FText },
  props: [
    'canShowCloseIssueReasons',
    'closeIssueReasonList',
    'flaggedEventId',
    'closeWarnMessage',
  ],
  data() {
    return {
      closeBtnLoading: false,
      selectedCloseIssueReasons: [],
    }
  },
  computed: {
    canShowCloseIssueReasonSelctList() {
      let { closeIssueReasonList } = this
      return !isEmpty(closeIssueReasonList)
    },
    canShowWarningMessage() {
      let { closeWarnMessage } = this
      return !isEmpty(closeWarnMessage)
    },
  },
  methods: {
    sanitize,
    closeReasonListDialog(reload = false) {
      this.$emit('closeDialog', reload)
    },
    closeWithReason() {
      let { selectedCloseIssueReasons } = this
      this.$emit('closeFlaggedEventWithReason', selectedCloseIssueReasons)
    },
  },
}
</script>
