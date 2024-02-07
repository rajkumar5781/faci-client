<template>
  <FContainer
    display="flex"
    backgroundColor="backgroundMidgroundSubtle"
    borderRadius="high"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    flexDirection="column"
    transition="transform 0.10s ease"
    marginBottom="containerXLarge"
  >
    <FContainer
      display="flex"
      flexDirection="row"
      padding="containerXLarge"
      justifyContent="space-between"
      alignItems="center"
    >
      <FText appearance="headingMed16" color="textMain">{{
        selectedRecordLabel
      }}</FText>
      <FContainer display="flex" flexDirection="row" alignItems="center">
        <FDropdown
          v-if="shouldShowDropdown"
          :loading="transitionsLoading"
          :name="dropDownName"
          :options="availableTransitions"
          contentWidth="150px"
          :split="true"
          @dropdown="handleTransitionDropdown"
          @click="handleTransitionClick"
        />
        <FButton
          v-else-if="!isEmpty(dropDownName)"
          appearance="primary"
          size="medium"
          :loading="transitionsLoading"
          @click="handleTransitionClick"
          >{{ dropDownName }}</FButton
        >
        <FDivider height="100%" margin="containerNone containerXLarge" />
        <FSegmentedControl
          :value="activeAttendanceView"
          :tabsList="attendanceViews"
          @change="changeView"
        >
          <template #tab.calender>
            <FIcon group="time-date" name="date" size="16" padding="0" />
          </template>
          <template #tab.list>
            <FIcon group="text-edit" name="bulletin" size="16" padding="0" />
          </template>
        </FSegmentedControl>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FIcon,
  FSegmentedControl,
  FDivider,
  FButton,
  FDropdown,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { getDisplayNameForTransition } from './AttendanceMixin'

export default {
  name: 'AttendanceTopBar',
  props: ['selectedRecordLabel', 'transitionsLoading', 'transitionButtons','activeAttendanceView'],
  data() {
    return {
        attendanceViews: [
        { label: 'Calender', value: 'calender' },
        { label: 'List', value: 'list' },
      ],
    }
  },
  components: {
    FContainer,
    FText,
    FIcon,
    FSegmentedControl,
    FDivider,
    FButton,
    FDropdown,
  },
  computed: {
    shouldShowDropdown() {
      let { transitionButtons = [] } = this
      return transitionButtons.length > 1
    },
    dropDownName() {
      let { transitionButtons = [] } = this
      if (transitionButtons.length > 0) {
        return getDisplayNameForTransition(transitionButtons[0])
      }
      return
    },
    availableTransitions() {
      let { transitionButtons = [] } = this
      if (transitionButtons.length > 1) {
        return transitionButtons.slice(1).map(button => {
          return {
            value: button,
            label: getDisplayNameForTransition(button),
          }
        })
      }
      return []
    },
  },
  methods: {
    isEmpty,
    changeView(tab) {
      this.$emit('update:activeAttendanceView', tab)
    },
    handleTransitionClick() {
      this.$emit('handleTransitionClick')
    },
    handleTransitionDropdown(option = {}){
      this.$emit('handleTransitionDropdown',option)
    },
  },
}
</script>
