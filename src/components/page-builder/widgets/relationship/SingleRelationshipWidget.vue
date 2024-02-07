<template>
  <FContainer>
    <portal :to="`title-${widget.id}-${widget.name}`">
      <FContainer display="flex" padding="containerXLarge">
        <FText color="textMain">{{ relationshipDisplayName }}</FText>
        <FDivider margin="containerNone containerLarge" height="16px" />
        <FText color="textDescription">
          {{ relationName }} -
          {{ toModuleName }}
        </FText></FContainer
      >
    </portal>
    <RelationList
      v-if="showRelation"
      v-bind="$attrs"
      :widget="widgetCpy"
      :details="details"
      :parentId="parentId"
      :toModuleName="toModuleName"
    ></RelationList>
    <RelationSummary
      v-else
      v-bind="$attrs"
      :widget="widgetCpy"
      :moduleName="toModuleName"
      :details="relationRecord"
      :parentId="parentId"
      :isV3Api="true"
      :primaryFields="[]"
      :isLoading="isLoading"
      :toModuleName="toModuleName"
      @onUpdate="loadData"
    ></RelationSummary>
  </FContainer>
</template>
<script>
import RelationWidget from './RelationWidget.vue'
import cloneDeep from 'lodash/cloneDeep'
import { API } from '@facilio/api'
import dlv from 'dlv'
import { ftoast } from '@facilio/design-system'

const relationTypeMap = {
  ONE_TO_ONE: 1,
  ONE_TO_MANY: 2,
  MANY_TO_ONE: 3,
  MANY_TO_MANY: 4,
}

export default {
  extends: RelationWidget,
  data() {
    return {
      widgetCpy: {},
    }
  },
  created() {
    let { widget } = this
    this.widgetCpy = Object.assign(
      { relation: cloneDeep(widget.widgetDetail) },
      widget
    )
  },
  computed: {
    toModuleName() {
      let { widgetDetail } = this.widget || {}
      let { toModuleName } = widgetDetail || {}

      return toModuleName
    },
    relationshipDisplayName() {
      return dlv(this.widget, 'widgetDetail.name')
    },
    relationName() {
      return dlv(this.widget, 'widgetDetail.relationName')
    },
    showRelation() {
      let { widgetDetail } = this.widget || {}
      let { relationType } = widgetDetail || {}
      let { ONE_TO_MANY, MANY_TO_MANY } = relationTypeMap || {}

      return [ONE_TO_MANY, MANY_TO_MANY].includes(relationType)
    },
    moduleName() {
      return this.$attrs.moduleName
    },
  },
  methods: {
    async loadData() {
      this.isLoading = true

      let { widgetDetail } = this.widget || {}
      let { reverseRelationLinkName } = widgetDetail || {}

      let params = {
        viewName: 'hidden-all',
        includeParentFilter: true,
        withCount: true,
      }
      let url = `v3/modules/${this.moduleName}/${this.details?.id}/relationship/${reverseRelationLinkName}`
      let { data, error } = await API.get(url, params, {
        force: true,
      })

      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        this.relationRecord = dlv(data, `${this.toModuleName}.0`, {})
      }
      this.isLoading = false
    },
  },
}
</script>
