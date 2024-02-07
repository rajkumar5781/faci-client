<script>
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { POSITION_TYPE } from '../../components/custom-button/CustomButtonUtil.js'
import { CustomModuleData } from '../../data/CustomModuleData'
import { eventBus } from '../../components/page-builder/event-bus.js'
import { mapState, mapActions } from 'pinia'
import moduleStore from '../../store/module'
import { ftoast } from '@facilio/design-system'
import viewStore from '../../store/views'

export default {
  name: 'CustomModuleSummary',
  data() {
    return {
      isLoading: true,
      record: null,
      primaryFields: [],
      notesModuleName: 'cmdnotes',
      attachmentsModuleName: 'cmdattachments',
      POSITION: POSITION_TYPE,
      customClass: '',
      systemBtnDisplayNames: {},
      systemButtonLoading: false,
      systemButtons: [],
    }
  },
  created() {
    this.loadApprovalStatus(this.moduleName)
  },
  mounted() {
    eventBus.$on('refresh-overview', this.refreshData)
  },
  beforeDestroy() {
    eventBus.$off('refresh-overview', this.refreshData)
  },
  computed: {
    ...mapState(viewStore, {
      metaInfo: 'metaInfo',
    }),
    moduleName() {
      return this.$route.params.moduleName
        ? this.$route.params.moduleName
        : this.$attrs.moduleName || ''
    },
    id() {
      let paramId = this.$attrs.id || this.$route.params.id
      return paramId && paramId !== 'null'
        ? parseInt(this.$route.params.id)
        : ''
    },
    routeName() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      return name || null
    },
    showEdit() {
      let { record } = this
      let canShowEdit = this.$access.hasPermission(`${this.moduleName}:UPDATE`)

      return canShowEdit && record.canEdit()
    },
    mainFieldKey() {
      let { fields = [] } = this.metaInfo || {}
      let mainFieldObj = fields.find(field => field.mainField)
      return mainFieldObj?.name || 'name'
    },
    photoFieldName() {
      return 'photoId'
    },
    showPhotoField() {
      return false
    },
    showAvatar() {
      return false
    },
    shouldHideApprovers() {
      return false
    },
    modelDataClass() {
      return CustomModuleData
    },
    systemBtnList() {
      return []
    },
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'edit_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
        },
      ]
    },
  },
  watch: {
    id: {
      handler: 'init',
      immediate: true,
    },
  },
  methods: {
    ...mapActions(moduleStore, ['loadApprovalStatus']),
    ...mapActions(viewStore, ['loadModuleMeta']),

    async init() {
      await this.loadModuleMeta(this.moduleName)
      this.loadRecord(true)
      this.loadSystemButtons(true)
    },
    refreshData() {
      this.init()
    },
    async loadRecord(force = false) {
      try {
        let { moduleName, id } = this
        this.isLoading = true
        this.record = await this.modelDataClass.fetch({ moduleName, id, force })
      } catch (error) {
        ftoast.critical(
          error?.message ||
            'Error Occurred while fetching record detail summary'
        )
      }

      this.isLoading = false
    },
    async loadSystemButtons(force = false) {
      try {
        this.systemButtonLoading = true
        let { moduleName, id, POSITION } = this
        let params = { moduleName, position: POSITION.SUMMARY, force }
        this.systemButtons =
          await this.modelDataClass.loadSystemButtonsForRecord({
            ...params,
            id,
          })
        this.systemBtnDisplayNames = this.systemButtons.reduce((acc, btn) => {
          let { identifier, name } = btn
          acc[identifier] = name
          return acc
        }, {})
      } catch (error) {
        ftoast.critical(error?.message || 'Unable to fetch system buttons')
      }
      this.systemButtonLoading = false
    },
    editRecord() {
      let { moduleName, id } = this

      let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
      name && this.$router.push({ name, params: { id, moduleName } })
    },
    back() {
      let viewname = this.$route?.params?.viewname
      let { routeName, moduleName } = this

      if (routeName) {
        this.$router.push({ name: routeName, params: { viewname, moduleName } })
      }
    },
  },
}
</script>
