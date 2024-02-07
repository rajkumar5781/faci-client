<template>
  <FContainer
    margin="containerXxLarge"
    class="classification-specification-container"
  >
    <FContainer
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      v-if="isLoading"
      class="flex-middle height-100"
    >
      <FSpinner :show="isLoading" :size="30"></FSpinner>
    </FContainer>
    <div
      v-else-if="isEmpty(canShowWidget)"
      ref="content-container"
      class="classification-specification-empty-state"
    >
      <FEmptyState
        :title="
          $t('empty_state_association', 'No Classifications Associated', {
            ns: 'classification',
          })
        "
        :vertical="true"
        illustration="no-entries"
      >
        <template #buttons>
          <FButton type="primary" @click="canShowSpecificationWizard = true">
            {{
              $t('associate_classification', 'Associate classification', {
                ns: 'classification',
              })
            }}
          </FButton>
        </template>
      </FEmptyState>
    </div>

    <FContainer v-else ref="content-container">
      <FContainer marginBottom="containerXLarge">
        <FTags text="Classification Title"></FTags>
      </FContainer>
      <FContainer marginBottom="containerXLarge">
        <FText color="textDescription" appearance="bodyReg14"
          >{{
            $t('classification', 'Classification', { ns: 'classification' })
          }}
        </FText>
      </FContainer>
      <FDivider width="100%"></FDivider>
      <FieldsGroup
        :columns="noOfColumns"
        :details="formattedDetails"
        :detailsLayout="detailsLayout"
        :config="config"
        :getTimeZone="getTimeZone"
        @mounted="autoResize"
      ></FieldsGroup>
      <portal
        :to="`action-${widget.id}-${widget.name}`"
        class="specification-right-content d-flex p20"
      >
        <FTooltip
          :title="
            $t('edit_attribute', 'Edit Attribute', { ns: 'classification' })
          "
        >
          <FContainer
            padding="containerNone containerLarge containerNone containerNone"
            ><FIcon
              group="edit"
              name="edit-line"
              size="16"
              @click="editAttrs"
            ></FIcon
          ></FContainer>
        </FTooltip>
        <FTooltip
          placement="topRight"
          :title="
            $t('remove_classification', 'Remove classification', {
              ns: 'classification',
            })
          "
        >
          <FIcon
            @click="showConfirmDelete"
            group="action"
            name="delete"
            size="16"
          ></FIcon>
        </FTooltip>
      </portal>
    </FContainer>
    <SpecificationWizard
      v-if="canShowSpecificationWizard"
      isAttributeInherited="true"
      :fromModuleName="moduleName"
      @onSave="selectedClassification"
      @specificationAttributes="v => (attributesList = v)"
      @onClose="canShowSpecificationWizard = false"
    ></SpecificationWizard>
    <SpecificationAttributes
      v-if="canShowSpecificationAttributes"
      :selectedAttributes="attributesList"
      @onClose="onCancelAttributes"
      @onSave="saveAttribute"
    ></SpecificationAttributes>
  </FContainer>
</template>
<script>
import { FieldsGroup } from '@facilio/ui/new-app'
import SpecificationWizard from './SpecificationWizard.vue'
import SpecificationAttributes from './SpecificationAttributes.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { dataTypes, dataTypeKey } from './classificationUtil.js'
import { mapActions } from 'pinia'
import {
  FText,
  FEmptyState,
  FContainer,
  FTooltip,
  FIcon,
  FButton,
  ftoast,
  FDivider,
  FTags,
  FSpinner,
  fDialog,
} from '@facilio/design-system'
import metricunits from '../../../../store/metricunits'
import dlv from 'dlv'
import { getTimeFormat, getTimeZone } from '../../../../utils/formatter'

const metricunitsStore = metricunits()

export default {
  props: [
    'moduleName',
    'id',
    'resizeWidget',
    'layoutParams',
    'calculateDimensions',
    'widget',
    'details',
    'reloadSummary',
  ],
  components: {
    SpecificationWizard,
    SpecificationAttributes,
    FieldsGroup,
    FText,
    FContainer,
    FEmptyState,
    FTooltip,
    FIcon,
    FButton,
    FDivider,
    FTags,
    FSpinner,
    fDialog,
  },
  data() {
    return {
      detailsLayout: null,
      canShowSpecificationWizard: false,
      canShowSpecificationAttributes: false,
      classificationData: null,
      attributesList: null,
      isLoading: false,
      formattedDetails: {},
      isEmpty,
      getTimeZone,
    }
  },
  async created() {
    await metricunitsStore.loadMetricUnits()
    await this.init()
    this.autoResize()
  },
  computed: {
    noOfColumns() {
      return !isEmpty(this.attributesList) ? 4 : 1
    },
    config() {
      let { $account: account } = this
      let timeformat = getTimeFormat()
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      let dateformat = dlv(account, 'org.dateFormat') || 'DD/MM/YYYY'
      return {
        dateformat,
        timezone,
        timeformat,
        showDivider: false,
        org: account.org,
      }
    },
    canShowWidget() {
      let { details } = this
      return details.classification || []
    },
    //Check for Workorder due to internal dependency
  },
  methods: {
    ...mapActions(metricunits, ['loadMetricUnits']),
    async init() {
      let { classification } = this.details || {}
      if (!isEmpty(classification)) {
        this.isLoading = true
        let { name, id, attributes } = classification || {}

        this.classificationData = { name, id }
        this.attributesList = attributes
        this.detailsLayout = await this.serializeDetailsLayout()
        this.isLoading = false
      }
    },
    autoResize(reset) {
      setTimeout(() => {
        let { h: layoutHeight } = this.layoutParams || {}

        if (reset) {
          this.resizeWidget({ h: layoutHeight })
          return
        }

        let container = this.$refs['content-container']?.$el

        if (!container) return
        let height = container.scrollHeight
        let width = container.scrollWidth

        let { h: actualHeight } = this.calculateDimensions({ height, width })
        let h =
          actualHeight > layoutHeight || actualHeight < layoutHeight
            ? actualHeight
            : layoutHeight

        if (actualHeight !== layoutHeight) this.resizeWidget({ h })
      })
    },
    async serializeDetailsLayout() {
      let { name } = this.classificationData || {}
      let { details, fields } = this.formatFields() || {}
      this.formattedDetails = details
      let data = [
        {
          columns: 4,
          displayName: this.$t('attributes', 'Attributes', {
            ns: 'classification',
          }),
          fields,
        },
      ]
      return data
    },
    formatFields() {
      let { attributesList } = this
      let { DECIMAL, NUMBER } = dataTypes || {}
      let unit = null
      let formattedFields = (attributesList || []).reduce(
        (acc, attr) => {
          let { name, value, fieldType, unitId, metric, id } = attr || {}
          let uni_name = (name || '').split(' ').join('_') + id
          acc.details[uni_name] = value
          if (fieldType === DECIMAL || fieldType === NUMBER) {
            unit = this.getUnitName(metric, unitId)
          }
          acc.fields.push({
            name: uni_name,
            displayName: name,
            field: { dataTypeEnum: dataTypeKey[fieldType], unit },
            colSpan: 1,
          })
          return acc
        },
        { details: {}, fields: [] }
      )
      return formattedFields
    },
    getUnitName(metric, unitId) {
      let options = metricunitsStore.getMetricsUnit({ metricId: metric })
      let unitLabel = ''
      options.forEach(unit => {
        let { label, value } = unit
        if (value === unitId) unitLabel = label
      })
      return unitLabel
    },
    async selectedClassification(item) {
      this.classificationData = item
      this.canShowSpecificationAttributes = true
    },
    async saveAttribute(item) {
      this.canShowSpecificationWizard = false
      let attributesData = await this.filteredAttributes(item)

      this.saveClassification(attributesData)
    },
    filteredAttributes(attributes) {
      let { NUMBER, DECIMAL } = dataTypes || {}
      let serializedAttribute = (attributes || []).map(attr => {
        let { fieldType, value } = attr || {}

        if (fieldType === NUMBER)
          value = !isEmpty(value) ? parseInt(value) : null
        else if (fieldType === DECIMAL)
          value = !isEmpty(value) ? parseFloat(value) : null

        return { ...attr, value }
      })

      return serializedAttribute
    },
    serialize(attributesData = null) {
      let { id, moduleName, classificationData } = this
      let { id: classificationId } = classificationData || []
      let classification = null

      if (!isEmpty(classificationId)) {
        classification = { id: classificationId, attributes: attributesData }
      }

      return { data: { classification }, id, moduleName }
    },
    async saveClassification(attributesData = null) {
      this.isLoading = true
      this.canShowSpecificationAttributes = false

      let params = this.serialize(attributesData)
      let { error } = await API.post('v3/modules/data/patch', params)

      if (error) {
        ftoast.critical(error.message)
      } else {
        ftoast.success(
          this.$t(
            'associate_successfully',
            'Classification Associated Successfully',
            { ns: 'classification' }
          )
        )
        this.reloadSummary()
      }
      this.isLoading = false
      this.$nextTick(() => {
        this.autoResize(isEmpty(this.detailsLayout))
      })
    },
    onCancelAttributes() {
      this.canShowSpecificationWizard = false
      this.canShowSpecificationAttributes = false
    },
    editAttrs() {
      this.canShowSpecificationAttributes = true
    },
    async showConfirmDelete() {
      let value = await fDialog.warning({
        title: `${this.$t('delete_associate', 'Delete Associate', {
          ns: 'classification',
        })}`,
        description: `${this.$t(
          'delete_associate_msg',
          'Are you sure you want to delete associated classification',
          { ns: 'classification' }
        )}`,
        saveText: 'Confirm',
        cancelText: 'Cancel',
      })

      if (value) {
        this.classificationData = null
        this.isLoading = true

        let params = this.serialize()
        let { error } = await API.post('v3/modules/data/patch', params)

        if (!error) {
          this.detailsLayout = null
          ftoast.success(
            this.$t(
              'delete_sucess',
              'Associated Classification Deleted Successfully',
              { ns: 'classification' }
            )
          )
          this.reloadSummary()
        }
        this.isLoading = false
      }
    },
  },
}
</script>
<style lang="scss">
.classification-specification-container {
  overflow: hidden !important;
  .classification-specification-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto;
    height: 100%;

    .classification-specification-empty-state-text {
      font-size: 16px;
      font-weight: 500;
      margin-top: 20px;
    }
    .classification-specification-add-btn {
      background-color: rgb(57, 178, 194);
      height: 42px;
      border: none;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.7px;
      font-weight: bold;
      cursor: pointer;
      color: #ffffff;
      border-radius: 3px;
      margin-top: 20px;
    }
  }
  .classification-association-container {
    padding: 4px;
    letter-spacing: 0.5px;
    .selected-attribute-row {
      flex-wrap: wrap;
    }
    .selected-attribute-row > * {
      flex: 0 22%;
    }
    .attribute-name {
      padding-bottom: 8px;
      color: #797b80;
    }
    .attribute-value {
      width: 200px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .specification-right-content {
    display: flex;
    align-items: center;
    margin: 10px;
    .el-dropdown {
      display: inline-block;
      position: relative;
      color: #606266;
      font-size: 16px;
    }
  }
}
</style>
