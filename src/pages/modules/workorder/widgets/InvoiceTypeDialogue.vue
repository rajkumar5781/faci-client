<template>
  <div>
    <FModal
      :title="`Choose ${conversionModuleField}`"
      :visible="visibility"
      saveText="Create"
      size="XS"
      @ok="handleOk"
      @cancel="close"
      :hideFooter="false"
    >
      <FContainer padding="sectionSmall sectionXSmall">
        <FText appearance="captionReg12"> {{ conversionModuleField }} </FText>
        <FSelect
          v-model="conversionType"
          :options="options"
          :multiple="false"
          size="large"
          :placeholder="`Choose ${conversionModuleField}`"
        />
      </FContainer>
    </FModal>
  </div>
</template>
<script>
import getProperty from 'dlv'
import {
  FContainer,
  FDivider,
  FIcon,
  FButton,
  FModal,
  FText,
  FRadioGroup,
  FSelect,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import router from '../../../../router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'InvoiceTypeSelect',

  props: ['details', 'visibility', 'options', 'moduleName'],
  data() {
    return {
      conversionType: null,
    }
  },
  components: {
    FContainer,
    FDivider,
    FIcon,
    FButton,
    FModal,
    FText,
    FRadioGroup,
    FSelect,
  },
  computed: {
    workorder() {
      return this.details
    },
    conversionModuleField() {
      let { moduleName } = this
      if (moduleName === 'invoice') {
        return 'Invoice Type'
      }
      return 'Quote Type'
    },
  },
  methods: {
    close() {
      this.conversionType = null
      this.$emit('closeConvertType')
    },
    handleOk() {
      this.createInvoice()
      this.conversionType = null
      this.$emit('closeConvertType')
    },
    async createInvoice() {
      let { conversionType, workorder, moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}

      let query = { workorder: workorder.id, conversionType }
      let { href } =
        router.resolve({
          name,
          query,
        }) || {}

      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
  },
}
</script>
