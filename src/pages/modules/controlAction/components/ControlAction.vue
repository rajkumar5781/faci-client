<template>
  <FContainer
    width="100%"
    borderRadius="high"
    maxHeight="99%"
    padding="containerXLarge containerXxLarge"
    border="1px solid"
    borderColor="borderNeutralGrey02Subtle"
    boxShadow="lightLow02"
  >
    <FContainer paddingBottom="sectionXSmall" maxHeight="94%">
      <FContainer backgroundColor="backgroundCanvas" width="100%">
        <FText appearance="headingMed14">{{
          $t('controls.ca', { ns: 'energy' })
        }}</FText>
      </FContainer>
      <FContainer v-if="showReadings" maxHeight="425px" overlow="scroll">
        <ControlActionReading
          v-for="(readingObject, index) in readingObjList"
          :key="index"
          :readingObj="readingObject"
          @deleteReading="deleteReading"
          :index="index"
          :showDeleteButton="readingObjList.length > 1"
          :readingOptionList="readingOptionList"
          :readingList="readingList"
          :isEnableRevert="isEnableRevert"
          @onReadingDataChange="onReadingDataChange"
        />
      </FContainer>
    </FContainer>
    <FContainer width="100%">
      <FDivider width="100%" />
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerXLarge containerLarge containerNone"
        cursor="pointer"
        width="15%"
      >
        <FButton
          appearance="primaryInverse"
          :disabled="isEmpty(readingOptionList) || maxReadingObtained "
          size="small"
          @click="addNewReading"
        >
          <FIcon
            group="navigation"
            name="addition"
            size="18"
            color="backgroundPrimaryPressed"
            :pressable="false"
          />
          <FText
            color="backgroundPrimaryPressed"
            appearance="headingMed14"
            paddingLeft="containerLarge"
            >{{ $t('controls.add_ca', { ns: 'energy' }) }}</FText
          ></FButton
        >
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import ControlActionReading from './ControlActionReading.vue'
import {
  FContainer,
  FText,
  FButton,
  FDivider,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: {
    FContainer,
    FText,
    ControlActionReading,
    FButton,
    FDivider,
    FIcon,
  },
  props: [
    'prefillRecordDetails',
    'readingOptionList',
    'readingList',
    'isEnableRevert',
  ],
  data() {
    return {
      readingObjList: [],
      showReadings: true,
    }
  },
  computed: {
    maxReadingObtained() {
      let { readingObjList } = this
      return readingObjList.length >= 5
    },
  },
  created() {
    this.readingObjList = cloneDeep(this.prefillRecordDetails)
    this.isEmpty = isEmpty
  },
  watch: {
    readingObjList: {
      async handler(newVal) {
        this.$emit('onControlActionChange', newVal)
      },
      deep: true,
    },
  },
  methods: {
    addNewReading() {
      let readingObj = {
        actionVariableType: 1,
        readingFieldId: null,
        readingFieldDataType: null,
        scheduledActionOperatorType: null,
        scheduleActionValue: null,
        revertActionOperatorType: null,
        revertActionValue: null,
      }
      this.readingObjList.push(readingObj)
    },
    deleteReading(index) {
      let { readingObjList } = this
      this.showReadings = false
      let filteredReadingObjList = (readingObjList || []).filter(
        (_, readingIndex) => readingIndex !== index
      )
      this.readingObjList = filteredReadingObjList
      this.$nextTick(() => {
        this.showReadings = true
      })
    },
    onReadingDataChange(data) {
      let { index, newField } = data || {}
      let { readingObjList } = this
      let clonedReadingObjList = cloneDeep(readingObjList)
      clonedReadingObjList[index] = newField
      this.readingObjList = clonedReadingObjList
    },
  },
}
</script>
