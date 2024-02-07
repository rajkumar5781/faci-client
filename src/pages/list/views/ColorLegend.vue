<template>
  <FContainer>
    <FContainer
      padding="containerLarge containerXLarge"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <FText appearance="headingMed14">Colors</FText>
      <FButton
        appearance="tertiary"
        size="small"
        iconButton
        iconGroup="action"
        iconName="cross"
        @click="onClose"
      ></FButton>
    </FContainer>
    <FContainer padding="containerXLarge" width="300px">
      <FContainer
        v-if="loading"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100px"
      >
        <FSpinner :size="20" />
      </FContainer>
      <FText v-else-if="isListEmpty">
        {{ $t('view.no_color_customize', { ns: 'view' }) }}
      </FText>
      <template v-else>
        <FContainer
          v-for="(valueObj, index) in colorCustomization.values"
          :key="`color-field-option-${index}`"
          padding="containerXLarge"
        >
          <FContainer display="flex" gap="containerLarge">
            <div
              class="h-3 w-3 rounded-full `bg-{valueObj.customization.eventColor}`"
              :style="{
                'background-color': valueObj.customization.eventColor,
              }"
            ></div>
            <FText appearance="bodyReg14">{{ valueObj.label }}</FText>
          </FContainer>
        </FContainer>
        <FContainer
          display="flex"
          gap="containerLarge"
          padding="containerXLarge"
        >
          <div
            class="h-3 w-3 rounded-full"
            :style="{
              'background-color':
                colorCustomization.defaultCustomization.eventColor,
            }"
          ></div>
          <FText appearance="bodyReg14">{{
            $t('view.default', { ns: 'view' })
          }}</FText>
        </FContainer>
      </template>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FContainer,
  FText,
  FButton,
  FSpinner,
  ftoast,
} from '@facilio/design-system'

const dataTypes = {
  BOOLEAN: 4,
  DATE: 5,
  DATE_TIME: 6,
  LOOKUP: 7,
  ENUM: 8,
  SYSTEM_ENUM: 12,
}

const lookupType = { BASE_ENTITY: 1, PICK_LIST: 2 }

export default {
  props: ['recordCustomization', 'metaInfo', 'moduleName'],
  components: { FContainer, FText, FButton, FSpinner },
  data() {
    return {
      loading: false,
      colorCustomization: {},
      fieldName: null,
      isEmpty,
    }
  },
  created() {
    this.deserialize()
  },
  computed: {
    isListEmpty() {
      let { values } = this.colorCustomization || {}
      return isEmpty(values)
    },
    selectFieldList() {
      let { BOOLEAN, LOOKUP, ENUM, SYSTEM_ENUM } = dataTypes
      let { PICK_LIST } = lookupType
      let { metaInfo } = this
      let { fields } = metaInfo || {}

      return (fields || []).filter(fld => {
        let { dataType, lookupModule } = fld
        let { type } = lookupModule || {}
        return (
          [BOOLEAN, ENUM, SYSTEM_ENUM].includes(dataType) ||
          (LOOKUP === dataType && type === PICK_LIST)
        )
      })
    },
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    },
    deserialize() {
      let { recordCustomization } = this || {}

      if (!isEmpty(recordCustomization)) {
        let {
          values,
          customizationType,
          defaultCustomization,
          customizationFieldId,
        } = recordCustomization || {}

        values = values.map(val => {
          let valueObj = {}
          let { customization, namedCriteriaId, fieldValue } = val || {}

          customization = JSON.parse(customization || '{}') || {}
          if (customizationType === 1) valueObj = { customization, fieldValue }
          else valueObj = { customization, namedCriteriaId }

          return valueObj
        })
        defaultCustomization = (defaultCustomization &&
          JSON.parse(defaultCustomization || '{}')) || {
          eventColor: '#4d95ff',
        }
        this.colorCustomization = {
          customizationType,
          values,
          defaultCustomization,
        }

        if (customizationType === 1) {
          this.colorCustomization = {
            ...this.colorCustomization,
            customizationFieldId,
          }
          this.loadOptions()
        } else {
          this.fieldName = 'Criteria'
          this.loadConditionManager()
        }
      }
    },
    async loadOptions() {
      this.loading = true

      let { BOOLEAN, LOOKUP, ENUM, SYSTEM_ENUM } = dataTypes
      let { selectFieldList, colorCustomization } = this
      let { customizationFieldId: fieldId, values } = colorCustomization || {}
      let selectedField = selectFieldList.find(f => f.id === fieldId) || {}
      let { dataType, displayName } = selectedField || {}

      if (BOOLEAN === dataType) {
        let { falseVal, trueVal } = selectedField || {}

        values = values.map(option => {
          let { fieldValue } = option || {}
          let label =
            fieldValue === 'true' ? trueVal || 'True' : falseVal || 'False'

          return { ...option, label }
        })
      } else if ([ENUM, SYSTEM_ENUM].includes(dataType)) {
        let { enumMap } = selectedField || {}

        values = values.map(option => {
          let { fieldValue } = option || {}
          return { ...option, label: enumMap[fieldValue] }
        })
      } else if (LOOKUP === dataType) {
        let { PICK_LIST } = lookupType
        let { lookupModule } = selectedField || {}
        let { name, type } = lookupModule || {}

        if (type === PICK_LIST) {
          let { data, error } = await API.get('v2/module/data/list', {
            moduleName: name,
          })
          if (!error) {
            let optionMap = (data.moduleDatas || []).reduce(
              (optionMapObj, option) => {
                let { id, displayName, name } = option
                optionMapObj[id] = displayName || name
                return optionMapObj
              },
              {}
            )
            values = values.map(option => {
              let { fieldValue } = option || {}
              return { ...option, label: optionMap[fieldValue] }
            })
          }
        }
      }
      this.$set(this.colorCustomization, 'values', values)
      this.fieldName = displayName
      this.loading = false
    },
    async loadConditionManager() {
      this.loading = true

      let { moduleName } = this
      let { error, data } = await API.post('v2/namedCriteria/list', {
        moduleName,
      })

      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { values } = this.colorCustomization || {}
        let namedCriteriaIdVsName = (data.namedCriteriaList || []).reduce(
          (namedCriteriaOptions, criteriaObj) => {
            let { id, name } = criteriaObj || {}
            namedCriteriaOptions[id] = name
            return namedCriteriaOptions
          },
          {}
        )

        this.colorCustomization.values = values.map(valueObj => {
          let { namedCriteriaId } = valueObj
          valueObj.label = namedCriteriaIdVsName[namedCriteriaId]
          return valueObj
        })
      }
      this.loading = false
    },
  },
}
</script>
