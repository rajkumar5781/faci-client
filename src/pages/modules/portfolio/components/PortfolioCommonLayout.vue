<template>
  <FContainer height="100%" width="100%" overflow="hidden">
    <FContainer
      padding="containerNone containerXLarge"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <FContainer
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        padding="containerXLarge"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <div>
          <slot name="viewheader"></slot>
        </div>
        <div>
          <slot name="header"></slot>
        </div>
      </FContainer>
      <FContainer
        border="solid 1px"
        borderRadius="high"
        borderColor="borderNeutralBaseSubtle"
        marginTop="containerLarge"
        overflow="hidden"
      >
        <slot name="sub-header"></slot>
        <slot></slot>
      </FContainer>
    </FContainer>
    <portal to="viewHeaderSection">
      <ViewsList
        :moduleName="moduleName"
        :currentView="currentView"
        :canShowViewManager="canShowViewList"
        @onLoadViewDetails="loadViewDetails"
        @onClickViewManager="redirectToViewManager"
        @onChangeView="updateView"
      />
    </portal>
  </FContainer>
</template>
<script>
import { findRouteForTab, pageTypes } from '@facilio/router'
import CommonLayout from '../../../list/views/CommonLayout.vue'
import { ViewsList } from '@facilio/ui/new-app'
export default {
  extends: CommonLayout,
  components: {
    ViewsList,
  },
  methods: {
    redirectToViewManager() {
      let { moduleName } = this
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_VIEWS) || {}

      name &&
        this.$router.push({
          name,
          params: { moduleName },
        })
    },
    updateView(view, group = null) {
      if (!this.isEmpty(view)) {
        let viewname = view?.name || view

        let { currentTab, filtersToRetain = [] } = this
        let { query } = this.$route

        let filteredQuery = Object.keys(query || {}).reduce((obj, key) => {
          if (filtersToRetain.includes(key)) {
            obj[key] = query[key]
          }
          return obj
        }, {})
        let route =
          findRouteForTab(currentTab.id, {
            pageType: pageTypes.PORTFOLIO_LIST,
          }) || {}

        if (route) {
          this.$router
            .push({
              ...route,
              params: { viewname },
              query: filteredQuery,
            })
            .catch(error => console.warn('Could not switch view\n', error))
        }
      }
    },
  },
}
</script>
