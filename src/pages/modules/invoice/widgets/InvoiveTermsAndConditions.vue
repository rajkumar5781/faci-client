<template>
  <FContainer>
    <FModal
      :title="$t('purchase_order.associate_term', { ns: 'procurement' })"
      :visible="showTandCModel"
      size="S"
      @cancel="closeDialog"
    >
      <FContainer v-if="loading" display="flex" justifyContent="center"
        ><FSpinner :size="30"
      /></FContainer>
      <FContainer v-else>
        <FTable
          v-if="!isTableDataListEmpty"
          :columns="columns"
          :data="termsAndConditionTableList"
          selectType="bulk"
          hideBorder
          :selectedList="selectedTandC"
          @recordSelected="recordSelected"
        ></FTable>
        <FContainer v-else padding="sectionMedium">
          <FEmptyState
            :title="this.$t('purchase_order.no_terms', { ns: 'procurement' })"
            vertical
            size="S"
            illustration="end-of-list"
          />
        </FContainer>
      </FContainer>
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton @click="associateTerms" :loading="saving">
            {{ $t('purchase_order.add_term', { ns: 'procurement' }) }}
          </FButton>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FModal,
  FContainer,
  FButton,
  FTable,
  FSpinner,
  FText,
  ftoast,
  FEmptyState,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isArray, isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import getProperty from 'dlv'
export default {
  props: ['showTandCModel', 'record'],
  components: {
    FModal,
    FContainer,
    FButton,
    FTable,
    FSpinner,
    FText,
    FEmptyState,
  },
  data() {
    return {
      selectedTandC: [],
      termsAndConditionTableList: [],
      loading: false,
      saving: false,
    }
  },
  created() {
    this.loadAllTermsAndConditions()
  },
  computed: {
    isTableDataListEmpty() {
      let { termsAndConditionTableList } = this
      return isEmpty(termsAndConditionTableList)
    },
    columns() {
      return [
        {
          displayName: 'Name',
          name: 'name',
          id: 1,
        },
        {
          displayName: 'Short Description',
          name: 'shortDesc',
          id: 2,
        },
      ]
    },
  },
  methods: {
    getProperty,
    closeDialog() {
      this.$emit('updateTermsVisibility', false)
    },
    async loadAllTermsAndConditions() {
      this.loading = true
      let params = {
        filters: JSON.stringify({
          isPublished: { operatorId: 15, value: ['true'] },
          isRevised: { operatorId: 15, value: ['false'] },
        }),
      }
      let { list = [], error } = await API.fetchAll(
        'termsandconditions',
        params
      )
      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t(
              'purchase_order.error_while_fetching_terms_and_conditions_list',
              { ns: 'procurement' }
            )
        )
      } else {
        let termsAssociated = getProperty(this, 'record.termsAssociated', [])
        let associatedTermsId
        if (isArray(termsAssociated)) {
          associatedTermsId = termsAssociated.map(term =>
            getProperty(term, 'terms.id', -1)
          )
        }
        this.termsAndConditionTableList = list.filter(record => {
          return !associatedTermsId.includes(record.id)
        })
      }
      this.loading = false
    },
    recordSelected(list) {
      this.selectedTandC = cloneDeep(list)
    },
    async associateTerms() {
      let tempTandCList = []
      let { record, selectedTandC } = this
      let { moduleName, id } = record || {}
      selectedTandC.map(tandC => {
        let { id } = tandC || {}
        tempTandCList.push({
          terms: { id },
        })
      })
      let param = {
        termsAssociated: tempTandCList,
        invoiceId: id,
      }
      this.saving = true
      let url = `v3/invoice/associateTerms`
      let { error } = await API.post(url, param)
      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t('purchase_order.unable_to_associate_terms', {
              ns: 'procurement',
            })
        )
      } else {
        ftoast.success(
          this.$t('purchase_order.terms_success_msg', { ns: 'procurement' })
        )
        this.$emit('savedInvoiceTermsCondition')
      }
      this.saving = false
    },
  },
}
</script>
