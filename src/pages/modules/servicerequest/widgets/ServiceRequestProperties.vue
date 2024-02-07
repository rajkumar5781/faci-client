<template>
  <FContainer padding="containerXxLarge">
    <FContainer>
      <FTags :text="'General'"></FTags>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
            >{{ $t('fields.priority', { ns: 'servicerequest' }) }}</FText
          >
        </FContainer>
        <FContainer
          width="50%"
          appearance="bodyReg14"
          display="flex"
          color="backgroundNeutralInverse"
        >
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">{{
            getPriorityName
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
            >{{ $t('fields.assignedTo', { ns: 'servicerequest' }) }}</FText
          >
        </FContainer>
        <FContainer display="flex" width="50%">
          <FContainer
            display="flex"
            alignItems="flex-start"
            v-if="getAssignedToForAvatar"
          >
            <FContainer
              marginRight="containerLarge"
              display="block"
              marginTop="containerMedium"
            >
              <FAvatar
                size="S"
                :userName="getAssignedToForAvatar"
                userStatus="nil"
              />
            </FContainer>
          </FContainer>
          <FContainer
            display="flex"
            paddingRight="containerXxLarge"
            alignItems="center"
            marginTop="containerLarge"
            width="90%"
          >
            <FTooltip placement="top">
              <template slot="title">
                {{ getAssignedTo }}
              </template>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralInverse"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap"
                cursor="pointer"
                >{{ getAssignedTo }}</FText
              >
            </FTooltip>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
            >{{
              $t('fields.classificationType', { ns: 'servicerequest' })
            }}</FText
          >
        </FContainer>
        <FContainer display="flex" width="50%">
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">{{
            getClassificationType
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
            >{{ $t('fields.dueDate', { ns: 'servicerequest' }) }}</FText
          >
        </FContainer>
        <FContainer
          width="50%"
          appearance="bodyReg14"
          display="flex"
          color="backgroundNeutralInverse"
        >
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">{{
            formattedDueDate
          }}</FText>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer paddingTop="containerXLarge">
      <FTags v-if="true" :text="'Requested By'"></FTags>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
          >
            {{ $t('service_request.name', { ns: 'servicerequest' }) }}
          </FText>
        </FContainer>
        <FContainer display="flex" alignItems="flex-start" width="50%">
          <FContainer
            marginRight="containerLarge"
            display="block"
            marginTop="containerMedium"
          >
            <FAvatar
              size="S"
              :userName="getRequesterNameForAvatar"
              userStatus="nil"
            />
          </FContainer>
          <FContainer
            display="flex"
            paddingRight="containerXxLarge"
            alignItems="center"
            marginTop="containerLarge"
            width="90%"
          >
            <FTooltip placement="top">
              <template slot="title">
                {{ getRequesterName }}
              </template>
              <FText
                appearance="bodyReg14"
                color="backgroundNeutralInverse"
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap"
                cursor="pointer"
                >{{ getRequesterName }}</FText
              >
            </FTooltip>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
            >{{ $t('service_request.email', { ns: 'servicerequest' }) }}</FText
          >
        </FContainer>
        <FContainer
          width="50%"
          appearance="bodyReg14"
          display="flex"
          color="backgroundNeutralInverse"
        >
          <FTooltip placement="top">
            <template slot="title">
              {{ getRequesterEmail }}
            </template>
            <FText
              appearance="bodyReg14"
              color="backgroundNeutralInverse"
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
              cursor="pointer"
              >{{ getRequesterEmail }}</FText
            >
          </FTooltip>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        paddingTop="containerLarge"
        paddingBottom="containerLarge"
        alignItems="center"
      >
        <FContainer width="50%">
          <FText
            appearance="captionMed12"
            color="backgroundNeutralInverseHovered"
            >{{ $t('service_request.phone', { ns: 'servicerequest' }) }}</FText
          >
        </FContainer>
        <FContainer
          width="50%"
          appearance="bodyReg14"
          display="flex"
          color="backgroundNeutralInverse"
        >
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">{{
            getRequesterPhoneNumber
          }}</FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTags,
  FAvatar,
  FTooltip,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { formatDate } from '../../../../utils/formatter'

const URGENCY_COLOR = {
  1: 'backgroundSemanticRedMedium',
  2: 'backgroundAccentYellowMedium',
  3: 'backgroundPrimaryHovered',
}
const CLASSIFICATION = {
  1: 'Question',
  2: 'Problem',
  3: 'Feature',
}
export default {
  props: ['details', 'widget', 'fitToViewArea'],
  components: {
    FContainer,
    FTags,
    FText,
    FAvatar,
    FTooltip,
  },
  data() {
    return {}
  },
  created() {
    this.fitToViewArea()
  },
  computed: {
    getRequesterNameForAvatar() {
      let { details } = this
      let requester =
        getProperty(details, 'requester.name') ||
        getProperty(details, 'requester.email') ||
        null
      return requester
    },
    getRequesterName() {
      let { details } = this
      let requester = getProperty(details, 'requester.name') || 'N/A'
      return requester
    },
    getRequesterEmail() {
      let { details } = this
      let email = getProperty(details, 'requester.email') || 'N/A'
      return email
    },
    getRequesterPhoneNumber() {
      let { details } = this
      let phone = getProperty(details, 'requester.phone') || 'N/A'
      return phone
    },
    getPriorityColor() {
      let { details } = this
      let { urgency } = details || {}
      let { sequenceNumber } = urgency || {}
      return URGENCY_COLOR[sequenceNumber]
    },
    getAssignedToForAvatar() {
      let { details } = this
      let assignedTo =
        getProperty(details, 'assignedTo.name') ||
        getProperty(details, 'assignedTo.email') ||
        null
      return assignedTo
    },
    getAssignedTo() {
      let { details } = this
      let assignedTo =
        getProperty(details, 'assignedTo.name') ||
        getProperty(details, 'assignedTo.email') ||
        'N/A'
      return assignedTo
    },
    getClassificationType() {
      let { details } = this
      let { classificationType } = details || {}
      return CLASSIFICATION[classificationType] || 'N/A'
    },
    formattedDueDate() {
      let { details } = this || {}
      let { dueDate } = details || {}

      if (dueDate !== 0 && !isEmpty(dueDate)) {
        return formatDate(dueDate)
      } else {
        return 'N/A'
      }
    },
    getPriorityName() {
      let { details } = this
      let { urgency } = details || {}
      let { displayName, primaryValue, priority } = urgency || {}
      return displayName || primaryValue || priority || 'N/A'
    },
  },
  methods: {},
}
</script>
