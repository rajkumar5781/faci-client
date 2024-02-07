<template>
  <FContainer v-if="isLoading"> </FContainer>
  <FContainer v-else ref="failureReport-body" width="100%">
    <portal
      :to="`title-${widget.id}-${widget.name}`"
      class="portal-alignment-ws"
    >
      <FContainer padding="containerLarge containerXxLarge">
        <FText appearance="headingMed14">Failure Report</FText>
      </FContainer></portal
    >
    <FContainer
      padding="containerXxLarge"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
    >
      <FContainer>
        <FText appearance="captionMed12" color="textMain">
          {{
            $t('workorder.class_name', 'Failure Class Name', {
              ns: 'workorder',
            })
          }}
        </FText>
        <FContainer>
          <FText appearance="bodyReg14" color="textDescription">
            {{ getName(this.details.failureClass) }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer>
        <FContainer>
          <FText appearance="captionMed12" color="textMain">{{
            $t('workorder.description', 'Description', { ns: 'workorder' })
          }}</FText>
        </FContainer>
        <FContainer>
          <FText appearance="bodyReg14" color="textDescription">
            {{ getDescription(this.details.failureClass) }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import getProperty from 'dlv'
import {
  FSpinner,
  FTable,
  FContainer,
  FIcon,
  FButton,
  FText,
  ftoast,
  FDivider,
  FEmptyState,
} from '@facilio/design-system'

export default {
  props: [
    'moduleName',
    'details',
    'resizeWidget',
    'layoutParams',
    'calculateDimensions',
    'widget',
  ],
  components: {
    FSpinner,
    FTable,
    FContainer,
    FDivider,
    FIcon,
    FButton,
    FEmptyState,

    FText,
  },
  data() {
    return {
      isLoading: false,
      failureClass: null,
    }
  },
  mounted() {
  this.autoResize()
  },
  methods: {
    autoResize() {
     this.resizeWidget({ h: 2 })
    },

    getName(item) {
      return getProperty(item, 'name', '---')
    },

    getDescription(item) {
      let description = getProperty(item, 'description', 'NA')
      return description
    },
  },
}
</script>
