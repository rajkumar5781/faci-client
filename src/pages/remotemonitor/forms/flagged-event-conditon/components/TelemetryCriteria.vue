<template>
  <FContainer
    height="calc(100% - 24px)"
    width="100%"
    display="flex"
    justifyContent="center"
    marginTop="sectionSmall"
  >
    <FContainer
      height="max-content"
      display="flex"
      flexDirection="column"
      padding="sectionSmall"
      width="100%"
      border="solid 1px"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="high"
    >
      <FContainer
        v-if="loading"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FSpinner :size="30"></FSpinner>
      </FContainer>

      <FContainer
        marginBottom="sectionXSmall"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <FText appearance="headingMed14">
          {{
            $t('flagged_event_rule.telemetric_criteria', {
              ns: 'remote_monitor',
            })
          }}
        </FText>
        <FContainer
          v-if="showAddTemplate"
          @click="addTemplate()"
          display="flex"
          alignItems="center"
          cursor="pointer"
        >
          <FButton
            appearance="secondary"
            size="medium"
            iconGroup="sign-symbols"
            iconName="addition"
            iconPosition="prefix"
          >
            <FText appearance="captionMed12">
              {{
                $t('field_names.add_telemetry_criteria', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
          </FButton>
        </FContainer>
      </FContainer>

      <FContainer
        borderRadius="high"
        backgroundColor="backgroundMidgroundSubtle"
        height="30px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <FContainer flexBasis="50%" paddingLeft="containerXLarge">
          <FText appearance="captionMed10">
            {{
              $t('flagged_event_rule.asset_category_uc', {
                ns: 'remote_monitor',
              })
            }}</FText
          >
        </FContainer>
        <FContainer flexBasis="55%">
          <FText appearance="captionMed10">
            {{
              $t('flagged_event_rule.criteria', {
                ns: 'remote_monitor',
              })
            }}</FText
          >
        </FContainer>
      </FContainer>
      <FContainer
        v-for="(item, index) in telemetryCriteria"
        :key="`fieldMapping-${item.iterCount}`"
        marginTop="containerXLarge"
      >
        <TelemetryCriteriaFieldMap
          :ref="`telemetry-criteria-field-map-form-${index}`"
          :index="index"
          :key="`telemetry-criteria-fieldMapping-${item.iterCount}-${item.category}`"
          :total="totalItems"
          :category="item.category"
          :telemetryCriteria="item.telemetryCriteriaId"
          :categories="getAvailableAssetCategories"
          @categorySelect="categorySelect"
          @onCriteriaChange="handleCriteriaChange"
          @remove="removeCriteria(index)"
        />
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FSpinner,
  FIcon,
  FText,
  FFormItem,
  FForm,
  FButton,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { Lookup } from '@facilio/ui/new-forms'
import TelemetryCriteriaFieldMap from './TelemetryCriteriaFieldMap.vue'
import getProperty from 'dlv'

export default {
  components: {
    FContainer,
    FSpinner,
    Lookup,
    FText,
    FFormItem,
    FForm,
    TelemetryCriteriaFieldMap,
    FIcon,
    FButton,
  },
  props: ['isNew', 'flaggedEventRule', 'fieldName'],
  data() {
    return {
      telemetryCriteria: [{ iterCount: 1 }],
      loading: false,
      controlAction: {
        assetCategory: null,
        controlAction: null,
      },
      iterCount: 1,
    }
  },
  computed: {
    totalItems() {
      let { telemetryCriteria = [] } = this
      return telemetryCriteria.length
    },
    showAddTemplate() {
      let { totalItems } = this
      return totalItems < 5
    },
    getAvailableAssetCategories() {
      let { telemetryCriteria = [] } = this
      let allCategories = telemetryCriteria.map(item => item.category)
      return allCategories
    },
  },
  created() {
    this.init()
  },
  methods: {
    categorySelect(value = {}) {
      let { category, index } = value
      let { telemetryCriteria } = this
      if (!isEmpty(telemetryCriteria)) {
        let templateItem = telemetryCriteria[index] || {}
        if (isEmpty(category)) {
          templateItem = { ...templateItem, telemetryCriteriaId: null }
        }
        this.telemetryCriteria[index] = { ...templateItem, category }
      }
    },
    handleCriteriaChange(value = {}) {
      let { telemetryCriteriaId, index } = value
      let { telemetryCriteria } = this
      if (!isEmpty(telemetryCriteria)) {
        let templateItem = telemetryCriteria[index] || {}
        this.telemetryCriteria[index] = {
          ...templateItem,
          telemetryCriteriaId,
        }
      }
    },
    addTemplate() {
      this.iterCount = this.iterCount + 1
      let { telemetryCriteria } = this
      this.telemetryCriteria = [
        ...telemetryCriteria,
        { iterCount: this.iterCount },
      ]
    },
    hideCATemplate(assetCategory) {
      return isEmpty(assetCategory)
    },
    removeCriteria(index) {
      let { telemetryCriteria = [] } = this
      telemetryCriteria.splice(index, 1)
    },
    async init() {
      this.loading = true
      this.deserializeData()
      this.loading = false
    },
    getSerializedData() {
      let { telemetryCriteria = [], fieldName } = this
      let telemetryCriteriaIds = []
      let isValid = true
      telemetryCriteria.forEach(item => {
        if (!isEmpty(item) && !isEmpty(getProperty(item, 'category'))) {
          isValid = !isEmpty(getProperty(item, 'telemetryCriteriaId'))
          telemetryCriteriaIds.push({
            id: getProperty(item, 'telemetryCriteriaId'),
          })
        }
      })
      if (!isValid) {
        return { invalid: true }
      }
      let telemetryCriteriaValues = {}
      telemetryCriteriaValues[fieldName] = telemetryCriteriaIds
      return telemetryCriteriaValues
    },
    deserializeData() {
      let { isNew, flaggedEventRule = {}, fieldName } = this
      if (!isNew) {
        let telemetryCriteria = getProperty(
          flaggedEventRule,
          `${fieldName}`,
          []
        )
        let templates = []
        telemetryCriteria.forEach(item => {
          templates.push({
            category: getProperty(item, 'assetCategory.id'),
            telemetryCriteriaId: getProperty(item, 'id'),
            iterCount: this.iterCount,
          })
          this.itemCount = this.iterCount + 1
        })
        if (isEmpty(templates)) {
          templates = [{ iterCount: 1 }]
        }
        this.telemetryCriteria = templates
      }
    },
  },
}
</script>
