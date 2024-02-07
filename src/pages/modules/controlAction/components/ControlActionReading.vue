<template>
  <FContainer display="flex" alignItems="center" marginTop="containerXxLarge">
    <FContainer
      :paddingTop="index === 0 ? 'containerXxLarge' : ''"
      paddingRight="containerLarge"
    >
      <FContainer
        backgroundColor="backgroundNeutralGrey01Dark"
        border="1px solid"
        width="24px"
        height="24px"
        borderRadius="full"
        textAlign="center"
        fontSize="14px"
        fontWeight="bold"
        color="backgroundCanvas"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {{ count }}
      </FContainer></FContainer
    >
    <FContainer width="30%" paddingRight="sectionXSmall">
      <FText
        v-if="index === 0"
        marginBottom="containerLarge"
        appearance="bodyReg14"
        display="flex"
      >
        {{ $t('controls.reading', { ns: 'energy' }) }}</FText
      >
      <FSelect
        v-model="readingDataObj.readingFieldId"
        :options="readingOptionList"
        :placeholder="$t('controls.select_reading', { ns: 'energy' })"
        :disabled="isEmpty(readingOptionList)"
        @change="setDefaultValue"
        size="small"
      />
    </FContainer>
    <FContainer width="30%" paddingRight="sectionXSmall">
      <FText
        v-if="index === 0"
        marginBottom="containerLarge"
        appearance="bodyReg14"
        display="flex"
      >
        {{ $t('controls.operator', { ns: 'energy' }) }}</FText
      >
      <FSelect
        v-model="readingDataObj.scheduledActionOperatorType"
        :options="operatorType"
        :placeholder="$t('controls.select_schedule_operator', { ns: 'energy' })"
        :disabled="!showOptionDropDown"
        size="small"
      />
    </FContainer>
    <FContainer width="30%" paddingRight="sectionXSmall">
      <FText
        v-if="index === 0"
        marginBottom="containerLarge"
        appearance="bodyReg14"
        display="flex"
      >
        {{ $t('controls.value', { ns: 'energy' }) }}</FText
      >
      <FInput
        v-if="showOptionDropDown"
        v-model="readingDataObj.scheduleActionValue"
        appearance="default"
        type="number"
        size="small"
        placeholder="--"
        :disabled="isEmpty(readingDataObj.readingFieldId)"
        ><template #suffix>{{ getPrefix }}</template></FInput
      >
      <FSelect
        v-else
        :options="booleanOptions"
        v-model="readingDataObj.scheduleActionValue"
        :multiple="false"
        :disabled="isEmpty(readingDataObj.readingFieldId)"
        :placeholder="$t('controls.select_schedule_value', { ns: 'energy' })"
        size="small"
      />
    </FContainer>
    <FContainer v-if="enableRevertAction" width="60%" display="flex">
      <FContainer width="50%" paddingRight="sectionXSmall">
        <FText
          v-if="index === 0"
          marginBottom="containerLarge"
          appearance="bodyReg14"
          display="flex"
          >{{ $t('controls.rev_operator', { ns: 'energy' }) }}</FText
        >
        <FSelect
          v-model="readingDataObj.revertActionOperatorType"
          :options="operatorType"
          :placeholder="$t('controls.select_rev_operator', { ns: 'energy' })"
          :disabled="!showOptionDropDown"
          size="small"
        />
      </FContainer>
      <FContainer width="50%" paddingRight="sectionXSmall">
        <FText
          v-if="index === 0"
          marginBottom="containerLarge"
          appearance="bodyReg14"
          display="flex"
          >{{ $t('controls.rev_value', { ns: 'energy' }) }}</FText
        >
        <FInput
          v-if="showOptionDropDown"
          v-model="readingDataObj.revertActionValue"
          appearance="default"
          type="number"
          size="small"
          placeholder="--"
          :disabled="isEmpty(readingDataObj.readingFieldId)"
          ><template #suffix>{{ readingDataObj.unit }}</template></FInput
        >
        <FSelect
          v-else
          :options="booleanOptions"
          v-model="readingDataObj.revertActionValue"
          :multiple="false"
          :disabled="isEmpty(readingDataObj.readingFieldId)"
          :placeholder="$t('controls.select_rev_value', { ns: 'energy' })"
          size="small"
        />
      </FContainer>
    </FContainer>
    <FContainer :paddingTop="index === 0 ? 'containerXxLarge' : ''">
      <FIcon
        v-if="showDeleteButton"
        group="action"
        name="delete"
        size="16"
        :pressable="true"
        @click="deleteReading(index)"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FSelect,
  FText,
  FInput,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
const operatorType = [
  { label: 'Fixed', value: 1 },
  { label: 'Increased By', value: 2 },
  { label: 'Decreased By', value: 3 },
]
const readingType = [
  { label: 'Asset Reading', value: 1 },
  { label: 'Related Reading', value: 2 },
]
export default {
  props: [
    'readingObj',
    'index',
    'showDeleteButton',
    'readingOptionList',
    'readingList',
    'isEnableRevert',
  ],
  components: { FContainer, FSelect, FText, FInput, FIcon },
  data() {
    return {
      readingType,
      operatorType,
      isBooleanField: false,
      prefix: '',
      readingDataObj: {},
      enableRevertAction: false,
      booleanOptions: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
    }
  },
  created() {
    let { readingObj, isEnableRevert } = this
    this.enableRevertAction = isEnableRevert
    this.readingDataObj = cloneDeep(readingObj)
    this.setPrefix(readingObj)
    this.isEmpty = isEmpty
  },
  computed: {
    count() {
      let { index } = this
      return (index + 1).toString()
    },
    getPrefix() {
      let { prefix } = this
      return prefix
    },
    showOptionDropDown() {
      let { readingDataObj, isBooleanField } = this
      return !isEmpty(readingDataObj.readingFieldId) && !isBooleanField
    },
  },
  watch: {
    readingDataObj: {
      async handler(newVal) {
        let data = {
          index: this.index,
          newField: newVal,
        }
        this.$emit('onReadingDataChange', data)
      },
      deep: true,
    },
    isEnableRevert: {
      async handler(newVal) {
        this.enableRevertAction = newVal
      },
      deep: true,
    },
  },
  methods: {
    deleteReading(index) {
      this.$emit('deleteReading', index)
    },
    setPrefix(readingObj) {
      let { readingList } = this
      let { readingFieldId } = readingObj || {}
      let selectedReading = readingList.find(
        reading => reading.id === readingFieldId
      )
      let { unit, dataType, typeAsString } = selectedReading || {}
      if (typeAsString == 'Boolean') {
        this.readingDataObj.revertActionOperatorType = 1
        this.readingDataObj.scheduledActionOperatorType = 1
        this.readingDataObj.operatorType = 'Boolean'
        this.isBooleanField = true
      } else {
        let { readingDataObj } = this
        let { revertActionOperatorType, scheduledActionOperatorType } =
          readingDataObj || {}
        this.readingDataObj.revertActionOperatorType = revertActionOperatorType
        this.readingDataObj.scheduledActionOperatorType =
          scheduledActionOperatorType
        this.isBooleanField = false
      }
      this.readingDataObj.unit = isEmpty(unit) ? '' : unit
      this.prefix = isEmpty(unit) ? '' : unit
      return dataType
    },
    setDefaultValue(val) {
      let { readingDataObj } = this
      this.readingDataObj.readingFieldId = val
      let dataType = this.setPrefix(readingDataObj)
      if (!isEmpty(dataType))
        this.readingDataObj.readingFieldDataType = dataType
    },
  },
}
</script>
