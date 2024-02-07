<template>
  <FContainer height="100%">
    <portal :to="titlePortal">
      <FContainer
        display="flex"
        flexDirection="column"
        padding="containerLarge"
      >
        <FText appearance="headingMed14">{{
          widget.displayName || widget.name
        }}</FText>
        <FText appearance="captionMed12" color="backgroundNeutralGrey01Dark">
          {{ formattedApprovalText }}
        </FText>
      </FContainer>
    </portal>
    <FContainer v-if="loading">
      <FSpinner :size="20"></FSpinner>
    </FContainer>
    <FContainer v-else-if="!loading && !isEmpty(approvalsList)" height="100%">
      <FTable
        :showSelect="false"
        :columns="column"
        :data="approvalsList"
        :hideBorder="true"
        :rounded="false"
      >
        <template #[`cell.name`]="{ row }">
          <FContainer display="flex" alignItems="center">
            <FAvatar size="M" :userName="row.name"> </FAvatar>
            <FContainer paddingLeft="containerMedium">
              <FText>{{ row.name }}</FText>
            </FContainer>
          </FContainer>
        </template>
        <template #[`cell.status`]="{ row }">
          <FTags
            appearance="status"
            statusType="information"
            :text="getStatus(row)"
          ></FTags>
        </template>
      </FTable>
    </FContainer>
    <FContainer v-else height="100%">
      <FEmptyState
        :title="
          $t('approval_activities.no_approvals', {
            ns: 'approvals',
          })
        "
        :vertical="true"
      >
      </FEmptyState>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTable,
  FTags,
  FEmptyState,
  FAvatar,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['approvalMeta', 'titlePortal', 'widget'],
  data() {
    return {
      column: [
        {
          displayName: this.$t('approval_activities.approver', {
            ns: 'approvals',
          }),
          name: 'name',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('approval_activities.status', {
            ns: 'approvals',
          }),
          name: 'status',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: this.$t('approval_activities.modified_time', {
            ns: 'approvals',
          }),
          name: 'actionTime',
          id: 3,
          resize: true,
          width: 200,
        },
      ],
      approvalsList: [],
      isEmpty,
      loading: false,
    }
  },
  components: {
    FContainer,
    FText,
    FTable,
    FTags,
    FEmptyState,
    FAvatar,
  },
  computed: {
    formattedApprovalText() {
      let { approvalRule } = this.approvalMeta || {}
      let { allApprovalRequired } = approvalRule || {}

      if (allApprovalRequired)
        return this.$t('approval_activities.everyone_should_approve', {
          ns: 'approvals',
        })
      else
        return this.$t('approval_activities.anyone_can_approve', {
          ns: 'approvals',
        })
    },
  },
  created() {
    let { approvalMeta = {} } = this
    let approvers = getProperty(approvalMeta, 'approvalList', []) || []

    this.loading = true
    this.approvalsList = approvers.filter(approver => {
      return !(approver.type === 'FIELD' && isEmpty(approver.value))
    })
    this.approvalsList = this.approvalsList.map(approver => {
      if (isEmpty(approver.value)) {
        return {
          ...approver,
          name: approver?.type,
          actionBy: false,
          actionTime: '',
        }
      }
      return approver.value
    })
    this.loading = false
  },
  methods: {
    getStatus(approver) {
      return approver.actionBy ? 'Approved' : 'Pending'
    },
  },
}
</script>
