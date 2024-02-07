<template>
  <FContainer padding="containerXLarge">
    <FForm
      :ref="`rollup-criteria-form-${index}`"
      uniqueId="rollup-criteria-form"
      :model="criteriaObj"
      position="top"
      :rules="formRules"
    >
      <FContainer
        v-if="isRollupRuleType"
        width="25%"
        marginBottom="containerXxLarge"
      >
        <FFormItem
          prop="assetCategoryId"
          :label="
            $t('field_names.asset_category', {
              ns: 'remote_monitor',
            })
          "
        >
          <Lookup
            v-model="criteriaObj.assetCategoryId"
            :field="lookupFields.assetCategory"
            size="small"
          />
        </FFormItem>
      </FContainer>
      <FContainer
        display="flex"
        rowGap="containerXxLarge"
        flexWrap="wrap"
        width="75%"
      >
        <template v-if="loading">
          <FContainer width="30%" paddingRight="containerXxLarge">
            <FShimmer :height="42" />
          </FContainer>
          <FContainer width="30%">
            <FShimmer :height="42" />
          </FContainer>
          <FContainer width="60%">
            <FShimmer :height="78" />
          </FContainer>
        </template>
        <template v-else>
          <FContainer
            v-if="isRollupRuleType"
            class="form-two-column-30"
            paddingRight="containerXxLarge"
          >
            <FFormItem
              prop="relationshipId"
              :label="
                $t('field_names.asset_relation', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FSelect
                v-model="criteriaObj.relationshipId"
                :options="relationOptions"
                :placeholder="
                  $t('alarm_filter_rule.select_asset_relation', {
                    ns: 'remote_monitor',
                  })
                "
                size="small"
              />
            </FFormItem>
          </FContainer>
          <FContainer class="form-two-column-30">
            <FFormItem
              prop="alarmDuration"
              :label="
                $t('field_names.duration', {
                  ns: 'remote_monitor',
                })
              "
            >
              <DurationTag
                v-model="criteriaObj.alarmDuration"
                placeholder="DD:HH:MM"
                size="small"
              />
            </FFormItem>
          </FContainer>
          <FContainer
            v-if="canShowWeightageField"
            paddingLeft="containerXxLarge"
            class="form-two-column-30"
          >
            <FFormItem
              v-if="isCountType"
              prop="alarmCount"
              :label="
                $t('field_names.weightage', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FInput
                v-model="criteriaObj.alarmCount"
                :placeholder="countPlaceholder"
                type="number"
                size="small"
                @slotClicked="toggleWeightageType"
              >
                <template #clickable>
                  <FText appearance="captionReg12">
                    {{ weightageType }}
                  </FText>
                </template>
              </FInput>
            </FFormItem>
            <FFormItem
              v-if="isPercentageType"
              prop="percentage"
              :label="
                $t('field_names.weightage', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FInput
                v-model="criteriaObj.percentage"
                :placeholder="percentagePlaceholder"
                type="number"
                size="small"
                @slotClicked="toggleWeightageType"
              >
                <template #clickable>
                  <FText appearance="captionReg12">
                    {{ weightageType }}
                  </FText>
                </template>
              </FInput>
            </FFormItem>
          </FContainer>
          <FContainer class="form-one-column-60" :maxlength="4">
            <FFormItem prop="message">
              <template #header>
                <FContainer
                  display="flex"
                  justifyContent="space-between"
                  marginBottom="containerMedium"
                >
                  <FText appearance="captionReg12" color="textMain">
                    {{
                      $t('field_names.message', {
                        ns: 'remote_monitor',
                      })
                    }}
                  </FText>
                  <FText appearance="captionReg12" color="textCaption">
                    {{ remainingCharaters }}
                  </FText>
                </FContainer>
              </template>
              <FTextArea
                v-model="criteriaObj.message"
                :rows="2"
                :maxlength="2000"
                :placeholder="
                  $t('alarm_filter_rule.enter_alarm_message', {
                    ns: 'remote_monitor',
                  })
                "
              />
            </FFormItem>
          </FContainer>
        </template>
      </FContainer>
    </FForm>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FInput,
  FDropdown,
  FTags,
  FCheckbox,
  FForm,
  FFormItem,
  FIcon,
  ftoast,
  FSelect,
  FTextArea,
  FShimmer,
} from '@facilio/design-system'
import { Lookup } from '@facilio/ui/new-forms'
import DurationTag from './DurationTag.vue'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

const RELATION_TYPES = {
  MANY_TO_ONE: 3,
}
export default {
  components: {
    FContainer,
    FText,
    Lookup,
    DurationTag,
    FInput,
    FDropdown,
    FTags,
    FCheckbox,
    FForm,
    FFormItem,
    FIcon,
    FSelect,
    FTextArea,
    FShimmer,
  },
  props: ['criteria', 'index', 'ruleType'],
  data() {
    return {
      loading: false,
      relationOptions: [],
      weightageType: this.$t('field_names.count', {
        ns: 'remote_monitor',
      }),
      canShowRelationEmptyError: false,
      relationsAsMap: {},
      criteriaObj: {
        message: null,
        alarmCount: null,
        alarmDuration: null,
      },
      lookupFields: {
        assetCategory: {
          isDataLoading: false,
          options: [],
          lookupModuleName: 'assetcategory',
          placeHolderText: this.$t('alarm_filter_rule.select_asset_category', {
            ns: 'remote_monitor',
          }),
          field: {
            lookupModule: {
              name: 'assetcategory',
              displayName: 'Asset Category',
            },
          },
        },
      },
      formRules: {
        assetCategoryId: {
          trigger: 'change',
          validator: value => {
            let { isRollupRuleType } = this
            if (isRollupRuleType && isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'alarm_filter_rule.please_select_asset_category',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
        relationshipId: {
          trigger: 'change',
          validator: value => {
            let { isRollupRuleType } = this
            if (isRollupRuleType && isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'alarm_filter_rule.please_select_asset_relation',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
        alarmDuration: {
          trigger: 'change',
          validator: value => {
            if (isEmpty(value) || value <= 0) {
              return {
                errorMessage: this.$t(
                  'alarm_filter_rule.duration_is_mandatory',
                  { ns: 'remote_monitor' }
                ),
                invalid: true,
              }
            }
            return { invalid: false }
          },
        },
        alarmCount: {
          trigger: 'blur',
          validator: value => {
            let { canShowWeightageField, isCountType } = this
            if (canShowWeightageField && isCountType && isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'alarm_filter_rule.weightage_is_mandatory',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
        percentage: {
          trigger: 'blur',
          validator: value => {
            let { canShowWeightageField, isPercentageType } = this
            if (canShowWeightageField && isPercentageType) {
              if (isEmpty(value)) {
                return {
                  errorMessage: this.$t(
                    'alarm_filter_rule.weightage_is_mandatory',
                    {
                      ns: 'remote_monitor',
                    }
                  ),
                  invalid: true,
                }
              } else if (value < 0 || value > 100) {
                return {
                  errorMessage: this.$t(
                    'alarm_filter_rule.enter_valid_percentage',
                    {
                      ns: 'remote_monitor',
                    }
                  ),
                  invalid: true,
                }
              }
            }
          },
        },
        message: {
          trigger: 'blur',
          validator: value => {
            if (isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'alarm_filter_rule.message_is_mandatory',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
            return { invalid: false }
          },
        },
      },
    }
  },
  computed: {
    isRollupRuleType() {
      let { ruleType } = this
      return ruleType === 'ROLL_UP'
    },
    isSiteOfflineRuleType() {
      let { ruleType } = this
      return ruleType === 'SITE_OFFLINE'
    },
    relationshipId() {
      return getProperty(this, 'criteriaObj.relationshipId', -1)
    },
    countPlaceholder() {
      let { isRollupRuleType } = this
      let i18nProp = isRollupRuleType
        ? 'enter_asset_count'
        : 'enter_controller_count'
      return this.$t(`alarm_filter_rule.${i18nProp}`, {
        ns: 'remote_monitor',
      })
    },
    percentagePlaceholder() {
      let { isRollupRuleType } = this
      let i18nProp = isRollupRuleType
        ? 'enter_asset_percentage'
        : 'enter_controller_percentage'
      return this.$t(`alarm_filter_rule.${i18nProp}`, {
        ns: 'remote_monitor',
      })
    },
    assetCategoryId() {
      let assetCategoryId = getProperty(
        this,
        'criteriaObj.assetCategoryId',
        null
      )
      return assetCategoryId
    },
    canShowWeightageField() {
      let { relationshipId, isSiteOfflineRuleType } = this
      if (!isEmpty(relationshipId)) {
        let relationType = getProperty(
          this,
          `relationsAsMap.${relationshipId}.mapping1.relationType`,
          null
        )

        if (relationType == RELATION_TYPES['MANY_TO_ONE']) {
          return true
        }
      }
      return isSiteOfflineRuleType
    },
    isPercentageType() {
      let { weightageType } = this
      return weightageType === '%'
    },
    isCountType() {
      let { weightageType } = this
      let countTypeText = this.$t('field_names.count', {
        ns: 'remote_monitor',
      })
      return weightageType === countTypeText
    },
    remainingCharaters() {
      let { criteriaObj = {} } = this
      let { message = '' } = criteriaObj
      let remainingCharaters = 2000
      let wordVariant = 'characters'
      if (!isEmpty(message)) {
        let messageLength = message?.length
        remainingCharaters = 2000 - messageLength
        if (remainingCharaters == 1) {
          wordVariant = 'character'
        }
      }
      return `${remainingCharaters} ${wordVariant} remaining `
    },
  },
  watch: {
    //this watcher sets value when getback to visited page
    criteria: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.criteriaObj = newVal
        }
      },
      deep: true,
    },
    assetCategoryId(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!isEmpty(oldVal)) {
          this.resetRollupCriteria()
        }
        if (!isEmpty(newVal)) {
          this.loadRelationsForAssetCategory()
        }
      }
    },
    relationshipId(newVal, oldVal) {
      if (!isEmpty(oldVal)) {
        this.canShowRelationEmptyError = isEmpty(newVal)
      } else if (!isEmpty(newVal)) {
        this.canShowRelationEmptyError = false
      }
    },
    canShowWeightageField(newVal, oldVal) {
      if (newVal != oldVal) {
        let { criteriaObj, index } = this
        let criteria = { ...criteriaObj, index, canShowWeightageField: newVal }
        this.$emit('updateCriteria', criteria)
        if (newVal) {
          let { criteria = {} } = this
          let { percentage } = criteria
          if (!isEmpty(percentage)) {
            this.weightageType = '%'
          } else {
            this.weightageType = this.$t('field_names.count', {
              ns: 'remote_monitor',
            })
          }
        }
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      let { criteria = {}, isRollupRuleType } = this
      let { percentage } = criteria
      if (!isEmpty(percentage)) {
        this.weightageType = '%'
      }
      this.criteriaObj = criteria
      if (isRollupRuleType) {
        await this.loadRelationsForAssetCategory()
      }
    },
    toggleWeightageType() {
      let { isPercentageType, criteriaObj, index } = this
      if (isPercentageType) {
        let criteria = { ...criteriaObj, percentage: null, index }
        this.weightageType = this.$t('field_names.count', {
          ns: 'remote_monitor',
        })
        this.$emit('updateCriteria', criteria)
      } else {
        let criteria = { ...criteriaObj, alarmCount: null, index }
        this.weightageType = '%'
        this.$emit('updateCriteria', criteria)
      }
    },
    getSerializedData() {
      let { index } = this
      let criteriaForm = getProperty(
        this,
        `$refs.rollup-criteria-form-${index}`,
        {}
      )
      let valid = true
      if (!isEmpty(criteriaForm)) {
        valid = criteriaForm.validate()
      }
      if (!valid) {
        return { invalid: true }
      }
      return {}
    },
    async loadRelationsForAssetCategory() {
      this.loading = true
      let { criteriaObj = {} } = this
      let { assetCategoryId } = criteriaObj
      if (!isEmpty(assetCategoryId)) {
        let { data = {}, error } = await API.get(
          `/v3/alarmFilterRule/assetRelation/${assetCategoryId}`
        )
        if (!isEmpty(error)) {
          let errorMessage =
            error?.message || this.$t('error_occurred_short_message')
          ftoast.critical(errorMessage)
        } else {
          let { relationsForAssetCategories = [] } = data
          this.constructRelationMappingOptions(relationsForAssetCategories)
          this.constrcutRelationsAsMap(relationsForAssetCategories)
        }
      }
      this.loading = false
    },
    constructRelationMappingOptions(relationsForAssetCategories = []) {
      this.relationOptions = relationsForAssetCategories.map(relation => {
        let { name: label, id: value } = relation
        return { label, value }
      })
    },
    constrcutRelationsAsMap(relationsForAssetCategories = []) {
      this.relationsAsMap = relationsForAssetCategories.reduce(
        (relationsAsMap, relation) => {
          let { id } = relation
          relationsAsMap[id] = relation
          return relationsAsMap
        },
        {}
      )
    },
    resetRollupCriteria() {
      this.criteriaObj = {
        ...this.criteriaObj,
        relationshipId: null,
        alarmDuration: null,
        alarmCount: null,
        percentage: null,
        message: null,
      }
      let { criteriaObj = {}, index } = this
      this.$emit('resetCriteria', { ...criteriaObj, index })
    },
  },
}
</script>
<style lang="scss" scoped>
.form-one-column-60 {
  flex: 0 0 60%;
}
.form-two-column-30 {
  flex: 0 0 30%;
}
</style>
