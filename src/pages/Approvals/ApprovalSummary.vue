<template>
  <div style="height: 90vh; width: 100%">
    <FSidebar
      :sidebarWidth="280"
      toggleText="sidePanel"
      title="Sidepanel"
      :defaultOpen="true"
    >
      <template #sidebar>
        <FContainer
          display="flex"
          flexDirection="column"
          flex="1"
          width="100%"
          height="100%"
        >
          <FContainer
            padding="containerLarge containerXLarge"
            borderBottom="solid 0.5px"
            borderColor="borderNeutralBaseSubtle"
          >
            <FInput
              placeholder="Search"
              v-model="searchText"
              @blur="searchText = ''"
            >
              <template #prefix>
                <FIcon group="action" name="search" size="16"></FIcon>
              </template>
            </FInput>
          </FContainer>
          <FContainer
            overflow="scroll"
            flex="1 0 0"
            padding="containerLarge containerXLarge"
          >
            <div
              v-if="showLoading"
              class="h-full flex items-center justify-center"
            >
              <FSpinner :size="30" />
            </div>
            <FContainer v-else-if="isList && !isEmpty(lists)">
              <FContainer
                v-for="(record, index) in lists"
                :key="`${record.id} - ${index}`"
                hover-backgroundColor="backgroundNeutralHovered"
                :backgroundColor="
                  selectedRecordId === record.id
                    ? 'backgroundNeutralHovered'
                    : ''
                "
                padding="containerXLarge"
                marginTop="containerSmall"
                marginBottom="containerSmall"
                borderRadius="medium"
                cursor="pointer"
                overflow="hidden"
                @click="redirectToOverview(record)"
              >
                <FText
                  :appearance="
                    selectedRecordId == record.id ? 'headingMed14' : 'bodyReg14'
                  "
                  color="textMain"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  display="block"
                >
                  <FText
                    :appearance="
                      selectedRecordId == record.id
                        ? 'headingMed14'
                        : 'bodyReg14'
                    "
                    color="textMain"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    display="block"
                  >
                    {{ record.name || record.subject }}
                  </FText>
                </FText>
              </FContainer>
            </FContainer>
            <FContainer
              v-else
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FText>
                {{
                  $t('approval_summary.no_record', {
                    ns: 'approvals',
                  })
                }}
              </FText>
            </FContainer>
          </FContainer>
          <FContainer
            borderTop="solid 0.5px"
            borderColor="borderNeutralBaseSubtle"
            padding="containerLarge"
            width="100%"
          >
            <Pagination
              v-if="!isEmpty(listcount)"
              :totalCount="listcount"
              :currentPageCount="100"
              :perPage="25"
              :currentPageNo="page"
              @onPageChanged="onPageChanged"
            ></Pagination>
          </FContainer>
        </FContainer>
      </template>
      <template #content>
        <FContainer display="flex" flexDirection="column" height="100%">
          <FContainer
            padding="containerNone containerXLarge"
            width="100%"
            flexShrink="0"
          >
            <FPageHeader
              :heading="record.subject || record.name"
              :captionText="`#${selectedRecordId}`"
              :breadCrumbProps="back"
              @path="openList"
            >
              <template #buttons>
                <FContainer width="200px">
                  <ApprovalButton
                    v-if="!pageLoading"
                    secondaryAppearance="secondary"
                    :record="record"
                    :moduleName="moduleName"
                    @onSuccess="reload"
                    @onFailure="onTransitionError"
                  >
                  </ApprovalButton>
                </FContainer>
              </template>
            </FPageHeader>
          </FContainer>
          <FContainer
            padding="containerNone containerMedium"
            flexGrow="1"
            overflow="hidden"
          >
            <ApprovalSummaryPageBuilder
              v-if="!pageLoading"
              :details="record"
              :id="selectedRecordId"
              :module="moduleName"
              :approvalMeta="approvalMeta"
              :metaInfo="metaInfo"
              :summaryFields="summaryFields"
              :notesModuleName="`${docsModuleName}notes`"
              :attachmentsModuleName="`${docsModuleName}attachments`"
              :relatedList="relatedList"
            ></ApprovalSummaryPageBuilder>
            <FContainer
              v-else
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <FSpinner :size="30" />
            </FContainer>
          </FContainer>
        </FContainer>
      </template>
    </FSidebar>
  </div>
</template>
<script>
import {
  FSidebar,
  FText,
  FContainer,
  FSpinner,
  FInput,
  FIcon,
  FPageHeader,
  FButton,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import Pagination from '../../pages/list/Pagination.vue'
import ApprovalSummaryPageBuilder from './ApprovalSummaryPageBuilder.vue'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import ActivityMixin from '../../../src/components/page-builder/widgets/history/ActivityMixin.vue'
import ApprovalButton from '../../../src/components/page-builder/approval-bar/ApprovalBar.vue'
import viewStore from '../../store/views'
import { mapState, mapActions } from 'pinia'
import { CustomModuleData } from '../../data/CustomModuleData'

export default {
  props: [
    'list',
    'stateflows',
    'moduleName',
    'listcount',
    'page',
    'listLoading',
  ],
  mixins: [ActivityMixin],
  data() {
    return {
      lists: [],
      showLoading: true,
      searchText: '',
      isList: false,
      isEmpty,
      back: { appearance: 'back' },
      recordCount: null,
      approvalMeta: {},
      pageLoading: true,
      summaryFields: null,
      record: {},
      relatedList: [],
    }
  },
  components: {
    FSidebar,
    FText,
    FContainer,
    FSpinner,
    FInput,
    FIcon,
    FPageHeader,
    FButton,
    ApprovalSummaryPageBuilder,
    Pagination,
    ApprovalButton,
  },
  created() {
    this.loadModuleMeta(this.moduleName)
    this.init()
  },
  computed: {
    getApprovalStates() {
      let { record } = this
      let { approvalStatus, approvalFlowId } = record
      let { id: approvalStatusId } = approvalStatus || {}
      if (isEmpty(approvalStatus) || isEmpty(approvalFlowId)) {
        return []
      }
      let key = `${approvalFlowId}_${approvalStatusId}`
      let transitions = this.stateflows[key]
      let { evaluatedTransitionIds = [] } = record

      if (transitions) {
        transitions = transitions.filter(({ id }) =>
          (evaluatedTransitionIds || []).includes(id)
        )
        return transitions.slice(0, 2)
      }
      return []
    },
    selectedRecordId() {
      if (this.$route.params.id) {
        return parseInt(this.$route.params.id)
      }
    },
    docsModuleName() {
      let { moduleName } = this
      if (moduleName === 'workorder') return 'ticket'
      else return moduleName
    },
    modelDataClass() {
      const moduleNameVsModelData = {}
      return moduleNameVsModelData[this.moduleName] || CustomModuleData
    },
    ...mapState(viewStore, {
      metaInfo: 'metaInfo',
    }),
  },
  watch: {
    list: {
      handler(newValue) {
        this.showLoading = true
        if (!isEmpty(newValue)) {
          this.lists = [...newValue]
          this.isList = true
        }
        this.showLoading = false
      },
      immediate: true,
    },
    selectedRecordId(newVal) {
      if (newVal > 0) this.init()
    },
    searchText(newVal) {
      if (!isEmpty(newVal)) {
        this.lists = this.list.filter(record => {
          let val = record.name || ''
          return val.toLowerCase().includes(newVal.toLowerCase())
        })
      } else if (newVal === '') {
        this.lists = this.list
      }
    },
    listLoading(newVal) {
      this.showLoading = newVal
    },
    page: {
      handler(newVal) {
        if (newVal) {
          this.$router.push({
            query: {
              ...this.$route.query,
              page: newVal,
            },
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(viewStore, ['loadModuleMeta']),
    redirectToOverview(record) {
      this.$emit('redirectToOverview', record.id)
    },
    async init() {
      this.pageLoading = true
      await this.loadApprovalMeta()
      await this.loadSummary()
      this.pageLoading = false
    },
    onPageChanged(val) {
      this.showLoading = true
      this.lists = []
      this.$router.push({
        query: {
          ...this.$route.query,
          page: val,
        },
      })
      this.$emit('pageChanged', val)
    },
    loadApprovalMeta() {
      let { moduleName, selectedRecordId: id = null } = this
      if (!isEmpty(id)) {
        return API.post('v2/approval/approvalDetails', {
          moduleName,
          id,
        }).then(({ error, data }) => {
          if (!error) {
            this.approvalMeta = data
            if (!isEmpty(this.approvalMeta)) {
              let { metaInfo } = this
              let metafields = getProperty(metaInfo, 'fields')
              let approvalRule = getProperty(this.approvalMeta, 'approvalRule')
              let configJson = JSON.parse(
                getProperty(approvalRule, 'configJson') || '{}'
              )
              let { fields: summaryFields, relatedModules } = configJson || {}
              let { relatedList } = approvalRule || {}
              let data = []

              if (!isEmpty(relatedList)) {
                relatedModules.forEach(moduleId => {
                  let { field, module: moduleData } = relatedList[moduleId]
                  let { module, id, name } = field || {}
                  let { displayName } = moduleData || {}

                  data.push({
                    widgets: [
                      {
                        widgetDetail: {
                          module,
                          field: {
                            module,
                            name,
                          },
                        },
                        id,
                        displayName,
                        widgetTypeObj: {
                          name: 'approvalRelatedList',
                        },
                        width: Number(12),
                        height: 6,
                        positionX: 0,
                        positionY: 4,
                      },
                    ],
                    id: Math.random(),
                  })
                })
              }
              this.relatedList = data
              let fieldIds = [...summaryFields].filter(id => !isEmpty(id))
              let fields = fieldIds
                .map(id => {
                  return (metafields || []).find(
                    ({ id: fieldId }) => fieldId === id
                  )
                })
                .filter(f => !isEmpty(f))

              let approvalNameField = {
                dataType: 1,
                dataTypeEnum: {
                  typeAsString: 'String',
                  _name: 'STRING',
                },
                default: true,
                displayName: 'Approval Name',
                displayType: {
                  html5Type: 'text',
                  intValForDB: 1,
                  _name: 'TEXTBOX',
                },
                fieldId: 'approval_name_local',
                id: 'approval_name_local',
                mainField: false,
                name: 'approval_name_local',
              }
              this.summaryFields = [approvalNameField, ...fields]
            }
          } else {
            this.summaryFields = []
            ftoast.warning(
              this.$t('approval_summary.cannot_fetch_record', {
                ns: 'approvals',
              })
            )
          }
        })
      } else Promise.resolve()
    },
    openList() {
      let { moduleName } = this
      let { viewname } = this.$route.params || {}

      this.$router.push({
        params: { moduleName, viewname, id: null },
        query: {
          page: 1,
        },
      })
    },
    reload() {
      this.$emit('reload')
      this.openList()
    },
    onTransitionError() {
      this.$emit('onTransitionError')
      this.openList()
    },
    async loadSummary() {
      this.record = {}

      try {
        let { moduleName, selectedRecordId } = this
        this.record = await this.modelDataClass.fetch({
          moduleName,
          id: selectedRecordId,
        })

        let approvalRuleName = getProperty(
          this.approvalMeta,
          'approvalRule.name'
        )

        this.record.approval_name_local = approvalRuleName
      } catch (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      }
    },
  },
}
</script>
