<template>
  <FContainer display="flex" flexDirection="column" rowGap="containerXxLarge">
    <FContainer
      display="flex"
      flexDirection="column"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        rowGap="containerMedium"
        padding="containerXLarge containerXxLarge"
      >
        <FText appearance="headingMed14" color="textMain">
          {{
            `${bureauName} ${$t('flagged_event_rule.evaluation_parameters', {
              ns: 'remote_monitor',
            })}`
          }}
        </FText>
        <FText
          appearance="captionReg12"
          color="textCaption"
          height="20px"
          verticalAlign="middle"
        >
          {{
            `${bureauName} ${$t(
              'flagged_event_rule.evaluation_param_description',
              {
                ns: 'remote_monitor',
              }
            )}`
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
        <FForm
          :ref="`evaluation-time-config-form-${index}`"
          :uniqueId="`evaluation-time-config-form-${index}`"
          :rules="formRules"
          :model="currentBureau"
        >
          <FContainer
            v-if="woCreateEnabled"
            display="flex"
            flexDirection="column"
            rowGap="containerXxLarge"
          >
            <FText appearance="bodyReg14">
              {{
                $t('flagged_event_rule.not_take_custody_description', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
            <FFormItem prop="takeCustodyPeriod">
              <DurationTag
                v-model="currentBureau.takeCustodyPeriod"
                placeholder="DD:HH:MM"
              />
            </FFormItem>

            <FDivider
              width="100%"
              backgroundColor="backgroundMidgroundDark"
              margin="containerLarge containerNone"
            />
            <FText appearance="bodyReg14">
              {{
                $t('flagged_event_rule.not_act_description', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
            <FFormItem prop="takeActionPeriod">
              <DurationTag
                v-model="currentBureau.takeActionPeriod"
                placeholder="DD:HH:MM"
              />
            </FFormItem>

            <FDivider
              width="100%"
              backgroundColor="backgroundMidgroundDark"
              margin="containerLarge containerNone"
            />
            <FContainer display="flex" alignItems="center">
              <FContainer width="16px" marginRight="containerLarge">
                <FCheckbox v-model="currentBureau.addUnusedEvalTime" />
              </FContainer>
              <FText appearance="bodyReg14" color="textDefault">
                {{
                  $t('flagged_event_rule.unused_time_description', {
                    ns: 'remote_monitor',
                  })
                }}
              </FText>
            </FContainer>
            <FDivider
              width="100%"
              backgroundColor="backgroundMidgroundDark"
              margin="containerLarge containerNone"
            />
          </FContainer>
        </FForm>
        <template v-if="woCreateEnabled">
          <BureauInhibitReasonList
            ref="inhibit-reason-list"
            :isNew="isNew"
            :bureauName="bureauName"
            :currentBureauDetails="currentBureauDetails"
          />
          <FDivider
            width="100%"
            backgroundColor="backgroundMidgroundDark"
            margin="containerLarge containerNone"
          />
        </template>

        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerXxLarge"
        >
          <FContainer
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <FText appearance="headingMed14" color="textMain">
              {{
                $t('flagged_event_rule.close_issue_reasons', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
            <FSwitch v-model="showIssueReasonList" size="small" />
          </FContainer>
          <FContainer
            v-if="showIssueReasonList"
            display="flex"
            flexDirection="column"
            rowGap="containerXxLarge"
          >
            <FInput
              v-model="currentBureau.newReason"
              @slotClicked="addCloseIssueReasonToList"
              placeholder="Enter Reason"
            >
              <template #clickable>
                <FIcon group="sign-symbols" name="addition" size="16"></FIcon>
              </template>
            </FInput>
            <FContainer
              display="flex"
              flexWrap="wrap"
              rowGap="containerLarge"
              columnGap="containerLarge"
              marginBottom="sectionXSmall"
            >
              <FTags
                v-for="(
                  issueReason, index
                ) in currentBureau.closeIssueReasonOptionContexts"
                :text="issueReason"
                :key="index"
                appearance="action"
                actionType="removable"
                @close="removeFromCloseIssueReasonOptionContexts(index)"
              />
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider
          width="100%"
          backgroundColor="backgroundMidgroundDark"
          margin="containerLarge containerNone"
        />
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerXxLarge"
        >
          <FContainer
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <FText appearance="headingMed14" color="textMain">
              {{
                $t('flagged_event_rule.flagged_condition_causes', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
            <FSwitch v-model="showCauseList" size="small" />
          </FContainer>
          <FContainer
            v-if="showCauseList"
            display="flex"
            flexDirection="column"
            rowGap="containerXxLarge"
          >
            <FInput
              v-model="currentBureau.newCause"
              @slotClicked="addCauseToList"
              placeholder="Enter Cause"
            >
              <template #clickable>
                <FIcon group="sign-symbols" name="addition" size="16"></FIcon>
              </template>
            </FInput>
            <FContainer
              display="flex"
              flexWrap="wrap"
              rowGap="containerLarge"
              columnGap="containerLarge"
              marginBottom="sectionXSmall"
            >
              <FTags
                v-for="(cause, index) in currentBureau.causeList"
                :text="cause"
                :key="index"
                appearance="action"
                actionType="removable"
                @close="removeFromCauseList(index)"
              />
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider
          width="100%"
          backgroundColor="backgroundMidgroundDark"
          margin="containerLarge containerNone"
        />
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerXxLarge"
        >
          <FContainer
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <FText appearance="headingMed14" color="textMain">
              {{
                $t('flagged_event_rule.flagged_condition_resolutions', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
            <FSwitch v-model="showResolutionList" size="small" />
          </FContainer>
          <FContainer
            v-if="showResolutionList"
            display="flex"
            flexDirection="column"
            rowGap="containerXxLarge"
          >
            <FInput
              v-model="currentBureau.newResolution"
              @slotClicked="addResolutionToList"
              placeholder="Enter Resolution"
            >
              <template #clickable>
                <FIcon group="sign-symbols" name="addition" size="16"></FIcon>
              </template>
            </FInput>
            <FContainer
              display="flex"
              flexWrap="wrap"
              rowGap="containerLarge"
              columnGap="containerLarge"
              marginBottom="sectionXSmall"
            >
              <FTags
                v-for="(resolution, index) in currentBureau.resolutionList"
                :text="resolution"
                :key="index"
                appearance="action"
                actionType="removable"
                @close="removeFromResolutionList(index)"
              />
            </FContainer>
          </FContainer>
        </FContainer>
        <template v-if="woCreateEnabled">
          <FDivider
            width="100%"
            backgroundColor="backgroundMidgroundDark"
            margin="containerLarge containerNone"
          />
          <FContainer
            display="flex"
            flexDirection="column"
            rowGap="sectionSmall"
          >
            <FText appearance="bodyReg14" color="textDefault">
              {{
                $t('flagged_event_rule.background_color_description', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
            <FContainer display="flex" justifyContent="space-between">
              <FContainer
                display="flex"
                flexDirection="column"
                rowGap="containerLarge"
                width="48%"
              >
                <FText appearance="captionReg12">
                  {{
                    $t('field_names.amber_urgency_time', {
                      ns: 'remote_monitor',
                    })
                  }}
                </FText>
                <FTimePicker
                  v-model="currentBureau.amberUrgencyTime"
                  :selectableRange="amberUrgencyTimeSelectRange"
                  placeholder="HH:MM"
                ></FTimePicker>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="column"
                rowGap="containerLarge"
                width="48%"
              >
                <FText appearance="captionReg12">
                  {{
                    $t('field_names.red_urgency_time', {
                      ns: 'remote_monitor',
                    })
                  }}
                </FText>
                <FTimePicker
                  v-model="currentBureau.redUrgencyTime"
                  :selectableRange="redUrgencyTimeSelectRange"
                  placeholder="HH:MM"
                ></FTimePicker>
              </FContainer>
            </FContainer>
          </FContainer>
        </template>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTimePicker,
  FCheckbox,
  FDivider,
  FSwitch,
  FInput,
  FTags,
  FIcon,
  FForm,
  FFormItem,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import BureauInhibitReasonList from './BureauInhibitReasonList.vue'
import DurationTag from '../../filtered-alarm-condition/components/DurationTag.vue'
import getProperty from 'dlv'
export default {
  components: {
    FContainer,
    FText,
    FTimePicker,
    FCheckbox,
    FDivider,
    FSwitch,
    FInput,
    FTags,
    FIcon,
    BureauInhibitReasonList,
    FForm,
    FFormItem,
    DurationTag,
  },
  props: [
    'isNew',
    'index',
    'bureauName',
    'currentBureauDetails',
    'woCreateEnabled',
  ],
  data() {
    return {
      dataDeserialized: false,
      showIssueReasonList: false,
      showCauseList: false,
      showResolutionList: false,
      selectableRange: { from: 300000, to: null },
      currentBureau: {
        takeCustodyPeriod: 0,
        takeActionPeriod: 0,
        addUnusedEvalTime: false,
        inhibitReasonList: [],
        newReason: '',
        closeIssueReasonOptionContexts: [],
        newCause: '',
        causeList: [],
        newResolution: '',
        resolutionList: [],
        amberUrgencyTime: 0,
        redUrgencyTime: 0,
      },
      formRules: {
        takeCustodyPeriod: {
          required: true,
          trigger: 'change',
          message: `${this.$t('field_names.take_custody_period', {
            ns: 'remote_monitor',
          })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`,
        },
        takeActionPeriod: {
          required: true,
          trigger: 'change',
          message: `${this.$t('field_names.take_action_period', {
            ns: 'remote_monitor',
          })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`,
        },
      },
    }
  },
  computed: {
    amberUrgencyTimeSelectRange() {
      let { currentBureau = {} } = this
      let { redUrgencyTime } = currentBureau
      return isEmpty(redUrgencyTime) || redUrgencyTime <= 0
        ? { from: 0, to: null }
        : { from: redUrgencyTime + 60000, to: null }
    },
    redUrgencyTimeSelectRange() {
      let { currentBureau = {} } = this
      let { amberUrgencyTime } = currentBureau
      return isEmpty(amberUrgencyTime) || amberUrgencyTime <= 0
        ? { from: 0, to: null }
        : { from: 0, to: amberUrgencyTime - 60000 }
    },
  },
  watch: {
    showIssueReasonList(newVal) {
      if (!newVal) {
        this.currentBureau.newReason = ''
        this.currentBureau.closeIssueReasonOptionContexts = []
      }
    },
    showCauseList(newVal) {
      if (!newVal) {
        this.currentBureau.newCause = ''
        this.currentBureau.causeList = []
      }
    },
    showResolutionList(newVal) {
      if (!newVal) {
        this.currentBureau.newResolution = ''
        this.currentBureau.resolutionList = []
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
      let { dataDeserialized, woCreateEnabled, index } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }

      let { currentBureau = {} } = this
      let {
        takeCustodyPeriod,
        takeActionPeriod,
        addUnusedEvalTime,
        closeIssueReasonOptionContexts = [],
        causeList = [],
        resolutionList = [],
        amberUrgencyTime,
        redUrgencyTime,
      } = currentBureau

      let inhibitReasonListObj = []

      closeIssueReasonOptionContexts = closeIssueReasonOptionContexts.map(
        issueReason => {
          return { name: issueReason }
        }
      )
      causeList = causeList.map(cause => {
        return { name: cause }
      })
      resolutionList = resolutionList.map(resolution => {
        return { name: resolution }
      })
      if (woCreateEnabled) {
        let evaluationTimeConfigForm = getProperty(
          this,
          `$refs.evaluation-time-config-form-${index}`,
          {}
        )
        let validTimeData = false
        if (!isEmpty(evaluationTimeConfigForm)) {
          validTimeData = evaluationTimeConfigForm.validate()
        }

        if (!validTimeData) {
          return { invalid: true }
        }

        // Serialize inhibitReasonList
        let inhibitReasonListComp = this.$refs['inhibit-reason-list']
        inhibitReasonListObj = inhibitReasonListComp.getSerializedData()
        takeCustodyPeriod = this.handleEmptyNumber(takeCustodyPeriod)
        takeActionPeriod = this.handleEmptyNumber(takeActionPeriod)
        amberUrgencyTime = this.handleEmptyNumber(amberUrgencyTime)
        redUrgencyTime = this.handleEmptyNumber(redUrgencyTime)
      } else {
        takeCustodyPeriod = null
        takeActionPeriod = null
        amberUrgencyTime = null
        redUrgencyTime = null
        inhibitReasonListObj = { inhibitReasonList: [] }
      }

      return {
        takeCustodyPeriod,
        takeActionPeriod,
        addUnusedEvalTime,
        ...inhibitReasonListObj,
        closeIssueReasonOptionContexts,
        causeList,
        resolutionList,
        amberUrgencyTime,
        redUrgencyTime,
      }
    },
    handleEmptyNumber(value) {
      // Handle empty or non-positive numbers by converting them to null
      return isEmpty(value) || value <= 0 ? null : value
    },
    deserializeData() {
      let { currentBureauDetails = {} } = this
      let {
        takeCustodyPeriod,
        takeActionPeriod,
        closeIssueReasonOptionContexts = [],
        causeList = [],
        resolutionList = [],
        amberUrgencyTime,
        redUrgencyTime,
      } = currentBureauDetails
      closeIssueReasonOptionContexts = (
        closeIssueReasonOptionContexts || []
      ).map(issueReason => {
        return issueReason?.name || ''
      })
      causeList = (causeList || []).map(cause => {
        return cause?.name || ''
      })
      resolutionList = (resolutionList || []).map(resolution => {
        return resolution?.name || ''
      })
      takeCustodyPeriod = this.handleEmptyNumber(takeCustodyPeriod)
      takeActionPeriod = this.handleEmptyNumber(takeActionPeriod)
      amberUrgencyTime = this.handleEmptyNumber(amberUrgencyTime)
      redUrgencyTime = this.handleEmptyNumber(redUrgencyTime)

      this.currentBureau = {
        ...currentBureauDetails,
        closeIssueReasonOptionContexts,
        causeList,
        resolutionList,
        takeCustodyPeriod,
        takeActionPeriod,
        amberUrgencyTime,
        redUrgencyTime,
      }
      this.showIssueReasonList = !isEmpty(closeIssueReasonOptionContexts)
      this.showCauseList = !isEmpty(causeList)
      this.showResolutionList = !isEmpty(resolutionList)
      this.dataDeserialized = true
    },
    addCloseIssueReasonToList() {
      let closeIssueReasonOptionContexts = getProperty(
        this,
        'currentBureau.closeIssueReasonOptionContexts',
        []
      )
      let newReason = getProperty(this, 'currentBureau.newReason', '')
      if (!isEmpty(newReason)) {
        closeIssueReasonOptionContexts.push(newReason)
        this.currentBureau.closeIssueReasonOptionContexts =
          closeIssueReasonOptionContexts
        this.currentBureau.newReason = ''
      }
    },
    removeFromCloseIssueReasonOptionContexts(index) {
      this.currentBureau.closeIssueReasonOptionContexts.splice(index, 1)
    },
    addCauseToList() {
      let causeList = getProperty(this, 'currentBureau.causeList', [])
      let newCause = getProperty(this, 'currentBureau.newCause', '')
      if (!isEmpty(newCause)) {
        causeList.push(newCause)
        this.currentBureau.causeList = causeList
        this.currentBureau.newCause = ''
      }
    },
    removeFromCauseList(index) {
      this.currentBureau.causeList.splice(index, 1)
    },
    addResolutionToList() {
      let resolutionList = getProperty(this, 'currentBureau.resolutionList', [])
      let newResolution = getProperty(this, 'currentBureau.newResolution', '')
      if (!isEmpty(newResolution)) {
        resolutionList.push(newResolution)
        this.currentBureau.resolutionList = resolutionList
        this.currentBureau.newResolution = ''
      }
    },
    removeFromResolutionList(index) {
      this.currentBureau.resolutionList.splice(index, 1)
    },
  },
}
</script>
