<script lang="jsx">
import {
  FContainer,
  FButton,
  FSpinner,
  FDivider,
  FButtonGroup,
} from '@facilio/design-system'
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import module from '../../../../store/module'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, findRouteForTab, pageTypes } from '@facilio/router'
import portfolioMixin from '../portfolioMixin.vue'
import BaseSpaceForm from '../BaseSpaceForm.vue'
import SpacePhotoUploader from '../components/SpacePhotoUploader.vue'
import { eventBus } from '../../../../components/page-builder/event-bus'
import MeterRelationMixin from '../../../summary/MeterRelationMixin.vue'
import AddRelationShip from '../../meter/widgets/AddRelationShip.vue'
import { API } from '@facilio/api'
import getProperty from 'dlv'
const moduleStore = module()
export default {
  extends: ModuleSummary,
  props: ['unit'],
  mixins: [portfolioMixin, MeterRelationMixin],
  components: {
    FContainer,
    FButton,
    FSpinner,
    FDivider,
    FButtonGroup,
    SpacePhotoUploader,
    BaseSpaceForm,
    AddRelationShip,
  },
  data() {
    return {
      isEmpty,
      loading: true,
      detailsLoading: false,
      primaryFields: [],
      hasCustomButtons: false,
      hasTransitionBtns: false,
      notesModuleName: 'basespacenotes',
      attachmentsModuleName: 'basespaceattachments',
      siteFormVisibility: false,
      showPhotoDialog: false,
      showFormDialog: false,
      isButtonClicked: false,
      selectedModuleForm: '',
      downloadQRurl: null,
    }
  },
  computed: {
    id() {
      let { $route: { params: { id: paramId } = {} } = {} } = this || {}
      let id = !isEmpty(paramId) && !isNaN(paramId) ? parseInt(paramId) : null
      return id
    },
    moduleName() {
      let { $route: { params: { moduleName = null } = {} } = {} } = this || {}
      return !isEmpty(moduleName)
        ? moduleName
        : getProperty(this, '$attrs.moduleName', null)
    },
    isModuleTab() {
      let { $route: { params: { moduleName = null } = {} } = {} } = this || {}
      return !isEmpty(moduleName) ? false : true
    },
    isRequestedState() {
      let { record } = this
      let { approvalStatus } = record || {}

      if (isEmpty(approvalStatus)) {
        return false
      } else {
        let statusObj = moduleStore.getApprovalStatus(approvalStatus.id)
        return getProperty(statusObj, 'requestedState', false)
      }
    },
    description() {
      let { record, unit } = this
      let { area, grossFloorArea } = record || {}
      if (this.isZeroOrNull(area) && this.isZeroOrNull(grossFloorArea)) {
        return ''
      }
      let areaVal =
        isEmpty(area) || area == 0 ? `-- ${unit}` : `${area} ${unit}`
      let grossFloorAreaVal =
        isEmpty(grossFloorArea) || grossFloorArea == 0
          ? `-- ${unit}`
          : `${grossFloorArea} ${unit}`
      return `${grossFloorAreaVal}  | ${areaVal}`
    },
    showAvatar() {
      return true
    },
    avatarIconGroup() {
      return 'default'
    },
    avatarIconName() {
      return 'building'
    },
    decommission() {
      return getProperty(this, 'record.decommission', false)
    },
    clickable() {
      return true
    },
    headingProps() {
      let { decommission } = this
      if (decommission) {
        return {
          group: 'alert',
          name: 'decommissioning',
          text: 'Decommisioned',
        }
      } else {
        return {}
      }
    },
    canEdit() {
      let { record = {} } = this
      let { isRequestedState } = this

      let hasState = getProperty(record, 'moduleState.id', null)
      let isLocked = hasState
        ? moduleStore.isStatusLocked(record.moduleState.id, this.moduleName)
        : false

      return hasState && !isLocked && !isRequestedState
    },
    systemBtnList() {
      let { record } = this
      let { decommission = false } = record || {}
      return [
        {
          name: this.$t('portfolio.buttons.new_building', 'Add Building', {
            ns: 'portfolio',
          }),
          identifier: 'addBuilding',
          clickAction: this.openNewSpaceForm,
          moduleName: 'building',
          disabled: decommission,
        },
        {
          name: this.$t('portfolio.buttons.new_space', 'Add Space', {
            ns: 'portfolio',
          }),
          identifier: 'addSiteSpace',
          clickAction: this.openNewSpaceForm,
          moduleName: 'space',
          disabled: decommission,
        },
        {
          name: this.$t('portfolio.buttons.new_space', 'Add Space', {
            ns: 'portfolio',
          }),
          identifier: 'addBuildingSpace',
          clickAction: this.openNewSpaceForm,
          moduleName: 'space',
          disabled: decommission,
        },
        {
          name: this.$t('portfolio.buttons.new_floor', 'Add Floor', {
            ns: 'portfolio',
          }),
          identifier: 'addFloor',
          clickAction: this.openNewSpaceForm,
          moduleName: 'floor',
          disabled: decommission,
        },
        {
          name: this.$t('portfolio.buttons.new_space', 'Add Space', {
            ns: 'portfolio',
          }),
          identifier: 'addFloorSpace',
          clickAction: this.openNewSpaceForm,
          moduleName: 'space',
          disabled: decommission,
        },
        {
          name: this.$t('portfolio.buttons.new_sub_space', 'Add Sub Space', {
            ns: 'portfolio',
          }),
          identifier: 'addSubSpace',
          clickAction: this.openNewSpaceForm,
          moduleName: 'space',
          disabled: decommission,
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: this.$t('portfolio.buttons.edit', 'Edit', {
            ns: 'portfolio',
          }),
          identifier: 'editSite',
          clickAction: this.editRecord,
        },
        {
          name: this.$t('portfolio.buttons.edit', 'Edit', {
            ns: 'portfolio',
          }),
          identifier: 'editBuilding',
          clickAction: this.editRecord,
        },
        {
          name: this.$t('portfolio.buttons.edit', 'Edit', {
            ns: 'portfolio',
          }),
          identifier: 'editFloor',
          clickAction: this.editRecord,
        },
        {
          name: this.$t('portfolio.buttons.edit', 'Edit', {
            ns: 'portfolio',
          }),
          identifier: 'editSpace',
          clickAction: this.editRecord,
        },
        {
          name: this.$t('portfolio.buttons.download_qr', 'Download QR', {
            ns: 'portfolio',
          }),
          identifier: 'downloadSiteQR',
          clickAction: this.redirectToQrPage,
        },
        {
          name: this.$t('portfolio.buttons.download_qr', 'Download QR', {
            ns: 'portfolio',
          }),
          identifier: 'downloadBuildingQR',
          clickAction: this.redirectToQrPage,
        },
        {
          name: this.$t('portfolio.buttons.download_qr', 'Download QR', {
            ns: 'portfolio',
          }),
          identifier: 'downloadSpaceQR',
          clickAction: this.redirectToQrPage,
        },
        {
          name: this.$t('portfolio.buttons.download_qr', 'Download QR', {
            ns: 'portfolio',
          }),
          identifier: 'downloadFloorQR',
          clickAction: this.redirectToQrPage,
        },
        {
          name: this.$t('portfolio.buttons.add_photo', 'Add Photo', {
            ns: 'portfolio',
          }),
          identifier: 'addSitePhoto',
          clickAction: this.openAddPhotoDialog,
        },
        {
          name: this.$t('portfolio.buttons.add_photo', 'Add Photo', {
            ns: 'portfolio',
          }),
          identifier: 'addBuildingPhoto',
          clickAction: this.openAddPhotoDialog,
        },
        {
          name: this.$t('portfolio.buttons.add_photo', 'Add Photo', {
            ns: 'portfolio',
          }),
          identifier: 'addSpacePhoto',
          clickAction: this.openAddPhotoDialog,
        },
        {
          name: this.$t('portfolio.buttons.add_photo', 'Add Photo', {
            ns: 'portfolio',
          }),
          identifier: 'addFloorPhoto',
          clickAction: this.openAddPhotoDialog,
        },
        {
          name: this.$t(
            'portfolio.buttons.add_meter_relationship',
            'Add Meter Relationship',
            {
              ns: 'portfolio',
            }
          ),
          identifier: 'addMeterRelationShip',
          clickAction: this.addMeterRelationShip,
        },
      ]
    },
  },

  methods: {
    editRecord() {
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_EDIT) || {}

      let { moduleName, id, viewname } = this
      if (name) {
        this.$router.push({
          name,
          params: {
            id: id,
            viewname: viewname || 'all',
            moduleName: moduleName,
          },
        })
      }
    },
    openAddPhotoDialog() {
      this.showPhotoDialog = true
    },
    closeForm() {
      console.log('form close')
      this.showFormDialog = false
    },
    back() {
      if (!this.isModuleTab) {
        let { name } = findRouteForTab(pageTypes.PORTFOLIO_LIST) || {}
        let { id, viewname } = this
        if (name) {
          this.$router.push({
            name,
            params: {
              id: id,
              viewname: viewname || 'all',
              moduleName: 'site',
              groupName: 'sites',
            },
          })
        }
      } else {
        let viewname = this.$route?.params?.viewname
        let { routeName } = this
        if (routeName) {
          this.$router.push({
            name: routeName,
            params: { viewname },
          })
        }
      }
    },
    refreshTreeData(data) {
      eventBus.$emit('refresh-spaceList')
      eventBus.$emit('refresh-tree')
      this.$emit('refresh', data)
      this.closeForm()
    },
    refreshDetails() {
      this.loadRecord(true)
    },
    setPhotos(data) {
      this.$set(this, 'photos', data)
    },
    openNewSpaceForm(btnObj) {
      let { moduleName } = btnObj
      this.selectedModuleForm = moduleName
      this.showFormDialog = true
    },
    defaultSpace() {
      let {
        showPhotoDialog,
        record,
        showFormDialog,
        canShowMeterRelationshipDialog,
        downloadQRurl,
      } = this || {}
      if (showPhotoDialog) {
        return (
          <SpacePhotoUploader
            details={record}
            showPhotoDialog={showPhotoDialog}
            vOn:onClose={() => (this.showPhotoDialog = false)}
          ></SpacePhotoUploader>
        )
      }
      if (showFormDialog) {
        return (
          <BaseSpaceForm
            isDialogForm={showFormDialog}
            parentModule={this.moduleName}
            parentId={record.id}
            fromSummary={true}
            formModuleName={this.selectedModuleForm}
            vOn:close={this.closeForm}
            vOn:refresh={this.refreshTreeData}
          ></BaseSpaceForm>
        )
      }
      if (canShowMeterRelationshipDialog) {
        return (
          <AddRelationShip
            canShowDialog={canShowMeterRelationshipDialog}
            record={this.record}
            moduleName={this.moduleName}
            vOn:saveDialog={this.saveMeterRelDialog}
            vOn:closeDialog={this.closeMeterRelDialog}
          />
        )
      }
    },
    async redirectToQrPage() {
      let { printQrUrl } = this
      window.open(printQrUrl)
    },
  },
}
</script>
