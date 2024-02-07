@ -1,596 +0,0 @@
<script lang="jsx">
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import JPVersionHistory from './widgets/JPVersionHistory.vue'
import ModuleSummary from '../../summary/ModuleSummary.vue'
import ActionButton from '../../summary/components/ActionButton.vue'
import {
  FPageHeader,
  FButton,
  FSpinner,
  FButtonGroup,
  FDropdown,
  fDialog,
  ftoast,
  FText,
} from '@facilio/design-system'
import {
  PUBLISH_STATUS,
  PUBLISHED_STATUS_TYPE,
  PUBLISHED_STATUS,
  PUBLISHED_STATUS_ICON_HASH,
  PUBLISHED_STATUS_ICON_COLOR_HASH,
} from '../jobplan/widgets/pm-utils'
import module from '../../../store/module'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import router from '../../../router'

const moduleStore = module()
export default {
  extends: ModuleSummary,
  name: 'JobPlanSummary',
  data() {
    return {
      loading: false,
      primaryFields: [
        'jobPlanCategory',
        'sysCreatedTime',
        'sysCreatedBy',
        'associatedPm',
      ],
      showDialog: false,
      dialogType: null,
      stateUpdating: false,
      showVersionHistory: false,
      jobPlanId: null,
      withWebTabs: true,
    }
  },
  components: {
    JPVersionHistory,
    ActionButton,
    FPageHeader,
    FButton,
    FSpinner,
    FButtonGroup,
    FDropdown,
    FText,
  },
  computed: {
    moduleName() {
      return 'jobplan'
    },
    jobPlan: {
      get() {
        return this.record
      },
      set(value) {
        this.record = value
      },
    },
    shouldHideApprovers() {
      return false
    },
    showJPBanner() {
      let { jobPlan } = this
      let { jpStatus } = jobPlan || {}

      return ['Disabled', 'Unpublished', 'Pending Revision'].includes(
        PUBLISHED_STATUS[jpStatus]
      )
    },
    captionText() {
      let { record, jobPlanTag } = this
      return record ? `${jobPlanTag}` : ''
    },
    publishText() {
      let { isJobPlanPublished } = this || {}
      if (!isJobPlanPublished) {
        return this.$t('Publish')
      } else {
        return this.$t('Unpublish')
      }
    },
    publishedState() {
      let { jobPlan } = this
      let { jpStatus } = jobPlan || {}
      return getProperty(PUBLISHED_STATUS, `${jpStatus}`, 'published')
    },
    publishStateType() {
      let { jobPlan } = this
      let { jpStatus } = jobPlan || {}
      return getProperty(PUBLISHED_STATUS_TYPE, `${jpStatus}`, 'published')
    },
    iconTitle() {
      let { jobPlan } = this
      let { jpStatus } = jobPlan || {}

      return getProperty(PUBLISHED_STATUS_ICON_HASH, `${jpStatus}`, 'published')
    },
    iconColor() {
      let { iconTitle } = this
      return getProperty(
        PUBLISHED_STATUS_ICON_COLOR_HASH,
        `${iconTitle}`,
        'published'
      )
    },
    currentModuleState() {
      let { moduleName, jobPlan } = this
      let currentStateId = getProperty(jobPlan, 'moduleState.id')
      let currentState = moduleStore.getTicketStatus(currentStateId, moduleName)
      let { displayName, status } = currentState || {}

      if (!isEmpty(displayName)) {
        return displayName
      }
      return status || null
    },
    groupId() {
      let { $route } = this
      let { params } = $route || {}
      let { id } = params || {}

      return parseInt(id)
    },
    version() {
      let { $route } = this
      let { query } = $route || {}
      let version = getProperty(query, 'jpversion', '')

      version = version.slice(1)
      return parseInt(version)
    },
    jobPlanTag() {
      let { groupId, version } = this
      return `#${groupId} / v${version}`
    },
    JobPlanSubject() {
      let { jobPlan } = this
      if (!isEmpty(jobPlan)) {
        let { name } = jobPlan || {}
        return name
      }
      return '---'
    },
    moduleDisplayName() {
      return 'Job Plan'
    },
    isJobPlanPublished() {
      let { jobPlan } = this
      if (!isEmpty(jobPlan)) {
        let { jpStatus } = jobPlan || {}
        return PUBLISHED_STATUS[jpStatus] === 'Published'
      }
      return false
    },
    isJobPlanRevised() {
      let { jobPlan } = this
      if (!isEmpty(jobPlan)) {
        let { jpStatus } = jobPlan || {}
        return PUBLISHED_STATUS[jpStatus] === 'Revised'
      }
      return false
    },
    canPublishJP() {
      let { jobPlan } = this
      if (!isEmpty(jobPlan)) {
        let { jpStatus } = jobPlan || {}
        return !['Published', 'Revised'].includes(PUBLISHED_STATUS[jpStatus])
      }
      return false
    },
    isJobPlanDisabled() {
      let { jobPlan } = this
      if (!isEmpty(jobPlan)) {
        let { jpStatus } = jobPlan || {}
        return PUBLISHED_STATUS[jpStatus] === 'Disabled'
      }
      return false
    },
    isStateFlowEnabled() {
      let { jobPlan } = this
      let hasState = getProperty(jobPlan, 'moduleState.id')
      let isEnabled = getProperty(this.moduleMeta, 'module.stateFlowEnabled')
      return hasState && isEnabled
    },
    isApprovalEnabled() {
      let { jobPlan } = this
      let { approvalFlowId, approvalStatus } = jobPlan || {}
      return !isEmpty(approvalFlowId) && !isEmpty(approvalStatus)
    },

    moreButtonList() {
      if (
        !this.isJobPlanDisabled &&
        !this.isJobPlanPublished &&
        !this.isJobPlanRevised
      ) {
        return [
          {
            name: 'Edit',
            identifier: 'jobplanEdit',
            clickAction: this.editRecord,
          },
          {
            name: 'Publish',
            identifier: 'jobplanPublish',
            clickAction: this.publishConfirm,
          },
          {
            name: 'Clone',
            identifier: 'jobplanClone',
            clickAction: this.cloneJP,
          },
          {
            name: 'Version History',
            identifier: 'jobplanVersionHistory',
            clickAction: this.openVersionHistory,
          },
        ]
      } else if (!this.isJobPlanDisabled && this.isJobPlanRevised) {
        return [
          {
            name: 'Clone',
            identifier: 'jobplanClone',
            clickAction: this.cloneJP,
          },
          {
            name: 'Version History',
            identifier: 'jobplanVersionHistory',
            clickAction: this.openVersionHistory,
          },
        ]
      } else if (!this.isJobPlanDisabled && this.isJobPlanPublished) {
        return [
          {
            name: 'Revise',
            identifier: 'jobplanRevise',
            clickAction: this.reviseJP,
          },
          {
            name: 'Clone',
            identifier: 'jobplanClone',
            clickAction: this.cloneJP,
          },
          {
            name: 'Version History',
            identifier: 'jobplanVersionHistory',
            clickAction: this.openVersionHistory,
          },
          {
            name: 'Disable',
            identifier: 'jobplanDisable',
            clickAction: this.disableConfirm,
          },
        ]
      }
    },
    notificationDetails() {
      if (this.canPublishJP && !this.isJobPlanDisabled) {
        return {
          description: this.$t(
            'jobplan.jp_before_publish_description',
            'Job Plan Should be published before it can be associated.',
            {
              ns: 'jobplan',
            }
          ),

          hideCloseIcon: true,
        }
      }
      if (this.isJobPlanDisabled) {
        return {
          description: this.$t(
            'jobplan.jp_disabled_description',
            'Job Plan has been disabled and can no longer be associated.',
            {
              ns: 'jobplan',
            }
          ),

          hideCloseIcon: true,
        }
      }
    },
    tagProps() {
      if (this.publishedState) {
        return {
          text: this.publishedState,
          appearance: 'status',
          statusType: this.publishStateType,
        }
      }
      return {}
    },
  },
  watch: {
    jobPlanId: {
      async handler(newVal) {
        if (!isEmpty(newVal)) {
          this.loadRecord()
        }
      },
      immediate: true,
    },
  },
  methods: {
    async init() {
      this.loading = true
      let { groupId, version } = this
      let params = { groupId, jobPlanVersion: version }
      let { error, data } = await API.get('v3/jobPlan/getJobPlanId', params)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        let { result } = data || {}
        this.jobPlanId = result
        this.loadRecord()
        this.loadSystemButtons(true)
      }
      this.loading = false
    },
    async loadRecord(force = false, groupId) {
      this.isLoading = true
      let { moduleName, jobPlanId } = this
      let url = `v3/modules/${moduleName}/${jobPlanId}`
      let params = {
        moduleName,
        id: !isEmpty(groupId) ? groupId : jobPlanId,
        moduleName,
        force,
      }
      let { error, data } = await API.get(url, params)
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        if (!isEmpty(data)) {
          let { jobplan } = data || {}
          this.record = jobplan
          this.jobPlan = jobplan
        }
      }
      if (!isEmpty(groupId)) {
        this.jobPlanId = groupId
      }
      this.isLoading = false
    },
    closeDialog() {
      this.showDialog = false
      this.showVersionHistory = false
      this.dialogType = null
    },
    async publishJP() {
      let { jobPlanId } = this
      let { error, data } = await API.post('v3/jobPlan/publish', {
        jobPlanId,
      })

      if (!error) {
        let { result } = data || {}
        let { groupId } = result || {}
        ftoast.success(
          this.$t('jobplan.jp_published', 'Job Plan Published.', {
            ns: 'jobplan',
          })
        )
        this.stateUpdating = false
        this.loadPublishedJobPlan(groupId)
      } else {
        this.stateUpdating = false
        ftoast.critical(error.message || 'Error Occurred')
      }
    },
    loadPublishedJobPlan(groupId) {
      this.closeDialog()
      this.loadRecord(true, groupId)
    },
    async updateStatus(status) {
      this.stateUpdating = true
      let { jobPlan } = this
      this.$set(jobPlan, 'jpStatus', PUBLISH_STATUS[`${status}`])
      let data = { ...jobPlan }
      let successMessage = `${this.moduleDisplayName} ${status}ed successfully`

      await this.updateRecord(data, successMessage)
    },
    async updateRecord(data, successMessage) {
      let { moduleName, jobPlanId } = this

      let { error } = await API.updateRecord(moduleName, {
        id: jobPlanId,
        data,
      })
      if (!error) {
        ftoast.success(successMessage)
        this.stateUpdating = false
        await this.loadRecord(true)
        this.closeDialog()
      } else {
        this.stateUpdating = false
        ftoast.critical(error.message)
      }
    },
    redirectToOverview(record) {
      let { moduleName, viewname, $route } = this
      let { group, jobPlanVersion: version } = record || {}
      let { query } = $route
      let groupId = getProperty(group, 'id', null)
      version = `v${version}`

      delete query.tabName //to remove preserved tabName from pageBuilder

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let route = {
        name,
        params: { viewname, id: groupId },
        query: { jpversion: version },
      }

      this.$router.push(route)
    },
    async publishConfirm() {
      let value = await fDialog.warning({
        title: 'Publish Job Plan',
        description: this.$t(
          'jobplan.publish_jp_confirm',
          'Once this Job Plan is published, changes cannot be made to it.Do you still want to publish?',
          { ns: 'jobplan' }
        ),
        saveText: 'Publish',
        cancelText: 'Cancel',
      })
      if (value) {
        this.publishJP()
      }
      return
    },
    async disableConfirm() {
      let value = await fDialog.warning({
        title: 'Disable Job Plan',
        description: this.$t(
          'jobplan.jp_disable_confirm',
          'Once this Job Plan is disabled, all current records associated with this Job Plan will not be affected. No new associations can be made to this Job Plan.Do you still want to disable?',
          { ns: 'jobplan' }
        ),
        saveText: 'Disable',
        cancelText: 'Cancel',
      })
      if (value) {
        this.updateStatus('Disable')
      }
      return
    },
    editRecord() {
      let { moduleName, record } = this
      let { group, jobPlanVersion: version } = record || {}
      let groupId = getProperty(group, 'id', null)
      version = `v${version}`
      let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
      name &&
        this.$router.push({
          name,
          params: { id: groupId },
          query: { jpversion: version },
        })
    },
    async reviseJP() {
      let { moduleName, jobPlanId } = this
      let routeName = 'edit-jobplan'

      let { data, error } = await API.post('v3/jobPlan/revise', {
        jobPlanId,
      })
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
        routeName = name

        let { result } = data || {}
        let { groupId, jobPlanVersion: version } = result || {}
        version = `v${version}`
        let params = { id: groupId }
        let query = { jpversion: version }
        let { href } =
          router.resolve({
            name: routeName,
            params,
            query,
          }) || {}

        if (!isEmpty(href)) {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
    },
    async cloneJP() {
      let { moduleName, jobPlanId } = this
      let routeName = 'edit-jobplan'

      let { data, error } = await API.post('v3/jobPlan/cloneJobPlan', {
        jobPlanId,
      })
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
        routeName = name

        let { result } = data || {}
        let { jobPlanId: id } = result || {}
        let params = { id }
        let query = { version: 'v1' }
        let { href } =
          router.resolve({
            name: routeName,
            params,
            query,
          }) || {}

        if (!isEmpty(href)) {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
    },
    openVersionHistory() {
      this.showVersionHistory = true
    },
    defaultSpace() {
      return (
        <FContainer>
          {this.showVersionHistory && (
            <JPVersionHistory
              showVersionHistory={this.showVersionHistory}
              moduleName={this.moduleName}
              jobPlanId={this.jobPlanId}
              vOn:onclose={this.closeShowVersionHistory}
            />
          )}
        </FContainer>
      )
    },
    actionButtons() {
      let { record, moduleName, POSITION, systemBtnList, systemButtonLoading } =
        this || {}

      let sysBtnList = this.getActiveSystemButtons(systemBtnList)
      return (
        <ActionButton
          record={record}
          moduleName={moduleName}
          position={POSITION.SUMMARY}
          disabled={this.isApprovalEnabled}
          systemButtons={sysBtnList}
          systemButtonLoading={systemButtonLoading}
          vOn:refresh={this.refreshData}
          vOn:onError={() => {}}
          vOn:transitionSuccess={this.refreshData}
          vOn:transitionFailure={() => {}}
        ></ActionButton>
      )
    },
    notificationButtons() {
      let { record } = this
      if (!this.isJobPlanPublished && !this.isJobPlanDisabled) {
        return (
          <FContainer
            borderRadius="medium"
            border="1px solid"
            borderColor="borderNeutralGrey01Subtler"
          >
            <FButton
              appearance="primary"
              vOn:click={() => this.publishConfirm()}
            >
              Publish
            </FButton>
          </FContainer>
        )
      } else if (this.isJobPlanDisabled) {
        return (
          <FContainer
            borderRadius="medium"
            border="1px solid"
            borderColor="borderNeutralGrey01Subtler"
          >
            <FButton
              borderRadius="medium"
              border="1px solid"
              borderColor="borderNeutralGrey01Subtler"
              appearance="primary"
              vOn:click={() => this.cloneJP()}
            >
              Clone
            </FButton>
          </FContainer>
        )
      }
    },
    closeShowVersionHistory() {
      this.showVersionHistory = false
    },
  },
  render() {
    let { record, recordMainField } = this || {}
    return (
      <FContainer height="100%">
        {this.isLoading ? (
          <FContainer
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FSpinner size={30} />
          </FContainer>
        ) : (
          <FContainer class="page-summary-container-ms">
            <FContainer
              class="page-header-ms"
              padding="containerNone containerXLarge"
            >
              <FPageHeader
                heading={recordMainField}
                breadCrumbProps={{ appearance: 'back' }}
                tagProps={this.tagProps}
                showNotification={this.isJobPlanDisabled || this.canPublishJP}
                showButtonPanel={false}
                notificationDetails={this.notificationDetails}
                showActionBar={false}
                withTabs={this.withTabs}
                captionText={this.captionText}
                vOn:path={this.back}
                {...{
                  scopedSlots: {
                    tags: () => {
                      return this.slot('tags')
                    },
                    buttons: () => {
                      return [
                        this.actionButtons(),
                        this.slot('buttons') || this.moreActionButtons(),
                      ]
                    },
                    notificationButton: () => {
                      return (
                        this.slot('notificationButton') ||
                        this.notificationButtons()
                      )
                    },
                  },
                }}
              ></FPageHeader>
            </FContainer>
            <FContainer
              class="page-builder-ms"
              padding="containerNone containerMedium"
            >
              <Page
                key={record.id}
                module={this.moduleName}
                id={record.id}
                details={record}
                notesModuleName={this.notesModuleName}
                isV3Api={true}
                attachmentsModuleName={this.attachmentsModuleName}
                attrs={this.$attrs}
                systemButtons={this.systemButtons}
                vOn:appendedTabHeader={() => (this.withTabs = true)}
              ></Page>
              {this.slot('defaultSpace')}
            </FContainer>
          </FContainer>
        )}
      </FContainer>
    )
  },
}
</script>
<style scoped lang="scss">
.page-summary-container-ms {
  display: flex;
  flex-direction: column;
  height: 100%;
  .page-header-ms {
    flex-shrink: 0;
  }
  .page-builder-ms {
    flex-grow: 1;
    overflow: hidden;
  }
}
</style>
