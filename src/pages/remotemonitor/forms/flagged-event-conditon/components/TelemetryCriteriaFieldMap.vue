<template>
  <FContainer display="flex" flexDirection="column">
    <FForm
      :ref="`flagged-alarm-control-action-${index}`"
      :uniqueId="`flagged-alarm-control-action-${index}`"
      :model="telemetryCriteriaForm"
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
              v-model="telemetryCriteriaForm.category"
              :field="lookupFields.assetCategory"
              moduleName="flaggedAlarmProcess"
              :hideLookupIcon="true"
              @input="onCategoryChange"
            >
            </Lookup>
          </FFormItem>
        </FContainer>
        <FContainer
          flexBasis="45%"
          :key="`ca-${telemetryCriteriaForm.category}`"
        >
          <FFormItem
            :hideLabel="true"
            :label="
              $t('field_names.telemetry_criteria', {
                ns: 'remote_monitor',
              })
            "
            prop="telemetryCriteria"
            :required="true"
          >
            <Lookup
              v-model="telemetryCriteriaForm.telemetryCriteria"
              :field="getTelemetryCriteriaField"
              moduleName="flaggedAlarmProcess"
              :hideLookupIcon="true"
              :disabled="disableCriteria"
              @input="onCriteriaChange"
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
            @click="remoteItem()"
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
  props: [
    'index',
    'isNew',
    'total',
    'categories',
    'telemetryCriteria',
    'category',
  ],
  data() {
    return {
      telemetryCriteriaForm: {
        category: this.category,
        telemetryCriteria: this.telemetryCriteria,
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
              displayName: this.$t('field_names.asset_category', {
                ns: 'remote_monitor',
              }),
            },
          },
        },
      },
    }
  },
  computed: {
    restrictDelete() {
      let { total } = this
      return total <= 1
    },
    getTelemetryCriteriaField() {
      let { telemetryCriteriaForm = {} } = this
      let { category } = telemetryCriteriaForm
      let field = {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'telemetryCriteria',
        placeHolderText: this.$t('field_names.telemetry_criteria', {
          ns: 'remote_monitor',
        }),
        field: {
          lookupModule: {
            name: 'telemetryCriteria',
            displayName: this.$t('field_names.telemetry_criteria', {
              ns: 'remote_monitor',
            }),
          },
        },
      }
      let filters = {}
      if (!isEmpty(category)) {
        filters.assetCategory = {
          operatorId: 36,
          value: [category.toString()],
        }
      }
      field.filters = filters
      return field
    },
    disableCriteria() {
      let { telemetryCriteriaForm = {} } = this
      let { category } = telemetryCriteriaForm
      return isEmpty(category)
    },
    cursorType() {
      let { restrictDelete } = this
      return restrictDelete ? 'not-allowed' : 'pointer'
    },
  },
  methods: {
    remoteItem() {
      if (!this.restrictDelete) {
        this.$emit('remove')
      }
    },
    onCategoryChange(category) {
      let { index } = this
      this.$emit('categorySelect', { index, category })
      if (isEmpty(category)) {
        this.controlAction = null
        this.onCriteriaChange(null)
        this.telemetryCriteriaForm.telemetryCriteria = null
      }
    },
    onCriteriaChange(telemetryCriteriaId) {
      let { index } = this
      this.$emit('onCriteriaChange', { index, telemetryCriteriaId })
    },
  },
}
</script>
