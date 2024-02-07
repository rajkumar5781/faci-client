export default {
  components: {
    evaluationTimeRemaining: () =>
      import(
        '../remotemonitor/summary/flagged-event/EvaluationTimeRemaining.vue'
      ),
    evaluationTeamDetails: () =>
      import(
        '../remotemonitor/summary/flagged-event/EvaluationTeamDetails.vue'
      ),
    flaggedAlarmTimeLog: () =>
      import('../remotemonitor/summary/flagged-event/FlaggedAlarmTimeLog.vue'),
  },
}
