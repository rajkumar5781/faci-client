<template>
  <FContainer
    width="280px"
    minWidth="280px"
    border="solid 1px"
    borderColor="borderNeutralBaseSubtle"
    borderRadius="high"
    :marginTop="hideTopMargin ? '' : 'containerLarge'"
    overflow="hidden"
  >
    <FContainer
      display="flex"
      padding="containerLarge containerXLarge"
      justifyContent="space-between"
      borderBottom="solid 1px"
      borderColor="borderNeutralBaseSubtle"
      alignItems="center"
      height="38px"
    >
      <FText>{{ sidebarHeading }}</FText>
      <FIcon
        v-if="showClose"
        group="action"
        name="cross"
        size="14"
        @click="onClose"
      ></FIcon>
    </FContainer>
    <FContainer
      display="flex"
      padding="containerLarge containerXLarge"
      justifyContent="space-between"
      borderBottom="solid 1px"
      borderColor="borderNeutralBaseSubtle"
      alignItems="center"
      height="48px"
    >
      <slot name="action">
        <FInput
          v-model="searchText"
          placeholder="Search view"
          size="small"
          @change="onSearchView"
        />
      </slot>
      <FPagination :currentPage.sync="page" :perPage="perPage"></FPagination>
    </FContainer>

    <FContainer
      v-if="viewMoreLoading"
      display="flex"
      justifyContent="center"
      marginTop="sectionLarge"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FText
      v-else-if="isEmpty(viewMoreList)"
      display="flex"
      justifyContent="center"
      marginTop="sectionLarge"
    >
      {{ $t('no_record') }}
    </FText>
    <FContainer v-else padding="containerXLarge" overflow="scroll" height="85%">
      <div
        v-for="viewData in viewMoreList"
        class="sidebar-event"
        :draggable="viewData.draggable"
        :group-id="currentGrpId"
        :event-id="viewData.id"
        @dragstart="e => dragStart(e, viewData)"
        @drop="drop"
        @dragover.prevent="dragOver"
        :key="`viewData ${viewData.id}`"
      >
        <FPopover trigger="clickToOpen">
          <template slot="content">
            <FPopoverDetails
              v-if="isCalendarView"
              :headerText="viewData.displayName"
              :key="`event - ${viewData.id}`"
              :recordId="viewData.id"
              :canShowRedirect="true"
              @onClickRedirect="eventClick(viewData.eventId)"
            >
              <template #content>
                <FContainer
                  display="flex"
                  padding="containerLarge"
                  justifyContent="space-between"
                >
                  <FContainer
                    v-for="fld in getField(viewData.data)"
                    :key="`${fld.value}-key`"
                    display="flex"
                    flexDirection="column"
                  >
                    <FText appearance="bodyReg14" color="textMain">
                      {{ fld.name }}
                    </FText>
                    <FText appearance="captionMed12" color="textCaption">
                      {{ fld.value }}
                    </FText>
                  </FContainer>
                </FContainer>
              </template>
            </FPopoverDetails></template
          >
          <FContainer
            border="solid 1px"
            borderRadius="medium"
            borderColor="borderNeutralBaseSubtle"
            marginBottom="containerLarge"
            padding="containerLarge"
            :style="{
              'background-color': viewData.eventColor
                ? viewData.eventColor
                : isCalendarView
                  ? '#cce2ffff'
                  : '#4d95ff',
            }"
            @click="openPopupSummary(viewData)"
          >
            <FContainer display="flex" alignItems="center" cursor="pointer">
              <FText
                appearance="bodyReg14"
                :color="isCalendarView ? 'textMain' : 'backgroundContainer'"
                textOverflow="ellipsis"
                width="200px"
                whiteSpace="nowrap"
                overflow="hidden"
                >{{ viewData.displayName }}</FText
              >
            </FContainer>
          </FContainer>
        </FPopover>
      </div>
    </FContainer>
    <popup-summary
      v-if="openEventSummary"
      :data="summaryData"
      :viewDetails="viewDetails"
      :moduleName="moduleName"
      :viewname="viewname"
      :additionalFields="additionalFields"
      @onRedirect="eventClick"
      @save="onEventUpdate"
      @cancel="openEventSummary = false"
    ></popup-summary>
  </FContainer>
</template>
<script>
import {
  FText,
  FContainer,
  FSpinner,
  FIcon,
  FInput,
  FPagination,
  FPopover,
  FPopoverDetails,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import PopupSummary from './PopupSummary.vue'

export default {
  components: {
    FContainer,
    FSpinner,
    FText,
    FIcon,
    FInput,
    FPagination,
    FPopover,
    FPopoverDetails,
    PopupSummary,
  },
  props: [
    'sidebarHeading',
    'viewMoreList',
    'viewMoreLoading',
    'page',
    'count',
    'perPage',
    'getFields',
    'showClose',
    'currentGrpId',
    'isCalendarView',
    'hideTopMargin',
    'viewDetails',
    'viewname',
    'moduleName',
    'additionalFields',
  ],
  data() {
    return {
      isEmpty,
      searchText: '',
      summaryData: {},
      isDragging: false,
      openEventSummary: false,
    }
  },
  computed: {
    canShowPagination() {
      let { viewMoreList, perPage, page } = this
      return !isEmpty(viewMoreList) && viewMoreList.length === perPage
    },
  },
  watch: {
    page() {
      this.$emit('update:page', this.page)
    },
  },
  created() {
    this.addDragEventListener()
  },
  beforeDestroy() {
    this.removeDragEventListener()
  },
  methods: {
    onEventUpdate(data) {
      this.$emit('onEventUpdate', data)
    },
    openPopupSummary(data) {
      if (!this.isCalendarView) {
        this.summaryData = data
        this.openEventSummary = true
      }
    },
    onClose() {
      this.$emit('onClose')
    },
    dragOver(event) {
      event.preventDefault()
    },
    dragStart(event, item) {
      let { data } = item || {}
      item = { ...item, ...data }
      event.dataTransfer.setData('application/json', JSON.stringify(item))
    },
    drop(event) {
      event.preventDefault()
      const serializedData = event.dataTransfer.getData('application/json')

      // Parse the data
      const droppedData = JSON.parse(serializedData || '{}')
    },
    onSearchView() {
      this.$emit('onSearchView', this.searchText)
    },
    clearSearch() {
      this.searchText = ''
    },
    eventClick(id) {
      this.$emit('onEventClick', id)
    },
    getField(data) {
      return this.getFields(data)
    },
    addDragEventListener() {
      document.addEventListener(
        'dragstart',
        () => (this.isDragging = true),
        false
      )
      document.addEventListener(
        'dragend',
        () => (this.isDragging = false),
        false
      )
      document.addEventListener('drop', () => (this.isDragging = false), false)
    },
    removeDragEventListener() {
      document.removeEventListener(
        'dragstart',
        () => (this.isDragging = true),
        false
      )
      document.removeEventListener(
        'dragend',
        () => (this.isDragging = false),
        false
      )
      document.removeEventListener(
        'drop',
        () => (this.isDragging = false),
        false
      )
    },
  },
}
</script>
<style scoped>
.cv-horiz-line {
  width: 6px;
  background-color: #cce8ff;
  border-radius: 3px;
}
</style>
