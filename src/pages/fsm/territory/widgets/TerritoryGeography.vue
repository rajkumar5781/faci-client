<template>
  <FContainer height="100%">
    <Territory :geoJson="geoJson" />
  </FContainer>
</template>
<script>
import { FContainer } from '@facilio/design-system'
import { Territory } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['details', 'widget'],
  data() {
    return {
      geoJson: {},
    }
  },
  components: { FContainer, Territory },
  mounted() {
    this.fetchGeoJson()
  },
  methods: {
    fetchGeoJson() {
      if (
        !isEmpty(this.details?.geography) &&
        typeof this.details.geography === 'string'
      ) {
        this.geoJson = JSON.parse(this.details?.geography)
      }
    },
  },
}
</script>
