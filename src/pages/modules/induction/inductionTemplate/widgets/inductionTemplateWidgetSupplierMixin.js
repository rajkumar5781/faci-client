export default {
  components: {
    inductionTemplateSummaryQuestionCount: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionTemplateSummaryQuestionsCount.vue'
      ),
    inductionnTemplateSummaryPageCount: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionTemplateSummaryPageCount.vue'
      ),
    inductionTemplateSummaryLastTriggered: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionTemplateSummaryLastTriggered.vue'
      ),
    inductionTemplateSummaryQuestions: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionTemplateSummaryQuestions.vue'
      ),
    inductionTemplateTriggers: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionTriggersTab.vue'
      ),
    inductionTemplateInsightGraph: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionInSightTabGraph.vue'
      ),
    inductionTemplateInsightSummary: () =>
      import(
        '../../../inspection/inspectionTemplate/widgets/InspectionInSightTabSummary.vue'
      ),
  },
}
