<script>
import intersection from 'lodash/intersection'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  POSITION_TYPE,
  getActionType,
  ACTION_TYPES,
} from './CustomButtonUtil.js'
import {
  redirectUrlAction,
  redirectType,
  internalUrlAction,
} from './actions/RedirectUrl.js'
import CreateUpdateRecord from './actions/CreateUpdateRecord.vue'
import BulkUpdateRecord from './actions/BulkUpdateRecord.vue'
import ConnectedAppWidget from './actions/ConnectedAppWidget.vue'
import PdfViewerWrapper from './actions/PDFViewerWrapper.vue'
import { tabTypes, findTab, getApp } from '@facilio/router'
import { CustomModuleData } from '../../data/CustomModuleData.js'
import dlv from 'dlv'
import webtabs from '../../store/webtabs'
import { ftoast } from '@facilio/design-system'

const webtabStore = webtabs()

export default {
  props: ['hideNotifications', 'position', 'selectedRecords'],
  components: {
    ConnectedAppWidget,
    CreateUpdateRecord,
    BulkUpdateRecord,
    PdfViewerWrapper,
  },
  data() {
    return {
      customButtons: [],
      selectedButton: null,
      customButtonLoading: false,
      showConnectedAppWidget: false,
      widgetId: null,
      showRecordActionForm: false,
      showBulkActionForm: false,
      showPdfViewer: false,
      currentActionType: null,
      POSITION: POSITION_TYPE,
      visibility: false,
      actionLoading: false,
      connectedAppTitle: '',
      showDropDown: false,
    }
  },
  computed: {
    modelDataClass() {
      return this.$attrs.modelDataClass || CustomModuleData
    },
    isWoStateTransitionLicenseEnabled() {
      return this.$access.isLicenseEnabled('WO_STATE_TRANSITION_V3')
    },
    // Remove when v3 is enabled for workorders
    isPortalApp() {
      return ['tenant', 'occupant', 'client', 'vendor'].includes(
        getApp().linkName || null
      )
    },
  },
  watch: {
    selectedRecords: {
      handler(records) {
        this.filterIntersectedButtons(records)
      },
      immediate: true,
    },
  },
  methods: {
    async customButtonInit() {
      let { LIST_ITEM, LIST_BULK } = POSITION_TYPE
      let { moduleName, position } = this
      if (!isEmpty(moduleName) && ![LIST_ITEM, LIST_BULK].includes(position)) {
        await this.loadCustomButtonsList()
      }
    },
    async loadCustomButtonsList(force = false) {
      let { LIST_ITEM, LIST_BULK } = POSITION_TYPE
      let { moduleName, record, selectedRecords, position } = this
      let params = { moduleName, position, force }

      let errorHandling = error => {
        let errMsg = error?.message || 'Unable to fetch custom button'
        ftoast.critical(errMsg)
      }

      this.customButtonLoading = true

      if ([LIST_ITEM, LIST_BULK].includes(position)) {
        let recordList = position === LIST_ITEM ? [record] : selectedRecords
        let recordIds = (recordList || []).map(rec => rec.id)

        try {
          let response = await this.modelDataClass.loadCustomButtonsForRecords({
            ...params,
            recordIds,
          })

          if (!isEmpty(response)) {
            position === LIST_ITEM
              ? this.filterEachRecordButtons(response)
              : this.filterIntersectedButtons(response)
          }
        } catch (error) {
          errorHandling(error)
        }
      } else {
        try {
          let customButtons = await this.modelDataClass.loadCustomButtons({
            ...params,
            record,
          })

          this.customButtons = (customButtons || []).map(btn => ({
            ...btn,
            loading: false,
            disable: false,
            clickAction: this.startButtonAction,
          }))
        } catch (error) {
          errorHandling(error)
        }
      }

      this.customButtonLoading = false
    },
    filterEachRecordButtons(response) {
      let { record, position } = this
      let { customButtons, customButtonsforRecords } = response || {}

      let { evaluatedButtonIds: buttonIds } =
        (customButtonsforRecords || []).find(r => r.id === record.id) || {}

      if (!isEmpty(buttonIds)) {
        this.customButtons = (customButtons || [])
          .filter(
            button =>
              buttonIds.includes(button.id) && button.positionType === position
          )
          .map(btn => ({
            ...btn,
            loading: false,
            disable: false,
            clickAction: this.startButtonAction,
          }))
      }
    },
    filterIntersectedButtons(response) {
      let { selectedRecords, position } = this
      let { customButtons, customButtonsforRecords } = response || {}

      if (!isEmpty(selectedRecords)) {
        let buttonIds = []

        selectedRecords.forEach(record => {
          let { evaluatedButtonIds } =
            (customButtonsforRecords || []).find(r => r.id === record.id) || {}
          let evaluatedBtnIds = isEmpty(evaluatedButtonIds)
            ? []
            : evaluatedButtonIds

          buttonIds.push(evaluatedBtnIds)
        })

        let customButtonsIds = intersection(...buttonIds)

        this.customButtons = (customButtons || [])
          .filter(
            button =>
              customButtonsIds.includes(button.id) &&
              button.positionType === position
          )
          .map(btn => ({
            ...btn,
            loading: false,
            disable: false,
            clickAction: this.startButtonAction,
          }))
      }
    },
    async startButtonAction(selectedButton) {
      this.showDropDown = false
      if (this.actionLoading) return
      this.freezeRecordInList(true)

      this.selectedButton = selectedButton
      this.actionLoading = true
      // if (this.position !== POSITION_TYPE.LIST_BULK) {
      //   this.customButtonLoading = true
      // }
      await this.executeAction()
      // this.customButtonLoading = false
      this.actionLoading = false
      let actiontypeText = getActionType(this.selectedButton)
      let isForm = ['Create Record', 'Update Record'].includes(actiontypeText)
      if (!isForm) {
        this.selectedButton.onActionComplete()
        if (actiontypeText != 'Open Pdf') this.selectedButton = null
      }

      this.freezeRecordInList(false)
    },
    freezeRecordInList(loading) {
      if (this.position === POSITION_TYPE.LIST_ITEM)
        this.$emit('freezeRecord', loading)
    },
    async executeAction() {
      let { moduleName, record, selectedButton, position } = this
      let actionType = getActionType(this.selectedButton)
      this.currentActionType = actionType
      if (actionType === ACTION_TYPES.REDIRECT_URL) {
        await redirectUrlAction({
          url: dlv(this, 'selectedButton.config.url'),
          record: this.record,
          type: redirectType.DIFFERENT_TAB,
          moduleName,
        })
      } else if (
        [ACTION_TYPES.OPEN_FORM, ACTION_TYPES.OPEN_SUMMARY].includes(actionType)
      ) {
        let { config = {} } = selectedButton
        let { moduleName: targetModuleName } = config
        let canCreate = false
        let { tabId } = findTab(tabTypes.MODULE, {
          moduleName: targetModuleName,
        })
        if (!isEmpty(tabId)) {
          let webTabObj = webtabStore.getTabByTabId(tabId)
          canCreate = webtabStore.tabHasPermission('CREATE', webTabObj)
        }
        await internalUrlAction(
          {
            config: config,
            record: this.record,
            type: redirectType.DIFFERENT_TAB,
            moduleName,
          },
          canCreate
        )
      } else if (actionType === ACTION_TYPES.CONNECTED_APPS) {
        this.widgetId = dlv(this, 'selectedButton.config.widgetId')
        this.connectedAppTitle = this.selectedButton?.name
        this.showConnectedAppWidget = true
      } else if (
        actionType === ACTION_TYPES.CREATE_RECORD ||
        actionType === ACTION_TYPES.UPDATE_RECORD
      ) {
        if (
          actionType === ACTION_TYPES.UPDATE_RECORD &&
          position === POSITION_TYPE.LIST_BULK
        ) {
          await this.startBulkUpdateAction()
        } else {
          await this.startRecordActionFlow()
        }
      } else if (actionType === ACTION_TYPES.OPEN_PDF) {
        this.showPdfViewer = true
      } else if (actionType === ACTION_TYPES.OTHER_ACTIONS) {
        let url = this.getUrl(selectedButton)

        let params
        if (this.position === POSITION_TYPE.LIST_BULK) {
          params = {
            customButtonId: selectedButton.id,
            moduleName: moduleName,
            data: {
              [moduleName]: this.selectedRecords.map(record => {
                return { id: record.id }
              }),
            },
          }
          return API.post('v3/modules/data/bulkpatch', params).then(
            this.otherActionResponse
          )
        } else {
          if (
            !this.isPortalApp &&
            moduleName === 'workorder' &&
            !this.isWoStateTransitionLicenseEnabled
          ) {
            params = this.transformFn({
              moduleName: moduleName,
              id: record?.id,
              customButtonId: selectedButton.id,
            })
            return API.post(url, params).then(this.otherActionResponse)
          } else {
            params = {
              id: record?.id,
              customButtonId: selectedButton.id,
              data: {},
            }
            let { id: recordId } = record || {}
            let url = `v3/action/${moduleName}/${recordId}/customButton`

            return API.patch(url, params).then(this.otherActionResponse)
          }
        }
      }
    },
    startRecordActionFlow() {
      this.showRecordActionForm = true
    },
    startBulkUpdateAction() {
      this.showBulkActionForm = true
    },
    loadData() {
      this.$emit('onSuccess')
      this.$emit('refresh')
    },
    responseHandler(response) {
      if (!response) {
        this.$emit('onError')
      } else {
        this.$emit('refresh')
        this.$emit('onSuccess')
      }
    },
    otherActionResponse({ error }) {
      if (error) {
        ftoast.critical(error.message || 'Error occured')
        this.responseHandler(false)
      } else {
        ftoast.success('Action executed successfully')

        this.responseHandler(true)
      }
    },
  },
}
</script>
