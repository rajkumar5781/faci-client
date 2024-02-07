<template>
  <div>
    <FModal
      title="New Task"
      :visible.sync="showAddTask"
      saveText="Add Task"
      size="M"
      @ok="addTaskData(selectedTask)"
      @cancel="closeAddTask"
      :hideFooter="false"
    >
      <FContainer class="fc-task-creation-dialogue">
        <FContainer>
          <FForm
            ref="task-facilio"
            :model="selectedTask"
            position="top"
            :rules="formRules"
            class="fc-task-form-spacing"
          >
            <div>
              <FFormItem label="Task Name" prop="subject"
                ><FInput
                  v-model="selectedTask.subject"
                  placeholder="Enter Task Name"
                  size="large"
                ></FInput
              ></FFormItem>
            </div>

            <FFormItem label="Description" prop="description">
              <FTextArea
                v-model="selectedTask.description"
                placeholder="Enter Description"
                :rows="6"
              ></FTextArea
            ></FFormItem>

            <FContainer
              display="flex"
              justifyContent="space-between"
              gap="containerLarge"
              width="100%"
            >
              <FContainer width="100%">
                <FFormItem label="Criticality" prop="taskCriticality">
                  <FSelect
                    :options="criticalityOptions"
                    v-model="selectedTask.taskCriticality"
                    placeholder="Criticality"
                    :multiple="false"
                    :disabled="false"
                    filterable
                    size="large"
                  />
                </FFormItem>
              </FContainer>
            </FContainer>

            <FFormItem>
              <Lookup
                :field="field"
                v-model="selectedTask.resource"
                @resourceSelected="val => (resourceSelected = val)"
                @showLookupWizard="showLookupWizard"
                :moduleName="'workorder'"
                :siteId="siteId"
              />
              <LookupWizard
                v-if="canShowLookupWizard"
                :canShowLookupWizard.sync="canShowLookupWizard"
                :selectedResource="resourceSelected"
                @setLookupFieldValue="setLookupFieldValue"
                :field="field"
                parentModuleName="workorder"
                :siteId="siteId"

              />
            </FFormItem>

            <FDivider width="100" />

            <FFormItem prop="enableInput">
              <FContainer
                display="flex"
                justify-content="space-between"
                align-items="center"
              >
                <FText appearance="bodyReg14" color="textMain"
                  >Enable Input Configuration</FText
                ><FSwitch v-model="selectedTask.enableInput" @change="resetInput()" size="small" />
              </FContainer>
            </FFormItem>

            <FContainer
              v-if="selectedTask.enableInput"
              padding="containerXLarge"
              backgroundColor="backgroundMidgroundMedium"
              display="flex"
              flexDirection="column"
              gap="containerXLarge"
            >
              <FFormItem
                label="Task Type"
                prop="inputType"
                v-if="selectedTask.enableInput"
              >
                <FRadioGroup
                  v-model="selectedTask.inputType"
                  @change="onSelectInput"
                  alignment="horizontal"
                  :options="[
                    { label: 'Text', value: 3 },
                    { label: 'Numeric', value: 4 },
                    { label: 'Option', value: 5 },
                    {
                      label: readingLabel,
                      value: 2,
                      disabled:
                        !selectedTask.resource ||
                        selectedTask.resource === -1 ||
                        !isPrerequisiteCompleted,
                    },
                  ]"
                />
              </FFormItem>
              <FFormItem
                v-if="selectedTask.inputType === 5"
                label="Options"
                prop="options"
              >
                <FContainer
                  v-for="(input, index) in selectedTask.inputList"
                  :key="index"
                  paddingBottom="containerXLarge"
                >
                  <FContainer display="flex" justifyContent="space-between">
                    <FContainer>
                      <FInput                        
                        v-model="selectedTask.options[index]"
                        :placeholder="'Option '  + (index + 1)"
                        size="large"
                        ><template #clickable
                          ><FContainer>{{ index + 1 }}</FContainer></template
                        ></FInput
                      >
                    </FContainer>
                    <FContainer>
                      <FContainer
                        display="flex"
                        alignItems="center"
                        height="100%"
                      >
                        <FButton
                          appearance="tertiary"
                          size="medium"
                          @click="addInput(index)"
                          ><FIcon
                            group="action"
                            name="circle-plus"
                            :size="20"
                            :pressable="false"
                          />
                        </FButton>
                        <FButton v-if="selectedTask.inputList.length > 1"
                          appearance="tertiary"
                          size="medium"
                          @click="removeInput(index)"
                          ><FIcon
                            group="action"
                            name="circle-minus"
                            :size="20"
                            :pressable="false"
                        /></FButton>
                      </FContainer>
                    </FContainer>
                  </FContainer>
                </FContainer>
              </FFormItem>
              <FFormItem
                v-if="selectedTask.inputType === 2"
                label="Reading Field"
              >
                <FSelect
                  v-model="selectedTask.readingFieldId"
                  :filterable="true"
                  :options="optionList"
                  size="large"
                />
              </FFormItem>
            </FContainer>
            <FDivider width="100" />
            <FFormItem label="Validation">
                    <FContainer display="flex">
                      <FContainer display="flex">
                        <FCheckbox
                          :disabled="false"
                          v-model="selectedTask.attachmentRequired"
                          :indeterminate="false"
                        ><FText appearance="bodyReg14" color="textMain"
                          >Photo Mandatory</FText
                        ></FCheckbox>
                        
                      </FContainer>
                      <FContainer v-if="selectedTask.inputType === 5" display="flex" paddingLeft="containerLarge" >
                        <FCheckbox
                          :disabled="false"
                          v-model="selectedTask.remarksRequired"
                          :indeterminate="false"
                        ><FText appearance="bodyReg14" color="textMain"
                          >Remarks Mandatory</FText
                        ></FCheckbox>
                        
                      </FContainer>
                    </FContainer>
                  </FFormItem>


            <!-- <FFormItem label="Validation">
              <FContainer display="flex">
                <FCheckbox
                  :disabled="false"
                  v-model="selectedTask.attachmentRequired"
                  :indeterminate="false"
                >
                  Photo Mandatory
                </FCheckbox>
              </FContainer>
            </FFormItem>

            <FFormItem label="Validation">
              <FContainer display="flex">
                <FCheckbox
                  :disabled="false"
                  v-model="selectedTask.attachmentRequired"
                  :indeterminate="false"
                >
                  Photo Mandatory
                </FCheckbox>
              </FContainer>
            </FFormItem> -->
          </FForm>
        </FContainer>
      </FContainer>
    </FModal>
  </div>
</template>
<script>
import workorderMixin from '../workorderHelper'
import { isEmpty } from '@facilio/utils/validation'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { loadAssetReadingFields } from '../../alarm/util'
import { API } from '@facilio/api'

import {
  FSpinner,
  FTable,
  FContainer,
  FRow,
  FCol,
  FDivider,
  FIcon,
  FButton,
  FModal,
  FText,
  FTextArea,
  FFormItem,
  FForm,
  FInput,
  FSelect,
  FDatePicker,
  FCheckbox,
  FRadioGroup,
  FAttachment,
  FSwitch,
  ftoast,
} from '@facilio/design-system'
export default {
  name: 'AddTasks',
  props: [
    'moduleName',
    'selectedSection',
    'showAddTask',
    'isPrerequisiteCompleted',
    'workorder',
  ],
  mixins: [workorderMixin],
  data() {
    return {
      resourceSelected: null,
      taskReadingFields: [],

      selectedTask: {
        inputValidationRuleId: -1,
        inputValidation: null,
        safeLimitRuleId: -1,
        minSafeLimit: null,
        maxSafeLimit: null,
        options: [''],
        inputList:[{ value: 'Choice 1' }, { value: 'Choice 2' }],
        taskType: -1,
        enableInput: false,
        inputType: 1,
        attachmentRequired: false,
        remarksRequired: false,
        subject: '',
        id: -1,
        selectedResourceName: '',
        inputValues: [],
        resource: null,
        sectionId: -1,
        taskCriticality: null,
        taskFrequency: null,
        readingFieldId: null,
        remarkOption: 'all',
      },
      frequencyOptions: [
        { value: 2, label: 'Daily' },
        { value: 3, label: 'Weekly' },
        { value: 4, label: 'Monthly' },
        { value: 5, label: 'Quarterly' },
        { value: 6, label: 'Half Yearly' },
        { value: 7, label: 'Annually' },
      ],
      criticalityOptions: [
        { value: 1, label: 'Statutory' },
        { value: 2, label: 'Mandatory' },
        { value: 3, label: 'Optimal' },
        { value: 4, label: 'Discretionary' },
      ],
      field: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'resource',
        field: {
          lookupModule: {
            name: 'resource',
            displayName: 'resource',
          },
        },
        multiple: false,
        name: 'resource',
      },
      taskBulkList: [],
      canShowLookupWizard: false,
      formRules: {
        subject: {
          trigger: 'blur',
          validator: value => {
            if (isEmpty(value)) {
              return {
                errorMessage: 'Please enter task name',
                invalid: true,
              }
            }
          },
        },
        number: { trigger: 'change' },
        date: { trigger: 'change' },
        file: { trigger: 'change' },
      },
    }
  },
  components: {
    FSpinner,
    FTable,
    FContainer,
    FRow,
    FCol,
    FDivider,
    FIcon,
    FButton,
    FModal,
    FText,
    FTextArea,
    FFormItem,
    FForm,
    FInput,
    FSwitch,
    FSelect,
    FDatePicker,
    FCheckbox,
    FRadioGroup,
    FAttachment,
    Lookup,
    LookupWizard,
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Tasks'
    },
    optionList() {
      return this.taskReadingFields.map(item => ({
        ...item,
        value: item.id,
        label: item.displayName,
      }))
    },
    canShowReadings(){
      if(!this.selectedTask.resource ||this.selectedTask.resource === -1 ||!this.isPrerequisiteCompleted)
      {
        return true
      }
      else{
        return false
      }
    },
    readingLabel(){
      return this.canShowReadings?'Readings(Enable Space/Asset for this)':'Readings'

    },
    siteId(){
        return this.workorder.siteId
    },
  },
  methods: {
    addInput(index) {
      this.selectedTask.options.push('')
      let newIndex =
        typeof index === 'number' ? index + 1 : this.inputList.length
      this.selectedTask.inputList.splice(newIndex, 0, '')
      this.selectedTask.options.splice(newIndex, 0, '')
    },
    removeInput(index) {
      this.selectedTask.inputList.splice(index, 1)
      this.selectedTask.options.splice(index, 1)
    },
    showLookupWizard() {
      this.canShowLookupWizard = true
    },
    closeAddTask() {
      this.$emit('update:showAddTask', false)
    },
    handleOk() {},
    async onSelectInput() {
      if (this.selectedTask.inputType === 2) {
       if(Number(this.selectedTask.resource)>0){
        let id = this.selectedTask.resource
            let { resource, error } = await API.fetchRecord('resource', {
            id,})
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message)
      } else {
        if (resource.resourceType === 2) {
         await  this.getResource(this.selectedTask.resource)
        }
      }
        }
        await this.fillTaskReadings()
      }
    },
    async fillTaskReadings() {
      if (
        this.selectedTask.resource &&
        this.selectedTask.resource.resourceType === 2 &&
        this.selectedTask.resource.category
      ) {
        let fields = []
        let excludeOperators = [74, 75, 76, 77, 78, 79, 35, 81, 82]

        let categoryId = getProperty(this, 'selectedTask.resource.category.id')

        let url = `/v2/readings/assetcategory?id=${categoryId}&excludeEmptyFields=${false}`
        let { data, error } = await API.get(url)
        if (error) {
          let { message } = error || {}
          ftoast.critical(message || this.$t('error_occurred'))
        } else {
          data.readings.forEach(field => {
            field.module = { name: field.module.name }
            let operators = getProperty(field, 'dataTypeEnum.operators')
            if (operators) {
              for (let operatorKey in operators) {
                let operator = operators[operatorKey]
                if (excludeOperators.includes(operator.operatorId)) {
                  delete operators[operatorKey]
                }
              }
            }
            fields.push(field)
          })
        }
        this.$set(this, 'taskReadingFields', fields)
      } else if (this.selectedTask.resource) {
        let parentCategoryId = -1
        if (this.selectedTask.resource.category) {
          parentCategoryId = this.selectedTask.resource.category.id
        }
        let resourceId = getProperty(this, 'selectedTask.resource.id')
        let result = this.loadSpaceReadingFields(
          resourceId,
          false,
          parentCategoryId,
          null
        )
        result.then(fields => {
          this.$set(this, 'taskReadingFields', fields)
        })
      }
    },
    loadSpaceReadingFields(
      id,
      excludeEmptyFields,
      categoryId,
      isOnlyReadingFields,
      includeDefaultFields,
      type
    ) {
      if (excludeEmptyFields !== false) {
        excludeEmptyFields = true
      }
      let url =
        id && id > -1
          ? `/reading/getspacespecificreadings?parentId=${id}&excludeEmptyFields=${excludeEmptyFields}`
          : `/reading/getallspacereadings${
              categoryId > 0 ? `?categoryIds=${categoryId}` : ''
            }`
      if (type) {
        url += '&readingType=' + type
      }
      return API.get(url).then(readings => {
        if (id && id > -1) {
          let fields = []
          if (readings.data) {
            let readings = readings.data['-1']
            readings.forEach(reading => {
              if (isOnlyReadingFields) {
                if (reading.type === 3) {
                  reading.fields.forEach(field => {
                    field.module = { name: reading.name }
                    fields.push(field)
                  })
                }
              } else {
                if (reading.fields) {
                  reading.fields.forEach(field => {
                    field.module = { name: reading.name }
                    fields.push(field)
                  })
                }
              }
            })
          }
          return fields
        } else {
          let fields = []
          let readings = readings.data['-1']
          if (readings) {
            if (readings[categoryId]) {
              readings[categoryId].forEach(reading => {
                if (isOnlyReadingFields) {
                  if (reading.type === 3) {
                    reading.fields.forEach(field => {
                      field.module = { name: field.name }
                      fields.push(field)
                    })
                  }
                } else {
                  reading.fields.forEach(field => {
                    field.module = { name: field.name }
                    fields.push(field)
                  })
                }
              })
            }

            if (includeDefaultFields) {
              if (readings[-1]) {
                readings[-1].forEach(reading => {
                  if (isOnlyReadingFields) {
                    if (reading.type === 3) {
                      reading.fields.forEach(field => {
                        field.module = { name: field.name }
                        fields.push(field)
                      })
                    }
                  } else {
                    reading.fields.forEach(field => {
                      field.module = { name: field.name }
                      fields.push(field)
                    })
                  }
                })
              }
            }
          }
          return fields
        }
      })
    },
    addTaskData(task) {
      if (this.selectedSection) {
        task.sectionId = this.selectedSection.sectionId
      }
     let error = this.addTask(task)
     if(!error){
      this.$emit('reload')
      this.closeAddTask()
     }
    },
    async setLookupFieldValue(props) {
      let { field: selectedLookupField } = this
      let { field } = props

      if (isEmpty(selectedLookupField)) this.selectedLookupField = field

      let {
        selectedItems,
        name: fieldName,
        options = [],
        multiple,
      } = field || {}
      let selectedItemIds = []

      if (!isEmpty(selectedItems)) {
        selectedItemIds = selectedItems.map(item => item.value)
        if (!isEmpty(options)) {
          let ids = options.map(item => item.value)
          let newOptions = selectedItems.filter(
            item => !ids.includes(item.value)
          )
          options.unshift(...newOptions)
        } else {
          options = [...selectedItems]
        }
      }

      this.$set(this.field, 'options', options)

      if (multiple) {
        this.selectedTask.resource = selectedItemIds
      } else {
        this.selectedTask.resource = selectedItemIds[0]
      }
      let id = this.selectedTask.resource
      let { resource, error } = await API.fetchRecord('resource', {
        id,
      })
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message)
      } else {
        if (resource.resourceType === 2) {
          this.getResource(this.selectedTask.resource)
        }
      }
    },
    async getResource(id) {
      let { asset, error } = await API.fetchRecord('asset', {
        id,
      })
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message)
      } else {
        this.selectedTask.resource = asset
      }
    },
    resetInput(){
         this.selectedTask.options=[''],
         this.selectedTask.inputType=1
         this.selectedTask.readingFieldId=null
     },
    },
}
</script>
<style scoped>
.fc-task-creation-dialogue {
  padding: 16px 215px 20px 215px;
}
.fc-task-form-spacing {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
