<template>
  <FModal
    :title="question.question"
    :visible.sync="openResponses"
    size="S"
    type="default"
    @cancel="closeDialog"
  >
    <template #footer>
      <FContainer
        display="flex"
        justifyContent="right"
        padding="containerXLarge sectionSmall"
        border="1px solid"
        borderColor="borderNeutralBaseSubtler"
        ><FButton appearance="secondary" @click="closeDialog">Close</FButton>
      </FContainer>
    </template>
    <FContainer v-if="loading" display="flex" justifyContent="center">
      <FSpinner :show="loading" :size="40"></FSpinner>
    </FContainer>
    <FContainer v-else-if="isEmpty(answers)">
      <FEmptyState
        :title="emptyStateText()"
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else padding="containerXLarge sectionSmall">
      <FContainer
        display="flex"
        marginBottom="containerLarge"
        flexDirection="column"
      >
        <FText
          apperance="captionReg12"
          marginBottom="containerXLarge"
          color="textInverseCaption"
        >
          {{ $t('template.response_dialog_desc', { ns: 'inspection' }) }},
          {{ timeRange }}
        </FText>
        <FText apperance="headingMed14" color="textDefault">{{
          $t('template.answers', { ns: 'inspection' })
        }}</FText>
      </FContainer>
      <template>
        <FContainer
          v-for="(answer, index) in answers"
          marginTop="containerMedium"
          padding="containerMedium containerNone"
          :key="answer.id"
          display="flex"
          flexDirection="column"
        >
          <FText apperance="bodyReg14" marginBottom="containerXLarge">
            {{ index + 1 }}.
            {{ getAnswer(answer) }}
          </FText>
          <FButton
            appearance="link"
            size="medium"
            @click="redirectToResponse(answer)"
          >
            {{ $t('template.view_inspection', { ns: 'inspection' }) }}
          </FButton>
        </FContainer>
      </template>
    </FContainer>
  </FModal>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FButton,
  FEmptyState,
  FSpinner,
  FModal,
  ftoast,
} from '@facilio/design-system'
import { getDateInOrgTimezone } from '../../../../../utils/formatter'

const QUESTION_TYPE_ANSWER_RENDERER = {
  MULTIPLE_CHOICE_MANY(answer) {
    return answer.other
  },
  MULTIPLE_CHOICE_ONE(answer) {
    return answer.other
  },
  BOOLEAN(answer, question) {
    let { trueLabel, falseLabel } = question || {}
    return answer.answer ? trueLabel : falseLabel
  },
  DATE_TIME(answer, question) {
    if (question.showTime) {
      return getDateInOrgTimezone(answer.answer).format(
        'HH:mm a - DD MMM, YYYY'
      )
    }
    return getDateInOrgTimezone(answer.answer).format('DD MMM, YYYY')
  },
  FILE_UPLOAD(answer) {
    let fileName = getProperty(answer, 'answer.fileName')
    return fileName
  },
  MULTI_FILE_UPLOAD(answer) {
    let { answer: filesArray } = answer || {}
    return filesArray.map(file => file.fileName).join(', ')
  },
}

export default {
  props: ['question', 'isOpen', 'closeDialog', 'dateObj'],
  components: {
    FContainer,
    FText,
    FButton,
    FEmptyState,
    FSpinner,
    FModal,
  },
  data() {
    return {
      answers: [],
      openResponses: false,
      loading: false,
      isEmpty,
    }
  },
  computed: {
    timeRange() {
      let { dateObj } = this
      let { value } = dateObj || {}
      if (!isEmpty(value)) {
        let startTime = getDateInOrgTimezone(value[0]).format('DD MMM, YYYY')
        let endTime = getDateInOrgTimezone(value[1]).format('DD MMM, YYYY')
        return `${startTime} - ${endTime}`
      }
      return ''
    },
    isMultiChoice() {
      let { question } = this
      let { questionType } = question || {}

      return ['MULTIPLE_CHOICE_ONE', 'MULTIPLE_CHOICE_MANY'].includes(
        questionType
      )
    },
  },
  watch: {
    isOpen: {
      handler(newVal) {
        this.openResponses = newVal
        if (newVal) {
          this.loadQuestionResponse()
        }
      },
    },
  },
  methods: {
    async loadQuestionResponse() {
      let { dateObj, isMultiChoice } = this
      let { value } = dateObj
      this.loading = true
      let { id } = this.question
      let params = {
        startTime: value[0],
        endTime: value[1],
      }

      let url = `v3/qanda/questions/fetchanswers/${id}`
      if (isMultiChoice) url = `v3/qanda/questions/fetchotheroptions/${id}`

      let { data, error } = await API.post(url, params)
      if (error) {
        ftoast.critical(error.message || 'Error occured')
      } else {
        this.answers = data.answers || data.otherResponses
      }
      this.loading = false
    },
    redirectToResponse(answer) {
      let { responseId, response } = answer || {}
      let { id: resId } = response || {}
      let id = responseId || resId
      let route
      if (id) {
        if (isWebTabsEnabled()) {
          let { name } =
            findRouteForModule('inspectionResponse', pageTypes.OVERVIEW) || {}

          if (name) {
            route = this.$router.resolve({
              name,
              params: {
                viewname: 'all',
                id,
              },
            })
          }
        } else {
          route = this.$router.resolve({
            name: 'individualInspectionSummary',
            params: { viewname: 'all', id },
          })
        }
        let { href } = route || {}
        window.open(href, '_blank')
      }
    },
    getAnswer(answer) {
      let { question = {} } = this
      let { questionType } = question

      if (!isEmpty(QUESTION_TYPE_ANSWER_RENDERER[questionType])) {
        return QUESTION_TYPE_ANSWER_RENDERER[questionType](answer, question)
      }
      return answer.answer
    },
    emptyStateText() {
      return `${this.$t('template.no_answer', {
        ns: 'inspection',
      })}`
    },
  },
}
</script>
