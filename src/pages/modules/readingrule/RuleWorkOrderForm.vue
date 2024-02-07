<template>
  <FContainer class="pm-form-container">
    <MultiStepperForm
      ref="multi-stepper-form"
      :formHeading="
        $t('faultToWorkorder.fault_to_wo', 'Fault To Workorder Creation', {
          ns: 'rule',
        })
      "
      :stepsData="stepData"
      :formDescription="formDescription"
      :currentStepName="activeStep"
      @currentStepListener="
        (isLastPage, currentStep) => currentStepHandler(isLastPage, currentStep)
      "
    >
      <template v-if="loading"><FSpinner :show="loading"></FSpinner></template>
      <template #page-header-buttons>
        <FContainer gap="containerXLarge" display="flex">
          <FButton appearance="secondary" size="medium" @click="closeForm">
            Discard
          </FButton>
        </FContainer>
      </template>
      <template #main-content>
        <FContainer
          display="flex"
          justifyContent="center"
          paddingTop="sectionMedium"
        >
          <FContainer
            id="workorder-creation"
            v-if="activeStep === 'Workorder Creation'"
            width="720px"
            gap="containerXLarge"
            display="flex"
            flexDirection="column"
          >
            <FContainer>
              <FContainer>
                <FText
                  appearance="headingMed14"
                  color="textMain"
                  weight="500px"
                  >{{
                    $t('faultToWorkorder.create_wo', 'Create Workorder', {
                      ns: 'rule',
                    })
                  }}</FText
                >
              </FContainer>
              <FText appearance="captionReg12" color="textCaption">{{
                $t(
                  'faultToWorkorder.create_wo_header',
                  'Automatically create Work Order on occurence of Fault create_wo_header',
                  {
                    ns: 'rule',
                  }
                )
              }}</FText>
            </FContainer>

            <FContainer
              gap="containerXLarge"
              display="flex"
              flexDirection="column"
              borderRadius="high"
              border="1px solid"
              borderColor="borderNeutralBaseSubtler"
              padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
            >
              <FContainer>
                <FText appearance="headingMed16" color="textMain">
                  {{
                    $t('faultToWorkorder.execute_on', 'Execute On', {
                      ns: 'rule',
                    })
                  }}
                </FText>

                <FContainer>
                  <FText appearance="captionReg12" color="textCaption">
                    {{
                      $t(
                        'faultToWorkorder.define_execute',
                        'Define when workorder creation should be executed',
                        { ns: 'rule' }
                      )
                    }}
                  </FText>
                </FContainer>
              </FContainer>
              <FContainer paddingTop=" containerMedium">
                <FSelect
                  v-model="workflowRule.event.activityType"
                  :placeholder="
                    $t('faultToWorkorder.select', 'Select', {
                      ns: 'rule',
                    })
                  "
                  :options="createWoActivityType"
                  :multiple="false"
                  :disabled="false"
                  :loading="isloading"
                  size="large"
                />
              </FContainer>
              <FContainer>
                <FaultToWoFields
                  v-if="isFieldChange"
                  :workflowRule="workflowRule"
                  :module="moduleName"
                  @selectedFields="addWoCreationFields"
                  :isEdit="isEdit"
                />
                <SchedulerForRuleWo
                  v-if="isOndate"
                  :moduleFields="moduleFields"
                  :module="moduleName"
                  :workflowRule="workflowRule"
                  @schedulerFields="addWodateField"
                  :isEdit="isEdit"
                />
              </FContainer>
            </FContainer>

            <FContainer
              gap="containerXLarge"
              display="flex"
              flexDirection="column"
              borderRadius="high"
              border="1px solid"
              borderColor="borderNeutralBaseSubtler"
              padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
            >
              <FContainer>
                <FText appearance="headingMed16" color="textMain">
                  {{
                    $t('faultToWorkorder.wo', 'Template and Field Mapping', {
                      ns: 'rule',
                    })
                  }}
                </FText>

                <FContainer>
                  <FText appearance="captionReg12" color="textCaption">
                    {{
                      $t(
                        'faultToWorkorder.workord',
                        'Define the template for Work Order creation & respective field mappings',
                        { ns: 'rule' }
                      )
                    }}
                  </FText>
                </FContainer>
              </FContainer>

              <FContainer paddingBotom="containerMedium">
                <FSelect
                  v-model="alarmWo.templateJson.formId"
                  @change="loadWOFormFields(formId, true)"
                  :placeholder="
                    $t('faultToWorkorder.select', '', {
                      ns: 'rule',
                    })
                  "
                  :options="templates"
                  size="medium"
                >
                </FSelect>
              </FContainer>
              <FContainer
                borderRadius="high"
                border="1px solid"
                backgroundColor="backgroundMidgroundSubtle"
                borderColor="borderNeutralBaseSubtler"
                padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
                gap="containerXLarge"
                display="flex"
                flexDirection="column"
              >
                <FContainer
                  width="624px"
                  borderRadius="high"
                  border="1px solid"
                  borderColor="borderNeutralBaseSubtler"
                  padding="containerLarge sectionLarge containerLarge sectionLarge"
                >
                  <FContainer
                    float="left"
                    marginRight="containerXxLarge"
                    width="44%"
                    justify-content="center"
                  >
                    <FText appearance="captionMed10" color="textCaption">
                      {{
                        $t('field', 'Field', {
                          ns: 'common',
                        })
                      }}</FText
                    >
                  </FContainer>
                  <FContainer
                    float="left"
                    marginRight="containerXxLarge"
                    width="42%"
                  >
                    <FText appearance="captionMed10" color="textCaption">
                      {{
                        $t('value', 'Value', {
                          ns: 'common',
                        })
                      }}</FText
                    >
                  </FContainer>
                </FContainer>

                <FContainer
                  v-for="(fieldMatcher, index) in alarmFieldMatcher"
                  :key="index"
                >
                  <FContainer v-if="!isloading" display="flex">
                    <FContainer
                      float="left"
                      marginRight="containerXxLarge"
                      width="42%"
                    >
                      <FSelect
                        :options="woFormFields"
                        v-model="fieldMatcher.field"
                        @change="statusFieldName(fieldMatcher, index)"
                        :disabled="disableFormFieldSelect(index)"
                        filterable
                        size="medium"
                      />
                    </FContainer>

                    <FContainer
                      float="left"
                      marginRight="containerXxLarge"
                      width="42%"
                    >
                      <FContainer v-if="!fieldMatcher.fieldObj">
                        <FInput
                          v-model="fieldMatcher.value"
                          display="flex"
                          size="medium"
                        ></FInput>
                      </FContainer>
                      <FContainer v-else-if="fieldMatcher.isSpacePicker">
                        <FInput
                          v-model="field.parseLabel"
                          disabled
                          display="flex"
                          size="medium"
                        >
                          <i slot="suffix"></i>
                        </FInput>
                      </FContainer>
                      <FContainer v-else class="flex-middle">
                        <FSelect
                          @change="changeDataType(fieldMatcher)"
                          v-if="lookupCondition(fieldMatcher)"
                          v-model="fieldMatcher.valueArray"
                          :options="pickList(fieldMatcher)"
                          size="medium"
                        >
                        </FSelect>

                        <FSelect
                          @change="changeDataType(fieldMatcher)"
                          v-else-if="
                            dataTypeEnum(fieldMatcher)?._name === 'LOOKUP'
                          "
                          v-model="fieldMatcher.valueArray"
                          :options="pickList(fieldMatcher)"
                          size="M"
                        />
                        <FInput
                          v-else
                          v-model="fieldMatcher.value"
                          display="flex"
                          size="medium"
                        ></FInput>
                      </FContainer>
                    </FContainer>

                    <FContainer display="flex" alignItem="center" height="100%">
                      <FButton
                        v-show="index > 0"
                        iconGroup="action"
                        iconName="delete"
                        appearance="tertiary"
                        :iconButton="true"
                        @click="deleteRow(index)"
                      ></FButton>
                    </FContainer>
                  </FContainer>
                </FContainer>
                <FButton
                  appearance="secondary"
                  size="medium"
                  color="borderNeutralBaseSubtle"
                  border="borderNeutralBaseSubtle"
                  radius="medium"
                  width="81px"
                  height="32px"
                  @click="addRowWO"
                  ><FText color="textMain" appearance="headingMed14">{{
                    $t('faultToWorkorder.add_Fields', 'Add Field', {
                      ns: 'rule',
                    })
                  }}</FText></FButton
                >
              </FContainer>
            </FContainer>

            <FContainer
              borderRadius="high"
              border="1px solid"
              borderColor="borderNeutralBaseSubtler"
              padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
            >
              <FText appearance="headingMed14">Enable Comments</FText>
              <FContainer float="right">
                <FSwitch
                  v-model="includeComments"
                  @change="createComment = !createComment"
                  >{{
                    $t(
                      'faultToWorkorder.include_commands',
                      'Include Commends',
                      { ns: 'rule' }
                    )
                  }}
                  ></FSwitch
                >
              </FContainer>

              <FContainer
                v-if="createComment"
                width="100%"
                paddingTop="containerXLarge"
              >
                <FTextArea
                  appearance="bodyReg14"
                  color="textCaption"
                  v-model="workflowRule.comments.create"
                  :min-rows="1"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 1 }"
                  :placeholder="
                    $t('faultToWorkorder.enter_commands', 'Enter Commend', {
                      ns: 'rule',
                    })
                  "
                >
                </FTextArea>
              </FContainer>
            </FContainer>

            <FContainer
              gap="containerXLarge"
              display="flex"
              flexDirection="column"
              borderRadius="high"
              border="1px solid"
              borderColor="borderNeutralBaseSubtler"
              padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
            >
              <FContainer>
                <FCheckbox v-model="workflowRule.isRecommendationAsTask">{{
                  $t(
                    'faultToWorkorder.fault_to_workorder_task',
                    'Add Recommendation as workorder task',
                    { ns: 'rule' }
                  )
                }}</FCheckbox>
              </FContainer>
              <FContainer>
                <FCheckbox v-model="workflowRule.isPossibleCauseAsDesc">{{
                  $t(
                    'faultToWorkorder.fault_to_workorder_desc',
                    'Add Possible Causes as Workorder Description',
                    { ns: 'rule' }
                  )
                }}</FCheckbox>
              </FContainer>
            </FContainer>

            <FContainer>
              <FContainer>
                <FText
                  appearance="headingMed14"
                  weight="500px"
                  color="textMain"
                >
                  {{
                    $t('faultToWorkorder.skip', 'Skip Workorder ', {
                      ns: 'rule',
                    })
                  }}
                </FText>
                <FContainer float="right">
                  <FSwitch
                    v-model="workflowRule.isSkip"
                    @change="skipactions"
                  />
                </FContainer>
              </FContainer>
              <FText appearance="captionReg12" color="textCaption">{{
                $t(
                  'faultToWorkorder.skip_creation',
                  'Skip Workorder Creation for Subsequent Occurrences',
                  { ns: 'rule' }
                )
              }}</FText>
            </FContainer>
            <FContainer
              gap="containerXLarge"
              display="flex"
              flexDirection="column"
              v-if="workflowRule.isSkip"
            >
              <FContainer
                borderRadius="high"
                border="1px solid"
                borderColor="borderNeutralBaseSubtler"
                padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
              >
                <FContainer>
                  <FText appearance="headingMed14" color="textMain">
                    {{ $t('criteria', 'CRITERIA', { ns: 'common' }) }}
                  </FText>

                  <FContainer>
                    <FText appearance="captionReg12" color="textCaption">
                      {{
                        $t(
                          'faultToWorkorder.skip_criteria',
                          'Skip Workorder Creation if Existing Workorder matches the below criteria',
                          { ns: 'rule' }
                        )
                      }}
                    </FText>
                  </FContainer>
                  <NewCriteriaBuilder
                    ref="criteria-woCreation"
                    v-model="workflowRule.woCriteria"
                    :moduleName="actionModule"
                    :disabled="!workflowRule.isSkip"
                    :showHeader="false"
                    :showCriteriaTitle="false"
                  />
                </FContainer>
              </FContainer>
              <FContainer
                borderRadius="high"
                border="1px solid"
                borderColor="borderNeutralBaseSubtler"
                padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
              >
                <FText appearance="headingMed14">Enable Comments</FText>
                <FContainer float="right">
                  <FSwitch
                    v-model="includeCommentsOnSkip"
                    @change="skipComment = !skipComment"
                    :disabled="!workflowRule.isSkip"
                    >{{
                      $t(
                        'faultToWorkorder.include_commands',
                        'Include Commends',
                        { ns: 'rule' }
                      )
                    }}
                    ></FSwitch
                  >
                </FContainer>

                <FContainer
                  v-if="skipComment"
                  width="100%"
                  paddingTop="containerXLarge"
                >
                  <FTextArea
                    appearance="bodyReg14"
                    color="textCaption"
                    v-model="workflowRule.comments.skip"
                    :min-rows="1"
                    type="textarea"
                    :autosize="{ minRows: 1, maxRows: 1 }"
                    :placeholder="
                      $t('faultToWorkorder.enter_commands', 'Enter Comments', {
                        ns: 'rule',
                      })
                    "
                  >
                  </FTextArea>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>

          <FContainer
            v-else-if="activeStep === 'Workorder Closure'"
            width="720px"
          >
            <FContainer paddingBottom="containerXLarge">
              <FText appearance="headingMed14" color="textMain">
                {{
                  $t('faultToWorkorder.auto_close_wo', 'Auto Close Workorder', {
                    ns: 'rule',
                  })
                }}
              </FText>

              <FContainer float="right">
                <FSwitch v-model="closeWorkflowRule.status"> </FSwitch>
              </FContainer>
            </FContainer>
            <FContainer
              gap="containerXLarge"
              display="flex"
              flexDirection="column"
            >
              <FContainer
                borderRadius="high"
                border="1px solid"
                borderColor="borderNeutralBaseSubtler"
                padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
                gap="containerXLarge"
                display="flex"
                flexDirection="column"
              >
                <FContainer>
                  <FText appearance="headingMed14" color="textMain">
                    {{
                      $t('faultToWorkorder.execute_on', 'Execute On', {
                        ns: 'rule',
                      })
                    }}
                  </FText>

                  <FContainer>
                    <FText appearance="captionReg12" color="textCaption">
                      {{
                        $t(
                          'faultToWorkorder.define_close',
                          'Define when workorder creation should be executed',
                          { ns: 'rule' }
                        )
                      }}
                    </FText>
                  </FContainer>
                </FContainer>

                <FContainer>
                  <FSelect
                    v-model="closeEvent.activityType"
                    :placeholder="
                      $t('faultToWorkorder.select', 'Select', {
                        ns: 'rule',
                      })
                    "
                    :disabled="!closeWoStatus"
                    :options="closeWoActivityType"
                    size="large"
                  >
                  </FSelect>

                  <FaultToWoFields
                    v-if="isCloseFieldChange"
                    :workflowRule="closeWorkflowRule"
                    :module="moduleName"
                    @selectedFields="addCloseWoFields"
                    :isEdit="isEdit"
                  />
                  <SchedulerForRuleWo
                    v-if="isCloseOnDate"
                    :moduleFields="moduleFields"
                    :module="moduleName"
                    :workflowRule="closeWorkflowRule"
                    @schedulerFields="addClosedateField"
                    :isEdit="isEdit"
                  />
                </FContainer>

                <FContainer
                  borderRadius="high"
                  border="1px solid"
                  backgroundColor="backgroundMidgroundSubtle"
                  borderColor="borderNeutralBaseSubtler"
                  padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
                >
                  <FText appearance="headingMed14" color="textMain">
                    {{ $t('criteria', 'CRITERIA', { ns: 'common' }) }}
                  </FText>

                  <FContainer>
                    <FText appearance="captionReg12" color="textCaption">
                      {{
                        $t(
                          'faultToWorkorder.close_criteria',
                          'Change Workorder State if Existing Workorder matches the below criteria"',
                          { ns: 'rule' }
                        )
                      }}
                    </FText>
                  </FContainer>
                  <NewCriteriaBuilder
                    ref="criteriaBuilder"
                    v-model="closeWoCriteria"
                    :moduleName="actionModule"
                    :disabled="!closeWoStatus"
                  />
                </FContainer>
              </FContainer>
              <FContainer
                borderRadius="high"
                border="1px solid"
                borderColor="borderNeutralBaseSubtler"
                padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
                gap="containerXLarge"
                display="flex"
                flexDirection="column"
              >
                <FContainer>
                  <FText appearance="headingMed14" color="textMain">
                    {{
                      $t('faultToWorkorder.action', 'ACTION', {
                        ns: 'rule',
                      })
                    }}
                  </FText>
                  <FContainer>
                    <FText appearance="captionReg12" color="textCaption">
                      {{
                        $t(
                          'faultToWorkorder.workorder_status',
                          'Workorder Status',
                          { ns: 'rule' }
                        )
                      }}
                    </FText>
                  </FContainer>
                </FContainer>
                <FContainer>
                  <FSelect
                    v-model="closeWoAction.templateJson.new_state"
                    :placeholder="
                      $t('faultToWorkorder.select', 'Select', {
                        ns: 'rule',
                      })
                    "
                    :disabled="!closeWoStatus"
                    :options="statusList"
                    size="large"
                  >
                  </FSelect>
                </FContainer>
              </FContainer>

              <FContainer
                borderRadius="high"
                border="1px solid"
                borderColor="borderNeutralBaseSubtler"
                padding="sectionSmall containerXxLarge sectionSmall containerXxLarge"
              >
                <FText appearance="headingMed14">Enable Comments</FText>
                <FContainer float="right">
                  <FSwitch
                    v-model="includeCloseComments"
                    @change="closeComment = !closeComment"
                    :disabled="!closeWoStatus"
                    >{{
                      $t(
                        'faultToWorkorder.include_commands',
                        'Include Commends',
                        { ns: 'rule' }
                      )
                    }}
                    ></FSwitch
                  >
                </FContainer>

                <FContainer
                  v-if="closeComment"
                  width="100%"
                  paddingTop="containerXLarge"
                >
                  <FTextArea
                    appearance="bodyReg14"
                    color="textCaption"
                    v-model="closeWorkflowRule.comments.close"
                    :min-rows="1"
                    type="textarea"
                    :autosize="{ minRows: 1, maxRows: 1 }"
                    :placeholder="
                      $t('faultToWorkorder.enter_commands', 'Enter Comment', {
                        ns: 'rule',
                      })
                    "
                    :disabled="!closeWoStatus"
                  >
                  </FTextArea>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </template>
      <template #footer-buttons>
        <FButton
          v-if="showPrevButton"
          appearance="tertiary"
          size="medium"
          iconGroup="navigation"
          iconName="left"
          iconPosition="prefix"
          @click="prevPageButtonClick"
        >
          {{ prevButtonName }}
        </FButton>
        <FButton
          appearance="primary"
          size="medium"
          iconGroup="navigation"
          iconPosition="suffix"
          @click="nextPageButtonClick"
        >
          {{ saveButtonText }}
        </FButton>
      </template>
    </MultiStepperForm>
  </FContainer>
</template>

<script>
import { MultiStepperForm } from '@facilio/ui/new-forms'
import { NewCriteriaBuilder } from '@facilio/criteria'
import getProperty from 'dlv'
import { dset as setProperty } from 'dset'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { getFieldOptions } from '../../../utils/picklist'
import FaultToWoFields from './FaultToWoFields.vue'
import SchedulerForRuleWo from './SchedulerForRuleWo.vue'
import { mapState, mapActions } from 'pinia'
import viewStore from '../../../store/views'
import sortBy from 'lodash/sortBy'
import Constants from '../../../utils/constants'
import {
  FContainer,
  FIcon,
  FButton,
  FModal,
  FSpinner,
  fDialog,
  FInput,
  FRow,
  FCol,
  FForm,
  FFormItem,
  FText,
  FSelect,
  FSwitch,
  FCheckbox,
  FTextArea,
  FDivider,
} from '@facilio/design-system'
import dlv from 'dlv'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { ftoast } from '@facilio/design-system'
export default {
  components: {
    ftoast,
    NewCriteriaBuilder,
    FaultToWoFields,
    SchedulerForRuleWo,
    FContainer,
    FIcon,
    FButton,
    FSpinner,
    fDialog,
    FInput,
    FRow,
    FCol,
    FFormItem,
    FForm,
    FText,
    FSelect,
    FSwitch,
    FCheckbox,
    FModal,
    FTextArea,
    FDivider,
    MultiStepperForm,
  },
  props: [
    'visibility',
    'modules',
    'moduleName',
    'ruleId',
    'rulename',
    'isEdit',
    'details',
  ],
  data() {
    return {
      prevButtonName: 'Prev',
      isLastPage: false,
      formDescription: this.$t(
        'faultToWorkorder.form_header',
        'Automatically generate a Workorder according to the configuration defined below when a Fault occurs',
        { ns: 'rule' }
      ),

      stepData: ['Workorder Creation', 'Workorder Closure'],
      loadFormFlds: true,
      errorMessage: '',
      error: '',
      ticketpriority: [],
      isloading: false,
      comments: null,
      closeEvent: {
        moduleName: 'newreadingalarm',
        activityType: 2048,
      },
      wofields: [],
      closefields: [],
      templates: [],
      woModuleFields: [],
      status: true,
      updateComments: null,
      woStatus: true,
      statusActions: [],
      alarmWo: {
        actionType: 11,
        templateJson: {
          formId: null,
          fieldMatcher: [],
        },
      },
      closeWoAction: {
        actionType: 12,
        templateJson: { new_state: null },
      },
      workflowRule: {
        scheduleType: 3,
        ruleType: 48,
        event: {
          moduleName: 'newreadingalarm',
          activityType: 549755813888,
        },
        actions: [],
        status: true,
        name: null,
        fields: [],
        interval: null,
        dateFieldId: -1,
        woCriteria: {},
        comments: {
          create: null,
          skip: null,
        },
        isSkip: false,
        id: null,
        isRecommendationAsTask: true,
        isPossibleCauseAsDesc: true,
      },
      includeComments: true,
      includeCommentsOnSkip: true,
      closeWoCriteria: null,
      woFormFields: [],
      picklistOptions: [],
      assets: null,
      fields: [],
      categoryMetric: null,
      closeWorkflowRule: {
        name: '',
        scheduleType: 3,
        ruleType: 48,
        fields: [],
        interval: null,
        dateFieldId: -1,
        actions: [],
        comments: { close: null },
        woCriteria: {},
        status: true,
        id: null,
      },
      includeCloseComments: true,
      reqWoFields: [],
      moduleFields: [],
      optionalWoFields: [],
      closeWoFields: [],
      dateFieldToExclude: [
        'sysCreatedTime',
        'sysModifiedTime',
        'sysDeletedTime',
      ],
      beforeDateFieldsToExclude: ['createdTime', 'modifiedTime'],
      dateFieldName: ['DATE', 'DATE_TIME'],
      metawoInfo: {},
      statusList: [],
      closeState: null,
      currentPageNumber: 1,
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.initForm()
  },
  computed: {
    ...mapState(viewStore, {
      metaInfo: 'metaInfo',
    }),
    activityTypes() {
      let { workFlowActionHash } = this
      let activity = [
        'On Date',
        'Field Change',
        'On each Alarm Occurrence',
        'Clear',
      ]
      let { activityTypes } = workFlowActionHash
      let activityTypesList = []
      if (activityTypes) {
        activityTypes.forEach(types => {
          if (activity.includes(types.label)) {
            activityTypesList.push(types)
          }
        })
      }
      activityTypesList = sortBy(activityTypesList, ['label'])
      return activityTypesList || []
    },
    isOndate() {
      let { activityType } = this
      return activityType === 'On Date'
    },
    isFieldChange() {
      let { activityType } = this
      return activityType === 'Field Change'
    },
    isCloseOndate() {
      let { closeActivityType } = this
      return closeActivityType === 'On Date'
    },
    isCloseFieldChange() {
      let { closeActivityType } = this
      return closeActivityType === 'Field Change'
    },
    workFlowActionHash() {
      let { WorkFlowAction } = Constants
      let { module } = WorkFlowAction
      return module['newreadingalarm']
    },
    alarmFieldMatcher() {
      let { alarmWo } = this
      let { templateJson = {} } = alarmWo
      let { fieldMatcher = [] } = templateJson
      return fieldMatcher
    },
    closeActivityType() {
      let { activityTypes, closeEvent = {} } = this
      let { activityType } = closeEvent || {}
      let activity = []
      if (activityTypes) {
        activity = activityTypes.filter(types => types.value === activityType)
      }
      let label = getProperty(activity[0], 'label')
      return label
    },
    saveButtonText() {
      let { isLastPage } = this
      if (isLastPage) {
        return this.$t('faultToWorkorder.save_changes', 'Save Changes', {
          ns: 'rule',
        })
      }
      return this.$t('faultToWorkorder.next', 'Next', {
        ns: 'rule',
      })
    },
    activityType() {
      let { activityTypes, workflowRule } = this || {}
      let { event } = workflowRule
      let { activityType } = event || {}
      let activity = []
      if (activityTypes) {
        activity = activityTypes.filter(types => types.value === activityType)
      }
      return activity[0].label || {}
    },
    showPrevButton() {
      let { currentPageNumber } = this
      return currentPageNumber > 1
    },
    closeWoStatus() {
      let { closeWorkflowRule = {} } = this
      let { status } = closeWorkflowRule
      return status
    },
    skipComment() {
      let { includeCommentsOnSkip } = this
      return includeCommentsOnSkip
    },
    createComment() {
      let { includeComments } = this
      return includeComments
    },
    closeComment() {
      let { includeCloseComments } = this
      return includeCloseComments
    },
    createWoActivityType() {
      let { activityTypes } = this || []
      let activity = []
      if (activityTypes) {
        activity = activityTypes.filter(types => types.value !== 2048)
      }
      return activity
    },
    activeStep() {
      let { stepData, currentPageNumber } = this
      return stepData[currentPageNumber - 1]
    },
    closeWoActivityType() {
      let { activityTypes } = this
      let activity = []
      if (activityTypes) {
        activity = activityTypes.filter(types => types.value !== 549755813888)
      }
      return activity
    },
    actionModule() {
      return 'workorder'
    },
    formId() {
      let { alarmWo } = this
      let { templateJson } = alarmWo || {}
      let { formId } = templateJson || {}
      if (!isEmpty(formId)) {
        return formId
      }
      return null
    },
    fieldMatch() {
      let { alarmWo } = this
      let { templateJson } = alarmWo
      let { fieldMatcher } = templateJson
      return fieldMatcher
    },
  },
  methods: {
    ...mapActions(viewStore, ['loadModuleMeta']),
    async init() {
      this.loadModuleMeta('newreadingalarm').then(meta => {
        this.moduleFields = meta.fields
      })
    },
    lookupCondition(fieldMatcher) {
      let { fieldObj } = fieldMatcher
      let { displayType, dataTypeEnum } = fieldObj || {}
      return dataTypeEnum === 'LOOKUP' || displayType === 'LOOKUP_SIMPLE'
    },
    pickList(fieldMatcher) {
      let { field } = fieldMatcher
      let { picklistOptions = {} } = this
      let values = []
      if (picklistOptions[field]) {
        values = picklistOptions[field]
      }
      return values
    },
    dataTypeEnum(fieldMatcher) {
      let { fieldObj } = fieldMatcher
      let { dataTypeEnum } = fieldObj || {}
      return dataTypeEnum
    },
    async loadWoTicketStatus(moduleName) {
      let response = await API.get(
        `v2/state/${moduleName}/list?parentModuleName=${moduleName}`
      )
      let status = getProperty(response, 'data.status')
      this.loadTicketPriority()
      this.woStatusList(status)
    },
    woStatusList(status) {
      let { closeWoAction, statusList, isEdit } = this
      let { templateJson } = closeWoAction

      status.forEach(m => {
        let data = {
          label: m.displayName,
          value: m.id,
        }
        statusList.push(data)
      })
      this.closeState = statusList.filter(state => state.label === 'Closed')

      if (!isEdit) {
        setProperty(templateJson, 'new_state', this.closeState[0]?.value)
      }
    },
    currentStepHandler(isLastPage, currentStep) {
      this.isLastPage = isLastPage
      this.currentPageNumber = currentStep
    },

    async initForm() {
      this.loading = true
      await this.loadWoTemplates(this.actionModule)
      await this.loadWoTicketStatus(this.actionModule)
      this.addRowWO()
      await this.initPrefill()
      this.skipactions()
      this.loading = false
    },
    async initPrefill() {
      let { isEdit } = this
      if (isEdit) {
        await this.prefill()
      }
    },

    changeDataType(criteria) {
      let { fieldObj, dateObject, valueArray } = criteria || {}
      let { dataTypeEnum } = fieldObj || {}
      if (['DATE_TIME', 'DATE'].includes(dataTypeEnum)) {
        if (dateObject) {
          let interval = this.daysHoursMinuToSec(dateObject)
          criteria.value = interval * 1000 // second to milliseconds
        }
      } else {
        if (valueArray) {
          criteria.value = { id: valueArray }
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
    statusFieldName(selectedField, index) {
      let { field } = selectedField || {}
      let { alarmWo, picklistOptions } = this
      let { templateJson } = alarmWo || {}
      let { fieldMatcher } = templateJson || {}

      if (!isEmpty(field)) {
        let fld = this.woFormFields.filter(
          field => !isEmpty(field) && field.meta.id === selectedField.field
        )
        fieldMatcher[index].field = selectedField.field
        fieldMatcher[index].fieldObj = fld[0].meta.field
        fieldMatcher[index].isSpacePicker = false
        fieldMatcher[index].columnName = fld[0].meta.field.completeColumnName

        if (!isEmpty(fld)) {
          let { field, lookupModuleName, name, id } = fld[0].meta || {}
          let { dataTypeEnum, specialType, lookupModule } = field || {}

          if (lookupModuleName === 'site') {
            this.$set(fieldMatcher[index].fieldObj, 'dataTypeEnum', 'LOOKUP')
            this.loadPickList(lookupModuleName, 'siteId')
          }
          if (dataTypeEnum === 'ENUM') {
            this.$set(picklistOptions, id, field.enumMap)
          }
          if (dataTypeEnum === 'LOOKUP' && specialType) {
            this.loadSpecialTypePickList(specialType, id)
          } else if (dataTypeEnum === 'LOOKUP' && lookupModule) {
            if (lookupModule.name === 'ticketstatus') {
              this.$set(picklistOptions, id, this.statusList)
            } else if (lookupModule.name === 'ticketpriority') {
              this.$set(picklistOptions, id, this.ticketpriority)
            } else {
              this.loadPickList(lookupModule.name, id)
            }
          }
        }
      }
    },
    prevPageButtonClick() {
      this.$refs['multi-stepper-form'].moveToPrevPage()
    },
    nextPageButtonClick() {
      if (this.isLastPage) {
        this.saveForm()
      }
      this.nextButtonLoading = true
      this.$refs['multi-stepper-form'].moveToNextPage()
      this.nextButtonLoading = false
    },
    async loadTicketPriority() {
      let { error, options = [] } = await getFieldOptions({
        field: {
          lookupModuleName: 'ticketpriority',
          skipDeserialize: true,
        },
        defaultIds: [],
      })
      if (isEmpty(error)) {
        options = (Object.keys(options) || []).map(key => {
          return { value: key, label: options[key] }
        })
        this.ticketpriority = options || []
      }
    },
    skipactions() {
      let { closeWorkflowRule } = this
      let { status } = closeWorkflowRule
      setProperty(this, 'includeCloseComments', status)
    },
    async addRowWO() {
      let { alarmWo } = this
      let { templateJson } = alarmWo || {}
      let { fieldMatcher } = templateJson || {}

      fieldMatcher.push({
        field: '',
        isSpacePicker: false,
        value: null,
        parseLabel: null,
        valueArray: null,
        dateObject: {},
        fieldObj: null,
      })
    },

    loadCategoryMetric(id) {
      this.$util.loadAssetReadingFields(-1, id).then(fields => {
        this.categoryMetric = fields
      })
      this.$util
        .loadAsset({ withReadings: true, categoryId: id })
        .then(response => {
          this.assets = []
          this.assets.push({
            id: '${workorder.resource.id}',
            name: 'Current Asset',
          })
          this.assets.push(...response.assets)
        })
    },
    async prefill() {
      let { details } = this || {}
      let { woCreation: workOrderCreation } = details || {}
      let { closeWo } = details || {}
      if (!isEmpty(workOrderCreation)) {
        let workflowRule = getProperty(details, 'woCreation')
        setProperty(this, 'workflowRule', workflowRule)
        this.dateObj = getProperty(workOrderCreation, 'interval')

        this.alarmWo.templateJson = getProperty(
          workOrderCreation.actions[0].template,
          'originalTemplate'
        )

        setProperty(workOrderCreation, 'status', true)
        let { formId } = this || {}
        await this.loadWOFormFields(formId, false)

        let i = 0
        let { alarmWo } = this
        let { templateJson } = alarmWo
        let { fieldMatcher } = templateJson
        fieldMatcher.forEach(field => {
          this.statusFieldName(field, i)
          i++
        })
      }

      if (!isEmpty(closeWo)) {
        let { closeWoAction } = this
        let closeWorkflowRule = getProperty(details, 'closeWo')
        setProperty(this, 'closeWorkflowRule', closeWorkflowRule)
        let { woCriteria } = closeWo || {}

        setProperty(this, 'closeWoCriteria', woCriteria)
        setProperty(
          closeWoAction,
          'templateJson',
          closeWo.actions[0].template.additionInfo
        )
        this.closeEvent.activityType = getProperty(
          closeWo.event,
          'activityType'
        )
      }
    },
    deleteAction(idx) {
      this.workflowRule.actions.splice(idx, 1)
      this.closeWorkflowRule.actions.splice(idx, 1)
    },
    serializeData() {
      let { rulename } = this
      let { workflowRule = {}, closeWorkflowRule = {} } = this
      setProperty(workflowRule, 'name', rulename)
      setProperty(closeWorkflowRule, 'name', rulename)

      this.setAction()
      if (!this.validateForm(workflowRule)) {
        return false
      }

      delete workflowRule.commentsJsonStr
      delete closeWorkflowRule.commentsJsonStr
      if (isEmpty(this.closeWoCriteria)) {
        this.setDefaultCloseCriteria()
      }

      closeWorkflowRule = {
        ...closeWorkflowRule,
        woCriteria: this.closeWoCriteria,
      }
      if (!this.validateForm(this.closeWorkflowRule)) {
        return false
      }
      let ruleWoData = { woCreation: workflowRule, closeWo: closeWorkflowRule }

      return ruleWoData
    },
    setDefaultCloseCriteria() {
      let { closeState } = this
      let criteria = {
        conditions: {
          1: {
            fieldName: 'moduleState',
            operatorId: 37,
            value: closeState[0].value,
          },
        },
        pattern: '( 1 )',
      }
      setProperty(this, 'closeWoCriteria', criteria)
    },
    setAction() {
      let { workflowRule, alarmWo } = this || {}
      let { isEdit } = this
      if (isEdit) {
        this.deleteAction(0)
      }
      if (!isEmpty(alarmWo)) {
        let { actions, event } = workflowRule || {}
        let { templateJson } = alarmWo
        let { fieldMatcher } = templateJson
        fieldMatcher.forEach(d => {
          if (!isEmpty(d.fieldObj)) {
            setProperty(d, 'fieldObj', null)
          }
        })
        actions.push(alarmWo)
        setProperty(workflowRule, 'activityType', event.activityType)
      }

      if (!isEmpty(this.closeWorkflowRule)) {
        let { closeWorkflowRule, closeWoFields } = this || {}
        let { actions } = closeWorkflowRule || {}
        let { closeEvent } = this || {}

        actions.push(this.closeWoAction)
        setProperty(this.closeWorkflowRule, 'event', closeEvent)
        setProperty(
          this.closeWorkflowRule,
          'activityType',
          closeEvent.activityType
        )
        this.closeWorkflowRule = {
          ...closeWorkflowRule,
          fields: closeWoFields,
        }
      }
    },
    checkComments() {
      let { closeComment, createComment, skipComment } = this
      let { closeWorkflowRule, workflowRule } = this
      if (!skipComment) {
        setProperty(workflowRule, 'comments.skip', null)
      }
      if (!createComment) {
        setProperty(workflowRule, 'comments.create', null)
      }
      if (!closeComment) {
        setProperty(closeWorkflowRule, 'comments.close', null)
      }
    },
    addCloseWoFields(selectedFields) {
      let fields = []
      selectedFields.forEach(d => {
        fields.push(d)
      })
      setProperty(this, 'closeWoFields', fields)
    },
    addWoCreationFields(selectedFields) {
      let { workflowRule } = this || {}
      this.workflowRule = { ...workflowRule, fields: selectedFields }
    },

    async saveForm() {
      let { isEdit } = this
      this.isloading = true
      let ruleWoData = this.serializeData()
      this.checkComments()
      if (ruleWoData) {
        if (isEdit) {
          this.updateRuleWorkOrder(ruleWoData)
        } else {
          this.addRuleWorkOrder(ruleWoData)
        }
      }
    },
    closeForm() {
      let { name } =
        findRouteForModule('newreadingrules', pageTypes.OVERVIEW) || {}
      let params = { viewname: 'all', id: this.ruleId }
      this.$router.push({ name, params }) || {}
    },

    async updateRuleWorkOrder(ruleWoData) {
      let url = 'v3/readingrule/actions/updateRuleWo'
      let { error, data } = await API.post(url, {
        faultToWorkorder: ruleWoData,
        ruleId: this.ruleId,
      })
      if (error) {
        this.isloading = false
        ftoast.critical('Error Occured')
      } else {
        this.closeForm()
        ftoast.success('FDD to Workorder Form successfully Updated')
      }
    },
    async addRuleWorkOrder(ruleWoData) {
      let url = 'v3/readingrule/actions/addRuleWo'
      let { error, data } = await API.post(url, {
        faultToWorkorder: ruleWoData,
        ruleId: this.ruleId,
      })
      if (error) {
        this.isloading = false
        ftoast.critical('Error Occured')
      } else {
        this.closeForm()
        ftoast.success('FDD to Workorder Form successfully configured')
      }
    },

    async loadWoTemplates(moduleName) {
      let { alarmWo, isEdit } = this
      let url = `/v2/${moduleName}/forms?moduleName=${moduleName}`
      this.isLoading = true
      let { data, error } = await API.get(url)
      if (error) {
        let { message } = error
        ftoast.critical(message)
      } else {
        let { forms = [] } = data || {}
        forms.map(template => {
          this.templates.push({
            label: template.displayName,
            value: template.id,
          })
        })
        let form = getProperty(this, 'templates.0.value')
        if (!isEdit) {
          setProperty(alarmWo.templateJson, 'formId', form)
          await this.loadWOFormFields(form, true)
        }
      }
    },
    loadSpecialTypePickList(specialType, fieldName) {
      let pickOption = {}
      let store = this.$store.state
      if (specialType === 'users') {
        let { users } = store
        let userList = users
        pickOption['$' + '{LOGGED_USER}'] = 'Current User'
        for (let user of userList) {
          pickOption[user.id] = user.name
        }
        setProperty(this.picklistOptions, fieldName, pickOption)
      } else if (specialType === 'groups') {
        let { groups } = store
        let groupList = groups
        for (let group of groupList) {
          pickOption[group.groupId] = group.name
        }
        setProperty(this.picklistOptions, fieldName, pickOption)
      } else if (specialType === 'basespace') {
        let { spaces } = store
        let spaceList = spaces
        for (let space of spaceList) {
          pickOption[space.id] = space.name
        }
        setProperty(this.picklistOptions, fieldName, pickOption)
      } else if (specialType === 'alarmType') {
        setProperty(
          this.picklistOptions,
          fieldName,
          this.$constants.AlarmCategory
        )
      } else if (specialType === 'sourceType') {
        setProperty(this.picklistOptions, fieldName, this.$constants.SourceType)
      }
    },
    async loadPickList(moduleName, id) {
      let { error, options } = await getFieldOptions({
        field: { lookupModuleName: moduleName, skipDeserialize: true },
      })

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        let values = []
        Object.entries(options).forEach(([key, value]) => {
          values.push({ label: value, value: key })
        })
        this.$set(this.picklistOptions, id, values)
      }
    },
    async loadWOFormFields(formId, change) {
      this.loadFormFlds = false
      if (formId > 0) {
        let url = `/v2/forms/workorder?formId=${formId}`
        let { data, error } = await API.get(url)
        if (error) {
          let { message } = error
          ftoast.critical(message)
        } else {
          let { form } = data || {}
          let { fields } = form || {}
          let formFields = []
          fields.map(fld => {
            if (!isEmpty(fld.field) && fld.name !== 'siteId')
              formFields.push({
                label: fld.displayName,
                value: fld.id,
                required: fld.required,
                meta: fld,
              })
          })
          setProperty(this, 'woFormFields', formFields)
          await this.filterWoFormFields(change)
        }
      }
    },
    async filterWoFormFields(change) {
      let { woFormFields } = this
      this.reqWoFields = woFormFields.filter(
        fld => !isEmpty(fld) && fld.required === true
      )
      this.optionalWoFields = woFormFields.filter(
        fld => !isEmpty(fld) && fld.meta.required === false
      )
      if (this.reqWoFields) {
        let { alarmWo } = this
        let { templateJson } = alarmWo
        let { fieldMatcher } = templateJson
        if (change) {
          let i = 0
          fieldMatcher.splice(0, fieldMatcher.length)
          this.reqWoFields.forEach(d => {
            if (!isEmpty(d.meta.name)) {
              this.addRowWO()
              setProperty(fieldMatcher[i], 'field', d.meta.id)
              if (d.meta.name === 'subject') {
                setProperty(
                  fieldMatcher[i],
                  'value',
                  '${newreadingalarm.subject}'
                )
              }
              this.statusFieldName(fieldMatcher[i], i)
              ++i
            }
          })
        }
      }
      this.loadFormFlds = true
    },
    disableFormFieldSelect(index) {
      let { reqWoFields } = this
      if (index < reqWoFields.length) {
        return true
      }
      return false
    },

    deleteRow(index) {
      this.alarmWo.templateJson.fieldMatcher.splice(index, 1)
    },
    addWodateField(scheduleFields) {
      let { dateFieldId, scheduleType, dateObject, checkDateTimeField } =
        scheduleFields || {}
      let { workflowRule } = this || {}
      setProperty(workflowRule, 'dateFieldId', dateFieldId)
      setProperty(workflowRule, 'scheduleType', scheduleType)
      this.dateField(workflowRule, dateObject, checkDateTimeField)
    },
    addClosedateField(scheduleFields) {
      let { dateFieldId, scheduleType, dateObject, checkDateTimeField } =
        scheduleFields || {}
      let { closeWorkflowRule } = this || {}
      setProperty(closeWorkflowRule, 'dateFieldId', dateFieldId)
      this.$set(closeWorkflowRule, 'scheduleType', scheduleType)
      this.dateField(closeWorkflowRule, dateObject, checkDateTimeField)
    },
    dateField(workflowRule, dateObject, checkDateTimeField) {
      workflowRule.interval = null
      let { closeEvent } = this
      if (
        closeEvent.activityType === 524288 ||
        parseInt(workflowRule.event.activityType) === 524288
      ) {
        if (dateObject) {
          if (workflowRule.dateFieldId) {
            if (!checkDateTimeField) {
              dateObject.hours = null
              dateObject.minute = null
            }
          }
          if (
            workflowRule.scheduleType === 1 ||
            workflowRule.scheduleType === 3
          ) {
            workflowRule.interval = this.daysHoursMinuToSec(dateObject)
          } else {
            workflowRule.interval = null
          }
        }
      }
      if (!workflowRule.dateFieldId) {
        delete workflowRule.dateFieldId
        delete workflowRule.interval
      }
      if (workflowRule.dateFieldId && this.checkDateTimeField) {
        workflowRule.time = null
      }
    },
    validateWoFormFields(ruleData) {
      this.error = false
      let validate = true
      let { reqWoFields } = this
      let { actions } = ruleData || {}
      let { templateJson = {} } = actions[0]
      let { fieldMatcher } = templateJson
      reqWoFields.forEach(fld => {
        if (fld.name !== 'siteId') {
          let val = fieldMatcher.filter(val => fld.meta.id === val.field)
          if (isEmpty(val[0]) || (!val[0]?.value && isEmpty(val[0].value))) {
            validate = false
          }
        }
      })
      return validate
    },
    validateForm(ruleData) {
      this.error = false
      let { actions } = ruleData || {}
      if (ruleData.event.activityType === 524288) {
        if (!ruleData.dateFieldId) {
          this.isloading = false
          this.error = true
          ftoast.critical('Please select field for on date activity')
          return false
        }
        if (ruleData.scheduleType === 3) {
          if (!ruleData.interval) {
            this.isloading = false
            this.error = true
            ftoast.critical('Please select duration')
            return false
          }
        }
      } else if (ruleData.event.activityType === 1048576) {
        if (!ruleData.fields || !ruleData.fields.length > 0) {
          this.error = true
          this.isloading = false
          ftoast.critical(
            'Please select atleast on field for field change activity'
          )
          return false
        }
      }
      if (!isEmpty(actions[0].templateJson.fieldMatcher)) {
        if (!this.validateWoFormFields(ruleData)) {
          this.error = true
          this.isloading = false
          ftoast.critical('Please fill mandatory form fields')
          return false
        }
      }
      return true
    },
  },
}
</script>
<style scoped>
.pm-form-container {
  position: absolute !important;
  top: 0px !important;
  left: 0px !important;
  height: 100vh !important;
  width: 100% !important;
  background: #ffffff;
  overflow: hidden;
}
</style>
