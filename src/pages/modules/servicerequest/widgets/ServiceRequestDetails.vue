<template>
  <FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else paddingLeft="containerLarge">
      <common-field-list
        :details="details"
        :module-name="'serviceRequest'"
        :details-layout="detailsLayout"
        @mounted="fitMyContent"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import CommonFieldList from '../../../../components/page-builder/widgets/fieldSummary/CommonFieldList.vue'
import { FContainer, FSpinner } from '@facilio/design-system'
import dlv from 'dlv'

export default {
  props: ['widget', 'details','fitMyContent'],
  components: {
    CommonFieldList,
    FContainer,
    FSpinner,
  },
  data() {
    return {
      detailsLayout: [],
      loading: false,
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      this.detailsLayout = dlv(this.widget, 'widgetDetail.groups') || []
      this.loading = false
    },
   
  },
}
</script>
