<template>
  <FContainer style="height: 100%">
    <FContainer
      v-if="loading"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FSpinner :size="30"></FSpinner>
    </FContainer>
    <FContainer
      v-else-if="isEmpty(readingRelationships)"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FEmptyState
        illustration="no-entries"
        :vertical="false"
        size="S"
        title="No Readings Available"
        description="Currently the Site has no related readings"
      ></FEmptyState>
      <!-- <FEmptyState title="No Relationships"> </FEmptyState> -->
    </FContainer>
    <FContainer v-else height="100%" display="flex">
      <FTabs v-model="activeTab" :tabsList="tabs" :maxCount="4">
        <FTabPane v-for="tab in tabs" :activeKey="tab.value" :key="tab.value">
          <NewRelatedReadingsList
            :widget="widget"
            :resourceId="details.id"
            :relDetail="tab.relation"
            :resizeWidget="resizeWidget"
            :moduleName="moduleName"
          >
          </NewRelatedReadingsList>
        </FTabPane>
      </FTabs>
      <FDivider width="100%"></FDivider>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import NewRelatedReadingsList from '../components/NewRelatedReadingsList.vue'
import {
  FContainer,
  FTabs,
  FTabPane,
  FSpinner,
  FDivider,
  FEmptyState,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

export default {
  components: {
    FContainer,
    FTabs,
    FTabPane,
    FSpinner,
    FEmptyState,
    NewRelatedReadingsList,
  },
  props: ['details', 'widget', 'moduleName', 'resizeWidget'],
  created() {
    this.loadRelationsWithReading()
  },
  data() {
    return {
      isEmpty,
      activeTab: '',
      recordList: null,
      isLoading: false,
      tabs: [],
      options: [],
      readingRelationships: [],
    }
  },
  computed: {
    loading() {
      return this.isLoading
    },
  },
  methods: {
    isActive(tabName) {
      return this.activeTab === tabName
    },
    async loadRelationsWithReading() {
      this.isLoading = true
      try {
        let { data, error } = await API.get(
          `v2/reading/latestdata/getReadingsRelationships/${this.moduleName}`,
          {
            moduleName: this.moduleName,
            resourceId: this.details.id,
          }
        )
        this.readingRelationships = []
        if (!error) {
          let relationships = getProperty(data, 'result', [])
          if (!isEmpty(relationships)) {
            this.readingRelationships = relationships
            this.activeTab = this.readingRelationships[0].id
            for (let i = 0; i < this.readingRelationships.length; i++) {
              let relation = this.readingRelationships[i]
              this.tabs.push({
                label: relation.name,
                value: relation.id,
                relation: relation,
              })
            }
          } else {
            this.resizeWidget({ h: 3 })
          }
        }
      } catch (e) {
        this.readingRelationships = []
      }
      this.isLoading = false
    },
    handleCommand(command) {
      this.activeTab = command.linkName
    },
  },
}
</script>
