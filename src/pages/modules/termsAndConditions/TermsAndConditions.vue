<template>
  <FContainer
    padding="containerXxLarge"
    gap="containerXLarge"
    display="flex"
    flexDirection="column"
    height="100%"
  >
    <FContainer
      v-if="!isEmpty(longDesc)"
      display="flex"
      flexDirection="column"
      height="100%"
      gap="containerXLarge"
    >
      <FContainer
        class="richtext-content text-sm"
        color="textMain"
        appearance="bodyReg14"
        fontWeight="400"
        fontSize="14px"
        v-html="longDesc"
      >
      </FContainer>
    </FContainer>
    <FContainer v-else display="flex" height="100%" width="100%">
      <FEmptyState
        illustration="no-data"
        size="M"
        :title="emptyStateTitle"
        :description="emptyStateDesc"
        :vertical="false"
      ></FEmptyState>
    </FContainer>
  </FContainer>
</template>
<script>
// import { RichText } from '@facilio/ui/forms'
import {
  FContainer,
  FEmptyState,
  FText,
  FRichtext,
} from '@facilio/design-system'
import sanitize from '../../../utils/sanitize'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: {
    FContainer,
    FText,
    FEmptyState,
    Richtext: FRichtext,
  },
  props: ['details'],
  data() {
    return {
      isEmpty,
    }
  },
  computed: {
    shortDesc() {
      let { details } = this
      let { shortDesc = {} } = details
      if (!isEmpty(shortDesc)) {
        return shortDesc
      }
      return ''
    },
    longDesc() {
      let { details } = this
      let { longDesc } = details
      if (!isEmpty(longDesc)) {
        return sanitize(longDesc)
      }
      return null
    },
    emptyStateTitle() {
      return this.$t('tAndC.empty.title', 'No Data Available', {
        ns: 'termsAndCondition',
      })
    },
    emptyStateDesc() {
      return this.$t(
        'tAndC.empty.desc',
        'Currently no description have been added',
        {
          ns: 'termsAndCondition',
        }
      )
    },
  },
}
</script>
