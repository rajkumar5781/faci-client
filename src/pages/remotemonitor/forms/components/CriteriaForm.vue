<template>
  <FContainer
    width="100%"
    maxHeight="100%"
    display="flex"
    justifyContent="center"
  >
    <FContainer
      width="50%"
      minHeight="300px"
      maxHeight="96%"
      overflow="scroll"
      padding="sectionXSmall"
      borderRadius="high"
      boxShadow="lightLow02"
      margin="sectionXSmall"
    >
      <FContainer>
        <FText>{{ headerText }}</FText>
      </FContainer>
      <NewCriteriaBuilder
        v-model="criteria"
        :moduleName="moduleName"
        :showHeader="false"
        :showCriteriaTitle="false"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import { NewCriteriaBuilder } from '@facilio/criteria'
import { FContainer, FText } from '@facilio/design-system'
export default {
  name: 'CriteriaForm',
  props: ['moduleName', 'moduleDisplayName', 'criteriaObj'],
  components: { FContainer, FText, NewCriteriaBuilder },
  data() {
    return {
      criteria: null,
    }
  },
  computed: {
    headerText() {
      let { moduleDisplayName } = this
      return `${moduleDisplayName} ${this.$t('criteria', {
        ns: 'remote_monitor',
      })}`
    },
  },
  watch: {
    criteria: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          let { moduleName, criteria } = this
          this.$emit(`${moduleName}CriteriaUpdate`, criteria)
        }
      },
      deep: true,
    },
  },
  created() {
    this.criteria = this.criteriaObj
  },
}
</script>
