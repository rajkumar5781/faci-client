<template>
  <div class="h-full">
    <FContainer
      class="h-full flex items-center justify-center"
      v-if="isEmpty(currentLocation)"
    >
      <FEmptyState
        illustration="location"
        :title="
          $t('employee.last_known_location.empty_state_title', { ns: 'fsm' })
        "
        :description="
          $t('employee.last_known_location.empty_state_description', {
            ns: 'fsm',
          })
        "
        :vertical="true"
        :size="'S'"
        width="70%"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else>
      <FContainer padding="containerXxLarge" v-if="isEmpty(details)"
        ><FShimmer :rounded="false" :height="50" :width="700"
      /></FContainer>
      <FContainer padding="containerXLarge" v-else>
        <FContainer
          display="flex"
          marginBottom="containerLarge"
          gap="containerLarge"
        >
          <FIcon group="action" name="reload" size="12" :pressable="false" />
          <FText color="backgroundNeutralGrey01Dark" appearance="captionMed12"
            >{{
              details?.lastSyncTime > 0
                ? `Last synced at ${formatDate(details.lastSyncTime)}`
                : '---'
            }}
          </FText>
        </FContainer>
        <FContainer>
          <GmapMap
            :zoom="16"
            :center="currentLocation"
            style="width: 100%; height: 150px"
            :options="{
              zoomControl: false,
              scrollwheel: false,
              mapTypeControl: false,
              scaleControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              disableDefaultUI: true,
            }"
            @tilesloaded="onTilesLoaded"
          >
            <GmapMarker
              :position="currentLocation"
              :animation="2"
              :clickable="true"
            ></GmapMarker>
          </GmapMap>
        </FContainer>
        <FContainer marginTop="containerMedium">
          <FText
            appearance="captionReg12"
            color="backgroundNeutralInverseHovered"
          >
            {{ address }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </div>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FShimmer,
  FText,
  FIcon,
  FEmptyState,
} from '@facilio/design-system'
import { formatDate } from '../../../../utils/formatter'
import { getGoogleMapsAPI } from 'gmap-vue'

export default {
  props: ['details', 'widget'],
  components: {
    FContainer,
    FShimmer,
    FText,
    FIcon,
    FEmptyState,
  },
  data() {
    return {
      address: '',
    }
  },
  computed: {
    currentLocation() {
      let { details } = this
      let { currentLocation } = details || {}
      if (currentLocation) {
        return JSON.parse(currentLocation)
      }
      return ''
    },
  },
  methods: {
    isEmpty,
    formatDate,
    onTilesLoaded() {
      if (this.currentLocation) {
        let google = getGoogleMapsAPI()
        new google.maps.Geocoder()
          .geocode({ location: this.currentLocation })
          .then(response => {
            if (response.results[0]) {
              this.address = response.results[0].formatted_address
            }
          })
      }
    },
  },
}
</script>
