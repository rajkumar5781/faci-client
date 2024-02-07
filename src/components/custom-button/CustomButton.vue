<template>
  <FContainer>
    <FContainer v-if="isListTopBar" display="flex" alignItems="center">
      <FContainer>
        <FButton
          v-for="button in customButtons"
          :key="`custom-button-${button.id}`"
          :disabled="actionLoading"
          :loading="actionLoading"
          appearance="secondary"
          @click="startButtonAction(button)"
        >
          {{ button.name }}
        </FButton>
      </FContainer>
      <FDivider
        v-if="!isEmpty(customButtons)"
        height="16px"
        margin="containerNone containerMedium containerNone containerLarge"
      />
    </FContainer>
    <FPopover
      v-else
      v-model="showDropDown"
      :showArrow="false"
      :placement="popoverPosition"
      trigger="clickToOpen"
    >
      <FButton
        v-if="isListBulkAction"
        appearance="secondary"
        size="medium"
        @click="loadCustomButtonsList"
        :loading="actionLoading"
      >
        More Actions
      </FButton>
      <!-- <FTooltip v-else placement="bottom">
        <template slot="title"> More Actions </template> -->
      <FIcon
        v-else
        group="action"
        name="options-horizontal"
        size="16"
        :pressable="true"
        @click="loadCustomButtonsList"
      />
      <!-- </FTooltip> -->
      <template #content>
        <FContainer
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          minWidth="250px"
          maxHeight="120px"
          padding="containerXLarge containerMedium"
          overflow="scroll"
        >
          <FSpinner v-if="customButtonLoading" :size="20" />
          <template v-else-if="!isEmpty(customButtons)">
            <FContainer
              v-for="button in customButtons"
              :key="`custom-button-${button.id}`"
              padding="containerXLarge"
              hover-backgroundColor="backgroundAccentBlueSubtle"
              width="100%"
              cursor="pointer"
              :disabled="actionLoading"
              @click="startButtonAction(button)"
            >
              <FText
                appearance="bodyReg14"
                display="flex"
                alignItems="center"
                columnGap="4px"
              >
                {{ button.name }}
              </FText>
            </FContainer>
          </template>
          <FText v-else appearance="captionReg12" color="textCaption">
            No Buttons configured
          </FText>
        </FContainer>
      </template>
    </FPopover>
    <template v-if="showRecordActionForm">
      <CreateUpdateRecord
        :selectedButton="selectedButton"
        :record="record"
        :moduleName="moduleName"
        :updateUrl="updateUrl"
        :transformFn="transformFn"
        :actionType="currentActionType"
        :isPortalApp="isPortalApp"
        @response="responseHandler"
        @closed="showRecordActionForm = false"
      />
    </template>
    <template v-if="showBulkActionForm">
      <BulkUpdateRecord
        :selectedButton="selectedButton"
        :selectedRecords="selectedRecords"
        :moduleName="moduleName"
        @response="responseHandler"
        @closed="showBulkActionForm = false"
      />
    </template>
    <ConnectedAppWidget
      v-if="showConnectedAppWidget"
      :record="record"
      :widgetId="widgetId"
      @loadData="loadData"
      :title="connectedAppTitle"
      @onClose="showConnectedAppWidget = false"
    />
    <PdfViewerWrapper
      v-if="showPdfViewer"
      :selectedButton="selectedButton"
      :record="record"
      :moduleName="moduleName"
      @onClose="showPdfViewer = false"
    ></PdfViewerWrapper>
  </FContainer>
</template>
<script>
import CustomButtonMixin from './CustomButtonMixin.vue'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import {
  FContainer,
  FButton,
  FText,
  FIcon,
  FSpinner,
  FTooltip,
  FPopover,
  FDivider,
} from '@facilio/design-system'

export default {
  props: ['record', 'moduleName', 'transformFn', 'updateUrl'],
  components: {
    FContainer,
    FButton,
    FText,
    FIcon,
    FSpinner,
    FTooltip,
    FPopover,
    FDivider,
  },
  mixins: [CustomButtonMixin],
  data() {
    return {
      isEmpty,
      connectedAppTitle: '',
    }
  },
  created() {
    this.customButtonInit()
  },
  computed: {
    isListTopBar() {
      return this.POSITION.LIST_TOP === this.position
    },
    isListBulkAction() {
      return this.POSITION.LIST_BULK === this.position
    },
    popoverPosition() {
      return this.isListBulkAction ? 'top' : 'bottom-end'
    },
  },
  watch: {
    moduleName(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loadCustomButtonsList()
      }
    },
  },
  methods: {
    getUrl(buttonObj) {
      if (isFunction(this.updateUrl)) {
        return this.updateUrl(buttonObj)
      } else {
        return this.updateUrl
      }
    },
  },
}
</script>
