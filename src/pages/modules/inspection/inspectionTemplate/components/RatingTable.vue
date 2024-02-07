<template>
  <FContainer width="100%" marginTop="containerXLarge">
    <FTable
      v-if="!isEmpty(mcqSummary)"
      :columns="column"
      :data="mcqSummary"
      :rounded="false"
    >
      <template v-if="isStarRating" #[`cell.option`]="{ row }">
        <FContainer display="flex">
          <FIcon
            v-for="stars in getCurrentOption(row)"
            :key="stars"
            group="emoji-filled"
            name="star"
            size="20"
          ></FIcon>
        </FContainer>
      </template>
      <template v-else #[`cell.option`]="{ row }">
        <EmojiRenderer :rating="getCurrentOption(row)" :isActive="true" />
      </template>
      <template #[`cell.percent`]="{ row }">
        <FText appearance="bodyReg14">{{ (row || {}).percent || 0 }} </FText>
      </template>
      <template #[`cell.count`]="{ row }">
        <FText appearance="bodyReg14">{{ (row || {}).count || 0 }} </FText>
      </template>
    </FTable>
  </FContainer>
</template>

<script>
import { FTable, FText, FContainer, FIcon } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import MCQTable from './MCQTable.vue'
import EmojiRenderer from './EmojiRenderer.vue'
export default {
  extends: MCQTable,
  components: { FTable, FText, FContainer, FIcon, EmojiRenderer },
  props: ['question'],
  data() {
    return {
      isEmpty,
      column: [
        {
          displayName: this.isStarRating ? 'Stars' : 'Emoji',
          name: 'option',
          id: 1,
          fixed: true,
          alignment: 'center',
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
    emojiStartRating() {
      let { question = {} } = this
      let { ratingScale } = question

      let halfScal = ratingScale / 2

      return Math.round(5 - halfScal)
    },
    mcqSummary() {
      let { question = {}, emojiStartRating, isStarRating } = this
      let { summary } = question
      let deserializedSummary = []
      if (summary) {
        deserializedSummary = summary.map(currSummary => {
          let { option } = currSummary
          if (!isStarRating) option = Math.abs(option + emojiStartRating - 1)
          return { ...currSummary, option }
        })
      }
      return deserializedSummary
    },
    isStarRating() {
      let { question = {} } = this
      let { questionType } = question
      return questionType === 'STAR_RATING'
    },
  },
  methods: {
    getCurrentOption(data) {
      return data?.option
    },
  },
}
</script>
