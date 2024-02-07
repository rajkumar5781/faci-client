<template>
  <FContainer
    display="flex"
    flexDirection="column"
    :style="formWidthStyle"
    border="solid 1px"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionSmall"
  >
    <FormHeading :formHeading="formHeading" formDescription="" />

    <FContainer marginTop="sectionXSmall">
      <FForm
        ref="scope-form"
        :model="scopeObj"
        :rules="rules"
        :position="labelPosition"
      >
        <FContainer>
          <FContainer>
            <FFormItem
              :label="$t('pm_creation.name', { ns: 'maintenance' })"
              prop="name"
              id="pmv2-form-scope-configuration-name"
              :hideLabel="false"
              :required="true"
            >
              <FInput
                v-model="scopeObj.name"
                :appearance="'default'"
                :placeholder="
                  $t('pm_creation.name_placeholder', { ns: 'maintenance' })
                "
                :disabled="false"
                size="large"
                :wrap="false"
              ></FInput>
            </FFormItem>
          </FContainer>

          <FContainer marginTop="containerXxLarge" display="flex">
            <FContainer marginRight="containerLarge" width="50%">
              <FFormItem
                :label="$t('pm_creation.site', { ns: 'maintenance' })"
                prop="sites"
                id="pmv2-form-scope-configuration-sites"
                :hideLabel="false"
                :required="true"
              >
                <Lookup
                  :field.sync="fields.site"
                  :formModel="scopeObj"
                  moduleName="plannedmaintenance"
                  :placeholder="
                    $t('pm_creation.select_site_placeholder', {
                      ns: 'maintenance',
                    })
                  "
                  :hideLookupIcon="false"
                  @showLookupWizard="showLookupWizard"
                  @recordSelected="setSiteValue"
                />
              </FFormItem>
            </FContainer>

            <FContainer marginLeft="containerLarge" width="50%">
              <FFormItem
                :label="$t('pm_creation.category', { ns: 'maintenance' })"
                prop="sites"
                id="pmv2-form-scope-configuration-sites"
                :hideLabel="false"
                :required="true"
              >
                <AssignmentTypeField
                  v-model="scopeObj.assignmentTypeEnum"
                  :options="categoryOptions"
                  :disabled="isEdit"
                  :placeholder="
                    $t('pm_creation.enter_category_placeholder', {
                      ns: 'maintenance',
                    })
                  "
                  @onScopeChange="toggleCategoryLookup"
                />
              </FFormItem>
            </FContainer>
          </FContainer>

          <FContainer
            v-if="showCategoryLookup"
            marginTop="containerXxLarge"
            display="flex"
            marginRight="containerXxLarge"
          >
            <FContainer width="50%">
              <FFormItem
                :prop="categoryModuleName"
                :label="$t(categoryFieldLabel, { ns: 'maintenance' })"
                :required="true"
              >
                <Lookup
                  :canShowLookupWizard="false"
                  :field="fields[categoryModuleName]"
                  :formModel.sync="scopeObj"
                  :fetchOptionsOnLoad="true"
                  :disabled="isEdit"
                  @recordSelected="setCategoryFieldValue"
                  parentModuleName="plannedmaintenance"
                  :placeholder="
                    $t(categoryFieldPlaceholder, { ns: 'maintenance' })
                  "
                />
              </FFormItem>
            </FContainer>
          </FContainer>
        </FContainer>
      </FForm>
    </FContainer>

    <LookupWizard
      v-if="showLookupFieldWizard"
      :field.sync="fields.site"
      :canShowLookupWizard.sync="showLookupFieldWizard"
      :selectedLookupField="fields.site"
      parentModuleName="plannedmaintenance"
      @setLookupFieldValue="setLookupFieldValue"
    ></LookupWizard>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FButton,
  FForm,
  FFormItem,
  FInput,
  FText,
} from '@facilio/design-system'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import AssignmentTypeField from './AssignmentTypeField.vue'
import { isEmpty, isObject } from '@facilio/utils/validation'
import FormHeading from './FormHeading.vue'
import getProperty from 'dlv'

export default {
  props: [
    'labelPosition',
    'scopeModel',
    'isScopeEdited',
    'isEdit',
    'deletedSiteObj',
    'formWidthStyle',
  ],
  components: {
    FContainer,
    FButton,
    FForm,
    FFormItem,
    FInput,
    FText,
    Lookup,
    LookupWizard,
    AssignmentTypeField,
    FormHeading,
  },
  created() {
    this.init()
  },
  mounted() {
    this.$nextTick(() => {
      let formComponent = this.$refs['scope-form']
      //formComponent.clearValidate()
    })
  },
  data() {
    return {
      rules: {
        name: [
          {
            required: true,
            message: this.$t('common.pm_creation.name_required', {
              ns: 'maintenance',
            }),
            trigger: 'change',
          },
        ],
        assignmentTypeEnum: [
          {
            required: true,
            message: this.$t('common._common.please_select_category', {
              ns: 'maintenance',
            }),
            trigger: 'change',
          },
        ],
        sites: [
          {
            required: true,
            message: this.$t('common.pm_creation.site_required', {
              ns: 'maintenance',
            }),
            trigger: 'blur',
          },
        ],
      },
      scopeObj: {
        name: '',
        sites: [],
        assignmentTypeEnum: null,
        assetCategory: { id: null },
        spaceCategory: { id: null },
        enableLeadTime: false,
        day: 0,
        hour: 0,
        skipWo: false,
      },
      fields: {
        site: {
          isDataLoading: false,
          options: [],
          lookupModuleName: 'site',
          field: {
            lookupModule: {
              name: 'site',
              displayName: 'Site',
            },
          },
          name: 'sites',
          multiple: true,
          forceFetchAlways: true,
          filters: {},
          isDisabled: false,
          config: {},
        },
        assetCategory: {
          name: 'assetCategory',
          lookupModuleName: 'assetCategory',
          config: { canShowLookupWizard: false },
        },
        spaceCategory: {
          name: 'spaceCategory',
          lookupModuleName: 'spaceCategory',
          config: { canShowLookupWizard: false },
        },
      },
      showCategoryLookup: false,
      showLookupFieldWizard: false,
      selectedLookupField: {},
      categoryOptions: [
        { label: 'Assets', value: 'ASSETS' },
        { label: 'Spaces', value: 'SPACES' },
        { label: 'Asset Category', value: 'ASSETCATEGORY' },
        { label: 'Space Category', value: 'SPACECATEGORY' },
        { label: 'Buildings', value: 'BUILDINGS' },
        { label: 'Sites', value: 'SITES' },
        { label: 'Floors', value: 'FLOORS' },
      ],
      initScope: null,
      formHeading: this.$t('pm_creation.pm_details', {
        ns: 'maintenance',
      }),
    }
  },
  computed: {
    categoryModuleName() {
      let moduleName
      let { scopeObj } = this || {}
      let { assignmentTypeEnum } = scopeObj || {}

      if (assignmentTypeEnum === 'SPACECATEGORY') {
        moduleName = 'spaceCategory'
      } else if (assignmentTypeEnum === 'ASSETCATEGORY') {
        moduleName = 'assetCategory'
      }
      return moduleName
    },
    isCategorySelected() {
      let { scopeObj } = this || {}
      let { assignmentTypeEnum } = scopeObj || {}

      return ['SPACECATEGORY', 'ASSETCATEGORY'].includes(assignmentTypeEnum)
    },
    categoryFieldLabel() {
      let { scopeObj } = this || {}
      let { assignmentTypeEnum } = scopeObj || {}

      if (assignmentTypeEnum === 'SPACECATEGORY') {
        return 'pm_creation.space_category'
      } else {
        return 'pm_creation.asset_category'
      }
    },
    categoryFieldPlaceholder() {
      let { scopeObj } = this || {}
      let { assignmentTypeEnum } = scopeObj || {}

      if (assignmentTypeEnum === 'SPACECATEGORY') {
        return 'pm_creation.select_space_category_placeholder'
      } else {
        return 'pm_creation.select_asset_category_placeholder'
      }
    },
  },
  watch: {
    scopeObj: {
      handler(value) {
        let deserializedData = {}
        let { sites, assetCategory, spaceCategory, day, hour } = value
        sites = sites.map(currSite => ({ id: currSite }))
        deserializedData = {
          ...value,
          sites,
          assetCategory: assetCategory,
          spaceCategory: spaceCategory,
          day: !isEmpty(day) ? Number(day) : 0,
          hour: !isEmpty(hour) ? Number(hour) : 0,
        }
        Object.entries(deserializedData).forEach(([key, value]) => {
          if (isObject(value)) {
            let { id } = deserializedData[key] || {}
            if (isEmpty(id)) {
              delete deserializedData[key]
            }
          } else if (isEmpty(value)) {
            delete deserializedData[key]
          }
        })
        this.$emit('onScopeChange', deserializedData)
      },
      deep: true,
    },
    deletedSiteObj: {
      async handler(newVal) {
        let { canRevert, deletedSites } = newVal || {}
        if (canRevert) {
          let { scopeObj, fields } = this
          let { site } = fields || {}
          let { selectedItems = [] } = site || {}
          let { sites = [] } = scopeObj || {}
          let revertedItems = deletedSites.map(value => {
            return { value }
          })

          if (!isEmpty(selectedItems)) {
            selectedItems = [...selectedItems, ...revertedItems]
          }
          if (!isEmpty(sites)) {
            sites = [...sites, ...deletedSites]
          }

          this.$set(this.scopeObj, 'sites', sites)
          this.$set(site, 'selectedItems', selectedItems)
          this.$set(this.fields, 'site', site)
          this.$set(this.selectedLookupField, 'selectedItems', selectedItems)
          this.$emit('update:deletedSiteObj', {
            deletedSiteCount: 0,
            deletedSites: [],
            canRevert: false,
          })
        }
      },
      deep: true,
    },
  },
  methods: {
    init() {
      let { scopeModel, scopeObj } = this || {}
      if (!isEmpty(scopeModel)) {
        let {
          assignmentTypeEnum,
          sites,
          name,
          day,
          hour,
          enableLeadTime,
          skipWo,
        } = scopeModel
        this.initScope = assignmentTypeEnum
        sites = (sites || []).map(site => {
          let { id } = site || {}
          return id
        })
        if (assignmentTypeEnum === 'SPACECATEGORY') {
          let spaceCategory = {
            id: getProperty(scopeModel, 'spaceCategory.id'),
          }
          scopeObj = { ...scopeObj, spaceCategory }
          this.showCategoryLookup = true
        } else if (assignmentTypeEnum === 'ASSETCATEGORY') {
          let assetCategory = {
            id: getProperty(scopeModel, 'assetCategory.id'),
          }
          scopeObj = { ...scopeObj, assetCategory }
          this.showCategoryLookup = true
        }
        this.scopeObj = {
          ...scopeObj,
          assignmentTypeEnum,
          sites,
          name,
          day,
          hour,
          enableLeadTime,
          skipWo,
        }
      }
    },
    showLookupWizard(field, canShow) {
      this.selectedLookupField = field
      this.showLookupFieldWizard = canShow
    },

    setCategoryFieldValue(fieldValue) {
      if (isEmpty(fieldValue)) {
        return
      }
      let { categoryModuleName } = this || {}
      let { value } = fieldValue
      if (isEmpty(value)) {
        return
      }
      console.log(value)
      this.scopeObj[categoryModuleName] = { id: value }
    },
    updateSites(newSites = [], oldSites = []) {
      let { isEdit } = this
      let deletedSiteCount = 0
      let deletedSites = []

      if (isEdit) {
        oldSites.forEach(site => {
          if (!newSites.includes(site)) {
            deletedSiteCount += 1
            deletedSites.push(site)
          }
        })
      }
      this.$emit('update:deletedSiteObj', {
        deletedSiteCount,
        deletedSites,
        canRevert: false,
      })
      this.$set(this.scopeObj, 'sites', newSites)
    },
    setSiteValue(currentSites) {
      let { scopeObj } = this
      let { sites: previousSites } = scopeObj || {}

      currentSites = (currentSites || []).map(site => {
        let { value } = site || {}
        return value
      })
      this.updateSites(currentSites, previousSites)
    },

    setLookupFieldValue(value) {
      let { scopeObj } = this
      let { sites } = scopeObj || {}
      let { field } = value
      let { selectedItems, options } = field
      let selectedItemIds = selectedItems.map(item => item.value)

      this.updateSites(selectedItemIds, sites)
      if (!isEmpty(options)) {
        let ids = options.map(item => item.value)
        let newOptions = selectedItems.filter(item => !ids.includes(item.value))
        options.unshift(...newOptions)
      } else {
        options = [...selectedItems]
      }
      this.$set(this.selectedLookupField, 'options', options)
      this.showLookupFieldWizard = false
    },

    toggleCategoryLookup() {
      let { isCategorySelected, scopeObj, isEdit, initScope } = this || {}
      let { assignmentTypeEnum } = scopeObj || {}
      // During edit and if old scope is not as new then show prompt
      if (isEdit && initScope !== assignmentTypeEnum) {
        this.$emit('update:isScopeEdited', true)
      } else if (isEdit && initScope === assignmentTypeEnum) {
        this.$emit('update:isScopeEdited', false)
      }
      this.$emit('update:isDataEdited', true)
      if (isCategorySelected) {
        this.showCategoryLookup = false
        // TODO: Handle this case while saving.
        // if (['SPACECATEGORY'].includes(assignmentTypeEnum)) {
        //   this.scopeObj = {
        //     ...scopeObj,
        //     assetCategory: null,
        //   }
        // } else if (['ASSETCATEGORY'].includes(assignmentTypeEnum)) {
        //   this.scopeObj = {
        //     ...scopeObj,
        //     spaceCategory: null,
        //   }
        // }
        this.$nextTick(() => {
          this.showCategoryLookup = true
        })
      } else {
        this.showCategoryLookup = false
        this.scopeObj = {
          ...scopeObj,
          assetCategory: null,
          spaceCategory: null,
        }
      }
    },

    cancelLookupWizard() {
      this.showLookupFieldWizard = false
    },

    validate() {
      return this.$refs['scope-form'].validate()
      // return new Promise(resolve => {
      //   this.$refs['scope-form'].validate(valid => {
      //     if (valid) {
      //       resolve(true)
      //     } else {
      //       resolve(false)
      //     }
      //   })
      // })
    },
  },
}
</script>
<style scoped lang="scss">
.new-form-container {
  height: 100%;
  border-radius: 8px;
  display: flex;
  justify-content: center;

  .ant-collapse {
    border: 0px;
    margin-bottom: 2px;
  }

  .ant-collapse-item {
    border-width: 0px 0px 0px !important;
  }

  .ant-collapse-content-box {
    padding: 16px 0px;
  }

  .ant-collapse-content {
    border-top: none;
  }

  .ant-modal-body {
    padding: 4px 24px 14px;
  }
}

.dsm-section-container {
  padding: 24px;
  background-color: #ffffff;
  margin: 1.25rem 0rem 0rem;
  display: flex;
  flex-wrap: wrap;
  border-radius: 8px;
  box-shadow: 0;
  // 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.11),
  // 0 1.6px 3.6px 0 rgba(0, 0, 0, 0.13);

  &:hover {
    box-shadow: 0 0;
    // 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.11),
    // 0 6.4px 14.4px 0 rgba(0, 0, 0, 0.13);
  }
}

.first-dsm-section-container {
  margin: 0px;
}
</style>
