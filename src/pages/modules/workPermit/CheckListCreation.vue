<template>
  <FContainer height="100%" width="100%">
    <FModal
      :visible="true"
      @cancel="closeDialog"
      :title="title"
      :hideFooter="false"
      @ok="saveCheckList"
      size="L"
    >
      <FContainer
        display="flex"
        padding="containerXxLarge sectionSmall"
        flexDirection="column"
        alignItems="flexStart"
        gap="sectionMedium"
        width="100%"
      >
        <FContainer v-if="isEmpty(checkListByCategory)">
          <FEmptyState
            :illustration="'add-item'"
            :title="$t('emptyState.message.checkList', { ns: 'workPermit' })"
            :vertical="true"
            :size="'M'"
          />
        </FContainer>
        <FContainer
          height="100%"
          width="100%"
          display="flex"
          overflow="hidden"
          flexDirection="column"
          alignItems="flexStart"
          gap="containerXLarge"
          v-else
          v-for="(checkLists, category) in checkListByCategory"
        >
          <FText appearance="headingMed16" color="textMain">{{
            category
          }}</FText>
          <FContainer
            display="flex"
            gap="sectionSmall"
            flexDirection="column"
            width="100%"
          >
            <FContainer
              v-for="(check, idx) in checkLists"
              height="100%"
              width="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              alignSelf="stretch"
            >
              <FContainer width="60%" marginRight="containerLarge">
                <FText appearance="bodyReg14" color="textMain">
                  {{ idx + 1 + '.' + check.item }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="row"
                gap="containerLarge"
                width="40%"
              >
                <FContainer width="30%">
                  <FSelect
                    v-model="check.required"
                    size="small"
                    :options="options"
                    :clearable="false"
                  ></FSelect>
                </FContainer>
                <FContainer width="70%">
                  <FInput
                    v-model="check.remarks"
                    size="small"
                    :placeholder="placeholder"
                  ></FInput>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FSelect,
  FModal,
  FTable,
  FText,
  FInput,
  ftoast,
  FEmptyState,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import dlv from 'dlv'
export default {
  props: ['title', 'checkListByCategory', 'record'],
  components: {
    FContainer,
    FModal,
    FSelect,
    FText,
    FTable,
    FInput,
    FEmptyState,
  },
  data() {
    return {
      isEmpty,
      selectedOption: true,
      placeholder: 'remarks',
      workPermitFieldId: null,
    }
  },
  async created() {
    await this.loadWorkPermitChecklistModuleMeta()
  },
  computed: {
    options() {
      return [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 2 },
        { label: 'N/A', value: 3 },
      ]
    },
  },
  methods: {
    async saveCheckList() {
      let { checkListByCategory, workPermitFieldId, record } = this
      let { permitStatus = 0 } = record || {}
      let workPemitCheckLists = []
      if (!isEmpty(checkListByCategory)) {
        let keys = Object.keys(checkListByCategory)
        for (let key of keys) {
          let { [key]: checkList } = checkListByCategory
          checkList.map(check => {
            let { required = 1, remarks = '', id } = check || {}
            workPemitCheckLists.push({
              remarks,
              required,
              isReviewed: false,
              checklist: { id },
              workPermit: { id: record.id },
            })
          })
        }
      }
      console.log(workPemitCheckLists)
      let param = {
        id: record.id,
        data: {
          permitStatus: permitStatus + 1,
          relations: {
            workpermitchecklist: [
              { fieldId: workPermitFieldId, data: workPemitCheckLists },
            ],
          },
        },
      }
      let { error } = await API.updateRecord(`workpermit`, param)
      if (!error) {
        this.$emit('refresh')
      } else {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t(
              'api.error.update',
              'Error Occurred while updating checklist',
              { ns: 'workPermit' }
            )
        )
      }
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
        } else {
          ftoast.critical('Work Permit field Not Found')
        }
      }
    },
    closeDialog() {
      this.$emit('onCancel')
    },
  },
}
</script>
