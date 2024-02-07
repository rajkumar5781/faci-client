<template>
  <FContainer height="100%">
    <FContainer>
      <FContainer display="flex" height="100%">
        <FContainer
          display="flex"
          flexDirection="column"
          v-if="!isEmpty(page)"
          padding="containerLarge containerXLarge"
          borderBottom="1px solid"
          borderColor="backgroundMidgroundDark"
          width="100%"
          backgroundColor="backgroundMidgroundSubtle"
        >
          <FText appearance="headingMed14" paddingBottom="containerLarge">
            {{ page.name }}
          </FText>
          <FText
            v-if="page.description"
            appearance="bodyReg14"
            color="textInverseCaption"
          >
            {{ page.description }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="!loading && isEmpty(questions)"
        display="flex"
        justifyContent="center"
      >
        <FContainer width="500px">
          <FEmptyState
            :title="emptyStateText()"
            :vertical="true"
            illustration="no-entries"
          ></FEmptyState>
        </FContainer>
      </FContainer>
      <FContainer v-else>
        <FContainer
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          v-if="loading"
        >
          <FSpinner :size="40" />
        </FContainer>
        <FContainer
          v-else
          v-for="(question, index) in questionList"
          :key="index"
          display="flex"
          padding="containerXLarge"
          borderBottom="1px solid"
          borderColor="backgroundMidgroundDark"
          flexDirection="column"
        >
          <FContainer display="flex" width="100%">
            <FTags
              v-if="question.questionNo"
              :text="question.questionNo"
              flex="0 0 auto"
            ></FTags>
            <FContainer flex="1" alignItems="center">
              <FContainer
                :padding="
                  question.questionNo && 'containerNone containerMedium'
                "
              >
                <FText>{{ question.question }} </FText>
              </FContainer>
              <FContainer
                v-if="question.answerRequired"
                display="flex"
                marginTop="containerXLarge"
              >
                <FContainer marginRight="containerSmall">
                  <FTags
                    :text="`Answered : ${
                      question.answered ? question.answered : 0
                    }`"
                  ></FTags>
                </FContainer>
                <FTags
                  :text="`Skipped : ${
                    question.answered && totalResponses
                      ? Math.abs(totalResponses - question.answered)
                      : 0
                  }`"
                ></FTags> </FContainer
            ></FContainer>
            <FContainer flex="0 0 auto">
              <FButton
                v-if="question.showResponses"
                appearance="link"
                size="medium"
                @click="openResponseDialog(question)"
              >
                {{ 'Show Answer' }}
              </FButton>
            </FContainer>
          </FContainer>

          <FContainer
            v-if="isMultiChoice(question)"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <MCQTable
              :question="question"
              @hook:mounted="callResize"
            ></MCQTable>
            <FContainer paddingTop="containerXLarge">
              <FButton
                v-if="question.summary"
                appearance="link"
                size="medium"
                @click="openResponseDialog(question)"
              >
                {{ 'Show Other Responses' }}
              </FButton>
            </FContainer>
          </FContainer>

          <FContainer
            v-if="isRatingField(question)"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <RatingTable :question="question" @hook:mounted="callResize" />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <ShowAnswerDialog
      :isOpen="isDialogOpen"
      :question="selectedQuestion"
      :closeDialog="closeDialog"
      :dateObj="dateObj"
    >
    </ShowAnswerDialog>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <FContainer margin="containerLarge">
        <FPagination
          :currentPage.sync="pageNumber"
          :total="totalPages"
          :perPage="perPage"
          @nextClick="next"
          @prevClick="prev"
        ></FPagination>
      </FContainer>
    </portal>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FButton,
  FEmptyState,
  FSpinner,
  FTags,
  FPagination,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import ShowAnswerDialog from '../components/ShowAnswerDialog.vue'
import MCQTable from '../components/MCQTable.vue'
import RatingTable from '../components/RatingTable.vue'
import debounce from 'lodash/debounce'
import { ftoast } from '@facilio/design-system'
import { eventBus } from '../../../../../components/page-builder/event-bus'

export default {
  components: {
    FContainer,
    FText,
    FButton,
    FEmptyState,
    FSpinner,
    FTags,
    FPagination,
    ShowAnswerDialog,
    MCQTable,
    RatingTable,
  },
  props: ['widget', 'actionPortal', 'details', 'fitMyContent'],
  data() {
    return {
      pageNumber: 1,
      questions: [],
      page: null,
      perPage: 50,
      loading: false,
      isDialogOpen: false,
      selectedQuestion: false,
      isEmpty,
      dateObj: {
        operatorId: 44,
      },
    }
  },
  created() {
    eventBus.$on('date-change-inspection', this.setDateObject)
  },
  computed: {
    pageModuleName() {
      return 'qandaPage'
    },
    totalPages() {
      let { details } = this
      let { pages } = details || {}
      return (pages || []).length
    },
    totalResponses() {
      let { details } = this || {}
      let { totalResponses } = details || {}
      return totalResponses
    },
    questionList() {
      let { questions } = this
      let count = 0
      return questions.map(question => {
        if (question.answerRequired) {
          count += 1
          return { ...question, questionNo: `Q${count}` }
        }
        return question
      })
    },
  },
  watch: {
    pageNumber: {
      handler() {
        this.loadPagesSummary()
      },
    },
    details: {
      handler() {
        this.loadPagesSummary()
      },
      immediate: true,
    },
  },
  methods: {
    callResize: debounce(() => {
      this.fitMyContent()
    }, 100),
    setDateObject(dateFilter) {
      this.dateObj = dateFilter
      this.loadPagesSummary()
    },
    async loadPagesSummary() {
      let { details = {}, pageNumber, pageModuleName, dateObj = {} } = this
      let { value } = dateObj
      let { pages } = details
      if (!isEmpty(pages)) {
        this.loading = true
        let { id } = pages[pageNumber - 1]
        let { [pageModuleName]: record, error } = await API.fetchRecord(
          pageModuleName,
          {
            id,
            fetchSummary: true,
            startTime: value[0],
            endTime: value[1],
          }
        )
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          this.page = record
          this.questions = getProperty(record, 'questions')
        }
        this.loading = false
        this.$nextTick(() => {
          this.fitMyContent()
        })
      }
    },
    openResponseDialog(question) {
      this.selectedQuestion = question
      this.isDialogOpen = true
    },
    closeDialog() {
      this.isDialogOpen = false
    },
    isMultiChoice(question) {
      let { questionType } = question || {}

      return ['MULTIPLE_CHOICE_ONE', 'MULTIPLE_CHOICE_MANY'].includes(
        questionType
      )
    },
    isRatingField(question) {
      let { questionType } = question || {}

      return ['STAR_RATING', 'SMILEY_RATING'].includes(questionType)
    },
    emptyStateText() {
      return `${this.$t('template.no_question_available', {
        ns: 'inspection',
      })}`
    },
    prev() {
      let { pageNumber } = this
      if (pageNumber !== 1) {
        this.$set(this, 'pageNumber', pageNumber - 1)
      }
    },
    next() {
      let { pageNumber, totalPages } = this
      if (pageNumber !== totalPages) {
        this.$set(this, 'pageNumber', pageNumber + 1)
      }
    },
  },
}
</script>
