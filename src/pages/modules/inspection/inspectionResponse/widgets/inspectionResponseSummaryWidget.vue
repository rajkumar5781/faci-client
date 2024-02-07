<template>
  <FContainer padding="containerXxLarge" height="100%">
    <FContainer
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      v-if="loading"
    >
      <FSpinner :size="40" />
    </FContainer>
    <FContainer v-else>
      <FContainer
        display="flex"
        padding="10px 0px 20px"
        flexDirection="column"
        pageBreakAfter="avoid"
        pageBreakInside="avoid"
      >
        <FContainer
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          padding="5px 0px 20px"
        >
          <img v-if="hasLogo" :src="getLogoUrl()" class="object-scale-down" />
        </FContainer>
        <FContainer paddingTop="containerXLarge">
          <FText apperance="headingMed14">
            {{ responseName }}
          </FText>
        </FContainer>
        <FContainer v-if="(templateRecord || {}).description">
          <FText
            apperance="bodyReg14"
            color="textCaption"
            paddingTop="containerMedium"
            >{{ (templateRecord || {}).description }}</FText
          >
        </FContainer>
        <FContainer padding="containerXxLarge containerNone">
          <FCard>
            <FContainer
              padding="containerXLarge"
              display="flex"
              flexWrap="wrap"
              overflow="hidden"
            >
              <FContainer
                v-for="(value, key) in recordList"
                :key="value + key"
                width="50%"
              >
                <FContainer
                  padding="containerLarge"
                  width="100%"
                  display="flex"
                  alignItems="center"
                >
                  <FText
                    appearance="captionMed12"
                    paddingRight="containerXLarge"
                    width="25%"
                    >{{ key }}</FText
                  >
                  <FText appearance="bodyReg14" width="75%">{{
                    !isEmpty(value) ? value : '---'
                  }}</FText>
                </FContainer>
              </FContainer>
            </FContainer>
          </FCard>
        </FContainer>
      </FContainer>

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
              <FTags
                v-if="question.questionNo"
                :text="question.questionNo"
                flex="0 0 auto"
              ></FTags>

              <FContainer
                flex="1"
                alignItems="center"
                :padding="question.questionNo && 'containerNone containerLarge'"
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
                  display="flex"
                  flexDirection="column"
                  :marginTop="
                    question.answerRequired
                      ? 'containerXxLarge'
                      : 'containerMedium'
                  "
                  gap="containerLarge"
                >
                  <FTags v-if="question.answerRequired" text="Answer"></FTags>
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
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import { getUnRelatedModuleSummary } from '../../../../../utils/relatedFieldUtil'
import getProperty from 'dlv'
import { getFieldOptions } from '../../../../../utils/picklist'
import dayjs from 'dayjs'
import FieldDisplayValue from '../components/FieldDisplayValue.vue'
import { ftoast } from '@facilio/design-system'
import FileFieldPreview from '../components/FileFieldPreview.vue'

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
import debounce from 'lodash/debounce'

export default {
  props: ['details', 'fitMyContent'],
  data() {
    return {
      loading: false,
      pages: [],
      isEmpty,
      getProperty,
      recordList: {
        siteName: null,
        id: null,
        spaceAsset: null,
        category: null,
        startedAt: null,
        conductedBy: null,
        completedAt: null,
        totalScore: null,
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
    await this.init()
    this.loadTemplate()
  },
  computed: {
    attenderName() {
      let { details = {} } = this
      let assignedToName = getProperty(details, 'assignedTo.name')
      if (!isEmpty(assignedToName)) {
        return assignedToName || '---'
      }
      return getProperty(details, 'people.name', '---')
    },
    startedTime() {
      let { details = {} } = this
      let { actualWorkStart = null } = details
      return isEmpty(actualWorkStart)
        ? actualWorkStart
        : dayjs(actualWorkStart).format('DD MMM, YYYY HH:mm')
    },
    completedTime() {
      let { details } = this
      let { actualWorkEnd } = details
      if (!isEmpty(actualWorkEnd))
        return dayjs(actualWorkEnd).format('DD MMM, YYYY HH:mm')
      return 'N/A'
    },
    responseScore() {
      let { details = {} } = this
      let { fullScore, totalScore, scorePercent } = details || {}
      if (!isEmpty(totalScore) && !isEmpty(scorePercent)) {
        return `${totalScore}/${fullScore}, ${scorePercent}%`
      }
      return null
    },
    moduleName() {
      return getProperty(this, '$attrs.moduleName')
    },
    templateModuleName() {
      let { moduleName } = this

      if (moduleName.includes('induction')) return 'inductionTemplate'
      return 'inspectionTemplate'
    },
    headerText() {
      let { moduleName } = this
      if (moduleName.includes('induction')) return 'Induction'
      return 'Inspection'
    },
    templateRecord() {
      let { details = {} } = this
      let { template } = details
      return template
    },
    responseName() {
      let { details = {} } = this
      let { name } = details
      return name
    },
    hasLogo() {
      return !isEmpty(getProperty(window, 'brandConfig.logo'))
    },
  },
  methods: {
    async init() {
      let data = {
        Site: await this.siteName(),
        Id: getProperty(this.details, 'id', null),
        'Space/Asset':
          getProperty(this.details, 'resource.primaryValue', null) ||
          getProperty(this.details, 'resource.name', ''),
        Category: getProperty(this.details, 'category.displayName'),
        'Started At': this.startedTime,
        'Conducted By': this.attenderName,
        'Completed At': this.completedTime,
        'Total Score': this.responseScore,
      }

      this.recordList = data
    },
    callResize: debounce(function () {
      this.fitMyContent()
    }, 100),
    getLogoUrl() {
      return getProperty(window, 'brandConfig.logo')
    },
    async siteName() {
      let { details } = this
      let { siteId } = details || {}
      if (!isEmpty(siteId)) {
        let perPage = siteId.length
        let { error, options } = await getFieldOptions({
          perPage,
          field: {
            lookupModuleName: 'site',
          },
          defaultIds: siteId,
        })
        if (isEmpty(error)) {
          let { label } = options[0]
          return label
        }
        return ''
      }
      return ''
    },
    async loadTemplate(responseModuleName = null) {
      this.loading = true
      let { details = {} } = this
      let { template = {} } = details
      let { pages } = template
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
      let { details, moduleName } = this
      let { id: responseId } = details || {}
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
    isLastItem(index, array) {
      return Array.isArray(array) && index === array.length - 1
    },
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
    canShowQuestion(question) {
      const { responseStatus } = this.details
      const { displayLogicMeta, answer } = question || {}
      if (isEmpty(displayLogicMeta)) {
        return true
      }
      const { action } = displayLogicMeta[0] || {}

      if (action === 'hide') {
        if (!isEmpty(answer) && responseStatus == 4) {
          return true
        }
        return false
      }

      return true
    },
    emptyStateText() {
      return `${this.$t('response.no_questions', { ns: 'inspection' })}`
    },
  },
}
</script>
