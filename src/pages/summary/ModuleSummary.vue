<script lang="jsx">
import {
  FContainer,
  FButton,
  FPageHeader,
  FSpinner,
  FDivider,
  FPopover,
  FAvatar,
  FIcon,
} from '@facilio/design-system'
import Page from '../../components/page-builder/PageBuilder.vue'
import { isEmpty, isFunction, isObject } from '@facilio/utils/validation'
import SummaryMixin from './SummaryMixin.vue'
import ApprovalBar from '../../components/page-builder/approval-bar/ApprovalBar.vue'
import ActionButton from './components/ActionButton.vue'
import dlv from 'dlv'
import getProperty from 'dlv'
import { eventBus } from '../../components/page-builder/event-bus'

const env = import.meta.env

export default {
  mixins: [SummaryMixin],
  name: 'ModuleSummary',
  components: {
    FContainer,
    FButton,
    FPageHeader,
    FSpinner,
    FDivider,
    FAvatar,
    FPopover,
    FIcon,
    ActionButton,
    Page,
    ApprovalBar,
  },
  data() {
    return {
      notesModuleName: 'cmdnotes',
      attachmentsModuleName: 'cmdattachments',
      approvalText: 'loading',
      systemButtonLoading: false,
      withTabs: false,
    }
  },
  computed: {
    captionText() {
      let { record } = this
      return record ? `#${record.id}` : ''
    },
    description() {
      return ''
    },
    showAvatar() {
      return false
    },
    avatarIconGroup() {
      return ''
    },
    avatarIconName() {
      return ''
    },
    getAvatarUrl() {
      return getProperty(this, 'record.avatarUrl', null)
    },
    notificationDetails() {
      return {
        description: this.approvalText,
        hideCloseIcon: true,
      }
    },
    tagProps() {
      let { record } = this || {}
      if (record?.isStateFlowEnabled() && record.currentModuleState()) {
        return {
          text: record.currentModuleState(),
          variant: 'status',
          statusType: 'information',
        }
      } else {
        return {}
      }
    },
    isApprovalEnabled() {
      let { record } = this
      return record?.isApprovalEnabled()
    },
    recordMainField() {
      let { mainFieldKey, record } = this
      let mainField = dlv(record, mainFieldKey) || null
      return isObject(mainField) ? mainField.name : mainField
    },
  },
  methods: {
    widgetComm(widgetType, payload) {
      let payloadObj = {
        from: {
          summaryPage: true,
        },
        payload,
      }
      eventBus.$emit(widgetType, payloadObj)
    },
    getActiveSystemButtons(buttonList) {
      return (buttonList || []).filter(btn => {
        return (this.systemButtons || []).find(
          sysBtn => sysBtn.identifier === btn.identifier
        )
      })
    },
    actionButtons() {
      let { record, moduleName, POSITION, systemBtnList, systemButtonLoading } =
        this || {}
      let sysBtnList = this.getActiveSystemButtons(systemBtnList)
      return (
        !isEmpty(record) && (
          <ActionButton
            record={record}
            moduleName={moduleName}
            position={POSITION.SUMMARY}
            disabled={record.isApprovalEnabled()}
            systemButtons={sysBtnList}
            systemButtonLoading={systemButtonLoading}
            vOn:refresh={this.refreshData}
            vOn:onError={() => {}}
            vOn:transitionSuccess={this.refreshData}
            vOn:transitionFailure={() => {}}
          ></ActionButton>
        )
      )
    },
    updateApprovalText(val) {
      this.approvalText = val
    },
    defaultSpace() {},
    moreActionButtons() {
      let { moreButtonList } = this
      let moreActionBtns = this.getActiveSystemButtons(moreButtonList)

      return (
        <FPopover trigger="hover" placement="bottom-end">
          {!isEmpty(moreActionBtns) && (
            <FIcon
              group="action"
              name="options-vertical"
              size="16"
              pressable={true}
              color="iconNeutralDefault"
              marginLeft="containerLarge"
              borderRadius="medium"
            />
          )}
          <FContainer
            slot="content"
            padding="containerLarge"
            overflow="scroll"
            maxHeight="200"
          >
            {moreActionBtns.map(btn => (
              <FButton
                key={btn.id}
                attrs={btn}
                appearance={btn.appearance || 'tertiary'}
                loading={btn.loading}
                disabled={btn.disabled}
                vOn:click={btn.clickAction}
                class="overview-more-action-btn"
              >
                {btn.name}
              </FButton>
            ))}
          </FContainer>
        </FPopover>
      )
    },
    slot(type) {
      let { $scopedSlots } = this
      let { [type]: component } = $scopedSlots || {}
      let validSlots = ['buttons', 'tags', 'defaultSpace', 'notificationButton']
      if (isEmpty(component) && type === 'defaultSpace') {
        return this.defaultSpace()
      } else if (isFunction(component) && validSlots.includes(type)) {
        return component && component()
      } else {
        return null
      }
    },
    notificationButtons() {
      let { record } = this
      return (
        !isEmpty(record) && (
          <ApprovalBar
            approvalText={this.approvalText}
            moduleName={this.moduleName}
            key={record.id + 'approval-bar'}
            record={record}
            hideApprovers={false}
            vOn:onSuccess={this.refreshData}
            vOn:onFailure={() => {}}
            class="approval-bar-shadow"
            {...{ on: { 'update:approvalText': this.updateApprovalText } }}
          ></ApprovalBar>
        )
      )
    },
  },

  render() {
    let { record, recordMainField,headingProps={} } = this || {}
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
                description={this.description}
                heading={recordMainField}
                breadCrumbProps={{ appearance: 'back' }}
                tagProps={this.tagProps}
                showNotification={this.isApprovalEnabled}
                showButtonPanel={false}
                notificationDetails={this.notificationDetails}
                showActionBar={false}
                withTabs={this.withTabs}
                captionText={this.captionText}
                vOn:path={this.back}
                avatarUrl={this.getAvatarUrl}
                showAvatar={this.showAvatar}
                iconname={this.avatarIconName}
                icongroup={this.avatarIconGroup}
                headingIcon={headingProps}
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
              {!isEmpty(record) && (
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
              )}
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
<style lang="scss">
.overview-more-action-btn {
  button {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
