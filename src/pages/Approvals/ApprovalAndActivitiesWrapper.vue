<template>
  <FContainer :padding="showHeader ? 'containerNone containerXLarge' : ''">
    <FContainer
      v-if="showHeader"
      padding="containerXLarge"
      border="solid 1px"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="high"
      borderWidth="1px"
      borderStyle="solid"
    >
      <ViewsList
        :moduleName="moduleName"
        :currentView="currentView"
        :groupViewList="groupViews"
        :currentGroupObj="currentGroupObj"
        @onChangeView="onChange"
      ></ViewsList>
    </FContainer>
    <ApprovalList
      v-if="isApprovalList"
      :moduleName="moduleName"
      :modules="modules"
      @summaryOpen="summaryOpen"
    >
    </ApprovalList>
    <ActivitiesList
      v-else
      :modules="modules"
      :moduleName="moduleName"
    ></ActivitiesList>
  </FContainer>
</template>
<script>
import { FContainer } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import ApprovalList from './ApprovalsList.vue'
import ActivitiesList from './ApprovalActivities.vue'
import { ViewsList } from '@facilio/ui/new-app'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

const activityView = {
  name: 'activities',
  displayName: 'History',
}
const pendingView = {
  name: 'pendingapproval',
  displayName: 'Pending Approval',
}

export default {
  props: ['moduleName', 'modules'],
  data() {
    return {
      showHeader: true,
    }
  },
  components: {
    ApprovalList,
    ViewsList,
    FContainer,
    ActivitiesList,
  },
  computed: {
    currentView() {
      return this.$route.params.viewname || 'activities'
    },
    currentGroupObj() {
      let { moduleName } = this
      return this.groupViews.find(view => view.moduleName === moduleName)
    },
    groupViews() {
      let currentModules = this.modules || []

      let moduleVsViewList = (currentModules || []).map(m => ({
        name: m.name,
        moduleName: m.name,
        displayName: m.displayName,
        id: m.moduleId,
        views: [
          { ...pendingView, moduleName: m.name },
          { ...activityView, moduleName: m.name },
        ],
      }))

      return moduleVsViewList
    },
    isApprovalList() {
      return this.currentView === 'pendingapproval'
    },
  },
  watch: {
    moduleName: {
      handler(newVal) {
        if (isEmpty(newVal)) {
          let moduleName = getProperty(this.modules, '0.name') || null
          moduleName &&
            this.$router.replace({
              params: { moduleName, viewname: 'pendingapproval' },
            })
        }
      },
      immediate: true,
    },
  },
  methods: {
    onChange(page) {
      let { moduleName, name: viewname } = page
      let { name } =
        findRouteForModule(moduleName, pageTypes.APPROVAL_LIST) || {}

      if (name) {
        this.$router.push({ name, params: { viewname, moduleName } })
      }
    },
    summaryOpen(value) {
      this.showHeader = value
    },
  },
}
</script>
