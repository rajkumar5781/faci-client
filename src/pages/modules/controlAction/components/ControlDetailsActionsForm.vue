<template>
  <FContainer display="flex" marginTop="containerXxLarge" height="95%">
    <FContainer
      width="25%"
      backgroundColor="backgroundMidgroundSubtle"
      borderRadius="low"
    >
      <BasicDetailForm
        :prefillRecordDetails.sync="getBasicDetails"
        @onFormDetailsChange="onFormDetailsChange"
        :isControlActionTemplateModule="isControlActionTemplateModule"
      />
    </FContainer>
    <FContainer
      width="70%"
      marginLeft="containerXLarge"
      overflow="scroll"
      maxHeight="70vh"
    >
      <FContainer
        v-if="canShowEmptyState"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <FEmptyState
          :description="emptyStateMessage"
          :title="emptyStateTitle"
          :vertical="true"
        />
      </FContainer>
      <FContainer v-else height="100%">
        <FContainer
          v-if="isCategoryChange"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FSpinner :size="30" />
        </FContainer>
        <ControlAction
          v-else
          :prefillRecordDetails.sync="getReadingList"
          @onControlActionChange="onControlActionChange"
          :readingList="readingList"
          :readingOptionList="readingOptionList"
          :isEnableRevert="enableRevertOption"
          :assetCategory="getProperty(getBasicDetails, 'assetCategory', null)"
        />
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import BasicDetailForm from './BasicDetailForm.vue'
import ControlAction from './ControlAction.vue'
import { FContainer, FSpinner, FEmptyState } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
const emptyReadingObject = {
  actionVariableType: 1,
  readingFieldId: null,
  readingFieldDataType: null,
  scheduledActionOperatorType: null,
  scheduleActionValue: null,
  revertActionOperatorType: null,
  revertActionValue: null,
}
export default {
  props: ['basicDetail', 'isControlActionTemplateModule'],
  data() {
    return {
      emptyReadingObject,
      basicDetails: {
        name: null,
        description: null,
        controlActionSourceType: null,
        controlActionType: null,
        assetCategory: null,
        scheduledActionDateTime: null,
        revertActionDateTime: null,
        isEnableRevert: false,
        actionContextList: [],
        controlActionTemplateType: null,
      },
      enableRevertOption: false,
      readingList: [],
      readingOptionList: [],
      isCategoryChange: false,
      canShowEmptyState: false,
      emptyStateTitle: this.$t('controls.no_ac_selected', { ns: 'energy' }),
      emptyStateMessage: this.$t('controls.no_ac_desc', { ns: 'energy' }),
    }
  },
  components: {
    BasicDetailForm,
    ControlAction,
    FContainer,
    FSpinner,
    FEmptyState,
  },
  created() {
    let { basicDetail = {} } = this
    if (!isEmpty(this.basicDetail)) {
      let {
        assetCategory,
        revertActionDateTime,
        isEnableRevert,
        actionContextList,
      } = basicDetail
      if (revertActionDateTime || isEnableRevert) {
        this.enableRevertOption = true
      }

      if (assetCategory) {
        this.updateReadingList(assetCategory)
      }
      let { enableRevertOption } = this
      this.basicDetails = {
        ...basicDetail,
        controlActionType: 1,
        actionContextList: !isEmpty(actionContextList) ? actionContextList : [],
        isEnableRevert: enableRevertOption,
      }
    }
  },
  watch: {
    basicDetails: {
      async handler(newVal) {
        this.$emit('onDataChange', newVal)
      },
      deep: true,
    },
  },
  computed: {
    getBasicDetails() {
      let { basicDetails = {} } = this
      return basicDetails
    },
    getReadingList() {
      let { basicDetails = {}, emptyReadingObject } = this
      let { actionContextList } = basicDetails
      return isEmpty(actionContextList)
        ? [emptyReadingObject]
        : actionContextList
    },
  },
  methods: {
    getProperty,
    onFormDetailsChange(val = {}) {
      let { basicDetails = {} } = this
      let { assetCategory: newCategory, isEnableRevert } = val
      let { assetCategory: oldCategory } = basicDetails
      if (
        newCategory != oldCategory &&
        (!isEmpty(newCategory) || !isEmpty(oldCategory))
      ) {
        this.updateReadingList(newCategory)
        this.resetActionList()
        this.canShowEmptyState = isEmpty(newCategory)
      } else if (isEmpty(newCategory)) {
        this.canShowEmptyState = true
      }

      this.enableRevertOption = isEnableRevert
      this.basicDetails = { ...basicDetails, ...val }
    },
    onControlActionChange(val) {
      let actionContextList = cloneDeep(val)
      this.basicDetails.actionContextList = actionContextList
    },
    resetActionList() {
      let { emptyReadingObject } = this
      this.basicDetails.actionContextList = [emptyReadingObject]
    },
    async updateReadingList(id) {
      let { $route } = this
      let { meta } = $route || {}
      let { moduleName } = meta || {}
      this.canShowEmptyState = false
      this.isCategoryChange = true
      if (!isEmpty(id)) {
        let { data: readingsData = {}, error: readingsError } = await API.get(
          `v2/formulaBuilder/${moduleName}/reading/assetcategory`,
          {
            id,
            excludeEmptyFields: false,
            fetchValidationRules: false,
            fetchControllableFields: true,
          }
        )
        if (!readingsError) {
          let { readings = [] } = readingsData
          if (isEmpty(readings)) {
            this.emptyStateTitle = this.$t('controls.no_readings_found', {
              ns: 'energy',
            })
            this.emptyStateMessage = this.$t('controls.select_other_cat', {
              ns: 'energy',
            })
            this.canShowEmptyState = true
          } else {
            this.readingOptionList = readings.map(reading => {
              let { displayName: label, id: value } = reading || {}
              return { label, value }
            })
            this.readingList = readings.map(reading => {
              let {
                displayName,
                id,
                dataType,
                unit,
                dataTypeEnum = {},
              } = reading || {}
              let { typeAsString } = dataTypeEnum
              return { displayName, id, dataType, unit, typeAsString }
            })
          }
        }
      } else {
        this.emptyStateTitle = this.$t('controls.no_ac_selected', {
          ns: 'energy',
        })
        this.emptyStateMessage = this.$t('controls.no_ac_desc', {
          ns: 'energy',
        })
        this.canShowEmptyState = true
      }
      this.isCategoryChange = false
    },
  },
}
</script>
