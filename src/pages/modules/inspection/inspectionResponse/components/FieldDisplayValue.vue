<template>
  <FContainer v-if="question.answerRequired" height="100%">
    <FContainer v-if="!isEmpty(question.answer)">
      <!-- File Fields -->
      <FileFieldPreview
        v-if="isFileTypeField(question)"
        :attachments="answer"
      />
      <!-- Multi select fields -->
      <FContainer v-else-if="checkFieldType('MULTIPLE_CHOICE_MANY')">
        <FContainer
          v-for="(choice, index) in answer"
          :key="`${choice.label}-${index}`"
          paddingBottom="containerLarge"
        >
          <FText color="textCaption">{{ choice.label }}</FText>
        </FContainer>
      </FContainer>
      <!-- Rating -->
      <FContainer v-else-if="checkFieldType('SMILEY_RATING')">
        <EmojiRenderer
          class="emoji-icon-layout mL_7"
          :rating="getEmojiAnswer()"
          :isActive="true"
        />
      </FContainer>
      <FContainer v-else-if="checkFieldType('STAR_RATING')">
        <FContainer display="flex">
          <FIcon
            v-for="stars in question.answer.answer"
            :key="stars"
            group="emoji-filled"
            name="star"
            size="20"
          ></FIcon>
          <FIcon
            v-for="unselectedStar in unselectedRatingStars"
            :key="unselectedStar"
            group="emoji"
            name="star"
            size="20"
          ></FIcon>
        </FContainer>
      </FContainer>
      <MatrixQuestionDisplay
        v-else-if="checkFieldType('MATRIX')"
        :answer="answer"
        :question="question"
      />
      <MultiQuestionDisplay
        v-else-if="checkFieldType('MULTI_QUESTION')"
        :question="question"
      >
      </MultiQuestionDisplay>
      <!-- Others -->
      <FText v-else color="textCaption"> {{ answer }}</FText>
    </FContainer>
    <FText v-else color="textCaption">
      {{ $t('response.no_answer', { ns: 'inspection' }) }}
    </FText>
  </FContainer>
  <FContainer v-else-if="!question.answerRequired">
    <div
      v-html="sanitizeHtml(question.richText)"
      class="inspection-heading-field"
    ></div>
  </FContainer>
</template>

<script>
import { sanitize } from '@facilio/utils/sanitize'
import { isEmpty } from '@facilio/utils/validation'
import EmojiRenderer from '../../inspectionTemplate/components/EmojiRenderer.vue'
import FileFieldPreview from './FileFieldPreview.vue'
import MatrixQuestionDisplay from './MatrixQuestionDisplay.vue'
import MultiQuestionDisplay from './MultiQuestionDisplay.vue'
import { formatDate } from '../../../../../utils/formatter'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FIcon,
  FButton,
  FTags,
  FSpinner,
  FPagination,
  FEmptyState,
} from '@facilio/design-system'

const QUESTION_TYPE_ANSWER_RENDERER = {
  MULTIPLE_CHOICE_MANY(answer, question) {
    let { options } = question || {}
    let { selected, other } = answer || {}
    selected = options
      .filter(option => selected.includes(option.id))
      .map(option => {
        if (option.other) {
          return { ...option, label: `${option.label} - ${other}` }
        } else {
          return option
        }
      })
    return selected
  },
  MULTIPLE_CHOICE_ONE(answer, question) {
    let { options } = question || {}
    let { selected, other } = answer || {}
    selected = options.find(option => selected === option.id)
    if (!isEmpty(selected) && !isEmpty(selected.other)) {
      selected.label = `${selected.label} - ${other}`
    }
    return selected.label
  },
  BOOLEAN(answer, question) {
    let { trueLabel, falseLabel } = question || {}
    return answer ? trueLabel : falseLabel
  },
  DATE_TIME(answer, question) {
    if (question.showTime) {
      return formatDate(answer)
    } else {
      return formatDate(answer, true)
    }
  },
}

export default {
  components: {
    FileFieldPreview,
    EmojiRenderer,
    MatrixQuestionDisplay,
    MultiQuestionDisplay,
    FContainer,
    FText,
    FIcon,
    FButton,
    FTags,
    FSpinner,
    FPagination,
    FEmptyState,
  },
  props: ['question'],
  data() {
    return {
      isEmpty,
    }
  },
  computed: {
    answer() {
      let { question } = this
      let { questionType } = question
      let answer = getProperty(this, 'question.answer.answer', null)
      if (!isEmpty(QUESTION_TYPE_ANSWER_RENDERER[questionType]))
        return QUESTION_TYPE_ANSWER_RENDERER[question.questionType](
          answer,
          question
        )
      else return answer
    },
    unselectedRatingStars() {
      let { question, answer } = this
      let { questionType } = question || {}
      if (questionType === 'STAR_RATING') {
        let { ratingScale } = question || {}
        return Math.abs(ratingScale - answer) || 0
      } else {
        return 0
      }
    },
  },
  methods: {
    isFileTypeField(question) {
      let { questionType } = question || {}
      return ['MULTI_FILE_UPLOAD', 'FILE_UPLOAD'].includes(questionType)
    },
    checkFieldType(type) {
      let { question = {} } = this
      let { questionType } = question
      return questionType === type
    },
    sanitizeHtml(richText) {
      return sanitize(richText)
    },
    getEmojiAnswer() {
      let { question, answer } = this || {}
      let { ratingScale } = question
      let halfScal = ratingScale / 2
      let startEmoji = Math.round(5 - halfScal)

      return Math.abs(answer + startEmoji - 1)
    },
  },
}
</script>

<style lang="scss">
.emoji-icon-layout {
  height: 48px;
  margin-left: -3px;
}
.mL_7 {
  margin-left: -5px;
}
.inspection-heading-field {
  color: #607796ff;
}

.inspection-heading-field img {
  width: 100%;
  min-height: 100px;
}

.inspection-heading-field p {
  font-size: 14px !important;
  color: #607796ff;
  margin: 5px 0px;
}
</style>
