<template>
  <FContainer
    v-if="!isButtonsEmpty"
    display="flex"
    backgroundColor="backgroundMidgroundSubtle"
  >
    <FContainer
      display="flex"
      alignItem="center"
      gap="containerXLarge containerLarge"
      v-if="canShowShimmerLoading"
    >
      <FShimmer
        v-for="index in [1, 2, 3]"
        :key="`action-bar-${index}`"
        :height="24"
        :width="100"
      />
    </FContainer>
    <FContainer
      display="flex"
      alignItem="center"
      gap="containerXLarge containerLarge"
      flexGrow="0"
      flexWrap="wrap"
      :ref="`module-action-bar-${moduleName}`"
    >
      <FButtonGroup>
        <template #buttons>
          <FButton
            v-if="isDropDownAction && !isEmpty(otherButtons)"
            style="max-width: 128px"
            :loading="true"
            :appearance="thirdButton.appearance || 'secondary'"
          >
            {{ $t('summary.loading', 'Loading') }}
          </FButton>
          <template v-else-if="!isEmpty(thirdButton)">
            <ButtonWrapper
              v-if="isEmpty(otherButtons)"
              :appearance="thirdButton.appearance || 'secondary'"
              :loading="thirdButton.loading"
              :iconGroup="thirdButton.iconGroup"
              :iconName="thirdButton.iconName"
              :iconButton="thirdButton.iconButton"
              :iconPosition="thirdButton.iconPosition"
              :name="thirdButton.name"
              @click="startDropDownBtnAction(thirdButton)"
            >
            </ButtonWrapper>

            <FPopover
              v-else
              v-model="tertiaryBtnVisible"
              trigger="clickToOpen"
              placement="bottom-end"
            >
              <ButtonWrapper
                :appearance="thirdButton.appearance || 'secondary'"
                :split="!isEmpty(otherButtons)"
                :loading="thirdButton.loading"
                :iconGroup="thirdButton.iconGroup"
                :iconName="thirdButton.iconName"
                :iconButton="thirdButton.iconButton"
                :iconPosition="thirdButton.iconPosition"
                :name="thirdButton.name"
                width="min-content"
                @dropdown="handleDropdown"
                @click="startDropDownBtnAction(thirdButton)"
              />
              <FContainer
                slot="content"
                padding="containerLarge containerXLarge"
                overflow="scroll"
                maxHeight="200px"
                minWidth="180px"
              >
                <FMenuItem
                  v-for="btn in otherButtons"
                  :key="btn.id"
                  width="100%"
                  :loading="btn.loading"
                  disabled
                  @click="startDropDownBtnAction(btn)"
                >
                  <FText appearance="headingMed14" color="textMain">
                    {{ btn.name }}
                  </FText>
                </FMenuItem>
              </FContainer>
            </FPopover>
          </template>
          <ButtonWrapper
            v-if="!isEmpty(secondButton)"
            :appearance="secondButton.appearance || 'secondary'"
            :iconGroup="secondButton.iconGroup"
            :iconName="secondButton.iconName"
            :iconButton="secondButton.iconButton"
            :iconPosition="secondButton.iconPosition"
            :loading="secondButton.loading"
            :disabled="secondButton.disabled"
            :name="secondButton.name"
            @click="startBtnAction(secondButton)"
          />
          <ButtonWrapper
            v-if="!isEmpty(firstButton)"
            :appearance="firstButton.appearance || 'primary'"
            :iconGroup="firstButton.iconGroup"
            :iconName="firstButton.iconName"
            :iconButton="firstButton.iconButton"
            :iconPosition="firstButton.iconPosition"
            :loading="firstButton.loading"
            :disabled="firstButton.disabled"
            :name="firstButton.name"
            @click="startBtnAction(firstButton)"
          />
        </template>
      </FButtonGroup>
      <template v-if="!isEmpty(customButtons)">
        <PdfViewerWrapper
          v-if="showPdfViewer"
          :selectedButton="selectedButton"
          :moduleName="moduleName"
          :record="record"
          @onClose="closeActionForm"
        ></PdfViewerWrapper>
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
            @closed="closeActionForm"
          />
        </template>
        <template v-if="showBulkActionForm">
          <BulkUpdateRecord
            :selectedButton="selectedButton"
            :selectedRecords="selectedRecords"
            :moduleName="moduleName"
            @response="responseHandler"
            @closed="closeActionForm"
          />
        </template>
        <ConnectedAppWidget
          v-if="showConnectedAppWidget"
          :record="record"
          :widgetId="widgetId"
          :title="connectedAppTitle"
          @loadData="loadData"
          @onClose="showConnectedAppWidget = false"
        />
      </template>
      <template v-if="!isEmpty(stateTransitions)">
        <DialogForm
          v-if="canShowForm"
          v-bind="transitionFormProps"
          @afterSave="reStartTransitionProcess"
        ></DialogForm>

        <ConfirmationDialog
          v-if="showConfirmationDialog"
          :transition="selectedTransition"
          :confirmations="confirmationDialogs"
          :onConfirm="continueTransition"
          :onCancel="cancelTransition"
        ></ConfirmationDialog>
        <TransitionComment
          v-if="showCommentDialog"
          :record="record"
          :transition="selectedTransition"
          :moduleName="moduleName"
          @onSave="onSaveComment"
          @onClose="cancelTransition"
        ></TransitionComment>
      </template>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty, isFunction, isNull } from '@facilio/utils/validation'
import CustomButtonMixin from '../../../components/custom-button/CustomButtonMixin.vue'
import TransitionButtonMixin from '../../../components/state-transition/TransitionButtonMixin.vue'
import DialogForm from '../../../pages/form/DialogForm.vue'
import {
  FButton,
  FContainer,
  FShimmer,
  FIcon,
  FButtonGroup,
  FPopover,
  FMenuItem,
  FText,
} from '@facilio/design-system'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import getProperty from 'dlv'
import ButtonWrapper from './ButtonWrapper.vue'

export default {
  props: [
    'record',
    'moduleName',
    'transformFn',
    'updateUrl',
    'systemButtons',
    'systemButtonLoading',
    'disabled',
  ],
  components: {
    FContainer,
    FButton,
    FShimmer,
    FIcon,
    FButtonGroup,
    FPopover,
    DialogForm,
    FText,
    FMenuItem,
    ButtonWrapper,
  },
  mixins: [CustomButtonMixin, TransitionButtonMixin],
  data: () => ({
    isEmpty,
    isNull,
    buttonList: [],
    tertiaryBtnVisible: false,
    isDropDownAction: false,
  }),
  async created() {
    await this.init()
  },
  computed: {
    buttonLoading() {
      return (
        this.customButtonLoading ||
        this.transitionLoading ||
        this.systemButtonLoading
      )
    },
    canShowShimmerLoading() {
      return (
        this.buttonLoading &&
        (isEmpty(this.customButtons) || isEmpty(this.stateTransitions))
      )
    },
    isButtonsEmpty() {
      return !this.canShowShimmerLoading && isEmpty(this.buttonList)
    },
    firstButton() {
      return getProperty(this.buttonList, '0') || null
    },
    secondButton() {
      return getProperty(this.buttonList, '1') || null
    },
    thirdButton() {
      return getProperty(this.buttonList, '2') || null
    },
    otherButtons() {
      return this.buttonList.slice(3) || null
    },
  },
  watch: {
    moduleName(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.init()
      }
    },
    record(newVal, oldVal) {
      if (isEqual(newVal, oldVal) && !isEmpty(newVal)) {
        this.init(true)
      }
    },
    systemButtons: {
      handler: 'constructButtonList',
      deep: true,
    },
    stateTransitions: {
      handler: 'constructButtonList',
      deep: true,
    },
    customButtons: {
      handler: 'constructButtonList',
      deep: true,
    },
    disabled: {
      handler: 'constructButtonList',
    },
  },
  methods: {
    async init(force = false) {
      await Promise.all([
        this.customButtonInit(force),
        this.transitionButtonInit({ force }),
      ])

      this.constructButtonList()
    },
    constructButtonList() {
      const buttonTypeHash = {
        PRIMARY: 1,
        SECONDARY: 2,
        TERTIARY_1: 0,
        TERTIARY_2: -1,
        TERTIARY: 3,
      }

      let { systemButtons, stateTransitions, customButtons, disabled } = this
      let totalBtnList = [...(systemButtons || []), ...(stateTransitions || [])]

      let sortedBtnList = sortBy(
        totalBtnList.map(btn => {
          let { buttonType = 1, disable } = btn || {}
          let { TERTIARY_1, TERTIARY_2, TERTIARY } = buttonTypeHash

          return {
            ...btn,
            canDisable: disable || disabled,
            customPriority: [TERTIARY_1, TERTIARY_2].includes(buttonType)
              ? TERTIARY
              : buttonType,
          }
        }),
        ['customPriority']
      )

      this.buttonList = [
        ...(sortedBtnList || []),
        ...(customButtons || []).map(btn => ({
          ...btn,
          canDisable: btn.disable || disabled,
        })),
      ]
    },
    getUrl(buttonObj) {
      if (isFunction(this.updateUrl)) {
        return this.updateUrl(buttonObj)
      } else {
        return this.updateUrl
      }
    },
    closeActionForm() {
      this.showRecordActionForm = false
      this.showBulkActionForm = false
      this.showPdfViewer = false
      this.selectedButton.onActionComplete()
      this.selectedButton = null
    },
    handleDropdown() {
      if (!isEmpty(this.otherButtons)) this.tertiaryBtnVisible = true
    },
    startDropDownBtnAction(btn) {
      this.isDropDownAction = true
      this.startBtnAction(btn)
    },
    startBtnAction(btn) {
      btn.loading = true
      this.btnActionLoading = true

      btn.onActionComplete = () => {
        btn.loading = false
        this.btnActionLoading = false
        this.isDropDownAction = false
      }
      btn.clickAction(btn)
    },
  },
}
</script>
