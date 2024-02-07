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
      width="50%"
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
            $t('flagged_event_rule.control_action', { ns: 'remote_monitor' })
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
                $t('field_names.add_control_action', {
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
              $t('flagged_event_rule.template_uc', {
                ns: 'remote_monitor',
              })
            }}</FText
          >
        </FContainer>
      </FContainer>
      <FContainer
        v-for="(item, index) in controlActionTemplates"
        :key="`fieldMapping-${item.iterCount}`"
        marginTop="containerXLarge"
      >
        <CAFieldMap
          :ref="`flagged-alarm-control-action-form-${index}`"
          :index="index"
          :key="`fieldMapping-${item.iterCount}`"
          :total="totalItems"
          :category="item.category"
          :template="item.controlActionTemplateId"
          :categories="getAvailableAssetCategories"
          @categorySelect="categorySelect"
          @onCaChange="caSelect"
          @remove="removeControlActionTemplate(index)"
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
import CAFieldMap from './CAFieldMap.vue'
import getProperty from 'dlv'

export default {
  components: {
    FContainer,
    FSpinner,
    Lookup,
    FText,
    FFormItem,
    FForm,
    CAFieldMap,
    FIcon,
    FButton,
  },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      controlActionTemplates: [{ iterCount: 1 }],
      flaggedEventRuleClosureConfig: {},
      woStausOptions: [],
      woCloseStausOptions: [],
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
      let { controlActionTemplates } = this
      return controlActionTemplates.length
    },
    showAddTemplate() {
      let { totalItems } = this
      return totalItems < 5
    },
    getAvailableAssetCategories() {
      let { controlActionTemplates } = this
      let allCategories = controlActionTemplates.map(item => item.category)
      return allCategories
    },
  },
  created() {
    this.init()
  },
  methods: {
    categorySelect(value = {}) {
      let { category, index } = value
      let { controlActionTemplates } = this
      if (!isEmpty(controlActionTemplates)) {
        let templateItem = controlActionTemplates[index] || {}
        this.controlActionTemplates[index] = { ...templateItem, category }
      }
    },
    caSelect(value = {}) {
      let { controlActionTemplateId, index } = value
      let { controlActionTemplates } = this
      if (!isEmpty(controlActionTemplates)) {
        let templateItem = controlActionTemplates[index] || {}
        this.controlActionTemplates[index] = {
          ...templateItem,
          controlActionTemplateId,
        }
      }
    },
    addTemplate() {
      this.iterCount = this.iterCount + 1
      let { controlActionTemplates } = this
      this.controlActionTemplates = [
        ...controlActionTemplates,
        { iterCount: this.iterCount },
      ]
    },
    hideCATemplate(assetCategory) {
      return isEmpty(assetCategory)
    },
    removeControlActionTemplate(index) {
      let { controlActionTemplates = [] } = this
      controlActionTemplates.splice(index, 1)
    },
    async init() {
      this.loading = true
      this.deserializeData()
      this.loading = false
    },
    getSerializedData() {
      let { controlActionTemplates = [] } = this
      let caTemplateIds = []
      let index = 0
      let isValid = true
      controlActionTemplates.map(item => {
        if (!isEmpty(item) && !isEmpty(getProperty(item, 'category'))) {
          isValid = !isEmpty(getProperty(item, 'controlActionTemplateId'))
          caTemplateIds.push({
            id: getProperty(item, 'controlActionTemplateId'),
          })
          index = index + 1
        }
      })
      if (!isValid) {
        return { invalid: true }
      } else {
        return {
          controlActionTemplate: caTemplateIds || [],
        }
      }
    },
    deserializeData() {
      let { isNew, flaggedEventRule = {} } = this
      if (!isNew) {
        let { controlActionTemplate = [] } = flaggedEventRule
        let templates = []
        controlActionTemplate.map(item => {
          templates.push({
            category: getProperty(item, 'assetCategory.id'),
            controlActionTemplateId: getProperty(item, 'id'),
            iterCount: this.iterCount,
          })
          this.itemCount = this.iterCount + 1
        })
        if (isEmpty(templates)) {
          templates = [{ iterCount: 1 }]
        }
        this.controlActionTemplates = templates
      }
    },
  },
}
</script>
