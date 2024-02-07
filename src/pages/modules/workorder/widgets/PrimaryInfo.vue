<template>
  <FModal
    title="Glimpse"
    :visible="showModal"
    size="S"
    :hideFooter="true"
    @cancel="closeInfo()"
  >
    <FContainer
      paddingBottom="containerSmall"
      paddingLeft="sectionSmall"
      paddingTop="containerXLarge"
    >
      <FText>More Details</FText>
    </FContainer>
    <FContainer
      display="flex"
      flex-direction="column"
      gap="12px"
      alignItems="flex-start"
      paddingTop="containerXxLarge"
      paddingLeft="sectionSmall"
      paddingBottom="containerXxLarge"
    >
      <FContainer display="flex" alignItems="flex-start" gap="16px">
        <FContainer
          display="flex"
          width="200px"
          flex-direction="column"
          justifyContent="center"
          gap="4px"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            alignItems="center"
            gap="8px"
            align-self="stretch"
          >
            <FText color="textMain" line-height="130%" appearance="captionMed12"
              >Created by</FText
            >
          </FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            paddingTop="containerMedium"
            align-self="stretch"
          >
            <FText
              color="textDescription"
              apperance="bodyReg14"
              line-height="130%"
              >{{ details.sysCreatedBy.name }}</FText
            >
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          width="200px"
          flex-direction="column"
          justifyContent="center"
          gap="4px"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            alignItems="center"
            gap="8px"
            align-self="stretch"
          >
            <FText color="textMain" line-height="130%" appearance="captionMed12"
              >Created Time</FText
            >
          </FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            paddingTop="containerMedium"
            align-self="stretch"
          >
            <FText
              color="textDescription"
              apperance="bodyReg14"
              line-height="130%"
            >
              {{ formatDate(details.sysCreatedTime) }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer display="flex" alignItems="flex-start" padding-top="16px">
        <FContainer
          display="flex"
          width="200px"
          flex-direction="column"
          justifyContent="center"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            alignItems="center"
            gap="8px"
            align-self="stretch"
          >
            <FText color="textMain" line-height="130%" appearance="captionMed12"
              >Modified by</FText
            >
          </FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            paddingTop="containerMedium"
            align-self="stretch"
          >
            <FText
              color="textDescription"
              apperance="bodyReg14"
              line-height="130%"
              >{{
                details.sysModifiedBy ? details.sysModifiedBy.name : '--'
              }}</FText
            >
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          width="200px"
          flex-direction="column"
          justifyContent="center"
          gap="4px"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            alignItems="center"
            gap="8px"
            align-self="stretch"
          >
            <FText color="textMain" line-height="130%" appearance="captionMed12"
              >Modified Time</FText
            >
          </FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            paddingTop="containerMedium"
            align-self="stretch"
          >
            <FText
              color="textDescription"
              apperance="bodyReg14"
              line-height="130%"
              >{{ formatDate(details.sysModifiedTime) }}</FText
            >
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { FContainer, FModal, FText } from '@facilio/design-system'
import { formatDate } from '../../../../utils/formatter'
export default {
  props: ['details'],
  data() {
    return {
      showModal: true,
    }
  },
  components: {
    FContainer,
    FText,
    FModal,
  },
  methods: {
    formatDate,
    closeInfo() {
      this.showModal = false
    },
  },
}
</script>
