<template>
  <FContainer>
    <FModal
      :title="$t('service_appointment.dispatch', { ns: 'fsm' })"
      :visible="true"
      :cancelText="$t('service_appointment.cancel', { ns: 'fsm' })"
      :saveText="$t('service_appointment.dispatch', { ns: 'fsm' })"
      size="S"
      :hideFooter="false"
      :confirmLoading="isDispatching"
      @ok="handleDispatch"
      @cancel="handleCancel"
    >
      <FForm ref="dispatch-form" :model="formModel" :rules="rules">
        <FContainer padding="containerXxLarge" width="100%">
          <FContainer paddingBottom="containerXxLarge" width="100%">
            <FFormItem
              label="Field Agent"
              prop="fieldAgent"
              :hideLabel="false"
              id="dsm-form-fieldAgent"
              :required="true"
            >
              <Lookup
                :field.sync="field"
                v-model="formModel.fieldAgent"
                :hideLookupIcon="false"
                @showLookupWizard="openLookupWizard"
              />
            </FFormItem>
          </FContainer>
          <FRow>
            <FCol :span="6">
              <FContainer paddingBottom="containerXxLarge" width="100%">
                <FFormItem
                  label="Scheduled Start Time"
                  prop="scheduledStartTime"
                  :hideLabel="false"
                  id="dsm-form-scheduledStartTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.scheduledStartTime"
                    :account="$account"
                  />
                </FFormItem>
              </FContainer>
            </FCol>
            <FCol :span="6">
              <FContainer paddingBottom="containerXxLarge" width="100%">
                <FFormItem
                  label="Scheduled End Time"
                  prop="scheduledEndTime"
                  :hideLabel="false"
                  id="dsm-form-scheduledEndTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.scheduledEndTime"
                    :account="$account"
                  />
                </FFormItem>
              </FContainer>
            </FCol>
          </FRow>
        </FContainer>
      </FForm>
    </FModal>
    <LookupWizard
      v-if="canShowLookupWizard"
      :field.sync="field"
      :canShowLookupWizard.sync="canShowLookupWizard"
      @closeWizard="cancelLookupWizard"
      @setLookupFieldValue="setLookupFieldValue"
    ></LookupWizard>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FModal,
  FRow,
  FCol,
  FForm,
  FFormItem,
} from '@facilio/design-system'
import { DatePicker, Lookup, LookupWizard } from '@facilio/ui/new-forms'
export default {
  props: ['record'],
  components: {
    FContainer,
    FModal,
    FRow,
    FCol,
    FForm,
    FFormItem,
    DatePicker,
    Lookup,
    LookupWizard,
  },
  data() {
    return {
      canShowLookupWizard: false,
      isDispatching: false,
      field: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'people',
        field: {
          lookupModule: {
            name: 'people',
            displayName: 'people',
          },
        },
        filters: {
          dispatchable: { operatorId: 15, value: ['true'] },
          oneLevelLookup: {},
        },
        additionalParams: {
          orderBy: 'name',
          orderType: 'asc',
        },
      },
      formModel: {
        fieldAgent: undefined,
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
      rules: {
        fieldAgent: [
          {
            required: true,
            message: this.$t('service_appointment.please_select_field_agent', {
              ns: 'fsm',
            }),
            trigger: 'change',
          },
        ],
        scheduledStartTime: [
          {
            required: true,
            message: this.$t(
              'service_appointment.please_select_scheduled_start',
              { ns: 'fsm' }
            ),
            trigger: 'change',
          },
        ],
        scheduledEndTime: [
          {
            required: true,
            message: this.$t(
              'service_appointment.please_select_scheduled_end',
              { ns: 'fsm' }
            ),
            trigger: 'change',
          },
        ],
      },
    }
  },
  mounted() {
    console.log('mounted: ', this.showDispatchFormModal)
    let { fieldAgent, scheduledStartTime, scheduledEndTime } = this.record
    if (!isEmpty(fieldAgent)) {
      this.$set(this.formModel, 'fieldAgent', fieldAgent.id)
    }
    if (!isEmpty(scheduledStartTime)) {
      this.$set(this.formModel, 'scheduledStartTime', scheduledStartTime)
    }
    if (!isEmpty(scheduledEndTime)) {
      this.$set(this.formModel, 'scheduledEndTime', scheduledEndTime)
    }
  },
  methods: {
    openLookupWizard() {
      this.canShowLookupWizard = true
    },
    cancelLookupWizard() {
      this.canShowLookupWizard = false
    },
    setLookupFieldValue({ field }) {
      let { selectedItems } = field || {}
      let { value } = selectedItems[0] || {}
      this.$set(this.formModel, 'fieldAgent', value)
    },
    handleDispatch() {
      let isValid = this.$refs['dispatch-form'].validate()
      if (isValid) {
        this.isDispatching = true
        this.$emit('dispatch', this.formModel)
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style></style>
