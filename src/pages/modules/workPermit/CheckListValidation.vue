<template>
  <FModal
    :visible="true"
    @cancel="closeDialog"
    :title="dialogTitle"
    :hideFooter="false"
    :saveText="saveBtnText"
    @ok="updateChecklist"
    size="L"
  >
    <FContainer
      v-if="isLoading"
      height="100px"
      alignItems="center"
      width="100%"
      display="flex"
      justifyContent="center"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer v-else-if="isEmpty(categories)">
      <FEmptyState
        illustration="server"
        size="M"
        :title="emptyStateMsg"
        :vertical="false"
      ></FEmptyState>
    </FContainer>
    <FContainer
      v-else
      v-for="(category, categoryIndex) in categories"
      :key="categoryIndex"
    >
      <FContainer
        display="flex"
        padding="containerLarge sectionSmall"
        alignItems="center"
        gap="48px"
        alignSelf="stretch"
      >
        <FText appearance="headingMed14" color="textMain">
          {{ category.name }}</FText
        >
      </FContainer>
      <FTable
        :showSelect="false"
        :columns="column"
        :data="category.checklist"
        :hideBorder="true"
        :rounded="false"
      >
        <template #[`cell.required`]="{ row, prop }">
          {{ 'Yes' }}
        </template>
        <template #[`cell.name`]="{ row, prop }">
          {{ dlv(row, 'checklist.item', '') }}
        </template>
        <template #[`cell.isReviewed`]="{ row, prop }">
          <FCheckbox
            v-model="row[prop]"
            @change="() => setProps(row, prop)"
          ></FCheckbox>
        </template>

        <template #[`cell.reviewerRemarks`]="{ row, prop }">
          <FInput
            v-model="row[prop]"
            size="small"
            @change="() => setProps(row, prop)"
            :placeholder="placeholder"
          ></FInput>
        </template>
      </FTable>
    </FContainer>
    <!-- </FContainer> -->
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FSpinner,
  ftoast,
  FInput,
  FEmptyState,
  FModal,
  FTable,
  FCheckbox,
  FText,
} from '@facilio/design-system'
import { isArray, isBoolean, isEmpty } from '@facilio/utils/validation'
import dlv from 'dlv'
import { dset } from 'dset'
import isObject from 'lodash/isObject'
export default {
  components: {
    FContainer,
    FModal,
    FText,
    FSpinner,
    FTable,
    FInput,
    FEmptyState,
    FCheckbox,
  },
  props: ['details', 'validationType', 'visibility', 'permitStatus'],
  data() {
    return {
      categories: [],
      isEmpty,
      dlv,
      idx: 0,
      workPermitFieldId: null,
      loading: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    dialogTitle() {
      return this.validationType === 1
        ? 'Review Prerequisites'
        : 'Permit Closeout'
    },
    placeholder() {
      return 'Reviewer Remarks'
    },
    saveBtnText() {
      return this.validationType === 1 ? 'Mark as Reviewed' : 'Mark as Closed'
    },
    isLoading() {
      let { loading } = this
      return loading
    },
    column() {
      return [
        {
          displayName: 'Item Name',
          name: 'name',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Required',
          name: 'required',
          id: 2,
          fixed: true,
        },
        {
          displayName: 'Remarks',
          name: 'remarks',
          id: 3,
          fixed: true,
        },
        {
          displayName: 'Reviewed',
          name: 'isReviewed',
          id: 4,
          fixed: true,
        },
        {
          displayName: 'Reviewer Remarks',
          name: 'reviewerRemarks',
          id: 5,
          fixed: true,
        },
      ]
    },
    emptyStateMsg() {
      let msg = this.$t(
        'emptyState.message.checkList',
        `No Checklist available.`,
        { ns: 'workPermit' }
      )
      return msg
    },
    list() {
      return []
    },
  },
  methods: {
    async init() {
      this.loading = true
      await this.loadWorkPermitChecklistModuleMeta()
      let categories = this.getChecklistforValidation(
        this.details.checklist,
        this.validationType
      )
      dset(this, 'categories', categories)
      this.loading = false
    },
    setProps(row, prop) {
      let { categories } = this
      categories.map(category => {
        let { checklist } = category
        checklist.map(item => {
          if (item.id === row.id) {
            item[prop] = row[prop]
          }
        })
      })
      console.log(categories)
    },
    async loadWorkPermitChecklistModuleMeta() {
      let { data, error } = await API.get(
        '/v2/modules/meta/workpermitchecklist'
      )
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t(
              'api.error.meta',
              'Error Occured while fetching Work permit checklist module meta',
              { ns: 'workPermit' }
            )
        )
      } else {
        let fields = dlv(data, 'meta.fields', [])
        let workpermitField = fields.find(field => field.name === 'workPermit')
        if (!isEmpty(workpermitField)) {
          this.workPermitFieldId = workpermitField.id
          if (!isEmpty(this.model)) {
            dset(this, 'model.checklist.fieldId', this.workPermitFieldId)
          }
        } else {
          ftoast.critical('Work Permit field Not Found')
        }
      }
    },
    getChecklistforValidation(list = [], validationType) {
      let categories = []
      list.forEach(permitChecklist => {
        let checklist = dlv(permitChecklist, 'checklist', {})
        let checklistCategory = dlv(checklist, 'category', {})
        if (
          checklist.validationType === validationType &&
          !isEmpty(checklistCategory) &&
          permitChecklist.required === 1
        ) {
          dset(
            permitChecklist,
            'isReviewed',
            !isBoolean(permitChecklist.isReviewed) || false
          )
          dset(
            permitChecklist,
            'reviewerRemarks',
            permitChecklist?.reviewerRemarks || ''
          )
          let category = categories.find(c => c.id === checklistCategory.id)
          if (!isEmpty(category) && isObject(category)) {
            category.checklist.push(permitChecklist)
          } else {
            categories.push({
              ...checklistCategory,
              checklist: [permitChecklist],
            })
          }
        }
      })
      return categories || []
    },
    async updateChecklist() {
      let checklist = []
      let { workPermitFieldId: fieldId } = this
      if (!isEmpty(this.categories) && isArray(this.categories)) {
        this.categories.forEach(category => {
          if (!isEmpty(category.checklist)) {
            checklist.push(...category.checklist)
          }
        })
      }
      let param = {
        id: this.details.id,
        data: {
          relations: {
            workpermitchecklist: [{ fieldId, data: checklist }],
          },
        },
      }
      if (this.validationType === 1) {
        dset(param, 'data.isPreValidationDone', true)
      } else if (this.validationType === 2) {
        dset(param, 'data.isPostValidationDone', true)
      }
      dset(param, 'data.permitStatus', this.permitStatus + 1)
      this.saving = true
      let { error } = await API.updateRecord(`workpermit`, param)
      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t(
              'api.error.update',
              'Error Occurred while updating checklist',
              { ns: 'workPermit' }
            )
        )
      } else {
        ftoast.success('Checklist Updated Successfully')
        this.$emit('saved')
        this.closeDialog()
      }
      this.saving = false
    },
    closeDialog() {
      this.$emit('onCancel')
    },
  },
}
</script>
