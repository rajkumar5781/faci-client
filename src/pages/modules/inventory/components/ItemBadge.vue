<template>
  <FContainer
    backgroundColor="backgroundMidgroundSubtle"
    padding="containerXLarge"
    display="flex"
    alignItems="center"
    border="1px solid"
    borderRadius="high"
    borderColor="borderNeutralBaseSubtler"
  >
    <FContainer
      class="item-building-icon"
      backgroundColor="backgroundMidgroundDark"
      marginRight="containerLarge"
    >
      <FIcon group="default" name="building" size="20"></FIcon>
    </FContainer>
    <FContainer>
      <FText appearance="captionReg10" color="textCaption">
        {{ recordId }}</FText
      >
      <FContainer display="flex" alignItems="center">
        <FText appearance="headingMed16" color="textHeading">
          {{ name }}
        </FText>
        <FDivider
          margin="containerNone containerLarge"
          height="24px"
        ></FDivider>
        <FTags :text="storeRoom"></FTags>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FDivider,
  FTags,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

export default {
  name: 'ItemBadge',
  props: {
    record: {
      type: Object,
    },
  },
  components: {
    FContainer,
    FText,
    FTags,
    FIcon,
    FDivider,
  },

  computed: {
    name() {
      let { record = {} } = this
      let { moduleName } = record
      if (moduleName == 'item') {
        return getProperty(record, 'itemType.name', '---')
      } else if (moduleName == 'tool') {
        return getProperty(record, 'toolType.name', '---')
      }
      return '---'
    },
    storeRoom() {
      let { record = {} } = this
      return getProperty(record, 'storeRoom.name', '---')
    },
    recordId() {
      let { record = {} } = this
      if (isEmpty(record?.id)) {
        return '---'
      }
      return `#${record.id}`
    },
  },
}
</script>
<style lang="scss">
.item-building-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
