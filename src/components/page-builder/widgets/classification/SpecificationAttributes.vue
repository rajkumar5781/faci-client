<template>
  <FModal
    :append-to-body="true"
    :visible="true"
    size="S"
    title="ATTRIBUTES"
    @ok="onSave"
    @cancel="closeDialog"
    class="attribute-list-specification"
  >
    <FContainer
      v-if="isEmpty(attributesList)"
      height="400px"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FEmptyState
        :title="
          $t('empty_state_association', 'No Classifications Associated', {
            ns: 'classification',
          })
        "
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else height="400px">
      <FContainer
        class="form-item"
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        padding="containerXLarge"
        gap="containerLarge"
      >
        <FContainer v-for="attr in attributesList" :key="attr.id">
          <FSelect
            v-if="attr.fieldType === dataTypes.BOOLEAN"
            v-model="attr.value"
            :options="options"
            placeholder="Select"
          ></FSelect>

          <FDatePicker
            v-if="attr.fieldType === dataTypes.DATE_TIME"
            v-model="attr.value"
            :placeholder="attr.placeholder"
            :type="attr.displayType"
          />

          <FInput
            v-if="
              [dataTypes.STRING, dataTypes.NUMBER, dataTypes.DECIMAL].includes(
                attr.fieldType
              )
            "
            v-model="attr.value"
            :placeholder="attr.placeholder"
            :type="attr.displayType"
          >
          </FInput>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { dataTypes } from './classificationUtil'
import {
  FModal,
  FButton,
  FContainer,
  FSelect,
  FDatePicker,
  FInput,
  FEmptyState,
} from '@facilio/design-system'

export default {
  props: ['selectedAttributes'],
  components: {
    FModal,
    FButton,
    FContainer,
    FSelect,
    FDatePicker,
    FInput,
    FEmptyState,
  },
  data() {
    return {
      dataTypes,
      attributesList: [],
      isEmpty,
    }
  },
  created() {
    this.init()
  },
  computed: {
    options() {
      return [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ]
    },
  },
  methods: {
    init() {
      if (!isEmpty(this.selectedAttributes)) {
        this.attributesList = (this.selectedAttributes || []).map(attr => {
          let { fieldType, name } = attr || {}
          let { STRING, NUMBER, DECIMAL, DATE_TIME } = dataTypes || {}
          let displayType = null,
            placeholder = ''

          if ([NUMBER, DECIMAL, STRING].includes(fieldType)) {
            displayType = fieldType === STRING ? 'text' : 'number'
            placeholder = `Enter ${name}`
          } else if (fieldType === DATE_TIME) {
            displayType = 'datetime'
            placeholder = this.$t(
              'setup.classification.attributes.select_date_time'
            )
          }

          return { ...attr, displayType, placeholder, value: null }
        })
      }
    },
    closeDialog() {
      this.$emit('onClose')
    },
    onSave() {
      let attributesList = this.attributesList.map(attr => {
        delete attr.displayType
        delete attr.placeholder
        return attr
      })

      this.$emit('onSave', attributesList)
    },
  },
}
</script>
<style lang="scss">
.attribute-list-specification {
  .form-item > * {
    flex: 0 48%;
  }
}
</style>
