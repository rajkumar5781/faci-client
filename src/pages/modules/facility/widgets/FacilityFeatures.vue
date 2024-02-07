<template>
  <FContainer>
    <FContainer
      v-if="isEmpty(details.amenities)"
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FEmptyState
        illustration="no-data"
        :description="
          $t('amenity.no_amenity_available', {
            ns: 'facilitybooking',
          })
        "
        size="S"
        :vertical="false"
      />
    </FContainer>
    <FContainer v-else display="flex" flexWrap="wrap" padding="containerLarge">
      <FContainer
        v-for="(amenity, index) in getAmenties"
        :key="index"
        textAlign="center"
        marginRight="containerXxLarge"
        width="23%"
        padding="containerXLarge"
      >
        <FContainer display="flex" width="100%">
          <FContainer display="flex" paddingRight="containerLarge">
            <FIcon
              group="action"
              name="tick-circle-filled"
              size="16"
              color="backgroundNeutralInverseHovered"
              :pressable="false"
            ></FIcon>
          </FContainer>
          <FContainer display="flex" alignItems="center">
            <FText color="backgroundNeutralInverse" appearance="bodyReg14">{{
              amenity.name
            }}</FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FIcon, FEmptyState } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['widget', 'details', 'fitMyContent'],
  components: {
    FContainer,
    FText,
    FIcon,
    FEmptyState,
  },
  data() {
    return {}
  },
  mounted() {
    this.fitMyContent()
  },
  computed: {
    getAmenties() {
      let { details } = this
      let { amenities } = details || {}
      return amenities || []
    },
  },
  methods: {
    isEmpty,
  },
}
</script>
