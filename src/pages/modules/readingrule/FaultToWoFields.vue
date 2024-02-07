<template>
  <FContainer gap="containerMedium" display="flex" flexDirection="column">
    <FText appearance="captionReg12" color="textMain">
      {{ $t('faultToWorkorder.fields', 'Fields', { ns: 'rule' }) }}
      {{ selectedFieldLength > 0 ? '(' + selectedFieldLength + ')' : '' }}
    </FText>
    <FContainer>
      <FSelect
        v-model="selectedFields"
        @change="addFields"
        :multiple="true"
        :placeholder="
          $t('faultToWorkorder.select', 'Select', {
            ns: 'rule',
          })
        "
        size="large"
        :options="moduleFields"
      >
      </FSelect>
    </FContainer>
    <FButton
      v-if="selectedFieldLength < 3"
      slot="reference"
      class="all-rule-btn"
    ></FButton>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FFormItem,
  FButton,
  FSelect,
  FText,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
export default {
  components: {
    FContainer,
    FFormItem,
    FButton,
    FSelect,
    FText,
  },
  data() {
    return {
      selectedFields: [],
      metaInfo: {},
      multiple: true,
    }
  },
  created() {
    this.getMetaFields()
    let { isEdit } = this
    if (isEdit) {
      let { workflowRule } = this || {}
      let { fields } = workflowRule || []
      if (!isEmpty(fields)) {
        this.selectedFieldObject = []
        fields.map(field => {
          this.selectedFields.push(
            parseInt(getProperty(field, 'fieldId', null))
          )
        })
        this.$emit('selectedFields', fields)
      }
    }
  },
  props: ['workflowRule', 'module', 'isEdit'],
  computed: {
    moduleFields() {
      if (!isEmpty(this.metaInfo)) {
        let fields = getProperty(this.metaInfo, 'fields', [])
        return fields.map((field, key) => ({
          label: field.displayName,
          id: field.id,
          value: field.id,
        }))
      }
      return []
    },
    selectedFieldLength() {
      let { selectedFields } = this
      return selectedFields.length
    },
  },
  methods: {
    async getMetaFields() {
      let { module } = this
      if (module) {
        let url = `/module/meta?moduleName=${module}`
        let { data } = await API.get(url, {
          module,
        })
        this.metaInfo = getProperty(data, 'meta', null)
      }
    },
    addFields() {
      let { selectedFields } = this || []
      let fields = []
      selectedFields.forEach(field => {
        fields.push({ fieldId: field })
      })
      this.$emit('selectedFields', fields)
    },
  },
}
</script>
