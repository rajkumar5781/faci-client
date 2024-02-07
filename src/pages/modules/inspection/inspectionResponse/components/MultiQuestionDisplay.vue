<template>
  <FContainer>
    <FContainer
      display="flex"
      v-for="(column, index) in questionResponse"
      :key="index"
      flexDirection="column"
    >
      <FContainer paddingTop="containerLarge">
        <FText overflow="hidden" textOverflow="ellipsis">
          {{ column.name }}
        </FText>
      </FContainer>
      <FContainer>
        <FText color="textCaption" overflow="hidden" textOverflow="ellipsis">
          {{ getColumnAnswer(column) }}
        </FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FText } from '@facilio/design-system'
import { formatDate } from '../../../../../utils/formatter'

const dataType = {
  5: 'dateTime',
  6: 'date',
  8: 'enum',
  14: 'multienum',
}

export default {
  name: 'MultiQuestionDisplay',
  components: { FContainer, FText },
  props: ['question'],
  created() {
    this.constructModel()
  },
  data() {
    return { questionResponse: [], dataType }
  },
  methods: {
    constructModel() {
      let { question = {} } = this
      let { answer = {}, columns = [] } = question
      let { answer: actualAnswer = {} } = answer
      let { rowAnswer = [] } = actualAnswer
      let { columnAnswer = [] } = rowAnswer[0] || {}
      let multiQuestionResponse = []

      multiQuestionResponse = columns.map(column => {
        let { name = '', id } = column || {}
        let answerObj = columnAnswer.find(answer => answer.column === id) || {}
        let { answer = '' } = answerObj

        return { name, answer, id }
      })

      this.questionResponse = multiQuestionResponse || []
    },
    canShowAnswer(column) {
      let { id: columnId = {} } = column
      let { question = {} } = this
      let { columns } = question
      let currAnsColumn = columns.find(col => {
        return col.id === columnId
      })
      let { displayLogicMeta } = currAnsColumn || {}

      if (!isEmpty(displayLogicMeta)) {
        let { action } = displayLogicMeta[0] || {}
        return !(action === 'hide')
      }
      return true
    },
    getColumnAnswer(column) {
      let { answer = {} } = column
      if (this.isChooserType(column) === 'enum')
        return this.getEnumAnswer(column)
      else if (this.isChooserType(column) === 'date')
        return this.getDateTime(column, true)
      else if (this.isChooserType(column) === 'dateTime')
        return this.getDateTime(column, false)
      else if (this.isChooserType(column) === 'multienum')
        return this.getMultiEnumAnswer(column)
      return answer
    },
    isChooserType(colAnswer) {
      let { id: columnId = {} } = colAnswer
      let { question = {} } = this
      let { columnVsFieldMap } = question
      let currObj = columnVsFieldMap[columnId]
      let { dataType } = currObj || {}
      return this.dataType[dataType]
    },
    getDateTime(colAnswer, onlyDate) {
      if (onlyDate) {
        return formatDate(colAnswer)
      } else {
        return formatDate(colAnswer, true)
      }
    },
    getEnumAnswer(colAnswer) {
      let { id: columnId = {}, answer: answerIndex = {} } = colAnswer
      let { question = {} } = this
      let { columnVsFieldMap = {} } = question
      let currObj = columnVsFieldMap[columnId]
      let { values } = currObj || {}
      let actualValue = values.find(val => {
        return val.index === answerIndex
      })
      let { value } = actualValue || {}
      return value
    },
    getMultiEnumAnswer(colAnswer) {
      let { id: columnId, answer: answerIndex = [] } = colAnswer || {}
      if (!isEmpty(answerIndex)) {
        let { question } = this
        let { columnVsFieldMap } = question || {}
        let currObj = columnVsFieldMap[columnId] || {}
        let { values } = currObj || {}
        let result = answerIndex
          .map(index => (values.find(obj => obj.index === index) || {}).value)
          .join(', ')
        return result
      }
      return ''
    },
    canDisableColumnValue(column = {}) {
      let { answer } = column
      return answer.length <= 100 ? true : false
    },
    canDisableColumn(column = {}) {
      let { name = null } = column
      return name.length <= 30 ? true : false
    },
  },
}
</script>
