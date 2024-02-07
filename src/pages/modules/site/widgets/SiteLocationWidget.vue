<template>
  <FContainer style="height: 100%">
    <FContainer v-if="loading">
      <FSpinner :size="20"></FSpinner>
    </FContainer>
    <FContainer
      v-else-if="mapQuery == ''"
      display="flex"
      flex-direction="column"
      align-items="center"
      justify-content="center"
      height="100%"
      padding="containerNone containerLarge"
      gap="containerLarge"
    >
      <FEmptyState
        illustration="broken-location"
        size="S"
        :title="emptyStateMessage.title"
        :description="emptyStateMessage.desc"
        :vertical="true"
      ></FEmptyState>
      <!-- <FIcon
        group="illustration"
        name="broken-location"
        size="80"
        :pressable="false"
        padding="containerLarge"
        color="textCaption"
      >
      </FIcon>
      <FText appearance="bodyReg14" color="backgroundPrimaryDefault">
        {{ 'No Location' }}
      </FText> -->
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flex-direction="column"
      align-items="center"
      justify-content="center"
      height="100%"
      gap="containerLarge"
    >
      <FIcon
        group="illustration"
        name="location"
        size="80"
        :pressable="false"
        padding="containerLarge"
        color="textCaption"
      >
      </FIcon>
      <FContainer
        textAlign="center"
        wordBreak="break-word"
        padding="containerNone sectionSmall containerNone sectionSmall"
      >
        <FButton appearance="link" @click="redirectToMap">
          <FContainer
            whiteSpace="normal"
            textAlign="center"
            wordBreak="break-word"
            padding="containerNone sectionSmall containerNone sectionSmall"
            ><FText appearance="bodyReg14" color="backgroundPrimaryDefault">{{
              address
            }}</FText></FContainer
          >
        </FButton>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FText,
  FContainer,
  FSpinner,
  FButton,
  FIcon,
  FEmptyState,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { convertAddressToReadableString } from '../../../../utils/formatter'
export default {
  components: {
    FText,
    FContainer,
    FEmptyState,
    FSpinner,
    FIcon,
    FButton,
  },
  props: ['details'],
  data() {
    return {
      mapQuery: '',
      loading: false,
      address: '',
    }
  },
  created() {
    this.initLocation()
  },
  computed: {
    getMapLink() {
      let href = `https://www.google.com/maps/search/?api=1&query=${this.mapQuery}`
      return href
    },
    emptyStateMessage() {
      let { details } = this
      let { moduleName } = details
      let prop = {
        title: this.$t('portfolio.location.no_location', 'No Location Found', {
          ns: 'portfolio',
        }),
        desc: this.$t(
          `portfolio.location.${moduleName}`,
          `Improve navigation by adding a mapped location for your ${moduleName}`,
          { ns: 'portfolio' }
        ),
      }
      return prop
    },
  },
  methods: {
    initLocation() {
      this.loading = true
      let { location } = this.details || {}
      let { street, city, state, zip, country } = location || {}
      if (isEmpty(location)) {
        this.mapQuery = ''
      } else {
        let latitude = location?.lat
        let longitude = location?.lng

        this.mapQuery = `${latitude},${longitude}`
        this.address = convertAddressToReadableString({
          street,
          city,
          state,
          zip,
          country,
        })
        if (isEmpty(this.address)) {
          this.address = this.details.name
        }
      }
      this.loading = false
    },
    redirectToMap() {
      window.open(this.getMapLink, '_blank')
    },
  },
}
</script>
