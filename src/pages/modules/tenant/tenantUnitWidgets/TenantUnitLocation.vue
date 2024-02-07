<template>
  <FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FContainer v-else-if="isEmpty(hierarchyList)">
      <FEmptyState
        :title="$t('no_location_found_for_site', { ns: 'tenant' })"
        vertical
        size="S"
        illustration="no-entries"
        type="narrow"
      />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      justifyContent="space-between"
      gap="sectionLarge"
      padding="containerXxLarge containerNone"
      marginRight="sectionLarge"
    >
      <FContainer :width="this.currentLocation ? '70%' : '100%'">
        <FContainer
          padding="containerLarge containerXxLarge"
          class="overflow-y-scroll"
          height="100px"
        >
          <FContainer
            v-for="(item, index) in hierarchyList"
            :key="index"
            width="100%"
            display="flex"
          >
            <FContainer
              @click="redirect(item.routeParams)"
              marginRight="containerMedium"
              class="truncate"
            >
              <FTooltip placement="top" :mouseEnterDelay="1">
                <template #title>{{ item.displayName }}</template>
                <FText
                  appearance="bodyReg14"
                  color="textMain"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  >{{ item.displayName }}</FText
                >
              </FTooltip>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="inline-flex"
        flex-direction="column"
        gap="containerMedium"
        marginTop="containerXxLarge"
        v-if="this.currentLocation"
      >
        <FIcon class="h-8 w-12" group="illustration" name="location"></FIcon>
        <FContainer
          display="flex"
          marginTop="containerXLarge"
          justifyContent="center"
        >
          <FButton appearance="link" size="small">
            <a :href="getMapLink()" target="_blank">{{
              $t('alarm.map', 'Map', { ns: 'alarm' })
            }}</a>
          </FButton>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FButton,
  FIcon,
  ftoast,
  FEmptyState,
  FTooltip,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import SpaceCardMixin from '../../workorder/widgets/SpaceCardMixin'

import {
  findRouteForModule,
  isWebTabsEnabled,
  pageTypes,
} from '@facilio/router'
export default {
  props: ['moduleName', 'details'],
  components: {
    FContainer,
    FText,
    FButton,
    FIcon,
    FEmptyState,
    FTooltip,
  },
  mixins: [SpaceCardMixin],
  data() {
    return {
      hierarchyList: [],
      loading: false,
      site: null,
      currentLocation: '',
      isEmpty,
    }
  },
  created() {
    this.loadResourceDetails()
  },
  methods: {
    getDisplayName(item, index) {
      let { hierarchyList } = this
      let { resourceType } = this.details
      if (index !== hierarchyList.length - 1) {
        return ` ${item.displayName} / `
      }
      return item.displayName + '.'
    },
    async loadResourceDetails() {
      this.loading = true

      this.hierarchyList = []
      let { id: resourceId, location } = this.details

      if (!isEmpty(location) && !(location?.lat === 0 && location?.lng === 0)) {
        this.currentLocation = `${location?.lat},${location?.lng}`
      }

      let { data, error } = await API.get(
        `/v2/basespaces/${resourceId}?fetchDeleted=true`
      )
      if (error) {
        ftoast.critical(error.message)
      } else {
        let basespace = getProperty(data, 'basespace', {})
        if (!isEmpty(basespace)) {
          this.hierarchyList = await this.initHierarchy(basespace)
        }
      }
      this.loading = false
    },
    getMapLink() {
      let href = `https://www.google.com/maps/search/?api=1&query=${this.currentLocation}`
      return href
    },
  },
}
</script>
