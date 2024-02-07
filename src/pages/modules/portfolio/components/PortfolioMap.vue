<template>
  <FMapWidget
    :data="mapData"
    :markerType="type"
    :close.sync="close"
    ref="portFolioMap"
    height="472px"
    width="100%"
    class="new-site-map"
    @boundsChanged="loadMapData"
    @cluster="loadClusterData"
  >
    <template v-slot="markerScope">
      <FContainer
        v-if="!markerScope.currentMarker.isCluster"
        @click="redirectToOverview(markerScope)"
        width="100%"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap="containerMedium"
        >
          <FContainer v-if="markerScope.currentMarker.isContainsPhoto">
            <img
              :src="markerScope.currentMarker.avatarUrl"
              width="98%"
              height="94"
            />
          </FContainer>
          <FContainer
            flexDirection="row"
            display="flex"
            justifyContent="space-between"
          >
            <FText appearance="headingMed14" color="textMain">
              {{ markerScope.currentMarker.name }}
            </FText>
            <FButton
              appearance="link"
              size="small"
              @click="redirectToOverview(markerScope)"
            >
              <FText appearance="bodyReg14" color="textPrimaryDefault">
                {{ `View` }}
              </FText>
            </FButton>
          </FContainer>
          <FContainer wordBreak="break-word">
            <FText appearance="captionReg14" color="textMain">
              {{ markerScope.currentMarker.address }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        v-else
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        justifyContent="space-between"
        gap="containerXLarge"
      >
        <FContainer
          overflow="hidden"
          width="100%"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerSmall"
          paddingBottom="containerLarge"
        >
          <FContainer
            width="100%"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <FContainer>
              <FText color="textMain" appearance="headingMed14">
                {{ `${markerScope.currentMarker.count} Sites` }}
              </FText>
            </FContainer>
            <FContainer>
              <FIcon
                group="default"
                name="close"
                size="14"
                @click="closePopup"
              ></FIcon>
            </FContainer>
          </FContainer>
          <FContainer width="100%">
            <FText color="textCaption" appearance="captionReg12">
              {{ `${markerScope.currentMarker.address}` }}
            </FText>
          </FContainer>
        </FContainer>
        <FContainer padding="containerSmall">
          <FInput
            v-model="searchString"
            size="medium"
            placeholder="Search here"
          >
            <template #prefix>
              <FIcon
                group="action"
                name="search"
                size="16"
                :pressable="false"
                @click="showSearch = false"
              ></FIcon>
            </template>
          </FInput>
        </FContainer>
        <FContainer
          display="flex"
          flex-direction="column"
          overflow-y="scroll"
          maxHeight="350px"
          :height="getHeight"
        >
          <FContainer maxHeight="400px" overflow="scroll">
            <FContainer
              v-if="isEmpty(filteredRecords)"
              marginTop="containerLarge"
            >
              <FEmptyState
                illustration="no-data"
                size="S"
                :title="emptyStateMessage"
                :vertical="true"
              ></FEmptyState>
            </FContainer>
            <FContainer
              v-else
              v-for="marker in filteredRecords"
              padding="containerLarge"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              alignSelf="stretch"
            >
              <FContainer
                width="120px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                letterSpacing="0.5px"
                cursor="pointer"
              >
                <FTooltip placement="left">
                  <template #title> {{ marker.currentMarker.name }} </template>
                  <FText color="textMain" appearance="bodyReg14">
                    {{ marker.currentMarker.name }}
                  </FText>
                </FTooltip>
              </FContainer>
              <FContainer>
                <FIcon
                  group="navigation"
                  size="16"
                  name="open-window"
                  @click="redirectToOverview(marker)"
                ></FIcon>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </template>
  </FMapWidget>
</template>
<script>
import { findRouteForTab, pageTypes } from '@facilio/router'
import FMapWidget from './FMapWidget.vue'
import {
  FContainer,
  FText,
  FButton,
  ftoast,
  FTooltip,
  FEmptyState,
  FIcon,
  FInput,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import isEqual from 'lodash/isEqual'
import { convertAddressToReadableString } from '../../../../utils/formatter'
export default {
  props: ['type', 'moduleName'],
  components: {
    FMapWidget,
    FContainer,
    FText,
    FIcon,
    FTooltip,
    FButton,
    FInput,
    FEmptyState,
  },
  async created() {
    await this.loadMapData(null, null, true)
  },
  data() {
    return {
      mapData: [],
      clusterData: null,
      close: false,
      isEmpty,
      searchString: '',
    }
  },
  computed: {
    filters() {
      let { $route } = this
      let {
        query: { search },
      } = $route || {}

      return !isEmpty(search) ? JSON.parse(search) : null
    },
    getHeight() {
      let { filteredRecords } = this
      if (filteredRecords == 0 || filteredRecords.length > 2) {
        return `120px`
      }
      return `80px`
    },
    filteredRecords() {
      let { searchString, clusterData } = this
      if (searchString == '') {
        return clusterData.spaces
      } else {
        let { spaces } = clusterData
        let spaceMap = []
        spaces.map(space => {
          let { currentMarker } = space
          let { name } = currentMarker
          if (name.includes(searchString)) {
            return spaceMap.push(space)
          }
        })
        return spaceMap || null
      }
    },
    emptyStateMessage() {
      return this.$t('portfolio.cluster.no_data', 'No results found', {
        ns: 'portfolio',
      })
    },
  },
  watch: {
    filters(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.loadMapData(null, null, true)
      }
    },
    moduleName: {
      async handler(newVal, oldVal) {
        if (!isEmpty(newVal) && newVal != oldVal) {
          await this.loadMapData(null, null, true)
        }
      },
    },
  },
  methods: {
    async loadMapData(lat, lng, fitBounds) {
      let { filters, moduleName } = this || {}
      let params = {}
      if (lat == null) {
        params = {
          filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
          defaultIds: '',
          moduleName,
        }
      } else {
        params = {
          maxLatitude: lat.hi,
          maxLongitude: lng.hi,
          minLongitude: lng.lo,
          minLatitude: lat.lo,
          filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
          defaultIds: '',
          moduleName,
        }
      }

      let { data, error } = await API.get('/v2/portfolio/boundedSpaces', params)
      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t(
              'portfolio.api.error',
              `error occured while fetching ${this.moduleName}s for specified bounds`,
              { ns: 'portfolio' }
            )
        )
      } else {
        if (!isEmpty(data) && !isEmpty(data.spaces)) {
          let { spaces } = data || {}
          if (!isEmpty(spaces)) {
            let map = []
            this.$emit('hasData', true)
            spaces.forEach(space => {
              if (space.lat && space.lng) {
                let { state, street, zip, city, country } = space || {}
                data = {
                  avatarUrl: space.photoId
                    ? `/api/v2/files/preview/${space.photoId}`
                    : null,
                  id: space.id,
                  location: {
                    lat: space.lat,
                    lng: space.lng,
                  },
                  name: space.name,
                  isContainsPhoto: space.photoId ? true : false,
                  address: convertAddressToReadableString({
                    state,
                    street,
                    zip,
                    city,
                    country,
                  }),
                }
                map.push(data)
              }
            })
            this.mapData = map
          }
        } else {
          this.mapData = []
          this.$emit('hasData', false)
        }
      }
      if (fitBounds) {
        setTimeout(() => {
          this.$refs.portFolioMap.fitBounds()
        }, 1000)
      }
    },
    loadClusterData(value) {
      this.clusterData = value
    },
    closePopup() {
      this.close = true
    },
    redirectToOverview(data) {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY)
      if (name) {
        this.$router.push({
          name,
          params: {
            moduleName: this.moduleName,
            id: data.currentMarker.id,
          },
        })
      }
    },
  },
}
</script>
<style>
.box-contaner {
  border: 1px solid var(--colors-border-neutral-base-subtler, #eae9e9);
  box-shadow:
    0px 4px 4px 0px rgba(0, 0, 0, 0.25),
    0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}
</style>
