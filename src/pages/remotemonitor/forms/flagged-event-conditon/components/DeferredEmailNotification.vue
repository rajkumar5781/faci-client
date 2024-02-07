<template>
  <FContainer
    display="flex"
    flexDirection="column"
    rowGap="containerXxLarge"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
  >
    <FContainer display="flex" justifyContent="space-between">
      <FText appearance="headingMed14" color="textMain">
        {{
          $t('flagged_event_rule.enable_deferred_email_notification', {
            ns: 'remote_monitor',
          })
        }}
      </FText>
      <FSwitch v-model="canShowConfig" size="small" />
    </FContainer>
    <FContainer
      v-if="canShowConfig"
      display="flex"
      flexDirection="column"
      rowGap="containerXxLarge"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
      padding="sectionSmall"
    >
      <FContainer display="flex" flexDirection="column">
        <FContainer
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <FText
            appearance="headingMed14"
            color="textDefault"
            verticalAlign="middle"
          >
            {{ $t('email_notification') }}
          </FText>
          <FContainer display="flex" columnGap="containerLarge">
            <FButton appearance="secondary" @click="showEmailActionDialog">
              {{ configureButtonText }}
            </FButton>
            <FIcon
              v-if="canShowEmailRuleDelete"
              group="action"
              name="delete"
              size="16"
              :pressable="true"
              color="textCaption"
              @click="resetEmailRule"
            />
          </FContainer>
        </FContainer>
        <FContainer
          v-if="canShowConfigureNotificationError"
          display="flex"
          alignItems="center"
        >
          <FIcon
            group="alert"
            name="critical-filled"
            size="14"
            color="textSemanticRed"
            :pressable="false"
          />
          <FText appearance="captionReg12" color="textSemanticRed">
            {{
              $t('flagged_event_rule.please_configure_email', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
        </FContainer>
      </FContainer>
      <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
      <FForm
        ref="delay-time-input-form"
        uniqueId="delay-time-input-form"
        :model="delayTimeObj"
        :rules="formRules"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerXxLarge"
        >
          <FText appearance="bodyReg14" color="textMain">
            {{
              $t('flagged_event_rule.wait_time_descriptions', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
          <FContainer
            display="flex"
            rowGap="containerLarge"
            flexDirection="column"
          >
            <FText appearance="bodyReg14" color="textMain">
              {{ $t('field_names.wait_time', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="followUpEmailDelayTimeOne">
              <FSelect
                v-model="delayTimeObj.followUpEmailDelayTimeOne"
                :options="timeOptions"
                placeholder="HH:MM"
              />
            </FFormItem>
          </FContainer>
          <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
          <FText appearance="bodyReg14" color="textMain">
            {{
              $t('flagged_event_rule.resend_time_description', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
          <FContainer
            display="flex"
            rowGap="containerLarge"
            flexDirection="column"
          >
            <FText appearance="bodyReg14" color="textMain"
              >{{ $t('field_names.resend_time', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="followUpEmailDelayTimeTwo">
              <FSelect
                v-model="delayTimeObj.followUpEmailDelayTimeTwo"
                :options="timeOptions"
                placeholder="HH:MM"
              />
            </FFormItem>
          </FContainer>
        </FContainer>
      </FForm>
    </FContainer>

    <EmailAction
      v-if="showEmailConfig"
      :title="
        $t('flagged_event_rule.deferred_email', {
          ns: 'remote_monitor',
        })
      "
      moduleName="flaggedAlarm"
      :actionObj="delayedEmailRule"
      @onSave="setDelayedEmailRule"
      @onClose="closeEmailActionDialog"
    />
  </FContainer>
</template>
<script>
import {
  FContainer,
  FDivider,
  FText,
  FSwitch,
  FButton,
  FTimePicker,
  FIcon,
  FForm,
  FFormItem,
  FSelect,
} from '@facilio/design-system'
import EmailAction from '../../../components/email-action/EmailAction.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  components: {
    FContainer,
    FDivider,
    FText,
    FSwitch,
    FButton,
    FTimePicker,
    EmailAction,
    FIcon,
    FForm,
    FFormItem,
    FSelect,
  },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      timeOptions: [],
      selectableRange: { from: 300000, to: null },
      dataDeserialized: false,
      canShowConfig: false,
      showEmailConfig: false,
      delayedEmailRule: {},
      delayTimeObj: {
        followUpEmailDelayTimeOne: null,
        followUpEmailDelayTimeTwo: null,
      },
      canShowConfigureNotificationError: false,
      formRules: {
        followUpEmailDelayTimeOne: {
          trigger: 'change',
          validator: value => {
            if (isEmpty(value) || value <= 0) {
              return {
                errorMessage: `${this.$t('field_names.wait_time', {
                  ns: 'remote_monitor',
                })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`,
                invalid: true,
              }
            }
          },
        },
        followUpEmailDelayTimeTwo: {
          trigger: 'change',
          validator: value => {
            if (isEmpty(value) || value <= 0) {
              return {
                errorMessage: `${this.$t('field_names.resend_time', {
                  ns: 'remote_monitor',
                })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`,
                invalid: true,
              }
            }
          },
        },
      },
    }
  },
  computed: {
    configureButtonText() {
      let { canShowEmailRuleDelete } = this
      let configureButtonText = canShowEmailRuleDelete
        ? this.$t('actions.edit_configuration')
        : this.$t('actions.configure')
      return configureButtonText
    },
    canShowEmailRuleDelete() {
      let { delayedEmailRule } = this
      return !isEmpty(delayedEmailRule)
    },
  },
  watch: {
    delayedEmailRule(newVal, oldVal) {
      if (!isEmpty(oldVal)) {
        this.canShowConfigureNotificationError = isEmpty(newVal)
      } else if (!isEmpty(newVal)) {
        this.canShowConfigureNotificationError = false
      }
    },
  },
  created() {
    this.init()
    let timeOptions = []
    for (let i = 0; i <= 23; i++) {
      let value = i * 2 * 1800000 // 30min = 1800000ms
      let hours = (i < 10 ? '0' + i : i) + ':'
      let hoursAndMins = hours + '00'
      let option = { label: hoursAndMins, value }
      timeOptions.push(option)
      value = (i * 2 + 1) * 1800000 // 30min = 1800000ms
      hoursAndMins = hours + '30'
      option = { label: hoursAndMins, value }
      timeOptions.push(option)
    }
    this.timeOptions = timeOptions
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized, canShowConfig } = this
      if (canShowConfig) {
        if (!dataDeserialized) {
          this.deserializeData()
        }
        let { delayedEmailRule, delayTimeObj = {} } = this
        let { followUpEmailDelayTimeOne, followUpEmailDelayTimeTwo } =
          delayTimeObj
        let delayTimeInputForm = getProperty(
          this,
          '$refs.delay-time-input-form',
          {}
        )
        let validTimeData = false
        if (!isEmpty(delayTimeInputForm)) {
          validTimeData = delayTimeInputForm.validate()
        }
        if (isEmpty(delayedEmailRule)) {
          this.canShowConfigureNotificationError = true
          return { invalid: true }
        } else if (!validTimeData) {
          return { invalid: true }
        } else {
          let { actionType, templateJson } = delayedEmailRule
          delayedEmailRule = { actionType, templateJson }
          delayedEmailRule = { actions: [delayedEmailRule] }
          followUpEmailDelayTimeOne = this.validateAndSet(
            followUpEmailDelayTimeOne
          )
          followUpEmailDelayTimeTwo = this.validateAndSet(
            followUpEmailDelayTimeTwo
          )
          return {
            delayedEmailRule,
            followUpEmailDelayTimeOne,
            followUpEmailDelayTimeTwo,
          }
        }
      }

      return {
        delayedEmailRule: null,
        followUpEmailDelayTimeOne: null,
        followUpEmailDelayTimeTwo: null,
      }
    },
    deserializeData() {
      let { isNew } = this
      if (!isNew) {
        let { flaggedEventRule = {} } = this
        let {
          delayedEmailRule = {},
          followUpEmailDelayTimeOne,
          followUpEmailDelayTimeTwo,
        } = flaggedEventRule
        let { actions = [] } = delayedEmailRule
        if (!isEmpty(actions)) {
          let emailNotification = actions[0] || {}
          emailNotification.templateJson = emailNotification?.template
          this.delayedEmailRule = emailNotification
          this.canShowConfig = true
        } else {
          this.delayedEmailRule = {}
        }
        followUpEmailDelayTimeOne = this.validateAndSet(
          followUpEmailDelayTimeOne
        )
        followUpEmailDelayTimeTwo = this.validateAndSet(
          followUpEmailDelayTimeTwo
        )
        this.delayTimeObj = {
          followUpEmailDelayTimeOne,
          followUpEmailDelayTimeTwo,
        }

        if (!isEmpty(delayedEmailRule)) {
          this.canShowConfig = true
        }
      }
      this.dataDeserialized = true
    },
    validateAndSet(value) {
      return isEmpty(value) || value <= 0 ? null : value
    },
    setDelayedEmailRule(mailData) {
      this.delayedEmailRule = mailData
      this.showEmailConfig = false
    },
    showEmailActionDialog() {
      this.showEmailConfig = true
    },
    closeEmailActionDialog() {
      this.showEmailConfig = false
    },
    resetEmailRule() {
      this.delayedEmailRule = {}
    },
  },
}
</script>
