<template>
  <FModal
    :title="
      $t('flagged_event.troubleshooting_tips', {
        ns: 'remote_monitor',
      })
    "
    :visible="canShowTroubleShootingTipsDialog"
    size="S"
    @cancel="closeTroubleShootingTipsDialog"
  >
    <FContainer padding="containerXxLarge sectionSmall">
      <FContainer v-html="sanitize(troubleShootingTips)" />
    </FContainer>
    <template #footer>
      <FContainer
        display="flex"
        columnGap="containerLarge"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FButton
          v-if="canShowSkipWoCreationBtn"
          appearance="secondary"
          :loading="skipWoCreateBtnLoading"
          size="medium"
          @click="skipWorkorderCreation"
        >
          {{
            $t('flagged_event.inhibit', {
              ns: 'remote_monitor',
            })
          }}
        </FButton>
        <FButton
          v-if="canShowCreateWoBtn"
          appearance="primary"
          :loading="createWoBtnLoading"
          size="medium"
          @click="createWorkOrder"
        >
          {{
            $t('flagged_event.create_workorder', {
              ns: 'remote_monitor',
            })
          }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import { sanitize } from '@facilio/utils/sanitize'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'

import {
  FModal,
  FContainer,
  FCheckboxGroup,
  FButton,
  ftoast,
} from '@facilio/design-system'
export default {
  name: 'TroubleShootingTipsDialog',
  components: { FModal, FContainer, FButton, FCheckboxGroup },
  props: [
    'canShowTroubleShootingTipsDialog',
    'flaggedEventId',
    'troubleShootingTips',
    'canShowCreateWoBtn',
    'canShowSkipWoCreationBtn',
  ],
  data() {
    return {
      skipWoCreateBtnLoading: false,
      createWoBtnLoading: false,
    }
  },
  methods: {
    sanitize,
    closeTroubleShootingTipsDialog(reload = false) {
      this.$emit('closeDialog', reload)
    },
    skipWorkorderCreation() {
      this.$emit('skipWorkorderCreation')
    },
    async createWorkOrder() {
      this.createWoBtnLoading = true
      let { flaggedEventId } = this
      let { error } = await API.patch(
        `/v3/flaggedEvent/${flaggedEventId}/createworkorder`
      )
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.workorder_creation_success', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event.workorder_creation_fail', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
      }
      this.createWoBtnLoading = false
      this.closeTroubleShootingTipsDialog(true)
    },
  },
}
</script>
