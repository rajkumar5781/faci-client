<template>
  <FContainer ref="jobPlanTaskSections" height="100%" overflow="scroll">
    <FContainer v-if="isLoading" display="flex" justifyContent="center">
      <FSpinner :size="30" />
    </FContainer>
    <template v-else-if="isEmpty(currentSections)">
      <FContainer display="flex" justifyContent="center">
        <FContainer width="500px">
          <FEmptyState
            title="No Task Sections found."
            description="It seems that there are no Task Sections for this Job Plan"
            vertical
            size="M"
            illustration="no-entries"
          />
        </FContainer>
      </FContainer>
    </template>
    <template v-else>
      <JobPlanTasks
        v-for="(section, index) in currentSections"
        :key="`section-${sectionPage}-${index}`"
        :sectionData="section"
        :jobPlanId="jobPlanId"
        :sectionLoading="isLoading"
      />
    </template>
  </FContainer>
</template>

<script>
import { FContainer, FSpinner, FEmptyState } from '@facilio/design-system'
import JobPlanTasks from './JobPlanTasks.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'
export default {
  name: 'JobPlanSection',
  props: ['resizeWidget', 'widget', 'calculateDimensions'],
  components: { FContainer, JobPlanTasks, FSpinner, FEmptyState },
  data() {
    return {
      isEmpty,
      sectionsPerWidget: 25,
      sectionPage: 1,
      sectionCount: null,
      currentSections: [],
      isLoading: false,
    }
  },
  created() {
    this.getSections()
  },
  computed: {
    jobPlan() {
      let { details = {} } = this.$attrs
      return details
    },
    jobPlanId() {
      let { jobPlan } = this
      let { id } = jobPlan || {}
      return id
    },
    isPrerequisite() {
      let { widget } = this
      let { widgetParams } = widget || {}
      let { isPrerequisite = true } = widgetParams || {}

      return isPrerequisite
    },
  },
  watch: {
    sectionPage: {
      async handler(newVal) {
        if (!isEmpty(newVal)) {
          this.getSections()
        }
      },
      immediate: true,
    },
  },
  methods: {
    autoResize() {
      this.$nextTick(() => {
        let params = {}
        let { widget } = this
        let defaultWidgetHeight = widget?.height || 24
        let container = this.$refs['jobPlanTaskSections']

        if (!container) return

        let height = container.scrollHeight || container.$el.scrollHeight
        let width = container.scrollWidth || container.$el.scrollWidth

        let dimensions = this.calculateDimensions({ height, width })

        if (isEmpty(dimensions)) return
        let { h } = dimensions || {}
        if (h <= defaultWidgetHeight) {
          params = { h }
          this.needsShowMore = false
        } else {
          params = { height, width }
          let { defaultWidgetHeight = 24 } = this
          this.needsShowMore = h > defaultWidgetHeight ? true : false
          this.defaultWidgetHeight = defaultWidgetHeight
        }
        console.log(params)
        this.resizeWidget(params)
      })
    },
    setPage(page) {
      this.sectionPage = page
    },
    async getSections() {
      this.isLoading = true
      let { sectionsPerWidget, sectionPage, jobPlanId } = this
      let params = {
        page: sectionPage,
        perPage: sectionsPerWidget,
        withCount: true,
      }
      let relatedFieldName = getRelatedFieldName('jobplan', 'jobplansection')
      let relatedConfig = {
        moduleName: 'jobplan',
        id: jobPlanId,
        relatedModuleName: 'jobplansection',
        relatedFieldName,
      }
      let { error, list, meta } = await API.fetchAllRelatedList(
        relatedConfig,
        params
      )

      if (error) {
        let { message } = error || {}
        this.$message.error(message || 'Error Occured')
      } else {
        let { pagination } = meta || {}
        let { totalCount = null } = pagination || {}

        this.$set(this, 'currentSections', list)
        this.$set(this, 'sectionCount', totalCount)
      }
      setTimeout(() => {
        this.autoResize()
      }, 1000)
      // this.autoResize()
      this.isLoading = false
    },
  },
}
</script>
<style scoped lang="scss">
.jp-section-layout {
  max-height: 500px;
  overflow: scroll;
  .widget-header {
    display: none;
  }
  .width95 {
    width: 95% !important;
  }
  .section-banner {
    height: 50px;
    font-size: 18px;
    font-weight: bold;
    padding: 20px;
    border-bottom: 1px solid #ccc;
    background-color: #fff;
  }
}
.jp-empty-white {
  width: 100%;
  height: 100px;
  display: flex;
  background: #ffffff;
  flex-direction: column;
  padding: 20px;
}
</style>
