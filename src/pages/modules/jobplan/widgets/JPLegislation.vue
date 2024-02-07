<template>
  <FContainer v-if="!sfgLegislations">
    <FContainer display="flex" justifyContent="center">
      <FContainer width="500px">
        <FEmptyState
          title="No Legislation found."
          description="It seems that there are no legislation, regulations and guidance."
          vertical
          size="M"
          illustration="no-entries"
        />
      </FContainer>
    </FContainer>
  </FContainer>
  <FContainer v-else height="100%" overflow="scroll">
    <FContainer padding="containerXxLarge containerXxLarge">
      <FContainer v-for="(legislation, index) in sfgLegislations" :key="index">
        <FContainer
          @click="redirectToURL(legislation.URL)"
          padding="containerMedium containerMedium"
        >
          <FText color="borderPrimaryDefault" appearance="bodyReg14">
            {{ index + 1 + `. ` }}</FText
          >
          <FText
            color="borderPrimaryDefault"
            appearance="bodyReg14"
            class="fc-jp-tlegislation-hover"
          >
            {{ legislation.Title }}</FText
          ></FContainer
        >
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FTable,
  FText,
  FDivider,
  FTags,
  FRow,
  FCol,
  FButton,
  FContainer,
  FSpinner,
  FEmptyState,
} from '@facilio/design-system'

export default {
  name: 'JobPlanTasks',
  props: ['sectionData', 'jobPlanId', 'sectionLoading'],
  components: {
    FTable,
    FText,
    FDivider,
    FTags,
    FRow,
    FCol,
    FButton,
    FContainer,
    FSpinner,
    FEmptyState,
  },
  watch: {},
  created() {},
  computed: {
    jobPlan() {
      let { details = {} } = this.$attrs
      return details
    },
    sfgLegislations() {
      let jsonObj = JSON.parse(this.jobPlan?.sfgLegislations)
      return jsonObj || null
    },
  },
  methods: {
    redirectToURL(url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank')
      } else {
        // If it doesn't have a protocol, prepend 'http://' and then open it
        window.open('http://' + url, '_blank')
      }
    },
  },
}
</script>
<style scoped>
.fc-jp-tlegislation-hover:hover {
  text-decoration: underline; /* Add underline on hover */
  cursor: pointer; /* Change cursor to pointer on hover */
}
</style>
