<template>
  <FContainer>
    <FPopover
      v-model="showDropDown"
      :showArrow="false"
      placement="bottom-end"
      trigger="clickToOpen"
    >
      <FIcon
        group="action"
        name="options-horizontal"
        size="16"
        :pressable="true"
        @click="loadSystemCustomButtonsList()"
      />
      <template #content>
        <FContainer
          display="flex"
          alignItems="center"
          flex-direction="column"
          minWidth="250px"
          maxHeight="240px"
          padding="containerXLarge"
          overflow="scroll"
        >
          <FSpinner
            v-if="customAndSysButtonLoading"
            justifyContent="center"
            :size="20"
          />
          <template
            v-else-if="!isEmpty(customButtons) || !isEmpty(systemButtons)"
          >
            <template v-if="!isEmpty(systemButtons)">
              <FText
                width="100%"
                appearance="captionMed10"
                color="textCaption"
                padding="containerMedium containerNone"
              >
                {{ $t('custommodules.custom_buttons.primary_actions') }}
              </FText>
              <ButtonWrapper
                v-for="button in systemButtons"
                :key="`system-button-${button.id}`"
                :appearance="button.systemButtonConfig.appearance || 'tertiary'"
                :attrs="button.systemButtonConfig"
                :name="button.name"
                :iconButton="button.systemButtonConfig.iconButton"
                :iconPosition="button.systemButtonConfig.iconPosition"
                :iconGroup="button.systemButtonConfig.iconGroup"
                :iconName="button.systemButtonConfig.iconName"
                :isDropdown="true"
                :disabled="button.systemButtonConfig.disabled"
                @click="button.systemButtonConfig.action(button.actionParam)"
              >
              </ButtonWrapper>
            </template>
            <template v-if="!isEmpty(customButtons)">
              <FText
                appearance="captionMed10"
                color="textCaption"
                width="100%"
                padding="containerMedium containerNone"
                >{{
                  $t('custommodules.custom_buttons.secondary_actions')
                }}</FText
              >
              <FMenuItem
                v-for="button in customButtons"
                :key="`custom-button-${button.id}`"
                width="100%"
                :loading="actionLoading"
                :disabled="actionLoading"
                @click="startButtonAction(button)"
              >
                <FText
                  appearance="bodyReg14"
                  display="flex"
                  alignItems="center"
                >
                  {{ button.name }}
                </FText>
              </FMenuItem>
            </template>
          </template>
          <FText
            v-else
            appearance="captionReg12"
            color="textCaption"
            justifyContent="center"
          >
            {{ $t('custommodules.custom_buttons.no_buttons_configured') }}
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
    <showConnectedAppWidget
      v-if="showConnectedAppWidget"
      :record="record"
      :widgetId="widgetId"
      @loadData="loadData"
      :title="connectedAppTitle"
      @onClose="showConnectedAppWidget = false"
    />
  </FContainer>
</template>
<script>
import { isEmpty, isFunction } from '@facilio/utils/validation'
import CustomButtonMixin from '../custom-button/CustomButtonMixin.vue'
import ButtonWrapper from '../../pages/summary/components/ButtonWrapper.vue'
import {
  FContainer,
  FButton,
  FText,
  FIcon,
  FSpinner,
  FTooltip,
  FPopover,
  FDivider,
  FMenuItem,
} from '@facilio/design-system'
import keyBy from 'lodash/keyBy'

export default {
  props: [
    'record',
    'moduleName',
    'transformFn',
    'updateUrl',
    'listModelDataClass',
    'recordSystemButtonsConfig',
  ],
  components: {
    FContainer,
    FButton,
    FText,
    FIcon,
    FSpinner,
    FTooltip,
    FPopover,
    FDivider,
    FMenuItem,
    ButtonWrapper,
  },
  mixins: [CustomButtonMixin],
  data() {
    return {
      isEmpty,
      connectedAppTitle: '',
      customAndSysButtonLoading: false,
      systemButtons: [],
    }
  },
  created() {
    this.customButtonInit()
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
    async loadSystemCustomButtonsList() {
      this.customAndSysButtonLoading = true

      let recordIds = [this.record.id]
      try {
        const [result1, result2] = await Promise.all([
          this.loadCustomButtonsList(),
          this.listModelDataClass.loadSystemButtonsForRecords({
            moduleName: this.moduleName,
            position: this.POSITION.LIST_ITEM, // LIST_ITEM
            recordIds,
          }),
        ])

        let { systemButtons } = result2
        let [nameMap] = Object.entries(systemButtons || []).reduce(
          (acc, btn) => {
            let [key, valueObj] = btn || []
            let { identifier, name } = valueObj || {}
            acc[0][identifier] = name
            acc[1][key] = identifier
            return acc
          },
          [{}, {}]
        )
        this.systemBtnDisplayNames = {
          ...this.systemBtnDisplayNames,
          ...nameMap,
        }

        let systemButtonLookup = keyBy(
          this.recordSystemButtonsConfig,
          'identifier'
        )
        this.systemButtons = Object.entries(systemButtons || []).map(
          ([key, valueObj]) => {
            let { identifier, name } = valueObj || {}
            this.systemBtnDisplayNames[identifier] = name

            let systemButtonConfig =
              systemButtonLookup[valueObj.identifier] || {}
            let actionParam = this.record
            return { ...valueObj, actionParam, systemButtonConfig }
          }
        )
      } catch (error) {
        console.log('Error:', error)
      } finally {
        this.customAndSysButtonLoading = false
      }
    },
  },
}
</script>
