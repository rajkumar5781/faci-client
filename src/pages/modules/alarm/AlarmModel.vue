<template>
  <FModal
    title="Create Workorder"
    saveText="Create"
    :visible="modalVisible"
    size="S"
    type="default"
    padding="containerNone"
    @ok="createWO"
    @cancel="closeDialog"
  >
    <FContainer padding="containerXLarge sectionSmall" height="400px">
      <FContainer marginBottom="containerXxLarge">
        <FContainer marginBottom="containerLarge">
          <FText color="textCaption" appearance="bodyReg14">{{
            $t('alarm.category', 'Category', { ns: 'alarm' })
          }}</FText>
        </FContainer>
        <FSelect
          :options="categoryOptions"
          v-model="alarmRequest.category"
          placeholder="Select"
          :multiple="false"
          :disabled="false"
          :loading="loading"
          filterable
          size="medium"
        />
      </FContainer>
      <FContainer marginBottom="containerXxLarge">
        <FContainer marginBottom="containerLarge">
          <FText
            color="textCaption"
            appearance="bodyReg14"
            marginBottom="containerLarge"
            >{{ $t('alarm.priority', 'Priority', { ns: 'alarm' }) }}</FText
          >
        </FContainer>
        <FSelect
          :options="priorityOptions"
          v-model="alarmRequest.priority"
          placeholder="Select"
          :multiple="false"
          :disabled="false"
          :loading="loading"
          filterable
          size="medium"
        />
      </FContainer>
      <FContainer marginBottom="containerXxLarge">
        <FContainer marginBottom="containerLarge">
          <FText
            color="textCaption"
            appearance="bodyReg14"
            marginBottom="containerLarge"
            >{{ $t('alarm.team_staff', 'Team/Staff', { ns: 'alarm' }) }}</FText
          >
        </FContainer>
        <TeamStaff
          :formModel.sync="alarmRequest"
          :siteId="alarmRequest.siteId"
          :field="assignmentField"
        ></TeamStaff>
      </FContainer>
      <FContainer>
        <FContainer marginBottom="containerLarge">
          <FText
            color="textCaption"
            appearance="bodyReg14"
            marginBottom="containerLarge"
            >{{ $t('alarm.site', 'Site', { ns: 'alarm' }) }}</FText
          >
        </FContainer>
        <FSelect
          :options="siteOptions"
          v-model="alarmRequest.siteId"
          placeholder="Sites"
          :multiple="false"
          :disabled="false"
          :loading="loading"
          filterable
          size="medium"
        />
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import {
  FContainer,
  FSelect,
  FText,
  FModal,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { getFieldOptions } from '../../../utils/picklist'
import NewAlarmMixin from './mixins/NewAlarmMixin'
import { API } from '@facilio/api'
import { TeamStaff } from '@facilio/ui/new-forms'

export default {
  components: {
    FContainer,
    FSelect,
    FText,
    FModal,
    TeamStaff,
  },
  mixins: [NewAlarmMixin],
  props: ['modalVisible', 'woIds', 'moduleName'],
  data() {
    return {
      categoryOptions: [],
      priorityOptions: [],
      siteOptions: [],
      assignmentField: {
        name: 'assignment',
        displayName: 'Assignment',
      },
      alarmRequest: {
        category: null,
        assignment: {
          assignedTo: {
            id: -1,
          },
          assignmentGroup: {
            id: -1,
          },
        },
        siteId: null,
        priority: null,
      },
      loading: true,
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      await this.loadCategoryOptions()
      await this.loadPriorityOptions()
      await this.loadSiteOptions()
      this.loading = false
    },
    async createWO() {
      let {
        moduleName,
        alarmRequest,
        categoryOptions = [],
        priorityOptions = [],
      } = this
      let { category, priority, siteId, assignment } = alarmRequest || {}
      let { assignedTo, assignmentGroup } = assignment || {}
      let fields = {}
      if (category) {
        let categoryObj = categoryOptions.find(
          option => option.value == category
        )
        fields.category = {
          id: category,
          name: categoryObj.label,
        }
      }
      if (priority) {
        let priorityObj = priorityOptions.find(
          option => option.value == priority
        )
        fields.priority = {
          id: priority,
          name: priorityObj.label,
        }
      }
      if (assignedTo) {
        fields.assignedTo = assignedTo
      }
      if (assignmentGroup) {
        fields.assignmentGroup = assignmentGroup
      }
      if (siteId > 0) {
        fields.siteId = siteId
      }

      fields.isWoCreated = true
      let updateObj = {
        id: this.woIds,
        workorder: fields,
      }
      ftoast.success(
        this.$t('alarm.wo_creating_msg', 'Creating Workorder ...', {
          ns: 'alarm',
        })
      )
      let { error } = await API.post(
        `v3/alarmWorkorder/${moduleName}`,
        updateObj
      )
      if (isEmpty(error)) {
        ftoast.success(
          this.$t(
            'alarm.wo_created_success',
            'Workorder created successfully!',
            { ns: 'alarm' }
          )
        )
      } else {
        ftoast.critical(error.message)
      }
      this.reset()
      this.$emit('confirmWoModel')
    },
    async loadCategoryOptions() {
      let { error, options = [] } = await getFieldOptions({
        field: {
          lookupModuleName: 'ticketcategory',
          skipDeserialize: true,
        },
        defaultIds: [],
      })
      if (isEmpty(error)) {
        options = (Object.keys(options) || []).map(key => {
          return { value: key, label: options[key] }
        })
        this.categoryOptions = options || []
      }
    },
    async loadPriorityOptions() {
      let { error, options = [] } = await getFieldOptions({
        field: {
          lookupModuleName: 'ticketpriority',
          skipDeserialize: true,
        },
        defaultIds: [],
      })
      if (isEmpty(error)) {
        options = (Object.keys(options) || []).map(key => {
          return { value: key, label: options[key] }
        })
        this.priorityOptions = options || []
      }
    },
    async loadSiteOptions() {
      let { error, options = [] } = await getFieldOptions({
        field: {
          lookupModuleName: 'site',
          skipDeserialize: true,
        },
        defaultIds: [],
      })
      if (isEmpty(error)) {
        options = (Object.keys(options) || []).map(key => {
          return { value: key, label: options[key] }
        })
        this.siteOptions = options || []
      }
    },
    reset() {
      this.alarmRequest = {
        category: null,
        assignment: {
          assignedTo: {
            id: -1,
          },
          assignmentGroup: {
            id: -1,
          },
        },
        siteId: null,
        priority: null,
      }
    },
    closeDialog() {
      this.reset()
      this.$emit('closeWoDialog')
    },
  },
}
</script>
