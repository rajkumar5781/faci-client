<template>
  <FContainer display="flex" flexDirection="column">
    <FForm
      :ref="`flagged-alarm-control-action-${index}`"
      :uniqueId="`flagged-alarm-control-action-${index}`"
      :model="controlActionForm"
      position="top"
      class="flex flex-col gap-y-8"
    >
      <FContainer display="flex" justifyContent="space-between">
        <FContainer flexBasis="45%">
          <FFormItem
            :hideLabel="true"
            :label="
              $t('field_names.asset_category', {
                ns: 'remote_monitor',
              })
            "
            prop="category"
            :required="true"
          >
            <Lookup
              v-model="controlActionForm.category"
              :field="lookupFields.assetCategory"
              moduleName="flaggedAlarmProcess"
              :hideLookupIcon="true"
              @input="onCategoryChange"
            >
            </Lookup>
          </FFormItem>
        </FContainer>
        <FContainer flexBasis="45%" :key="`ca-${controlActionForm.category}`">
          <FFormItem
            :hideLabel="true"
            :label="
              $t('field_names.control_action_templates', {
                ns: 'remote_monitor',
              })
            "
            prop="template"
            :required="true"
          >
            <Lookup
              v-model="controlActionForm.template"
              :field="getCAField"
              moduleName="flaggedAlarmProcess"
              :hideLookupIcon="true"
              :disabled="disableCA"
              @input="onCaChange"
            >
            </Lookup>
          </FFormItem>
        </FContainer>

        <FContainer
          width="40px"
          height="40px"
          border="solid 2px"
          borderColor="backgroundMidgroundDark"
          borderRadius="medium"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FIcon
            :key="`${total}-item-icon-${index}`"
            @click="removeControlActionTemplate()"
            group="action"
            name="delete"
            size="20"
            :pressable="true"
            color="textCaption"
            :cursor="cursorType"
          />
        </FContainer>
      </FContainer>
    </FForm>
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
import { Lookup } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'

export default {
  components: {
    FContainer,
    FSpinner,
    FIcon,
    Lookup,
    FText,
    FFormItem,
    FForm,
    FButton,
  },
  props: ['index', 'isNew', 'total', 'categories', 'template', 'category'],
  data() {
    return {
      controlActionForm: {
        category: this.category,
        template: this.template,
      },
      lookupFields: {
        assetCategory: {
          isDataLoading: false,
          options: [],
          lookupModuleName: 'assetcategory',
          placeHolderText: this.$t('field_names.asset_category', {
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
    }
  },
  computed: {
    restrictDelete() {
      let { total } = this || {}
      return total <= 1
    },
    getCAField() {
      let { controlActionForm, categories } = this || {}
      let { category } = controlActionForm || {}
      let field = {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'controlActionTemplate',
        placeHolderText: this.$t('field_names.control_action_templates', {
          ns: 'remote_monitor',
        }),
        field: {
          lookupModule: {
            name: 'controlActionTemplate',
            displayName: 'Control Action Template',
          },
        },
      }
      let filters = {
        controlActionTemplateType: {
          operatorId: 54,
          value: ['3'],
        },
      }
      if (!isEmpty(category)) {
        filters.assetCategory = {
          operatorId: 36,
          value: [category.toString()],
        }
      }
      field.filters = filters
      return field
    },
    disableCA() {
      let { controlActionForm } = this || {}
      let { category } = controlActionForm || {}
      return isEmpty(category)
    },
    cursorType() {
      let { restrictDelete } = this
      return restrictDelete ? 'not-allowed' : 'pointer'
    },
  },
  methods: {
    removeControlActionTemplate() {
      if (!this.restrictDelete) {
        this.$emit('remove')
      }
    },
    onCategoryChange(category) {
      let { index } = this || {}
      this.$emit('categorySelect', { index, category })
      if (isEmpty(category)) {
        this.controlAction = null
        this.onCaChange(null)
      }
    },
    onCaChange(controlActionTemplateId) {
      let { index } = this || {}
      this.$emit('onCaChange', { index, controlActionTemplateId })
    },
  },
}
</script>
