<template>
  <FContainer>
    <FModal
      :title="$t('controls.control_action', { ns: 'energy' })"
      :visible="showCreateActionModal"
      size="S"
      @cancel="closeDialog"
    >
      <FContainer padding="sectionSmall">
        <FContainer marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.schedule_date', { ns: 'energy' }) }}
          </FText>
          <FDatePicker
            :placeholder="$t('controls.place_holder.date', { ns: 'energy' })"
            v-model="scheduledActionDateTime"
            type="date-time"
            :timeFormat="{ is12Hour: false, interval: 30 }"
            :validateDate="validateStartDate"
            displayFormat="YYYY-MM-DD HH:mm"
          />
        </FContainer>
        <FContainer v-if="isEnableRevert" marginBottom="containerXxLarge">
          <FText
            appearance="headingMed14"
            paddingRight="containerSmall"
            display="inline-flex"
            marginBottom="containerMedium"
            >{{ $t('controls.revert_date', { ns: 'energy' }) }}
          </FText>
          <FDatePicker
            :placeholder="$t('controls.place_holder.date', { ns: 'energy' })"
            v-model="revertActionDateTime"
            type="date-time"
            :timeFormat="{ is12Hour: false, interval: 30 }"
            :validateDate="validateEndDate"
            displayFormat="YYYY-MM-DD HH:mm"
          />
        </FContainer>
        <FContainer marginBottom="containerXxLarge">
          <FContainer>
            <FText
              appearance="headingMed14"
              paddingRight="containerSmall"
              display="inline-flex"
              marginBottom="containerMedium"
            >
              {{ $t('controls.simulation', { ns: 'energy' }) }}
            </FText>
            <FTooltip placement="right">
              <template slot="title">{{
                $t('controls.simulation_info_description', {
                  ns: 'energy',
                })
              }}</template>
              <FIcon group="action" name="info" size="14" :pressable="false" />
            </FTooltip>
          </FContainer>
          <FContainer margin="containerMedium containerNone" display="flex">
            <FCheckbox v-model="isSandBox" />
            <FText
              paddingRight="containerSmall"
              alignItems="center"
              display="flex"
              >{{ $t('controls.activate_simulation', { ns: 'energy' }) }}
            </FText>
          </FContainer>
        </FContainer>
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
            :loading="saving"
            :disabled="disableCreateBtn"
            @click="updateControlActionTemplate"
          >
            {{ $t('controls.create', { ns: 'energy' }) }}
          </FButton>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FModal,
  FContainer,
  FButton,
  FText,
  FDatePicker,
  ftoast,
  FTooltip,
  FCheckbox,
  FIcon,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isArray, isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import getProperty from 'dlv'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export default {
  props: ['showCreateActionModal', 'record', 'showRevert'],
  components: {
    FModal,
    FContainer,
    FButton,
    FDatePicker,
    FText,
    FTooltip,
    FCheckbox,
    FIcon,
  },
  data() {
    return {
      scheduledActionDateTime: null,
      revertActionDateTime: null,
      saving: false,
      isSandBox: false,
    }
  },
  computed: {
    isEnableRevert() {
      return getProperty(this, 'record.isEnableRevert', false)
    },
    disableCreateBtn() {
      let { isEnableRevert, scheduledActionDateTime, revertActionDateTime } =
        this
      return isEnableRevert
        ? isEmpty(scheduledActionDateTime) || isEmpty(revertActionDateTime)
        : isEmpty(scheduledActionDateTime)
    },
  },
  methods: {
    getProperty,
    closeDialog() {
      this.$emit('updateVisibility', false)
    },
    validateStartDate(date) {
      let today = dayjs()
      let currentDate = dayjs(date)

      return currentDate.isBefore(today)
    },
    validateEndDate(date) {
      let { scheduledActionDateTime } = this
      let today = dayjs()
      let startDate = dayjs(scheduledActionDateTime)
      let currentDate = dayjs(date)
      let isSameDay =
        currentDate.format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD')

      return (
        currentDate.isBefore(startDate) ||
        isSameDay ||
        currentDate.isBefore(today)
      )
    },
    async updateControlActionTemplate() {
      this.saving = true
      let {
        scheduledActionDateTime,
        revertActionDateTime,
        isSandBox,
        record = {},
      } = this
      let { id, moduleName } = record
      if (id) {
        let data = {
          scheduledActionDateTime,
          revertActionDateTime,
          isSandBox,
          controlActionTemplateId: id,
        }
        let url = 'v3/ControlActionTemplate/createAction'
        let { error = {} } = await API.post(url, {
          scheduledActionDateTime,
          revertActionDateTime,
          isSandBox,
          controlActionTemplateId: id,
        })
        if (!error) {
          ftoast.success(
            this.$t('controls.create_action_success', {
              ns: 'energy',
            })
          )
        } else {
          ftoast.critical(error?.message || this.$t('error_occured'))
        }
        this.$emit('updateVisibility', false)
      }
    },
  },
}
</script>
