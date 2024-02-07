<template>
  <FModal
    :title="$t('field_names.inhibit_reason', { ns: 'remote_monitor' })"
    :visible="canShowInhibitReasonSelectDialog"
    size="M"
    @cancel="closeInhibitReasonSelectDialog"
  >
    <FContainer>
      <FTable
        :columns="columns"
        :data="inhibitReasonList"
        selectType="single"
        @recordSelected="handleSelection"
      >
        <template slot="cell.maxInhibitTime" slot-scope="{ row, prop }">
          <FText>{{ getTimePlaceHolder(row, prop) }}</FText>
        </template>
      </FTable>
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
          :loading="inhibitBtnLoading"
          size="medium"
          @click="inhibitFlaggedEvent"
        >
          {{ $t('flagged_event.submit', { ns: 'remote_monitor' }) }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FModal,
  FContainer,
  FText,
  FButton,
  FTable,
  ftoast,
} from '@facilio/design-system'
import { getTimeAsListWithDays } from '../../forms/utils/rmHelpers.js'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'InhibitReasonSelectDialog',
  components: { FModal, FContainer, FText, FButton, FTable },
  props: [
    'canShowInhibitReasonSelectDialog',
    'flaggedEventId',
    'inhibitReasonList',
  ],
  data() {
    return {
      columns: [
        { displayName: 'Inhibit Reason', name: 'inhibitReason', id: 1 },
        {
          displayName: 'Max Inhibit Time (min)',
          name: 'maxInhibitTime',
          id: 2,
        },
      ],
      inhibitBtnLoading: false,
      selectedInhibitReasonId: -1,
    }
  },
  methods: {
    async inhibitFlaggedEvent() {
      this.inhibitBtnLoading = true
      let { flaggedEventId, selectedInhibitReasonId } = this
      let payload = { inhibitReasonId: selectedInhibitReasonId }
      let { error } = await API.patch(
        `/v3/flaggedEvent/${flaggedEventId}/inhibit`,
        payload
      )
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.inhibit_success', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event.inhibit_fail', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
      }
      this.inhibitBtnLoading = false
      this.closeInhibitReasonSelectDialog(true)
    },
    handleSelection(record) {
      if (!isEmpty(record)) {
        this.selectedInhibitReasonId = record?.id
      }
    },
    closeInhibitReasonSelectDialog(reload = false) {
      this.$emit('closeDialog', reload)
    },
    getTimePlaceHolder(row, prop) {
      let timeInMs = row[prop]
      let timeAsList = getTimeAsListWithDays(timeInMs)
      let days = timeAsList[0] || 0
      let hours = timeAsList[1] || 0
      let minutes = timeAsList[2] || 0
      days = days < 10 ? '0' + days : days
      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes
      return `${days}D:${hours}H:${minutes}M`
    },
  },
}
</script>
