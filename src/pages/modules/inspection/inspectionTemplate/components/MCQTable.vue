<template>
  <FContainer marginTop="containerXLarge" width="100%">
    <FTable
      v-if="!isEmpty(mcqSummary)"
      :columns="column"
      :data="mcqSummary"
      :rounded="false"
    >
      <template #[`cell.option`]="{ row }">
        <FText appearance="bodyReg14">{{ (row || {}).option.label }}</FText>
      </template>
      <template #[`cell.frequencyType`]="{ row }">
        <FText appearance="bodyReg14">{{ (row || {}).percent || 0 }} </FText>
      </template>
      <template #[`cell.sysCreatedTime`]="{ row }">
        <FText appearance="bodyReg14">{{ (row || {}).count || 0 }} </FText>
      </template>
    </FTable>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import { FTable, FText, FContainer } from '@facilio/design-system'
export default {
  components: { FTable, FText, FContainer },
  props: ['question'],
  data() {
    return {
      isEmpty,
      column: [
        {
          displayName: 'Choice',
          name: 'option',
          id: 1,
        },
        {
          displayName: 'Response Percent',
          name: 'percent',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Response Count',
          name: 'count',
          id: 3,
          width: 250,
        },
      ],
    }
  },
  computed: {
    mcqSummary() {
      let { question } = this
      let { summary, options } = question || {}
      let deserializedSummary = []
      if (summary) {
        deserializedSummary = summary.map(currSummary => {
          let { option } = currSummary
          let optionObject = options.find(
            currOption => currOption.id === option
          )
          return { ...currSummary, option: optionObject }
        })
      }
      return deserializedSummary
    },
  },
}
</script>
