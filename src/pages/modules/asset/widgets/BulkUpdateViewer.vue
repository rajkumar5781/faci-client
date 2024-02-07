<template>
  <FModal
    title="Bulk Update"
    :visible="showBulkUpdate"
    saveText="Confirm"
    size="M"
    @cancel="actioncancel()"
    :hideFooter="false"
    padding="containerLarge"
  >
    <FContainer
      height="500px"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
      padding="containerXxLarge"
    >
      <FContainer overflow="scroll" width="100%">
        <FContainer
          v-for="(element, index) in fieldMatcher"
          :key="index"
          padding="sectionXSmall sectionSmall"
          width="100%"
        >
          <FContainer display="flex" gap="sectionLarge" width="100%">
            <FContainer text-align="center" width="5%">
              <FAvatar
                size="M"
                :userName="(index + 1).toString()"
                shape="circle"
                userStatus="nil"
              />
            </FContainer>

            <FContainer display="flex" width="45%">
              <FSelect
                style="width: 100%"
                v-model="element.field"
                @change="statusFieldName(element, index)"
                :options="getFieldlist()"
                size="large"
              >
              </FSelect>
            </FContainer>

            <FContainer display="flex" width="45%">
              <FContainer width="100%" v-if="!element.fieldObj">
                <FInput
                  style="width: 100%"
                  @change="checkinput(element)"
                  v-model="element.value"
                />
              </FContainer>
              <FContainer v-else-if="element.isSpacePicker">
                <FContainer>
                  <!-- space picker -->
                </FContainer>
              </FContainer>
              <FContainer v-else width="100%">
                <FInput
                  style="width: 100%"
                  v-if="
                    element.fieldObj[0].dataTypeEnum._name === 'NUMBER' ||
                    element.fieldObj[0].dataType === 'DECIMAL'
                  "
                  @change="checkinput(element)"
                  v-model="element.value"
                />

                <FSelect
                  v-else-if="
                    element.fieldObj[0].dataTypeEnum._name === 'BOOLEAN'
                  "
                  v-model="element.field"
                  @change="statusFieldName(element, index)"
                  :options="getBooleanValue(element)"
                  size="large"
                />

                <FSelect
                  v-else-if="element.fieldObj[0].dataTypeEnum._name === 'ENUM'"
                  v-model="element.field"
                  @change="statusFieldName(element, index)"
                  :options="getOptions(picklistOptions[element.field])"
                  size="large"
                />
                <FDatePicker
                  v-else-if="
                    element.fieldObj[0].dataTypeEnum._name === 'DATE' ||
                    element.fieldObj[0].dataTypeEnum._name === 'DATE_TIME'
                  "
                  v-model="element.value"
                  @change="changeDataType(element, index), checkinput(element)"
                  type="date-time"
                  size="large"
                />
                <FContainer
                  width="100%"
                  v-else-if="
                    element.fieldObj[0].dataTypeEnum._name === 'LOOKUP' &&
                    (element.fieldObj[0].displayType._name ===
                      'LOOKUP_SIMPLE' ||
                      element.fieldObj[0].displayType._name === 'LOOKUP_POPUP')
                  "
                >
                  <Lookup
                    style="width: 100%"
                    v-model="element.valueArray"
                    :field="element.fieldObj[0]"
                    :canShowLookupWizard="showLookupFieldWizard"
                    @showLookupWizard="showLookupWizard"
                    @recordSelected="
                      changeDataType(element, index), checkinput(element)
                    "
                  />
                </FContainer>
                <FContainer v-else-if="isMultiLookUpField(element)">
                  <Lookup
                    style="width: 100%"
                    v-model="element.valueArray"
                    :field="getMultiLookUpFieldObj(element.fieldObj[0])"
                    :canShowLookupWizard="showLookupFieldWizard"
                    @showLookupWizard="showLookupWizard"
                    @recordSelected="
                      changeDataType(element, index), checkinput(element)
                    "
                  />
                </FContainer>
                <FInput
                  v-else
                  @change="checkinput(element)"
                  v-model="element.value"
                />
              </FContainer>
            </FContainer>
            <FContainer width="5%">
              <FContainer
                v-if="indexbool"
                @click="deleteRow(element, index)"
                width="100%"
              >
                <FIcon group="action" name="delete" size="16"></FIcon>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer padding="sectionXSmall sectionSmall">
          <FButton
            appearance="link"
            size="small"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="addRow(element)"
          >
            Add New
          </FButton>
        </FContainer>
      </FContainer>
    </FContainer>
    <template #footer>
      <FContainer
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FButton @click="actionSave(fieldMatcher)" appearance="primary">
          Update
        </FButton>
      </FContainer>
    </template>
    <LookupWizard
      v-if="showLookupFieldWizard"
      :canShowLookupWizard.sync="showLookupFieldWizard"
      :field.sync="selectedLookupField"
      @setLookupFieldValue="setLookupFieldValue"
    />
  </FModal>
</template>
<script>
import {
  FContainer,
  FText,
  FModal,
  FButton,
  FIcon,
  FSelect,
  FInput,
  FDatePicker,
  FAvatar,
} from '@facilio/design-system'
import cloneDeep from 'lodash/cloneDeep'
import { dset as setProperty } from 'dset'
import viewStore from '../../../../store/views'
import { mapState, mapActions } from 'pinia'
import { loadModuleMeta } from '../../../../pages/remotemonitor/forms/utils/rmHelpers'
import { getFieldOptions } from '../../../../utils/picklist'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
export default {
  data() {
    return {
      confirmRequest: {
        assignedTo: {
          id: null,
        },
        assignmentGroup: {
          id: null,
        },
      },
      showLookupFieldWizard: false,
      indexcount: 0,
      checkbool: false,
      indexbool: false,
      updateFields: [],
      fieldbool: false,
      fielddeletelist: [],
      fieldupdatelist: [],
      fieldnewlist: [],
      searchbool: true,
      selectedspace: null,
      referindex: -1,
      index: null,
      fieldContext: '',
      chooserVisibility: false,
      picklistOptions: {},
      fieldUpdateValue: true,
      spacePicker: false,
      fieldMatcher: [],
      selectedLookupField: null,
      moduleFields: [],
    }
  },
  components: {
    FContainer,
    FText,
    FModal,
    FButton,
    FIcon,
    FSelect,
    FInput,
    FDatePicker,
    Lookup,
    LookupWizard,
    FAvatar,
  },
  props: ['module', 'showBulkUpdate', 'fieldlist'],
  // watch: {},

  async mounted() {
    await this.init()
  },

  computed: {
    ...mapState(viewStore, {
      metaInfo: 'metaInfo',
    }),
  },

  methods: {
    ...mapActions(viewStore, ['loadModuleMeta']),
    async init() {
      await loadModuleMeta('asset').then(response => {
        this.moduleFields = response.data.meta.fields
      })
      await this.addRow()
      await this.update()
    },
    checkinput(selectedField) {
      this.fieldupdatelist.push(selectedField.field)
    },
    actioncancel() {
      this.$emit('closed')
    },
    async update() {
      this.fieldnewlist = this.fieldlist
      if (this.moduleFields && this.fieldnewlist) {
        this.updateFields = this.moduleFields.filter(
          field => !field.default || this.fieldnewlist.includes(field.name)
        )
        this.updateFields.find(function (fm) {
          if (fm.name === 'assignedTo') {
            fm.displayName = 'Team / Staff'
          }
        })
      }
    },
    checkUpdate(field) {
      if (
        this.fieldupdatelist.find(function (fm) {
          return fm === field.name
        })
      ) {
        return false
      } else {
        return true
      }
    },
    statusFieldName(selectedField, index) {
      if (selectedField != undefined)
        this.fieldupdatelist.push(selectedField.field)

      let field = this.moduleFields.filter(
        field => field.name === selectedField.field
      )
      this.fieldMatcher[index].fieldObj = field
      this.fieldMatcher[index].isSpacePicker = false
      this.fieldMatcher[index].isAssigned = false
      if (field.length > 0) {
        this.fieldMatcher[index].columnName = field[0].completeColumnName
        if (field[0].dataTypeEnum._name === 'ENUM') {
          this.$set(this.picklistOptions, field[0].name, field[0].enumMap)
        }
        if (field[0].dataTypeEnum._name === 'LOOKUP' && field[0].specialType) {
          if (field[0].specialType === 'requester') {
            this.loadPickList(field[0].lookupModule.name, field[0].name)
          } else {
            this.loadSpecialTypePickList(
              field[0].specialType,
              field[0].name,
              index
            )
          }
        } else if (
          field[0].dataTypeEnum._name === 'LOOKUP' &&
          field[0].lookupModule
        ) {
          if (field[0].lookupModule.name === 'ticketpriority') {
            let priority = {}
            this.ticketpriority.forEach(d => {
              priority[d.id] = d.displayName
            })
            this.$set(this.picklistOptions, field[0].name, priority)
          } else if (field[0].lookupModule.name === 'resource') {
            this.loadSpecialTypePickList(
              field[0].lookupModule.name,
              field[0].name,
              index
            )
          } else {
            this.loadPickList(field[0].lookupModule.name, field[0].name)
          }
        }
        this.$forceUpdate()
      }
    },
    async loadPickList(moduleName, fieldName) {
      let { error, options } = await getFieldOptions({
        field: { lookupModuleName: moduleName, skipDeserialize: true },
      })

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.$set(this.picklistOptions, fieldName, options)
      }
    },
    changeDataType(criteria, index) {
      if (
        !isEmpty(index) &&
        !isEmpty(criteria[index]) &&
        (criteria[index].fieldObj[0].dataTypeEnum._name === 'DATE_TIME' ||
          criteria[index].fieldObj[0].dataTypeEnum._name === 'DATE')
      ) {
        if (criteria[index].value) {
          let interval = this.daysHoursMinuToSec(criteria[index].value)
          criteria[index].value = interval * 1000
          this.fieldMatcher[index].value = criteria[index].value
        }
      } else {
        if (criteria.valueArray) {
          criteria.value = { id: criteria.valueArray }
        }
      }
      this.$forceUpdate()
    },
    daysHoursMinuToSec(dateObject) {
      let interval = null
      if (dateObject.days) {
        interval = dateObject.days * 86400
      }
      if (dateObject.minute) {
        interval += dateObject.minute * 60
      }
      if (dateObject.hours) {
        interval += dateObject.hours * 3600
      }
      return interval
    },
    actionSave(datas) {
      let data = cloneDeep(datas)
      if (data) {
        this.$emit('submit', data)
      }
    },
    async addRow() {
      this.indexcount++
      let { fieldMatcher } = this
      if (this.indexcount > 1) {
        this.indexbool = true
      } else {
        this.indexbool = false
      }
      if (this.moduleFields && this.fieldlist) {
        this.updateFields = this.moduleFields.filter(
          field => !field.default || this.fieldlist.includes(field.name)
        )
        this.updateFields.find(function (fm) {
          if (fm.name === 'assignedTo') {
            fm.displayName = 'Team / Staff'
          }
        })
      }

      let newField = {
        field: '',
        isSpacePicker: false,
        isAssigned: false,
        value: null,
        parseLabel: null,
        valueArray: null,
        dateObject: {},
        fieldObj: [
          {
            displayName: '',
            dataTypeEnum: {
              _name: '',
            },
          },
        ],
      }

      this.$set(this.fieldMatcher, fieldMatcher.length, newField)
    },
    deleteRow(element, index) {
      this.indexcount--
      if (this.indexcount > 1) {
        this.indexbool = true
      } else {
        this.indexbool = false
      }

      for (let i = 0; i < this.fieldupdatelist.length; i++) {
        if (this.fieldupdatelist[i] === element.field) {
          this.referindex = i
        }
      }
      if (this.referindex != -1) {
        this.fieldupdatelist.splice(this.referindex, 1)
      }
      this.referindex = -1
      this.fieldMatcher.splice(index, 1)
    },
    loadSpecialTypePickList(specialType, fieldName, index) {
      let pickOption = {}
      if (specialType === 'users' || specialType === 'groups') {
        this.fieldMatcher[index].isAssigned = true
      } else if (specialType === 'basespace') {
        this.fieldMatcher[index].isSpacePicker = true
        let spaceList = this.$store.state.spaces
        for (let space of spaceList) {
          pickOption[space.id] = space.name
        }
        setProperty(this.picklistOptions, fieldName, pickOption)
      } else if (specialType === 'resource') {
        this.fieldMatcher[index].isSpacePicker = true
      } else if (specialType === 'sourceType') {
        setProperty(this.picklistOptions, fieldName, this.$constants.SourceType)
      }
    },
    getFieldlist() {
      return this.updateFields
        .filter(item => item !== null)
        .map((item, index) => ({
          label: item.displayName,
          value: item.name,
        }))
    },
    getBooleanValue(element) {
      let fieldValue = [
        {
          label: element.fieldObj[0].trueVal
            ? element.fieldObj[0].trueVal
            : 'Yes',
          value: 'true',
        },
        {
          label: element.fieldObj[0].falseVal
            ? element.fieldObj[0].falseVal
            : 'No',
          value: 'false',
        },
      ]
      return fieldValue
    },
    showLookupWizard(field, canShow) {
      this.selectedLookupField = { ...field, config: {} }
      this.showLookupFieldWizard = canShow
    },
    setLookupFieldValue(value) {
      let { field } = value
      let { selectedItems } = field
      let { fieldMatcher, selectedLookupField } = this
      let currentFieldIndex = fieldMatcher.findIndex(field => {
        let name = getProperty(field, 'fieldObj.0.name')
        return name === selectedLookupField.name
      })
      let currentField = fieldMatcher[currentFieldIndex]
      if (field.multiple) {
        let valueArrayItems = []
        selectedItems.forEach(selectedItem => {
          let { value } = selectedItem || {}
          valueArrayItems.push(value)
        })
        currentField = { ...currentField, valueArray: valueArrayItems }
      } else {
        currentField = { ...currentField, valueArray: selectedItems[0].value }
      }
      if (!isEmpty(fieldMatcher[currentFieldIndex])) {
        this.$set(this.fieldMatcher, currentFieldIndex, currentField)
        this.changeDataType(currentField, currentFieldIndex)
        this.checkinput(currentField)
      }
      this.showLookupFieldWizard = false
    },
    isMultiLookUpField(element) {
      let { fieldObj } = element || {}
      let { displayType, dataTypeEnum } = fieldObj[0] || {}
      let { _name: displayTypeName } = displayType || {}
      let { _name: dataTypeEnumName } = dataTypeEnum || {}
      if (
        dataTypeEnumName === 'MULTI_LOOKUP' &&
        ['MULTI_LOOKUP_POPUP', 'MULTI_LOOKUP_SIMPLE'].includes(displayTypeName)
      ) {
        return true
      }
      return false
    },
    getOptions(option) {
      let finalOption = Object.keys(option).map(function (key) {
        return {
          label: inputObject[key],
          value: parseInt(key), // Assuming keys are integers, if not, adjust accordingly
        }
      })
      return finalOption
    },
    getMultiLookUpFieldObj(variable) {
      variable['multiple'] = true
      return variable
    },
  },
}
</script>
