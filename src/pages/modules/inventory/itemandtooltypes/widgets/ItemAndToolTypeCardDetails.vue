<template>
  <FContainer display="flex">
    <FContainer
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <div>
        <FText appearance="headingMed20" color="textDefault">
          {{ leftFieldValue }}
        </FText>
      </div>
      <div>
        <FText appearance="captionReg12" color="backgroundNeutralGrey01Dark">
          {{ leftFieldDisplayName }}
        </FText>
      </div>
    </FContainer>
    <FContainer
      v-if="checkMidFieldAvailable"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <div>
        <FText appearance="headingMed20" color="textDefault">
          {{ midFieldValue }}
        </FText>
      </div>
      <div>
        <FText appearance="captionReg12" color="backgroundNeutralGrey01Dark">
          {{ midFieldDisplayName }}
        </FText>
      </div>
    </FContainer>
    <FContainer
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <div>
        <FText appearance="headingMed20" color="textDefault">
          {{ rightFieldValue }}
        </FText>
      </div>
      <div>
        <FText appearance="captionReg12" color="backgroundNeutralGrey01Dark">
          {{ rightFieldDisplayName }}
        </FText>
      </div>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { formatDate } from '../../../../../utils/formatter'

export default {
  props: ['details', 'widget'],
  components: {
    FContainer,
    FText,
  },
  data() {
    return {
      cardDetails: {},
    }
  },
  created() {
    this.init()
  },
  computed: {
    checkMidFieldAvailable() {
      let midField = getProperty(this.cardDetails, 'midField.FieldName', null)
      return !isEmpty(midField)
    },
    midFieldDisplayName() {
      return getProperty(this.cardDetails, 'midField.DisplayName', null)
    },
    leftFieldDisplayName() {
      return getProperty(this.cardDetails, 'leftField.DisplayName', null)
    },
    rightFieldDisplayName() {
      return getProperty(this.cardDetails, 'rightField.DisplayName', null)
    },
    midFieldValue() {
      let { details } = this
      let midField = getProperty(this.cardDetails, 'midField', null)
      let fieldName = midField?.FieldName
      let dateField = midField?.isDateField
      let value = getProperty(details, fieldName, null)
      if (fieldName in ['sellingPrice', 'lastPurchasedPrice']) {
        value = '$ ' + value
      }
      return isEmpty(value) ? '---' : this.convertData(value, dateField)
    },
    leftFieldValue() {
      let { details } = this
      let leftField = getProperty(this.cardDetails, 'leftField', null)
      let fieldName = leftField?.FieldName
      let dateField = leftField?.isDateField
      let value = getProperty(details, fieldName, null)
      return isEmpty(value) ? '---' : this.convertData(value, dateField)
    },
    rightFieldValue() {
      let { details, cardDetails } = this
      let rightField = getProperty(cardDetails, 'rightField', null)
      let fieldName = rightField?.FieldName
      let dateField = rightField?.isDateField
      let value = getProperty(details, fieldName, null)
      if (fieldName === 'isRotating' || fieldName === 'toolType.rotating') {
        return value ? 'Yes' : 'No'
      }
      return this.convertData(value, dateField)
    },
  },
  methods: {
    getProperty,
    isEmpty,
    init() {
      let { widget } = this
      let { widgetParams } = widget || {}
      this.cardDetails = widgetParams
    },
    convertData(value, dateField) {
      if (!isEmpty(value)) {
        return dateField == 'true' ? formatDate(value, true) : value
      }
      return '---'
    },
  },
}
</script>
