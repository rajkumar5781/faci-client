<template>
  <FContainer
    display="flex"
    flexDirection="column"
    rowGap="containerXxLarge"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
  >
    <FContainer display="flex">
      <FContainer width="16px" marginRight="containerLarge">
        <FCheckbox v-model="groupAlarmCountData.includeGroupAlarmCountCheck" />
      </FContainer>
      <FContainer display="flex" alignItems="center">
        <FText appearance="headingMed14" color="textMain">
          {{
            $t('flagged_event_rule.include_group_alarm_count_check', {
              ns: 'remote_monitor',
            })
          }}
        </FText>
        <FContainer marginLeft="containerMedium" marginTop="containerMedium">
          <fc-icon group="action" name="info" size="14" color="#7B91B0" />
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer display="flex" flexDirection="column">
      <FText
        appearance="bodyReg14"
        marginBottom="containerLarge"
        color="textDefault"
      >
        {{ $t('field_names.group_alarm_count', { ns: 'remote_monitor' }) }}
      </FText>
      <FInput
        v-model="groupAlarmCountData.groupAlarmCount"
        placeholder="Enter alarm count"
        type="number"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FCheckbox, FInput } from '@facilio/design-system'
export default {
  components: {
    FContainer,
    FText,
    FCheckbox,
    FInput,
  },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      dataDeserialized: false,
      groupAlarmCountData: {},
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { groupAlarmCountData = {} } = this
      return groupAlarmCountData
    },
    deserializeData() {
      let { isNew } = this
      if (!isNew) {
        let { flaggedEventRule = {} } = this
        let { includeGroupAlarmCountCheck, groupAlarmCount } = flaggedEventRule
        this.groupAlarmCountData = {
          includeGroupAlarmCountCheck,
          groupAlarmCount,
        }
      }
      this.dataDeserialized = true
    },
  },
}
</script>
