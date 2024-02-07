<template>
  <FModal
    :title="getDisplayNameForTransition(transition)"
    :visible="true"
    :cancelText="$t('cancel', { ns: 'common' })"
    :saveText="$t('update', { ns: 'common' })"
    size="S"
    :hideFooter="false"
    :confirmLoading="isLoading"
    @ok="addTransition"
    @cancel="handleCancel"
  >
    <FForm ref="attendance-transition-form" :model="formModel">
      <FContainer padding="containerXxLarge" width="100%">
        <FContainer paddingBottom="containerXxLarge" width="100%">
          <FFormItem
            label="Date"
            prop="date"
            :hideLabel="false"
            id="attendance-transition-form-date"
            :required="true"
          >
            <DatePicker
              type="date-time"
              v-model="formModel.date"
              :account="$account"
              :disabled="!isAdmin"
              @change="loadBreakOnDateChange"
            />
          </FFormItem>
        </FContainer>
        <FContainer
          paddingBottom="containerXxLarge"
          width="100%"
          v-if="showBreak"
        >
          <FFormItem
            label="Break"
            prop="break"
            :hideLabel="false"
            id="attendance-transition-form-break"
            :required="true"
          >
            <FSelect
              v-model="formModel.break"
              :options="breakOptions"
              :placeholder="$t('break', { ns: 'attendance' })"
              :loading="breakListLoading"
              :disabled="!showBreak"
              size="medium"
            >
            </FSelect>
          </FFormItem>
        </FContainer>
        <FContainer paddingBottom="containerXxLarge" width="100%">
          <FFormItem
            label="Description"
            prop="description"
            :hideLabel="false"
            id="attendance-transition-form-description"
            :required="false"
          >
            <FTextArea
              v-model="formModel.description"
              :placeholder="$t('enter_here', { ns: 'attendance' })"
            />
          </FFormItem>
        </FContainer>
      </FContainer>
    </FForm>
  </FModal>
</template>
<script>
import { API } from '@facilio/api/dist/index.mjs'
import {
  FModal,
  FSelect,
  FTextArea,
  FForm,
  FContainer,
  FFormItem,
  ftoast,
} from '@facilio/design-system'
import { DatePicker } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'
import { getDisplayNameForTransition } from './AttendanceMixin'
import getProperty from 'dlv'

export default {
  components: {
    FModal,
    DatePicker,
    FSelect,
    FTextArea,
    FForm,
    FContainer,
    FFormItem,
  },
  props: ['transition', 'isAdmin', 'peopleId'],
  data() {
    return {
      isLoading: false,
      formModel: {
        date: null,
        break: null,
        description: null,
      },
      breakOptions: [],
      breakListLoading:false
    }
  },
  async created() {
    let { showBreak, peopleId } = this
    const today = new Date().valueOf()
    this.$set(this.formModel, 'date', today)
    if (!isEmpty(peopleId) && showBreak) {
      await this.fetchEmployeeShift(today, today, peopleId)
      await this.loadBreakList()
    }
  },
  computed: {
    showBreak() {
      return this.transition === 'BREAK'
    },
  },
  methods: {
    getDisplayNameForTransition,
    async addTransition() {
      let { peopleId = null, formModel = {}, transition = null } = this
      let { date = null, break : shiftBreak = null, description = null } = formModel || {}
      this.isLoading = true
      const sourceType = 'WEB'

      if (date && transition && sourceType && peopleId) {
        const transaction = {
          transactionTime: date,
          transactionType: transition,
          sourceType,
          people: { id: peopleId },
        }

        if (shiftBreak) {
          transaction.shiftBreak = { id: shiftBreak }
        }

        if (description) {
          transaction.notes = description
        }
        const { error } = await API.post('/v3/attendance/addTransaction', {
          data: transaction,
        })
        if (error) {
          let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
        } else {
          this.$emit("transitionSuccess",peopleId)
          this.formModel = {
          date: null,
          break:null,
          description:null
          }
        }
      }
      this.isLoading = false
      this.$emit('closeTransitionModal')
    },
    handleCancel() {
      this.$emit('closeTransitionModal')
    },
    async loadBreakOnDateChange() {
      let { peopleId, showBreak } = this
      this.breakOptions = []
      let date = getProperty(this.formModel, 'date', null)
      if (date && showBreak) {
        await this.fetchEmployeeShift(date, date, peopleId)
        await this.loadBreakList()
      }
    },
    async fetchEmployeeShift(rangeFrom, rangeTo, peopleId) {
      this.employeeShift = null
      let url = '/v3/shiftplanner/view'
      let { error, data } = await API.get(url, { rangeFrom, rangeTo, peopleId })
      if (error) {
        let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        let { shifts = [] } = data
        if (!isEmpty(shifts)) {
          this.employeeShift = data.shifts[0]
        }
      }
    },
    async loadBreakList() {
      let shiftId = getProperty(this.employeeShift, 'shiftId', null)
      this.breakListLoading = true
      if (shiftId) {
        let url = '/v3/attendance/picklist/break'
        let params = {
          page: 1,
          perPage: 50,
          viewName: 'hidden-all',
          filters: JSON.stringify({
            shifts: {
              operatorId: 90,
              value: [String(shiftId)],
            },
          }),
        }
        let { error, data } = await API.get(url, params)
        if (error) {
          return { error }
        } else {
          let { pickList: options } = data || {}
          this.breakOptions = options || []
        }
      }
      this.breakListLoading = false
    },
  },
}
</script>
