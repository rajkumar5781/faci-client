<template>
  <FContainer
    borderRadius="high"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    padding="containerXLarge"
    backgroundColor="backgroundMidgroundSubtle"
  >
    <FContainer
      display="flex"
      justifyContent="space-between"
      marginBottom="containerXLarge"
      height="50px"
    >
      <div v-if="isEmpty(getPhotoUrl)">
        <FIcon
          group="dsm"
          name="image"
          key="dsm-image"
          size="45"
          :pressable="false"
          color="textDescription"
        >
        </FIcon>
      </div>
      <div v-else>
        <img :src="getPhotoUrl" class="catalog-card-image" />
      </div>
    </FContainer>
    <FContainer marginBottom="containerXLarge" display="flex">
      <FText appearance="headingMed14" color="textDescription">
        {{ getCatalogName }}
      </FText>
    </FContainer>
    <FContainer marginBottom="containerXLarge">
      <FContainer marginBottom="containerSmall">
        <FText appearance="captionMed12" color="textMain">
          {{ $t('catalog.catagory', { ns: 'servicecatalog' }) }}
        </FText>
      </FContainer>

      <FTags appearance="simple" :text="getCatagory" :disabled="false" />
    </FContainer>
    <div>
      <FContainer marginBottom="containerSmall">
        <FText appearance="captionMed12" color="textMain">
          {{ $t('catalog.catalog_description', { ns: 'servicecatalog' }) }}
        </FText>
      </FContainer>
      <FText appearance="captionReg12" color="textCaption">
        {{ getDescription }}
      </FText>
    </div>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FIcon,
  FTooltip,
  FTags,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import CatalogMixin from './CatalogMixin.vue'
export default {
  props: ['catalogItem'],
  mixins: [CatalogMixin],
  components: {
    FContainer,
    FText,
    FIcon,
    FTooltip,
    FTags,
  },
  computed: {
    getCatagory() {
      let { catalogItem = {} } = this
      let { group = {} } = catalogItem
      let { name = '---' } = group
      return name
    },
  },
  data() {
    return {
      isEmpty,
    }
  },
}
</script>
<style scoped lang="scss">
.catalog-card-image {
  height: 56px;
  width: 56px;
  border-radius: 8px;
}
</style>
