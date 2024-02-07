<template>
  <FContainer
    backgroundColor="backgroundAccentYellowMedium"
    borderRadius="medium"
    padding="containerXLarge containerXxLarge"
    display="flex"
    flexDirection="row"
    justifyContent="start"
    alignItems="center"
  >
    <FContainer>
      <fc-icon group="alert" name="triangle-warning-filled"></fc-icon>
    </FContainer>
    <FText
      marginLeft="containerLarge"
      color="textMain"
      appearance="headingMed14"
      >{{ alertMessage }}</FText
    >
  </FContainer>
</template>

<script>
import { FContainer, FText, FIcon } from '@facilio/design-system'

export default {
  name: 'PlannerAlertBanner',
  components: { FContainer, FText, FIcon },

  props: {
    resourcePlaceHolderSmallCase: {
      type: String,
      required: true,
      default: 'resource',
    },
  },
  data() {
    return {}
  },
  computed: {
    alertMessage() {
      let { resourcePlaceHolderSmallCase } = this
      return `Please provide the trigger details and ensure the selection of at least one ${resourcePlaceHolderSmallCase}.`
    },
  },
  methods: {},
}
</script>
