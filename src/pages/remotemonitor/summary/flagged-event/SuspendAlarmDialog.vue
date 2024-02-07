<template>
  <FModal
    :saveText="'Yes'"
    :title="
      $t('flagged_event.suspend_alarm', {
        ns: 'remote_monitor',
      })
    "
    :confirmLoading="isSaving"
    @ok="suspendAlarm"
    :visible="true"
    size="S"
    @cancel="closeReasonListDialog"
  >
    <FContainer diplay="flex" alignItems="center" padding="sectionSmall">
      {{
        $t('flagged_event.suspend_conformation', {
          ns: 'remote_monitor',
        })
      }}
    </FContainer>
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
  FForm,
  FFormItem,
  ftoast,
} from '@facilio/design-system'
import { DatePicker, Lookup, LookupWizard } from '@facilio/ui/new-forms'
import { getOptionsForSecondLevelLookup } from '../../../remotemonitor/forms/utils/rmHelpers'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

export default {
  components: {
    FModal,
    FContainer,
    FCheckboxGroup,
    FButton,
    FDivider,
    FText,
    Lookup,
    LookupWizard,
    FForm,
    FFormItem,
    ftoast,
  },
  props: ['flaggedEventId'],
  data() {
    return {
      isSaving: false,
    }
  },
  computed: {},
  methods: {
    async suspendAlarm() {
      this.isSaving = true
      let { flaggedEventId } = this
      let { error } = await API.patch(
        `/v3/flaggedEvent/${flaggedEventId}/suspendAlarm`,
        {
          id: flaggedEventId,
        }
      )
      if (isEmpty(error)) {
        let message = this.$t('flagged_event.assign_success', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event.assign_error', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
      }
      this.closeReasonListDialog(true)
      this.isSaving = false
    },
    closeReasonListDialog(reload = false) {
      this.$emit('closeDialog', reload)
    },
  },
}
</script>
