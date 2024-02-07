<template>
  <FContainer>
    <FContainer display="flex">
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
        <FText appearance="headingMed14">
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
      height="100%"
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
        alignItems="center"
      >
        <FTags
          v-if="question.questionNo"
          :text="question.questionNo"
          flex="0 0 auto"
        ></FTags>
        <FText
          flex="1"
          :margin="question.questionNo && 'containerNone containerLarge'"
          >{{ question.question }}
        </FText>
        <FTags
          v-if="question.answerRequired"
          :text="getMandatory(question)"
          flex="0 0 auto"
        ></FTags>
      </FContainer>
    </FContainer>
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
  FTags,
  FSpinner,
  FPagination,
  FEmptyState,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

export default {
  props: ['details', 'widget', 'fitMyContent', 'moduleName'],
  components: {
    FContainer,
    FText,
    FTags,
    FSpinner,
    FPagination,
    FEmptyState,
    ftoast,
  },

  data() {
    return {
      pageNumber: 1,
      questions: [],
      page: null,
      loading: false,
      isEmpty,
      perPage: 50,
    }
  },
  computed: {
    pageModuleName() {
      return 'qandaPage'
    },
    totalPages() {
      let { details = {} } = this
      let { pages } = details
      return (pages || []).length
    },
    questionList() {
      let { questions } = this
      let count = 0
      return questions.map(question => {
        if (question.answerRequired) {
          count += 1
          return { ...question, questionNo: `Q${count}` }
        } else {
          return question
        }
      })
    },
    canLoadPages() {
      let { $route = {} } = this
      let { path = '' } = $route

      return !(path || '').includes('builder')
    },
  },
  watch: {
    pageNumber: {
      handler() {
        let { canLoadPages } = this
        if (canLoadPages) this.loadPagesSummary()
      },
    },
    details: {
      handler() {
        let { canLoadPages } = this
        if (canLoadPages) this.loadPagesSummary()
      },
      immediate: true,
    },
  },
  methods: {
    async loadPagesSummary() {
      let { details = {}, pageNumber, pageModuleName, moduleName } = this
      let { pages } = details

      if (!isEmpty(pages)) {
        this.loading = true
        let { id } = pages[pageNumber - 1]
        let { [pageModuleName]: record, error } =
          await this.getUnRelatedModuleSummary(moduleName, pageModuleName, id, {
            force: true,
          })
        if (error) {
          ftoast.critical(error.message || 'Error occured')
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
    async getUnRelatedModuleSummary(
      moduleName,
      unRelatedModuleName,
      id,
      params
    ) {
      let { force = false } = params || {}
      let url = `v3/unrelated/${moduleName}/fetch/${unRelatedModuleName}/${id}`
      let { error, data } = await API.get(url, params, { force })

      return { error, ...data }
    },
    emptyStateText() {
      return `${this.$t('response.no_questions', { ns: 'inspection' })}`
    },
    getMandatory(question) {
      return (question || {}).mandatory ? 'Mandatory' : 'Optional'
    },
  },
}
</script>
