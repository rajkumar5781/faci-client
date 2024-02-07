<template>
  <div>
    <FContainer
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      padding="containerMedium containerXLarge"
      borderBottom="solid 1px"
      borderColor="borderNeutralBaseSubtler"
    >
      <FText appearance="headingMed14" padding="containerLarge"
        >Saved Views</FText
      >
    </FContainer>
    <FContainer
      padding="containerLarge containerXLarge"
      borderBottom="solid 1px"
      borderColor="borderNeutralBaseSubtler"
    >
      <FInput ref="view-search" placeholder="Search Views" v-model="searchText">
        <template #prefix>
          <fc-icon
            group="action"
            name="search"
            size="16"
            :pressable="false"
          ></fc-icon>
        </template>
      </FInput>
    </FContainer>
    <FContainer
      maxHeight="calc(100vh - 350px)"
      minHeight="200px"
      maxWidth="300px"
      overflow="scroll"
    >
      <FContainer
        v-if="isEmpty(filteredList)"
        height="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FText>{{ $t('view.no_views', { ns: 'view' }) }}</FText>
      </FContainer>

      <FContainer v-else>
        <FAccordionItem
          v-for="(group, index) in filteredList"
          :key="index"
          :showSuffix="true"
          :showHeaderBorder="false"
          :showPanel="isCurrentGroup(group) || !isEmpty(searchText)"
          borderRadius="medium"
        >
          <template #header>
            <FText
              appearance="headingMed14"
              paddingLeft="containerMedium"
              color="textMain"
              class="text-ellipsis"
              >{{ group.displayName }}</FText
            ></template
          >
          <template #prefix>
            <FIcon
              group="files"
              name="folder"
              size="16"
              :pressable="false"
            ></FIcon>
          </template>
          <template #suffix="{ open }">
            <FIcon
              group="navigation"
              :name="open ? 'accordion-down' : 'accordion-right'"
              size="16"
            ></FIcon>
          </template>
          <template #panel>
            <FContainer
              v-for="view in group.views"
              :key="view.id"
              :backgroundColor="
                isActiveView(view) ? 'borderAccentBlueSubtle' : ''
              "
              borderRadius="medium"
            >
              <FMenuItem
                :value="view.name"
                :iconGroup="isActiveView(view) ? 'action' : ''"
                :iconName="isActiveView(view) ? 'tick' : ''"
                justifyContent="space-between"
                @click="changeView(view, group)"
                style="padding-left: 32px"
              >
                <FText
                  :appearance="
                    isActiveView(view) ? 'headingMed14' : 'bodyReg14'
                  "
                  color="textMain"
                  paddingLeft="containerMedium"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  wordBreak="break-word"
                  class="text-line-clamp-2"
                  >{{ view.displayName }}
                </FText>
              </FMenuItem>
            </FContainer>
          </template>
        </FAccordionItem>
      </FContainer>
    </FContainer>
    <!-- <FContainer
      borderTop="solid 1px"
      borderColor="borderNeutralBaseSubtler"
      padding="containerXLarge"
      class="view-list-manager"
    >
      <FButton appearance="tertiary" @click="loadViewManager">
        <fc-icon
          group="action"
          name="option"
          size="16"
          style="margin-right: 5px"
        ></fc-icon>
        <FText> View Manager</FText>
      </FButton>
    </FContainer> -->
  </div>
</template>

<script>
import {
  FInput,
  FContainer,
  FText,
  FButton,
  FDropdownMenu,
  FDropdown,
  FMenuItem,
  FAccordion,
  FAccordionItem,
  FIcon,
  // FTooltip,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
  getApp,
} from '@facilio/router'
import { mapState } from 'pinia'
import viewStore from '../../../store/views'
// import { findRouterForModuleInApp } from '../data/routeUtil'

export default {
  name: 'ViewsList',
  components: {
    FInput,
    FContainer,
    FText,
    FButton,
    FDropdownMenu,
    FDropdown,
    FMenuItem,
    FAccordion,
    FAccordionItem,
    FIcon,
    // FTooltip,
  },
  props: [
    'groupViews',
    'moduleName',
    'canShowViewsSidePanel',
    'hideArrowIcon',
    'currentGroup',
  ],
  data() {
    return {
      searchText: '',
      isWebTabsEnabled: isWebTabsEnabled(),
      isEmpty,
    }
  },
  mounted() {
    this.$nextTick(() => {
      let inputBox = this.$refs['view-search']?.$refs['f-input-field']
      if (inputBox) inputBox.focus()
    })
  },
  computed: {
    ...mapState(viewStore, ['currentViewDetail']),
    currentViewName() {
      let { currentViewDetail } = this
      let { name } = currentViewDetail || {}
      return name
    },
    filteredList() {
      if (isEmpty(this.searchText)) {
        return this.groupViews
      } else {
        return this.groupViews.reduce((res, group) => {
          let filteredViews = group.views.filter(view =>
            view.displayName.toLowerCase().includes(this.searchText)
          )
          if (!isEmpty(filteredViews))
            res.push({
              ...group,
              views: filteredViews,
            })
          return res
        }, [])
      }
    },
  },
  methods: {
    isCurrentGroup(group) {
      let { currentGroup } = this

      return currentGroup.name === group.name
    },
    isActiveView(view) {
      let { currentViewName } = this
      let { name } = view
      return currentViewName === name
    },
    changeView(view, group) {
      this.$emit('onChange', view, group)
    },
    closeViewSidePanel() {
      this.$emit('update:canShowViewsSidePanel', false)
    },
    loadViewManager() {
      // let appId = (getApp() || {}).id
      // let { moduleName, $route } = this
      // let { query } = $route
      // let route = findRouterForModuleInApp(moduleName, pageTypes.VIEW_MANAGER)
      // console.log(route)
      // if (route)
      //   this.$router.push({
      //     ...route,
      //     params: { moduleName },
      //     query: { ...query, appId },
      //   })
    },
  },
}
</script>
<style>
.text-line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
