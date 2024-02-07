<template>
  <FContainer
    display="flex"
    alignItems="center"
    height="100%"
    justifyContent="center"
    flexDirection="column"
    gap="containerLarge"
  >
    <FText appearance="captionMed12" color="textCaption">
      {{ $t('template.pages', { ns: 'inspection' }) }}
    </FText>
    <FText appearance="headingMed20" color="textDefault">
      {{ pagesCount }}
    </FText>
  </FContainer>
</template>

<script>
import { FContainer, FText } from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  components: { FContainer, FText },
  props: ['details'],
  computed: {
    pagesCount() {
      let { details } = this
      let pages = getProperty(details, 'totalPages', 0)
      return pages
    },
  },
}
</script>
