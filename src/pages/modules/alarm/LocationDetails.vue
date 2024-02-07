<template>
  <FContainer overflow="scroll">
    <FContainer
      display="flex"
      justifyContent="space-between"
      gap="sectionLarge"
      padding="containerXxLarge containerNone"
      marginRight="sectionLarge"
    >
      <FContainer width="200px">
        <FContainer
          @click="openAsset(alarm.resource.id)"
          padding="containerLarge containerXxLarge"
          cursor="pointer"
        >
          <FText appearance="headingMed14" color="textMain">
            {{ alarm.resource.name }}</FText
          >
        </FContainer>
        <FContainer
          padding="containerLarge containerXxLarge"
          display="flex"
          flexWrap="wrap"
        >
          <FContainer v-for="(item, index) in hierarchyList" :key="index">
            <FContainer
              @click="redirect(item.routeParams)"
              v-if="
                alarm.resource.resourceType === 2 ||
                index != hierarchyList.length - 1
              "
              cursor="pointer"
            >
              <FText appearance="bodyReg14" color="textMain">{{
                getDisplayName(item, index)
              }}</FText>
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
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import SpaceCardMixin from '../workorder/widgets/SpaceCardMixin'

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
  },
  mixins: [SpaceCardMixin],
  data() {
    return {
      hierarchyList: [],
      loading: false,
      site: null,
      currentLocation: '',
    }
  },
  computed: {
    alarm() {
      return this.details
    },
  },
  created() {
    this.loadResourceDetails()
  },
  methods: {
    getDisplayName(item, index) {
      let { alarm, hierarchyList } = this
      let { resource } = alarm || {}
      let { resourceType } = resource || {}
      if (
        (resourceType === 2 && index !== hierarchyList.length - 1) ||
        (resourceType !== 2 &&
          hierarchyList.length > 1 &&
          index !== hierarchyList.length - 2)
      )
        return item.displayName + ', '
      return item.displayName + '.'
    },
    async loadResourceDetails() {
      this.hierarchyList = []
      let resource = getProperty(
        this.alarm,
        `${this.resourceFieldKey || 'resource'}`
      )
      if (!isEmpty(resource)) {
        let resourceId = resource.id
        if (resource.resourceType === 2) {
          this.loading = true
          let { data = {}, error } = await API.get(
            `/v2/newreadingalarm/fetchHierarchy/${resourceId}`,
            { fetchHierarchy: true }
          )
          if (error) {
            ftoast.critical(error.message)
          } else {
            let { asset } = data || {}
            let space = getProperty(asset, 'space', {})
            if (!isEmpty(space)) {
              let { currentLocation } = asset || {}
              this.hierarchyList = await this.initHierarchy(space)
              this.currentLocation = currentLocation
            }
          }
          this.loading = false
        } else {
          this.loading = true
          let { data, error } = await API.get(
            `/v2/basespaces/${resourceId}?fetchDeleted=true`
          )
          if (error) {
            ftoast.critical(error.message)
          } else {
            let basespace = getProperty(data, 'basespace', {})
            if (!isEmpty(basespace)) {
              let { currentLocation } = basespace || {}
              this.hierarchyList = await this.initHierarchy(basespace)
              this.currentLocation = currentLocation
            }
          }
          this.loading = false
        }
      }
    },
    async openAsset(id) {
      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule('asset', pageTypes.OVERVIEW) || {}

        if (name) {
          this.$router.push({ name, params: { id } })
        }
      }
    },
    getMapLink() {
      let href = `https://www.google.com/maps/search/?api=1&query=${this.currentLocation}`
      return href
    },
  },
}
</script>
