export default {
  components: {
    inspectionTemplateSummaryQuestionCount: () =>
      import('./InspectionTemplateSummaryQuestionsCount.vue'),
    inspectionTemplateSummaryPageCount: () =>
      import('./InspectionTemplateSummaryPageCount.vue'),
    inspectionTemplateSummaryLastTriggered: () =>
      import('./InspectionTemplateSummaryLastTriggered.vue'),
    inspectionTemplateSummaryQuestions: () =>
      import('./InspectionTemplateSummaryQuestions.vue'),
    inspectionTemplateTriggers: () => import('./InspectionTriggersTab.vue'),
    inspectionTemplateInsightGraph: () =>
      import('./InspectionInSightTabGraph.vue'),
    inspectionTemplateInsightSummary: () =>
      import('./InspectionInSightTabSummary.vue'),
  },
}
