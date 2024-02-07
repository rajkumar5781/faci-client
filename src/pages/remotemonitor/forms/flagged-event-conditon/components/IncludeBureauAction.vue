<template>
  <FContainer
    display="flex"
    flexDirection="column"
    rowGap="containerXxLarge"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
    class="include-bureau-action"
  >
    <FContainer
      display="flex"
      flexDirection="column"
      rowGap="containerMedium"
      height="25px"
    >
      <FContainer
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <FContainer display="flex" alignItems="center">
          <FText appearance="headingMed14" color="textMain">
            {{
              $t('flagged_event_rule.add_evaluation_definition', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
        </FContainer>
        <FSwitch v-model="includeBureau" size="small" />
      </FContainer>
    </FContainer>
    <template v-if="includeBureau">
      <FContainer
        display="flex"
        flexDirection="column"
        borderRadius="high"
        backgroundColor="backgroundMidgroundSubtle"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          padding="containerXLarge containerXxLarge"
        >
          <FText appearance="headingMed14" color="textMain">
            {{
              `${name} ${$t('flagged_event_rule.evaluation', {
                ns: 'remote_monitor',
              })}`
            }}
          </FText>
        </FContainer>
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerXxLarge"
          padding="containerXxLarge"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            rowGap="containerMedium"
          >
            <FContainer
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <FContainer
                display="flex"
                flexDirection="column"
                rowGap="containerMedium"
              >
                <FContainer display="flex" alignItems="center" height="20px">
                  <FText appearance="headingMed14" color="textMain">
                    {{ $t('field_names.team', { ns: 'remote_monitor' }) }}
                  </FText>
                </FContainer>
                <FText
                  appearance="captionReg12"
                  color="textCaption"
                  verticalAlign="middle"
                >
                  {{
                    $t('flagged_event_rule.define_assesment_team', {
                      ns: 'remote_monitor',
                      team: name.toLowerCase(),
                    })
                  }}
                </FText>
              </FContainer>
              <FDropdown
                :options="teamOptions"
                :split="false"
                :loading="false"
                @dropdown="setTeam"
              >
                <template>
                  <FTags
                    appearance="action"
                    :actionType="actionType"
                    :text="teamLabel"
                    @click="resetTeam"
                  />
                </template>
              </FDropdown>
            </FContainer>
            <FContainer
              v-if="canShowTeamEmptyError"
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
              <FText
                appearance="captionReg12"
                color="textSemanticRed"
                marginLeft="containerMedium"
              >
                {{
                  `${this.$t('field_names.evaluation_team', {
                    ns: 'remote_monitor',
                  })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`
                }}
              </FText>
            </FContainer>
          </FContainer>

          <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
          <FContainer
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <FText appearance="headingMed14" color="textMain">
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
          <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
          <FText appearance="headingMed14" color="textMain">
            {{
              $t('field_names.troubleshooting_tips', { ns: 'remote_monitor' })
            }}
          </FText>
          <FContainer>
            <RichText v-model="currentBureau.troubleShootingTips" />
          </FContainer>
        </FContainer>
      </FContainer>
      <BureauEvaluationParameters
        ref="bureau-eval-params"
        :isNew="isNew"
        :currentBureauDetails="currentBureau"
        :woCreateEnabled="createWorkorder"
        :bureauName="name"
        :index="index"
      />
    </template>
    <FContainer v-if="canShowAddNextLevelEvaluation">
      <FContainer display="flex" alignItems="center">
        <FContainer cursor="pointer" @click="addNextLevelEvaluation">
          <FIcon
            group="sign-symbols"
            name="addition"
            size="20"
            :pressable="true"
            color="iconPrimaryDefault"
          />
        </FContainer>
        <FContainer cursor="pointer" @click="addNextLevelEvaluation">
          <FText
            marginLeft="containerLarge"
            appearance="headingMed14"
            color="backgroundPrimaryDefault"
          >
            {{
              $t('flagged_event_rule.add_next_level_evaluation', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
    <EmailAction
      v-if="showEmailConfig"
      :title="
        $t('flagged_event_rule.email_to_evaluation_team', {
          ns: 'remote_monitor',
        })
      "
      moduleName="flaggedAlarm"
      :actionObj="currentBureau.emailRule"
      @onSave="setEmailRule"
      @onClose="closeEmailActionDialog"
    />
  </FContainer>
</template>
<script>
import BureauEvaluationParameters from './BureauEvaluationParameters.vue'
import {
  FContainer,
  FText,
  FSwitch,
  FDivider,
  FButton,
  FDropdown,
  FTags,
  FIcon,
} from '@facilio/design-system'
import { RichText } from '@facilio/ui/new-forms'
import EmailAction from '../../../components/email-action/EmailAction.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  components: {
    BureauEvaluationParameters,
    FContainer,
    FText,
    FSwitch,
    FButton,
    FDivider,
    RichText,
    EmailAction,
    FDropdown,
    FTags,
    FIcon,
  },
  props: [
    'isNew',
    'name',
    'currentBureauDetails',
    'createWorkorder',
    'teamOptions',
    'addNextLevelEvaluation',
    'index',
  ],
  data() {
    return {
      dataDeserialized: false,
      includeBureau: false,
      woCreateEnabled: false,
      showEmailConfig: false,
      currentBureau: {
        emailRule: {},
      },
      teamLabel: this.$t('flagged_event_rule.select_team', {
        ns: 'remote_monitor',
      }),
      canShowTeamEmptyError: false,
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
      let { currentBureau = {} } = this
      let { emailRule } = currentBureau
      return !isEmpty(emailRule)
    },
    actionType() {
      let { currentBureau = {} } = this
      let { team = null } = currentBureau
      if (isEmpty(team)) {
        return 'dropdown'
      }
      return 'removable'
    },
    isLastChild() {
      let { currentBureauDetails = {} } = this
      let { lastChild } = currentBureauDetails
      return lastChild
    },
    canShowAddNextLevelEvaluation() {
      let { isLastChild, includeBureau, index } = this
      return isLastChild && includeBureau && index < 2
    },
    selectedTeam() {
      let selectedTeam = getProperty(this, 'currentBureau.team', null)
      return selectedTeam
    },
  },
  watch: {
    selectedTeam(newVal, oldVal) {
      if (!isEmpty(oldVal)) {
        this.canShowTeamEmptyError = isEmpty(newVal)
      } else if (!isEmpty(newVal)) {
        this.canShowTeamEmptyError = false
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { currentBureau, includeBureau } = this
      let { emailRule = {}, team = null } = currentBureau
      if (includeBureau) {
        if (isEmpty(team)) {
          this.canShowTeamEmptyError = true
          return { invalid: true }
        }
        let bureauEvaluationParamsForm = this.$refs['bureau-eval-params']
        let bureauEvaluationParamsData =
          bureauEvaluationParamsForm.getSerializedData()
        let { invalid } = bureauEvaluationParamsData
        if (invalid) {
          return { invalid: true }
        }
        if (!isEmpty(emailRule)) {
          let { actionType, templateJson } = emailRule
          emailRule = { actionType, templateJson }
          emailRule = { emailRule: { actions: [emailRule] } }
        }
        return {
          ...currentBureau,
          team: { id: team },
          ...emailRule,
          ...bureauEvaluationParamsData,
        }
      }
      return {}
    },
    deserializeData() {
      let { currentBureauDetails = {}, isNew } = this
      let { team = {} } = currentBureauDetails
      let { id: teamId } = team
      this.currentBureau = currentBureauDetails
      if (!isNew) {
        let { emailRule = {}, team = {} } = currentBureauDetails
        let { id } = team
        this.currentBureau.team = id
        this.teamLabel = this.getLabelForTeamId(id)
        let { actions = [] } = emailRule
        if (!isEmpty(actions)) {
          let emailNotification = actions[0] || {}
          emailNotification.templateJson = emailNotification?.template
          this.currentBureau.emailRule = emailNotification
        } else {
          this.currentBureau.emailRule = {}
        }
      }
      if (!isEmpty(teamId)) {
        this.includeBureau = true
      }
      this.dataDeserialized = true
    },
    setTeam(team) {
      this.teamLabel = team.label
      let { currentBureau } = this
      this.currentBureau = { ...currentBureau, team: team?.value }
    },
    resetTeam(event) {
      let { currentBureau } = this
      let clickedComponent = getProperty(event, 'target.name', '')
      if (['cross', 'close'].includes(clickedComponent)) {
        event.stopPropagation()
        this.currentBureau = { ...currentBureau, team: null }
        this.teamLabel = this.$t('flagged_event_rule.select_team', {
          ns: 'remote_monitor',
        })
      }
    },
    showEmailActionDialog() {
      this.showEmailConfig = true
    },
    closeEmailActionDialog() {
      this.showEmailConfig = false
    },
    setEmailRule(contex) {
      let { currentBureau = {} } = this
      this.currentBureau = { ...currentBureau, emailRule: contex }
      this.showEmailConfig = false
    },
    getLabelForTeamId(id) {
      let { teamOptions = [] } = this
      let selectedTeam = (teamOptions || []).find(team => {
        return team.value === id
      })
      return (
        selectedTeam?.label ||
        this.$t('flagged_event_rule.select_team', {
          ns: 'remote_monitor',
        })
      )
    },
    resetEmailRule() {
      this.currentBureau.emailRule = {}
    },
  },
}
</script>
<style lang="scss">
.include-bureau-action {
  .richtext-content {
    height: 200px !important;
    background-color: #fff;
  }
}
</style>
