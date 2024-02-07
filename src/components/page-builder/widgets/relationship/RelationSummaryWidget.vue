<template>
  <FContainer height="100%">
    <portal v-if="canShowRelActionButtons" :to="actionPortal">
      <FButton
        v-if="!(isEmpty(details) || emptyState)"
        appearance="secondary"
        iconPosition="prefix"
        iconGroup="connectivity"
        iconName="unplug"
        @click="disassociateRecord"
      >
        Dissociate
      </FButton>
    </portal>
    <FContainer
      v-if="showLoading"
      height="100%"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      ><FSpinner :size="20"></FSpinner
    ></FContainer>
    <template v-else
      ><FContainer
        v-if="emptyState || isEmpty(details)"
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
      >
        <FEmptyState
          :title="emptyStateText"
          illustration="add-item"
          size="S"
          :vertical="true"
        >
          <template #buttons>
            <FContainer
              v-if="canShowRelActionButtons"
              marginBottom="containerXLarge"
            >
              <FButton
                v-if="isEmpty(details) || emptyState"
                appearance="primary"
                iconPosition="prefix"
                iconGroup="navigation"
                iconName="addition"
                @click="showLookupFieldWizard = true"
              >
                {{ $t('summary.widgets.bulkwidget.associate') }}
              </FButton>
            </FContainer>
          </template>
        </FEmptyState>
      </FContainer>
      <SummaryFieldsWidget
        v-else
        ref="summary-fields"
        :details="details"
        :moduleName="moduleName"
        :widget="serializedWidget"
        v-bind="$attrs"
      ></SummaryFieldsWidget>
      <RelationshipWizard
        v-if="showLookupFieldWizard"
        :key="`${relationName}-${toModuleName}`"
        :canShowLookupWizard.sync="showLookupFieldWizard"
        :config="{}"
        :parentModuleName="fromModuleName"
        :field="fieldObj"
        :recordId="parentId"
        :isEdit="true"
        @setLookupFieldValue="setListValues"
      ></RelationshipWizard>
    </template>
  </FContainer>
</template>
<script>
import SummaryFieldsWidget from '../fieldSummary/SummaryFieldsWidget.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import isEqual from 'lodash/isEqual'
import { RelationshipWizard } from '@facilio/ui/new-forms'
import { getApp } from '@facilio/router'
import { findRouteForModule, pageTypes } from '@facilio/router'
import {
  FButton,
  FText,
  FContainer,
  FIcon,
  FEmptyState,
  fDialog,
  ftoast,
  FSpinner,
  FModal,
} from '@facilio/design-system'
import dlv from 'dlv'

export default {
  props: [
    'isLoading',
    'moduleName',
    'parentId',
    'toModuleName',
    'widget',
    'details',
    'resizeWidget',
    'calculateDimensions',
    'layoutParams',
    'relationshipDisplayName',
    'actionPortal',
  ],
  components: {
    RelationshipWizard,
    FButton,
    FText,
    FContainer,
    FIcon,
    FEmptyState,
    FModal,
    FSpinner,
    SummaryFieldsWidget,
  },
  data() {
    return {
      showLookupFieldWizard: false,
      loading: true,
      isEmpty,
      emptyState: false,
      widgetDetail: {},
    }
  },
  computed: {
    fieldObj() {
      let { relation } = this.widget
      return { relationData: relation }
    },
    appId() {
      let { id } = getApp() || {}
      return id
    },
    showShowMore() {
      let { needsShowMore, contentHidden } = this
      return contentHidden || needsShowMore
    },
    serializedWidget() {
      let { widget, widgetDetail } = this
      return { ...widget, widgetDetail }
    },
    widgetName() {
      let { name } = this.widget
      return name
    },
    fromModuleName() {
      return dlv(this.widget, 'relation.fromModuleName')
    },
    emptyStateText() {
      let { toModuleDisplayName } = this
      return `No ${toModuleDisplayName} Associated`
    },

    filteredFieldsList() {
      let { fieldsList } = this

      if (!isEmpty(fieldsList)) {
        let mainFieldIdx = fieldsList.findIndex(fld => fld?.field?.mainField)

        if (mainFieldIdx !== -1) {
          let mainFieldObj = fieldsList[mainFieldIdx]
          fieldsList.splice(mainFieldIdx, 1)
          fieldsList.unshift(mainFieldObj)
        }
      }

      return fieldsList
    },
    toModuleDisplayName() {
      return dlv(this.widget, 'relation.toModule.displayName')
    },
    relationName() {
      return dlv(this.widget, 'relation.relationName')
    },
    showLoading() {
      return this.isLoading || this.loading
    },
    listUrlConfig() {
      let { searchText, parentId } = this
      let { relation } = this.widget || {}
      let { fromModuleName, reverseRelationLinkName } = relation || {}
      let params = {
        unAssociated: true,
      }
      if (!isEmpty(searchText)) {
        params.search = searchText
      }
      return {
        url: `v3/modules/${fromModuleName}/${parentId}/relationship/${reverseRelationLinkName}`,
        toModuleName: this.toModuleName,
        params,
      }
    },
    canShowRelActionButtons() {
      let { $access, showLoading, moduleName } = this
      let hasPermission = $access.hasPermission(`${moduleName}:UPDATE`)
      let isVirtualRelationship = dlv(this.widget, 'relation.isVirtual', false)
      return hasPermission && !showLoading && !isVirtualRelationship
    },
  },
  watch: {
    details: {
      async handler(value, oldValue) {
        if (!isEqual(value, oldValue)) {
          this.getFormMeta()
        } else this.loading = false
      },
      immediate: true,
    },
  },
  methods: {
    setListValues(data) {
      let { selectedItems } = data?.field || {}

      if (!isEmpty(selectedItems)) {
        let selectedId = selectedItems.map(item => {
          let { value } = item || {}
          return value
        })

        this.createRelations(selectedId)
      }
    },
    async getFormMeta() {
      let { moduleName, details } = this
      if (isEmpty(moduleName) || isEmpty(details)) {
        this.emptyState = true
        this.loading = false
        return
      } else {
        this.emptyState = false
      }

      this.loading = true
      let { data, error } = await API.get(
        `v2/customPage/relation/summaryWidget/${moduleName}/get`,
        { moduleName }
      )
      if (!error) {
        this.widgetDetail = data?.widgetDetail || {}
      }
      this.loading = false
    },
    async createRelations(selectedId) {
      this.loading = true

      let { widget, parentId } = this
      let { relation } = widget || {}
      let { fromModuleName, toModuleName, forwardRelationLinkName } =
        relation || {}
      let url = `v3/modules/${fromModuleName}/${parentId}/relationship/${forwardRelationLinkName}`
      let params = { data: { [toModuleName]: selectedId } }
      let { error } = await API.post(url, params)

      if (error) {
        ftoast.critical(error.message || 'Error Occurred ')
        this.loading = false
      } else {
        ftoast.success(this.$t('custommodules.summary.relation_add_success'))
        this.$emit('onUpdate')
      }
    },
    openRecordSummary(id) {
      let { widget } = this
      let route
      let isCustomModule = dlv(widget, 'relation.toModule.custom')

      let { name } =
        findRouteForModule(this.toModuleName, pageTypes.OVERVIEW) || {}

      if (name) {
        route = this.$router.resolve({
          name,
          params: {
            viewname: 'all',
            id: id,
            moduleName: this.toModuleName,
          },
        }).href
      }
      if (route) window.open(route, '_blank')
    },
    async disassociateRecord() {
      let value = await fDialog.warning({
        title: 'Dissociate',
        description:
          'Are you sure you want to remove the record from associated relationship?',
        saveText: 'Yes',
        cancelText: 'No',
      })

      if (!value) return

      this.loading = true

      let { widget, parentId, details } = this
      let { relation } = widget || {}
      let { fromModuleName, toModuleName, forwardRelationLinkName } =
        relation || {}
      let url = `v3/modules/${fromModuleName}/${parentId}/relationship/${forwardRelationLinkName}`
      let params = { data: { [toModuleName]: [details?.id] } }
      let { error } = await API.patch(url, params)

      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('custommodules.list.delete_error'))
        this.loading = false
      } else {
        ftoast.success(
          this.$t('custommodules.summary.relation_dissociate_success')
        )
        this.needsShowMore = false
        this.resizeWidget({ h: this.defaultWidgetHeight })
        this.$emit('onUpdate')
      }
    },
    isRotatingItem(field) {
      let { name: fieldName } = field || {}
      let { rotatingItem } = this.details || {}
      let { id: rotatingItemId } = rotatingItem || {}

      return rotatingItemId && fieldName === 'rotatingItem'
    },
    isRotatingTool(field) {
      let { name: fieldName } = field || {}
      let { rotatingTool } = this.details || {}
      let { id: rotatingToolId } = rotatingTool || {}

      return rotatingToolId && fieldName === 'rotatingTool'
    },
  },
}
</script>
