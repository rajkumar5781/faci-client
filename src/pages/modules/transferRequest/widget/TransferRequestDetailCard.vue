<template>
  <FContainer display="flex">
    <FContainer
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <FContainer>
        <FText appearance="headingMed20">
          {{ leftValue }}
        </FText>
      </FContainer>
      <FContainer>
        <FText appearance="captionReg12">
          {{ leftDisplayName }}
        </FText>
      </FContainer>
    </FContainer>
    <FContainer
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <FContainer>
        <FText appearance="headingMed20">
          {{ rightValue }}
        </FText>
      </FContainer>
      <FContainer>
        <FText appearance="captionReg12">
          {{ rightDisplayName }}
        </FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatCustomDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
export default {
  props: ['details', 'resizeWidget'],
  components: {
    FContainer,
    FText,
  },
  computed: {
    leftDisplayName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.leftTypeDisplayName',
        ''
      )
    },
    rightDisplayName() {
      return getProperty(
        this,
        '$attrs.widget.widgetParams.rightTypeDisplayName',
        ''
      )
    },
    leftValue() {
      let { details } = this
      let fieldName = getProperty(
        this,
        '$attrs.widget.widgetParams.leftTypeFieldName',
        null
      )
      let value = getProperty(details, fieldName, null)
      return isEmpty(value) ? '---' : this.convertData(value)
    },
    rightValue() {
      let { details } = this
      let fieldName = getProperty(
        this,
        '$attrs.widget.widgetParams.rightTypeFieldName',
        null
      )
      let value = getProperty(details, fieldName, null)
      return isEmpty(value) ? '---' : this.convertData(value)
    },
  },
  methods: {
    getProperty,
    convertData(value) {
      let isDateField = getProperty(
        this,
        '$attrs.widget.widgetParams.isDateField',
        null
      )
      return isDateField ? formatCustomDate(value, 'DD-MMM-YYYY') : value
    },
  },
}
</script>
