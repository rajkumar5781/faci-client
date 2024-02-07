<template>
  <FContainer>
    <portal :to="titlePortal">
      <FContainer
        display="flex"
        flexDirection="column"
        padding="containerLarge"
      >
        <FContainer lineHeight="24px">
          <FText color="textMain" appearance="headingMed14">{{
            relationshipDisplayName
          }}</FText></FContainer
        >
        <FContainer lineHeight="19px">
          <FText color="textCaption" appearance="captionReg12">
            {{ relationName }} -
            {{ toModuleName }}
          </FText></FContainer
        ></FContainer
      >
    </portal>
    <RelationList
      v-if="showRelation"
      v-bind="$attrs"
      :widget="widget"
      :details="details"
      :parentId="parentId"
      :toModuleName="toModuleName"
      @fitContent="fitMyContent"
    ></RelationList>
    <RelationSummary
      v-else
      v-bind="$attrs"
      :widget="widget"
      :moduleName="toModuleName"
      :details="relationRecord"
      :parentId="parentId"
      :isV3Api="true"
      :primaryFields="[]"
      :isLoading="isLoading"
      :toModuleName="toModuleName"
      @onUpdate="loadData"
      :resizeWidget="resizeWidget"
      :relationshipDisplayName="relationshipDisplayName"
      :fitMyContent="fitMyContent"
    ></RelationSummary>
  </FContainer>
</template>
<script>
import RelationList from './RelationListWidget.vue'
import RelationSummary from './RelationSummaryWidget.vue'
import { API } from '@facilio/api'
import { FContainer, FDivider, FText, ftoast } from '@facilio/design-system'
import dlv from 'dlv'

const relationTypeMap = {
  ONE_TO_ONE: 1,
  ONE_TO_MANY: 2,
  MANY_TO_ONE: 3,
  MANY_TO_MANY: 4,
}

export default {
  name: 'RelationWidget',
  props: [
    'details',
    'widget',
    'id',
    'resizeWidget',
    'titlePortal',
    'fitMyContent',
  ],
  components: {
    RelationList,
    RelationSummary,
    FContainer,
    FDivider,
    FText,
  },
  data() {
    return {
      relationRecord: null,
      isLoading: false,
    }
  },
  created() {
    if (!this.showRelation) this.loadData()
  },
  computed: {
    parentId() {
      return this.id
    },
    toModuleName() {
      let { relation } = this.widget || {}
      let { toModuleName } = relation || {}
      return toModuleName
    },

    showRelation() {
      let { relation } = this.widget || {}
      let { relationType } = relation || {}
      let { ONE_TO_MANY, MANY_TO_MANY } = relationTypeMap || {}

      return [ONE_TO_MANY, MANY_TO_MANY].includes(relationType)
    },
    moduleName() {
      return this.$attrs.moduleName
    },
    relationshipDisplayName() {
      return dlv(this.widget, 'relation.name')
    },
    relationName() {
      return dlv(this.widget, 'relation.relationName')
    },
  },
  methods: {
    async loadData() {
      this.isLoading = true

      let { relation } = this.widget || {}
      let { reverseRelationLinkName } = relation || {}

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
