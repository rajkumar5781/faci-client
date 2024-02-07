<template>
  <FContainer>
    <FContainer
      v-for="page in pages"
      :key="page.id"
      height="100%"
      paddingBottom="containerXLarge"
    >
      <FCard :hideBorder="false">
        <template #header>
          <FContainer
            borderBottom="solid 1px"
            borderColor="borderNeutralBaseSubtler"
            padding="containerXLarge"
          >
            <FText apperance="headingMed14">{{
              'Page ' + page.position
            }}</FText>
          </FContainer>
          <FContainer
            display="flex"
            flexDirection="columns"
            justifyContent="space-between"
            borderBottom="solid 1px"
            borderColor="borderNeutralBaseSubtler"
            backgroundColor="backgroundMidgroundSubtle"
          >
            <FContainer padding="containerXLarge">
              <FText apperance="headingMed14">{{ page.name }}</FText>
              <FContainer v-if="(page || {}).description">
                <FText
                  color="textCaption"
                  apperance="bodyReg14"
                  paddingTop="containerMedium"
                >
                  {{ page.description }}
                </FText>
              </FContainer>
            </FContainer>
            <FContainer
              v-if="!isEmpty(getPageScore(page))"
              display="flex"
              alignItems="center"
              marginRight="containerXLarge"
            >
              <FTags :text="getPageScore(page)"> </FTags>
            </FContainer>
          </FContainer>
        </template>
        <FContainer v-if="!isEmpty(page.questions)">
          <FContainer
            v-for="(question, index) in page.questions"
            :key="index"
            display="flex"
            borderBottom="1px solid"
            borderColor="backgroundMidgroundDark"
            padding="containerXLarge"
          >
            <FTags :text="question.questionNo" flex="0 0 auto"></FTags>

            <FContainer
              flex="1"
              alignItems="center"
              padding="containerNone containerLarge"
            >
              <FText appearance="headingMed14">
                {{ question.question }}
              </FText>
              <FContainer v-if="!isEmpty(question.description)">
                <FText color="textCaption" appearance="bodyReg14">
                  {{ question.description }}
                </FText>
              </FContainer>
              <FContainer
                v-if="question.answerRequired"
                display="flex"
                flexDirection="column"
                marginTop="containerXxLarge"
                gap="containerLarge"
              >
                <FTags text="Answer"></FTags>
                <FContainer marginBottom="containerLarge">
                  <FieldDisplayValue
                    @hook:mounted="callResize"
                    :question="question"
                  />
                </FContainer>
                <FContainer
                  v-if="(question.answer || {}).comments"
                  display="flex"
                  flexDirection="column"
                >
                  <FText
                    appearance="headingMed14"
                    marginBottom="containerLarge"
                  >
                    {{ (question || {}).commentsLabel }}
                  </FText>
                  <FText color="textCaption" appearance="bodyReg14">
                    {{ (question.answer || {}).comments }}
                  </FText>
                </FContainer>
                <FContainer
                  v-if="!isEmpty((question.answer || {}).attachmentList)"
                >
                  <FText appearance="headingMed14">
                    {{ (question || {}).attachmentLabel }}
                  </FText>
                  <FileFieldPreview
                    :attachments="(question.answer || {}).attachmentList"
                  />
                </FContainer>
              </FContainer>
            </FContainer>
            <FTags
              v-if="!isEmpty(getQuestionScore(question))"
              :text="getQuestionScore(question)"
              flex="0 0 auto"
            >
            </FTags>
          </FContainer>
        </FContainer>
        <FContainer v-else display="flex" justifyContent="center">
          <FContainer width="500px">
            <FEmptyState
              :title="emptyStateText()"
              :vertical="true"
              illustration="no-entries"
            ></FEmptyState>
          </FContainer>
        </FContainer>
      </FCard>
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FIcon,
  FButton,
  FTags,
  FSpinner,
  FPagination,
  FEmptyState,
  FCard,
  FRecordDetails,
  FTable,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { getUnRelatedModuleSummary } from '../../../utils/relatedFieldUtil'
import FieldDisplayValue from '../../modules/inspection/inspectionResponse/components/FieldDisplayValue.vue'
import FileFieldPreview from '../../modules/inspection/inspectionResponse/components/FileFieldPreview.vue'
import debounce from 'lodash/debounce'

export default {
  props: ['pagesData', 'id', 'moduleName', 'fitMyContent'],
  data() {
    return {
      pages: [],
      isEmpty,
      details: null,
      appCategory: {
        PORTALS: 1,
      },
    }
  },
  components: {
    FContainer,
    FText,
    FIcon,
    FButton,
    FTags,
    FSpinner,
    FPagination,
    FEmptyState,
    FCard,
    FRecordDetails,
    FTable,
    FieldDisplayValue,
    FileFieldPreview,
  },
  async created() {
    await this.loadTemplate()
  },
  computed: {
    isPortal() {
      let {
        appCategory: { PORTALS },
      } = this.appCategory
      let { appCategory } = getApp()

      return appCategory == PORTALS
    },
  },
  methods: {
    callResize: debounce(function () {
      this.fitMyContent()
    }, 100),
    getPageScore(page) {
      let { fullScore, totalScore } = page || {}

      if (!isEmpty(totalScore)) {
        return `${totalScore}/${fullScore}`
      }
      return ''
    },
    getQuestionScore(question) {
      let { fullScore, score } = question || {}

      let validateScore = !isEmpty(score) && !isEmpty(fullScore)
      if (validateScore) {
        return `${score}/${fullScore}`
      }
      return ''
    },
    emptyStateText() {
      return `${this.$t('response.no_questions', { ns: 'inspection' })}`
    },
    async loadTemplate(responseModuleName = null) {
      this.loading = true
      //   let { details = {} } = this
      //   let { template = {} } = details
      // let { pages } = template
      let pages = this.pagesData
      if (!isEmpty(pages)) {
        let response = await this.loadQAndA(pages, responseModuleName)
        let finalQandA = []
        response.forEach(qandaResponse => {
          let { error, ['qandaPage']: data } = qandaResponse
          let { questions } = data
          let count = 0
          if (!isEmpty(questions)) {
            questions = questions.map(question => {
              if (question.answerRequired) {
                count += 1
                return { ...question, questionNo: `Q${count}.` }
              }
              return question
            })
          } else {
            questions = []
          }
          if (error) {
            ftoast.critical(error.messge || 'Error Occured')
          } else {
            finalQandA.push({ ...data, questions })
          }
        })
        this.pages = finalQandA
      }

      this.loading = false
    },
    async loadQAndA(pages, responseModuleName) {
      let { moduleName } = this
      //   let { id: responseId } = details || {}

      let responseId = this.id
      let promise = []
      if (!isEmpty(responseId)) {
        pages.forEach(page => {
          let params = { response: responseId }
          if (isEmpty(responseModuleName)) {
            params = { ...params, responseModuleName: moduleName }
          } else {
            params = { ...params, responseModuleName }
          }
          let { id } = page || {}
          let qandaResponse = getUnRelatedModuleSummary(
            moduleName,
            'qandaPage',
            id,
            params
          )
          promise.push(qandaResponse)
        })
      }
      return Promise.all(promise)
    },
  },
}
</script>
