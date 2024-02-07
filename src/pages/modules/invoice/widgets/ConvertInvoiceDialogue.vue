<template>
  <div>
    <FModal
      title="Choose Invoice type"
      :visible="visibility"
      saveText="Create"
      size="XS"
      @ok="handleOk"
      @cancel="close"
      :hideFooter="false"
    >
      <FContainer padding="sectionSmall sectionXSmall">
        <FText appearance="captionReg12"> Invoice type </FText>
        <FSelect
          v-model="invoiceType"
          :options="invoiceOptions"
          :multiple="false"
          size="large"
          placeholder="Choose Invoice type"
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
  ftoast,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import router from '../../../../router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'InvoiceTypeSelect',

  props: ['details', 'visibility', 'invoiceOptions'],
  data() {
    return {
      invoiceType: null,
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
  methods: {
    close() {
      this.$emit('closeInvoiceConvert')
    },
    handleOk() {
      this.createInvoice()
      this.$emit('closeInvoiceConvert')
    },
    async createInvoice() {
      let { name } = findRouteForModule('invoice', pageTypes.CREATE) || {}
      let { invoiceType, details } = this
      if (invoiceType) {
        let query = { invoiceId: details.id, conversionType: invoiceType }
        let { href } =
          router.resolve({
            name,
            query,
          }) || {}

        if (!isEmpty(href)) {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      } else {
        ftoast.critical('Select any Invoice Type to convert')
      }
    },
  },
}
</script>
