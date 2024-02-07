<template>
  <FContainer
    v-if="isLoading"
    width="100%"
    height="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FSpinner :size="25" />
  </FContainer>
  <FContainer
    v-else
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    rowGap="containerXxLarge"
    padding="containerXxLarge"
  >
    <FContainer display="flex" flexDirection="column" rowGap="containerMedium">
      <FText appearance="captionMed12">{{
        $t('field_names.team', { ns: 'remote_monitor' })
      }}</FText>
      <FText appearance="bodyReg14" color="textDescription">
        {{ assignedTeam }}
      </FText>
    </FContainer>
    <FContainer display="flex" flexDirection="column" rowGap="containerMedium">
      <FText appearance="captionMed12">{{
        $t('flagged_event.actioned_by', { ns: 'remote_monitor' })
      }}</FText>
      <FContainer display="flex" columnGap="containerMedium">
        <FAvatar v-if="canShowAvatar" size="XS" :userName="assignedPeople" />
        <FText appearance="bodyReg14" color="textDescription">
          {{ assignedPeople }}
        </FText>
      </FContainer>
    </FContainer>
    <FContainer display="flex" flexDirection="column" rowGap="containerMedium">
      <FText appearance="captionMed12">{{
        $t('flagged_event.evaluation_status', { ns: 'remote_monitor' })
      }}</FText>
      <FText appearance="bodyReg14" color="textDescription">
        <FTags
          v-if="canShowStatusTag"
          appearance="status"
          statusType="default"
          :text="evaluationStatus"
        />
      </FText>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FSpinner,
  FContainer,
  FText,
  FTags,
  FAvatar,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'EvaluationTeamDetails',
  components: { FSpinner, FContainer, FText, FTags, FAvatar },
  props: ['details', 'moduleName'],
  data() {
    return {
      isLoading: false,
      assignedTeam: null,
      assignedPeople: null,
      evaluationStatus: null,
    }
  },
  computed: {
    canShowAvatar() {
      let { assignedPeople } = this
      return !isEmpty(assignedPeople) && assignedPeople !== '---'
    },
    canShowStatusTag() {
      let { evaluationStatus } = this
      return !isEmpty(evaluationStatus) && evaluationStatus !== '---'
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      await this.loadFlaggedEventActionDetails()
    },
    async loadFlaggedEventActionDetails() {
      this.isLoading = true
      let flaggedEventBureauActionId = getProperty(
        this,
        'details.currentBureauActionDetail.id',
        null
      )
      if (
        !isEmpty(flaggedEventBureauActionId) &&
        flaggedEventBureauActionId > 0
      ) {
        let { data = {}, error } = await API.get(
          `/v3/unrelated/flaggedAlarm/fetch/flaggedEventBureauActions/${flaggedEventBureauActionId}`,
          null,
          { force: true }
        )
        if (isEmpty(error)) {
          let { flaggedEventBureauActions } = data
          this.assignedTeam = getProperty(
            flaggedEventBureauActions,
            'team.name',
            '---'
          )
          this.assignedPeople = getProperty(
            flaggedEventBureauActions,
            'assignedPeople.name',
            '---'
          )
          this.evaluationStatus = getProperty(
            flaggedEventBureauActions,
            'statusDisplayName',
            null
          )
        }
      }
      this.isLoading = false
    },
  },
}
</script>
