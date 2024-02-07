<template>
    <div class="h-full">
        <FContainer
        class="h-full flex items-center justify-center"
        v-if="isEmpty(imageUrl)"
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
        <FContainer class="h-full" v-else>
        <FContainer class="h-full" padding="sectionSmall" v-if="isEmpty(details)">
            <FShimmer :rounded="false" :height="50" :width="700"
        />
        </FContainer>
        <FContainer class="h-full" padding="sectionSmall" v-else>
            <img
            class="journey-img"
            :src="imageUrl"
            />
        </FContainer>
        </FContainer>
    </div>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FShimmer,
  FEmptyState,
} from '@facilio/design-system'
export default {
  name: 'TripJourney',
  components:{
    FContainer,
    FEmptyState,
    FShimmer
  },
  data() {
    return {}
  },
  props:['details'],
  computed: {
    imageUrl() {
      let { details } = this || {}
      let { journeyUrl } = details || {}
      return journeyUrl
    },
  },
  methods : {
    isEmpty
  }
}
</script>
<style>
.journey-img {
    border-radius: 8px;
    object-fit: fill;
    height: 100% !important;
    width: 100%;
}
</style>