<template>
  <FContainer v-if="loading"> </FContainer>
  <FContainer
    v-else
    display="flex"
    flexDirection="column"
    rowGap="sectionSmall"
  >
    <IncludeBureauAction
      v-for="(currentBureau, index) in flaggedEventRuleBureauEvaluationContexts"
      :ref="getBureauName(index)"
      :key="index"
      :isNew="isNew"
      :name="getBureauName(index)"
      :teamOptions="teamOptions"
      :index="index"
      :currentBureauDetails="currentBureau"
      :addNextLevelEvaluation="addNextLevelEvaluation"
      :createWorkorder="createWorkorder"
    />
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { FContainer } from '@facilio/design-system'
import IncludeBureauAction from './IncludeBureauAction.vue'
import { isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import getProperty from 'dlv'
import { eventBus } from '../../../../../components/page-builder/event-bus'
const NUMBER_WORDING_MAP = {
  1: 'First',
  2: 'Second',
  3: 'Third',
  4: 'Fourth',
  5: 'Fifth',
}
export default {
  components: { FContainer, IncludeBureauAction },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      dataDeserialized: false,
      loading: false,
      flaggedEventRuleBureauEvaluationContexts: [],
      createWorkorder: false,
    }
  },
  created() {
    this.init()
  },
  beforeDestroy() {
    eventBus.$off('create-wo-enable', this.handleCreateWoChange)
  },
  methods: {
    async init() {
      eventBus.$on('create-wo-enable', this.handleCreateWoChange)
      this.loading = true
      await this.loadTeams()
      this.deserializeData()
      this.loading = false
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { flaggedEventRuleBureauEvaluationContexts = [] } = this
      let returnList = []
      let invalid = false
      flaggedEventRuleBureauEvaluationContexts.forEach((_, index) => {
        let bureauName = this.getBureauName(index)
        let evaluationParamsForm = this.$refs[bureauName]
        if (!isEmpty(evaluationParamsForm)) {
          evaluationParamsForm = evaluationParamsForm[0] || {}
          let evaluationParamsData = evaluationParamsForm.getSerializedData()
          if (evaluationParamsData && evaluationParamsData.invalid) {
            invalid = true
          }
          if (!isEmpty(evaluationParamsData)) {
            returnList.push(evaluationParamsData)
          }
        }
      })
      return invalid
        ? { invalid: true }
        : { flaggedEventRuleBureauEvaluationContexts: returnList }
    },
    deserializeData() {
      let { isNew, flaggedEventRule = {} } = this
      let bureauEvaluationContexts = []
      if (!isNew) {
        this.createWorkorder = getProperty(
          this,
          'flaggedEventRule.createWorkorder',
          false
        )
        let { flaggedEventRuleBureauEvaluationContexts = [] } = flaggedEventRule
        bureauEvaluationContexts =
          cloneDeep(flaggedEventRuleBureauEvaluationContexts) || []
      }
      if (isEmpty(bureauEvaluationContexts)) {
        let bureauEvalInitialVal = {
          emailRule: {},
          causeList: [],
          issueReasonList: [],
          resolutionList: [],
          troubleShootingTips: '',
          takeCustodyPeriod: null,
          takeActionPeriod: null,
          addUnusedEvalTime: false,
          lastChild: true,
        }
        bureauEvaluationContexts.push(bureauEvalInitialVal)
      } else {
        const evaluationConfigListLength = (bureauEvaluationContexts || [])
          .length
        const lastIndex = evaluationConfigListLength - 1
        bureauEvaluationContexts[lastIndex].lastChild = true
      }
      this.flaggedEventRuleBureauEvaluationContexts = bureauEvaluationContexts
      this.dataDeserialized = true
    },
    addNextLevelEvaluation() {
      let { flaggedEventRuleBureauEvaluationContexts: evaluationList } = this
      evaluationList = cloneDeep(evaluationList)
      evaluationList = (evaluationList || []).map(evaluationObj => {
        return { ...evaluationObj, lastChild: false }
      })
      let evaluationObjInitialVal = {
        emailRule: {},
        causeList: [],
        issueReasonList: [],
        resolutionList: [],
        troubleShootingTips: '',
        takeCustodyPeriod: null,
        takeActionPeriod: null,
        addUnusedEvalTime: false,
        lastChild: true,
      }
      evaluationList.push(evaluationObjInitialVal)
      this.flaggedEventRuleBureauEvaluationContexts = evaluationList
    },
    getBureauName(index) {
      return `${NUMBER_WORDING_MAP[index + 1]} ${this.$t('level', {
        ns: 'remote_monitor',
      })}`
    },
    async loadTeams() {
      this.loading = true
      let { data = {}, error } = await API.get(
        '/v3/flaggedAlarmProcess/subModulePickList/team/flaggedEventBureauEvaluation'
      )
      if (isEmpty(error)) {
        let { pickList = [] } = data
        this.teamOptions = pickList
      }
      this.loading = false
    },
    handleCreateWoChange(shouldCreateWo) {
      this.createWorkorder = shouldCreateWo
    },
  },
}
</script>
