<template>
  <FContainer display="flex" flexDirection="column" rowGap="containerXxLarge">
    <FContainer display="flex" justifyContent="space-between">
      <FText appearance="headingMed14" color="textMain">
        {{
          $t('flagged_event_rule.inhibit_reason_list', { ns: 'remote_monitor' })
        }}
      </FText>
      <FSwitch v-model="showInhibitReasonList" size="small" />
    </FContainer>
    <FContainer
      v-if="showInhibitReasonList"
      display="flex"
      flexDirection="column"
      rowGap="20px"
    >
      <FTable
        v-if="canShowInhibitReasonTable"
        :columns="columns"
        :data="inhibitReasonList"
      >
        <template slot="cell.maxInhibitTime" slot-scope="{ row, prop }">
          <FText>{{ getTimePlaceHolder(row, prop) }}</FText>
        </template>
        <template slot="cell.action" slot-scope="{ row }">
          <FContainer
            marginRight="containerLarge"
            cursor="pointer"
            @click="editInhibitReason(row)"
          >
            <FIcon group="edit" name="edit-line" size="16"></FIcon>
          </FContainer>
          <FContainer cursor="pointer" @click="deleteInhibitReason(row)">
            <FIcon group="action" name="delete" size="16"></FIcon>
          </FContainer>
        </template>
      </FTable>
      <FContainer display="flex" alignItems="center">
        <FContainer
          cursor="pointer"
          marginTop="containerMedium"
          @click="addInhibitReason"
        >
          <FIcon
            group="sign-symbols"
            name="addition"
            size="20"
            color="iconPrimaryDefault"
          ></FIcon>
        </FContainer>
        <FContainer cursor="pointer" @click="addInhibitReason">
          <FText
            marginLeft="containerLarge"
            appearance="headingMed14"
            color="backgroundPrimaryDefault"
          >
            {{
              $t('flagged_event_rule.add_flagged_event_inhibit_reason', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
    <FModal
      v-if="showInhibitReasonForm"
      :visible="showInhibitReasonForm"
      :title="
        $t('flagged_event_rule.add_inhibit_reason', {
          ns: 'remote_monitor',
        })
      "
      :saveText="$t('actions.add')"
      size="S"
      type="default"
      padding="containerNone"
      @cancel="closeInhibitReasonForm"
    >
      <FForm
        ref="inhibit-reason-form"
        uniqueId="inhibit-reason-form"
        :model="selectedInhibitReason"
        position="top"
        :rules="formRules"
        class="inhibit-reason-form"
      >
        <FFormItem
          :label="$t('field_names.inhibit_reason', { ns: 'remote_monitor' })"
          prop="inhibitReason"
        >
          <FInput
            v-model="selectedInhibitReason.inhibitReason"
            :placeholder="
              $t('flagged_event_rule.enter_inhibit_reason', {
                ns: 'remote_monitor',
              })
            "
          ></FInput>
        </FFormItem>
        <FFormItem
          :label="$t('field_names.max_inhibit_time', { ns: 'remote_monitor' })"
          prop="maxInhibitTime"
        >
          <DurationTag
            v-model="selectedInhibitReason.maxInhibitTime"
            placeholder="DD:HH:MM"
          />
        </FFormItem>
      </FForm>
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton type="primary" @click="saveInhibitReason">
            {{ $t('actions.add') }}
          </FButton>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FSwitch,
  FTable,
  FModal,
  FForm,
  FFormItem,
  FInput,
  FButton,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import { getTimeAsListWithDays } from '../../utils/rmHelpers'
import DurationTag from '../../filtered-alarm-condition/components/DurationTag.vue'
export default {
  components: {
    FContainer,
    FText,
    FSwitch,
    FTable,
    FModal,
    FForm,
    FFormItem,
    FInput,
    FButton,
    FIcon,
    DurationTag,
  },
  props: ['isNew', 'bureauName', 'currentBureauDetails'],
  data() {
    return {
      dataDeserialized: false,
      showInhibitReasonList: false,
      showInhibitReasonForm: false,
      columns: [
        { displayName: 'Inhibit Reason', name: 'inhibitReason', id: 1 },
        {
          displayName: 'Max Inhibit Time (min)',
          name: 'maxInhibitTime',
          id: 2,
        },
      ],
      inhibitReasonList: [],
      selectedInhibitReason: {
        index: 0,
        inhibitReason: null,
        maxInhibitTime: null,
      },
      formRules: {
        inhibitReason: {
          required: true,
          message: 'Please Enter Rule Name',
          trigger: 'blur',
        },
        maxInhibitTime: {
          required: true,
          message: 'Please Enter Rule Name',
          trigger: 'blur',
        },
      },
    }
  },
  computed: {
    canShowInhibitReasonTable() {
      let { inhibitReasonList = [] } = this
      return !isEmpty(inhibitReasonList)
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized, inhibitReasonList = [] } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      if (!isEmpty(inhibitReasonList)) {
        inhibitReasonList = inhibitReasonList.map(inhibitReason => {
          let { maxInhibitTime } = inhibitReason
          return { ...inhibitReason, maxInhibitTime }
        })
        return { inhibitReasonList }
      }
      return {}
    },
    deserializeData() {
      let { isNew } = this
      if (!isNew) {
        let { currentBureauDetails = {} } = this
        let { inhibitReasonList = [] } = currentBureauDetails
        this.inhibitReasonList = (inhibitReasonList || []).map(
          (inhibitReason, index) => {
            let { maxInhibitTime } = inhibitReason
            return { ...inhibitReason, index, maxInhibitTime }
          }
        )
        if (!isEmpty(inhibitReasonList)) {
          this.showInhibitReasonList = true
        }
      }
      this.dataDeserialized = true
    },
    getTimePlaceHolder(row, prop) {
      let maxInhibitTime = row[prop] || []
      maxInhibitTime = getTimeAsListWithDays(maxInhibitTime)
      let days = maxInhibitTime[0] || 0
      let hours = maxInhibitTime[1] || 0
      let minutes = maxInhibitTime[2] || 0
      days = days < 10 ? '0' + days : days
      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes
      return `${days}D:${hours}H:${minutes}M`
    },
    addInhibitReason() {
      let { inhibitReasonList = [] } = this
      let length = (inhibitReasonList || []).length
      this.selectedInhibitReason = {
        index: length,
        inhibitReason: null,
        maxInhibitTime: 0,
      }
      this.showInhibitReasonForm = true
    },
    saveInhibitReason() {
      let { inhibitReasonList, selectedInhibitReason } = this
      inhibitReasonList = cloneDeep(inhibitReasonList)
      let { index } = selectedInhibitReason
      inhibitReasonList[index] = selectedInhibitReason
      this.inhibitReasonList = inhibitReasonList
      this.showInhibitReasonForm = false
    },
    editInhibitReason(row) {
      this.selectedInhibitReason = cloneDeep(row)
      this.showInhibitReasonForm = true
    },
    deleteInhibitReason(row) {
      let { index } = row
      let { inhibitReasonList = [] } = this
      inhibitReasonList = cloneDeep(inhibitReasonList)
      inhibitReasonList.splice(index, 1)
      this.inhibitReasonList = (inhibitReasonList || []).map(
        (reasonObj, index) => {
          return { ...reasonObj, index }
        }
      )
    },
    closeInhibitReasonForm() {
      this.showInhibitReasonForm = false
    },
  },
}
</script>

<style lang="scss" scoped>
.inhibit-reason-form {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  padding: 16px 84px;
}
</style>
