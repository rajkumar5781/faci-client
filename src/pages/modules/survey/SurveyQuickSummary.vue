<template>
  <FModal
    title="Satisfaction Survey"
    :visible="showSurveyOverview"
    size="M"
    type="default"
    :hideFooter="true"
    @cancel="handleCancel"
  >
    <FContainer
      paddingTop="containerXxLarge"
      paddingBottom="containerXxLarge"
      paddingLeft="sectionSmall"
      paddingRight="sectionSmall"
      height="50%"
      ><FContainer
        display="flex"
        flexDirection="column"
        gap="containerXLarge"
        paddingBottom="containerXxLarge"
      >
        <FContainer width="100%">
          <FTags text="Survey Details" />
        </FContainer>
        <FContainer width="100%">
          <div>
            <FText
              appearance="headingMed14"
              color="backgroundNeutralInverseHovered"
            >
              {{ getDisplayName }}
            </FText>
          </div>
          <div>
            <FText
              appearance="bodyReg14"
              color="backgroundNeutralInverse"
              textAlign="justify"
            >
              {{ subject }}
            </FText>
          </div>
        </FContainer>
        <FContainer display="flex" width="100%">
          <FContainer width="25%">
            <div>
              <FText
                appearance="headingMed14"
                color="backgroundNeutralInverseHovered"
              >
                {{
                  $t('survey.fields.survey_respondent', 'Survey Respondent', {
                    ns: 'survey',
                  })
                }}
              </FText>
            </div>
            <FContainer
              display="flex"
              flex-direction="row"
              gap="containerMedium"
            >
              <FAvatar
                size="XS"
                :avatarUrl="surveyResponseData?.assignedTo?.avatarUrl"
              />

              <FText
                appearance="bodyReg14"
                color="backgroundNeutralInverse"
                textAlign="justify"
              >
                {{
                  surveyResponseData?.assignedTo?.name
                    ? surveyResponseData.assignedTo.name
                    : '---'
                }}
              </FText>
            </FContainer>
          </FContainer>
          <FContainer width="25%">
            <div>
              <FText
                appearance="headingMed14"
                color="backgroundNeutralInverseHovered"
                >{{
                  $t('survey.fields.response_date', 'Response Date', {
                    ns: 'survey',
                  })
                }}
              </FText>
            </div>
            <div>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralInverse"
                textAlign="justify"
              >
                {{ formatDate(surveyResponseData?.createdTime) || '---' }}
              </FText>
            </div>
          </FContainer>
          <FContainer width="25%" v-if="isNotPortal">
            <div>
              <FText
                appearance="headingMed14"
                color="backgroundNeutralInverseHovered"
              >
                {{ fieldsMap.totalScore }}
              </FText>
            </div>
            <div>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralInverse"
                textAlign="justify"
              >
                <FTags :text="getTotalScore(surveyResponseData)" />
              </FText>
            </div>
          </FContainer>
          <FContainer width="25%" v-if="isNotPortal">
            <div>
              <FText
                appearance="headingMed14"
                color="backgroundNeutralInverseHovered"
              >
                {{ fieldsMap.scorePercent }}
              </FText>
            </div>
            <div>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralInverse"
                textAlign="justify"
              >
                <FTags :text="getScorePercent(surveyResponseData)" />
              </FText>
            </div>
          </FContainer>
        </FContainer>
      </FContainer>
      <FDivider width="100%" />
      <FContainer paddingTop="containerXxLarge">
        <FTags
          :text="
            $t('survey.fields.survey_response', 'Survey Response', {
              ns: 'survey',
            })
          "
        />
        <FContainer paddingTop="containerXLarge">
          <SurveyResponseSummaryWidget
            v-if="id && showSurveyOverview"
            :pagesData="getPageData"
            :moduleName="moduleName"
            :id="id"
            :fitMyContent="true"
          >
          </SurveyResponseSummaryWidget>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import {
  FAvatar,
  FModal,
  FTooltip,
  FTextArea,
  FContainer,
  FButton,
  FRecordDetails,
  FTags,
  FTabPane,
  FTabs,
  FDivider,
  FText,
  FIcon,
  FEmptyState,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { formatDate } from '../../../utils/formatter'
import SurveyResponseSummaryWidget from './QAndAWidget.vue'
import { findRouteForModule, pageTypes, getApp } from '@facilio/router'

export default {
  props: ['showSurveyOverview', 'id'],
  data() {
    return {
      fieldsMap: {},
      subject: '---',
      moduleName: 'surveyResponse',
      surveyResponseData: {},
      appCategory: {
        PORTALS: 1,
      },
    }
  },

  components: {
    FAvatar,
    FTooltip,
    FModal,
    FIcon,
    FTextArea,
    FContainer,
    FButton,
    FRecordDetails,
    FTags,
    FTabPane,
    FTabs,
    FEmptyState,
    FDivider,
    FText,
    ftoast,
    SurveyResponseSummaryWidget,
  },
  async created() {
    await this.init()
  },
  watch: {
    async id(newVal, oldVal) {
      if (newVal !== oldVal) {
        // this.id = newVal
        await this.getRecord(this.id)
      }
    },
  },
  computed: {
    getDisplayName() {
      let { serviceRequestId } = this.surveyResponseData || {}
      let { workOrderId } = this.surveyResponseData || {}
      let displayName = ''
      if (isEmpty(serviceRequestId)) {
        displayName = this.fieldsMap.workOrderId
        this.subject = workOrderId?.subject
      } else if (isEmpty(workOrderId)) {
        displayName = this.fieldsMap.serviceRequestId
        this.subject = serviceRequestId?.subject
      }
      return displayName
    },
    getPageData() {
      return this.surveyResponseData?.template?.pages
    },
    isNotPortal() {
      let { appCategory } = getApp()
      return !(appCategory == this.appCategory.PORTALS)
    },
  },
  methods: {
    async getRecord(id) {
      console.log('created')

      this.loading = true
      let { error, data } = await API.get(
        '/v3/modules/data/summary?id=' + id + '&moduleName=' + this.moduleName
      )
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        let { surveyResponse } = data || {}
        this.surveyResponseData = surveyResponse || {}
      }
      this.loading = false
    },
    formatDate,
    async init() {
      await this.getRecord(this.id)
      await this.getModuleMeta()
    },
    handleCancel(val) {
      this.showSurveyOverview = false
    },
    async getModuleMeta() {
      let { data } = await API.get(`/module/meta?moduleName=` + this.moduleName)
      if (!isEmpty(data)) {
        let { meta } = data || {}
        let { fields = [], module } = meta || {}
        let fieldsMap = {}
        fields.forEach(field => {
          fieldsMap[field.name] = field.displayName
        })
        this.fieldsMap = fieldsMap
      }
    },
    getScorePercent(surveyResponseData) {
      let { scorePercent } = surveyResponseData
      return !isEmpty(scorePercent) ? scorePercent + '%' : '---'
    },
    getTotalScore(surveyResponseData) {
      let { totalScore, fullScore } = surveyResponseData
      return !isEmpty(totalScore) && !isEmpty(fullScore)
        ? totalScore + '/' + fullScore
        : '--- / ---'
    },
  },
}
</script>
