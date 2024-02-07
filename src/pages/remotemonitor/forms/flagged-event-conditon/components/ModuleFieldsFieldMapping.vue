<template>
  <FContainer display="flex" flexDirection="column" rowGap="containerXxLarge">
    <FContainer v-if="loading || parentLoading">
      <FShimmer :height="44" />
    </FContainer>
    <template v-else>
      <FContainer
        v-for="(mappingField, index) in fieldMapping"
        :key="`fieldMapping-${index}`"
      >
        <FForm
          :ref="`field-value-form-${index}`"
          :uniqueId="`field-value-form-${index}`"
          :model="mappingField"
          :rules="formRules"
        >
          <FContainer class="flex items-start gap-x-2">
            <FContainer width="50%">
              <FFormItem prop="leftFieldName">
                <FSelect
                  v-model="mappingField.leftFieldName"
                  :placeholder="$t('actions.select_field')"
                  :options="moduleFieldsAsOptions"
                  :filterable="true"
                  :disabled="isDefaultField(mappingField)"
                />
              </FFormItem>
            </FContainer>
            <FContainer width="50%">
              <FFormItem prop="valueText">
                <template v-if="isSelectField(mappingField)">
                  <FSelect
                    v-model="mappingField.valueText"
                    :options="getSelectedFieldOptions(mappingField)"
                  ></FSelect>
                </template>
                <template v-else-if="isLookupField(mappingField)">
                  <Lookup
                    v-model="mappingField.valueText"
                    :field="getSelectedField(mappingField)"
                    :moduleName="moduleName"
                    @showLookupWizard="showLookUpWizard"
                    :fetchOptionsMethod="fetchOptionsMethod"
                    :hideLookupIcon="true"
                  />
                </template>
                <template v-else-if="isDateTimeField(mappingField)">
                  <DatePicker
                    v-model="mappingField.valueText"
                    :type="getSelectedFieldType(mappingField)"
                    :placeholder="getDatePickerPlaceHolder(mappingField)"
                    :account="account"
                  />
                </template>
                <template v-else-if="isTimeField(mappingField)">
                  <TimePicker
                    v-model="mappingField.valueText"
                    :field="getSelectedField(mappingField)"
                    :placeholder="$t('actions.select_time')"
                  />
                </template>
                <FInput
                  v-else
                  v-model="mappingField.valueText"
                  :type="getSelectedFieldType(mappingField)"
                  :placeholder="getPlaceHolderText(mappingField)"
                  :disabled="isValueFieldDisabled(mappingField)"
                ></FInput>
              </FFormItem>
            </FContainer>
            <FContainer
              cursor="pointer"
              display="flex"
              alignItems="center"
              height="44px"
              @click="removeFieldFromMapping(mappingField)"
            >
              <FIcon
                group="action"
                name="delete"
                size="20"
                :pressable="true"
                color="textCaption"
                :cursor="`${
                  isDefaultField(mappingField) ? 'not-allowed' : 'pointer'
                }`"
              />
            </FContainer>
          </FContainer>
        </FForm>
      </FContainer>
      <FDivider
        width="100%"
        backgroundColor="backgroundMidgroundDark"
        margin="containerLarge containerNone"
      />
      <FContainer display="flex" alignItems="center">
        <FContainer cursor="pointer" @click="addFieldForMapping">
          <FIcon
            group="sign-symbols"
            name="addition"
            size="20"
            :pressable="true"
            color="iconPrimaryDefault"
          />
        </FContainer>
        <FContainer cursor="pointer" @click="addFieldForMapping">
          <FText
            marginLeft="containerLarge"
            appearance="headingMed14"
            color="backgroundPrimaryDefault"
          >
            {{ $t('actions.add_field') }}
          </FText>
        </FContainer>
      </FContainer>
    </template>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FSelect,
  FInput,
  FDivider,
  FText,
  FIcon,
  FForm,
  FFormItem,
  FShimmer,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { TimePicker } from '@facilio/ui/forms'
import { DatePicker, Lookup } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { getOptionsForSecondLevelLookup } from '../../utils/rmHelpers'

const SUPPORTED_FIELD_TYPES = [
  'STRING',
  'NUMBER',
  'DECIMAL',
  'BOOLEAN',
  'DATE',
  'DATE_TIME',
  'LOOKUP',
  'ENUM',
  'BIG_STRING',
]

export default {
  components: {
    FContainer,
    FSelect,
    FInput,
    DatePicker,
    Lookup,
    TimePicker,
    FDivider,
    FText,
    FIcon,
    FForm,
    FFormItem,
    FShimmer,
  },
  props: ['moduleName', 'fieldMappingList', 'parentLoading', 'fieldConfig'],
  data() {
    return {
      loading: false,
      dataDeserialized: false,
      fieldsAsOptions: [],
      formFieldsMap: [],
      moduleFieldsAsOptions: [],
      moduleFieldsMap: {},
      fieldMapping: [],
      formRules: {
        valueText: {
          required: true,
          trigger: 'change',
          message: this.$t('flagged_event_rule.value_cant_empty', {
            ns: 'remote_monitor',
          }),
        },
        leftFieldName: {
          required: true,
          trigger: 'change',
          validator: value => {
            if (isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'flagged_event_rule.field_name_cant_empty',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
      },
    }
  },
  computed: {
    account() {
      return this.$account
    },
  },
  watch: {
    fieldMappingList() {
      this.deserializeData()
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      await this.loadModuleFields()
      this.deserializeData()
      this.loading = false
    },
    isDefaultField(mappingField) {
      let { fieldConfig = {} } = this
      let { leftFieldName = '' } = mappingField
      let defaultFields = getProperty(fieldConfig, 'DEFAULT_FIELDS', [])
      return defaultFields.includes(leftFieldName)
    },
    isValueFieldDisabled(mappingField) {
      let { leftFieldName } = mappingField || {}
      return isEmpty(leftFieldName)
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { fieldMapping = {} } = this
      let fieldMappingListLength = (fieldMapping || []).length
      const isValidMapping = [...Array(fieldMappingListLength)].every(
        (_, i) => {
          let fieldMappingForm = this.$refs[`field-value-form-${i}`]
          if (!isEmpty(fieldMapping)) {
            fieldMappingForm = fieldMappingForm[0]
            return fieldMappingForm?.validate() !== false
          }
          return true
        }
      )
      if (!isValidMapping) {
        return { invalid: true }
      }
      return fieldMapping
    },
    deserializeData() {
      let { isNew, fieldMappingList = [], moduleName } = this
      if (!isNew) {
        this.fieldMapping = fieldMappingList.map((fieldMapping = {}, index) => {
          return { ...fieldMapping, index }
        })
      }
      if (isEmpty(fieldMappingList)) {
        let leftFieldName = 'subject'
        if (moduleName === 'serviceOrder') {
          leftFieldName = 'name'
        }
        this.fieldMapping = [
          {
            index: 0,
            leftFieldName,
            leftFieldId: null,
            rightFieldId: null,
            parentId: null,
            valueText: null,
          },
        ]
      }

      this.dataDeserialized = true
    },
    addFieldForMapping() {
      let { fieldMapping = [] } = this
      let length = fieldMapping.length
      fieldMapping = [
        ...fieldMapping,
        {
          index: length,
          leftFieldName: null,
          leftFieldId: null,
          rightFieldId: null,
          parentId: null,
          valueText: null,
        },
      ]
      this.fieldMapping = fieldMapping
    },
    removeFieldFromMapping(mappingField) {
      if (this.isDefaultField(mappingField)) {
        return
      }
      let { index } = mappingField
      let { fieldMapping = [] } = this
      fieldMapping.splice(index, 1)
      this.fieldMapping = (fieldMapping || []).map((fieldMap, index) => {
        return { ...fieldMap, index }
      })
    },
    showLookUpWizard() {},
    isNumberType(field) {
      let displayType = getProperty(field, 'displayType')
      return ['NUMBER', 'DECIMAL', 'DURATION'].includes(displayType)
    },
    isDateTimeType(field) {
      let displayType = getProperty(field, 'displayType')
      return ['DATETIME'].includes(displayType)
    },
    isDateType(field) {
      let displayType = getProperty(field, 'displayType')
      return ['DATE'].includes(displayType)
    },
    getSelectedField(mappingField) {
      let fieldName = getProperty(mappingField, 'leftFieldName', '')
      let { moduleFieldsMap } = this
      if (!isEmpty(fieldName)) {
        let selectedField = moduleFieldsMap[fieldName] || {}
        return selectedField
      }
      return {}
    },
    isLookupField(mappingField) {
      let selectedField = this.getSelectedField(mappingField)
      if (isEmpty(selectedField)) {
        return false
      }
      let displayType = getProperty(selectedField, 'displayType', '')
      return ['LOOKUP_SIMPLE', 'MULTI_LOOKUP_SIMPLE', 'LOOKUP_POPUP'].includes(
        displayType
      )
    },
    isSelectField(mappingField) {
      let selectedField = this.getSelectedField(mappingField)
      if (isEmpty(selectedField)) {
        return false
      }
      let displayType = getProperty(selectedField, 'displayType', '')
      return ['SELECTBOX', 'MULTI_SELECTBOX', 'DECISION_BOX'].includes(
        displayType
      )
    },
    isTimeField(mappingField) {
      let selectedField = this.getSelectedField(mappingField)
      if (isEmpty(selectedField)) {
        return false
      }
      let displayType = getProperty(selectedField, 'displayType', '')
      return ['TIME'].includes(displayType)
    },
    isDateTimeField(mappingField) {
      let selectedField = this.getSelectedField(mappingField)
      if (isEmpty(selectedField)) {
        return false
      }
      let displayType = getProperty(selectedField, 'displayType', '')
      return ['DATE', 'DATETIME'].includes(displayType)
    },
    getPlaceHolderText(mappingField) {
      let selectedField = this.getSelectedField(mappingField)
      if (isEmpty(selectedField)) {
        return 'Enter Value'
      }
      let displayName = getProperty(selectedField, 'displayName', '')
      return `Enter ${displayName}`
    },
    getSelectedFieldOptions(field) {
      let selectedField = this.getSelectedField(field) || []
      return isEmpty(selectedField) ? [] : selectedField.options
    },
    getSelectedFieldType(field) {
      let selectedField = this.getSelectedField(field) || []
      return isEmpty(selectedField) ? '' : selectedField.type
    },
    getDatePickerPlaceHolder(field) {
      let placeholder = this.$t('flagged_event_rule.select_a_date', {
        ns: 'remote_monitor',
      })
      let selectedFieldType = this.getSelectedFieldType(field)
      if (!isEmpty(selectedFieldType)) {
        placeholder = placeholder + this.$t('date_time.time')
      }
      return placeholder
    },
    async loadModuleFields() {
      this.loading = true
      let { moduleName } = this
      let { data, error } = await API.get(
        `/v3/flaggedAlarmProcess/${moduleName}/fields`
      )
      if (isEmpty(error)) {
        let { fieldConfig = {} } = this
        let { fields = [] } = data
        let filteredFields = fields
        if (!isEmpty(fields) && !isEmpty(fieldConfig)) {
          let { INCLUDE_SYSTEM_FIELDS, EXCLUDE_SYSTEM_FIELDS } = fieldConfig
          filteredFields = fields.filter((field = {}) => {
            let { dataType, name, default: isSystemField = false } = field
            if (isSystemField) {
              if (!isEmpty(INCLUDE_SYSTEM_FIELDS)) {
                return INCLUDE_SYSTEM_FIELDS.includes(name)
              } else if (!isEmpty(EXCLUDE_SYSTEM_FIELDS)) {
                return !EXCLUDE_SYSTEM_FIELDS.includes(name)
              }
              return true
            }
            return SUPPORTED_FIELD_TYPES.includes(dataType)
          })
        }
        this.moduleFieldsMap = (filteredFields || []).reduce(
          (fieldsMap, field) => {
            let name = getProperty(field, 'name')
            if (!isEmpty(name)) {
              if (this.isNumberType(field)) {
                field.type = 'number'
              } else if (this.isDateTimeType(field)) {
                field.type = 'date-time'
              } else if (this.isDateType(field)) {
                field.type = 'date'
              } else {
                field.type = ''
              }
              fieldsMap[name] = field
            }
            return fieldsMap
          },
          {}
        )
        this.moduleFieldsAsOptions = (filteredFields || []).map(field => {
          let label = getProperty(field, 'displayName')
          let value = getProperty(field, 'name')
          return { label, value }
        })
      }
      this.loading = false
    },
    resetValues() {
      this.fieldsAsOptions = []
      this.fieldObjList = [
        {
          leftFieldId: null,
          leftFieldName: null,
          rightFieldId: null,
          parentId: null,
          valueText: null,
        },
      ]
    },
    async fetchOptionsMethod(props) {
      let { moduleName } = this
      let options = await getOptionsForSecondLevelLookup(props, moduleName)
      return options
    },
  },
}
</script>
