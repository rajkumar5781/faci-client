<template>
  <FContainer v-if="hasImpact">
    <FContainer
      v-if="isLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else
      padding="sectionSmall"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <FContainer display="flex" flexDirection="row">
        <FContainer
          borderRadius="high"
          minWidth="145px"
          padding="containerLarge containerNone containerXLarge containerNone"
          display="flex"
          flexDirection="column"
        >
          <FText
            color="textMain"
            appearance="headingMed20"
            flexDirection="column"
            paddingBottom="containerMedium"
            display="inherit"
          >
            {{ thisMonthImpact }}
          </FText>
          <FText
            color="textCaption"
            appearance="captionReg12"
            flexDirection="column"
            display="inherit"
            >{{ $t('alarm.this_month', 'This month', { ns: 'alarm' }) }}</FText
          >
        </FContainer>
        <FContainer
          borderRadius="high"
          minWidth="145px"
          marginLeft="containerXxLarge"
          padding="containerLarge containerNone containerXLarge containerNone"
          display="flex"
          flexDirection="column"
        >
          <FText
            color="textMain"
            appearance="headingMed20"
            flexDirection="column"
            paddingBottom="containerMedium"
            display="inherit"
          >
            {{ lastMonthImpact }}
          </FText>
          <FText
            color="textCaption"
            appearance="captionReg12"
            flexDirection="column"
            display="inherit"
            >{{ $t('alarm.last_month', 'Last month', { ns: 'alarm' }) }}</FText
          >
        </FContainer>
      </FContainer>
      <FContainer
        tag="span"
        v-if="displayPercentage"
        marginLeft="containerXLarge"
        paddingLeft="containerMedium"
        paddingRight="containerMedium"
        paddingBottom="containerSmall"
        borderRadius="medium"
        :backgroundColor="backgroundColor"
      >
        <FIcon
          v-if="scale"
          group="navigation"
          name="up-triangle-filled"
          size="12"
          color="borderSemanticRedLight"
        ></FIcon>
        <FIcon
          v-else
          group="navigation"
          name="down-triangle-filled"
          size="12"
          color="borderSemanticGreenMedium"
        ></FIcon>
        <FText appearance="captionReg12">
          {{ percent }}
        </FText></FContainer
      >
    </FContainer>
  </FContainer>
  <FContainer
    v-else
    display="flex"
    align-items="center"
    justify-content="center"
  >
    <FContainer width="500px">
      <FEmptyState
        :title="this.$t('alarm.no_impact', 'No impact', { ns: 'alarm' })"
        :vertical="true"
        size="S"
        illustration="no-entries"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTags,
  FSpinner,
  FEmptyState,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import { dset as setProperty } from 'dset'
import { API } from '@facilio/api'
export default {
  components: {
    FContainer,
    FText,
    FTags,
    FSpinner,
    FEmptyState,
    FIcon,
  },
  props: ['moduleName', 'details', 'isCostImpact'],
  data() {
    return {
      thisMonthImpact: 0,
      lastMonthImpact: 0,
      isLoading: false,
    }
  },
  created() {
    this.loadRecords()
  },
  computed: {
    title() {
      let { isCostImpact } = this
      return isCostImpact ? 'Cost Impact' : 'Energy Impact (KWh)'
    },
    hasImpact() {
      let { details: alarm } = this
      let { rule } = alarm || {}
      return rule.hasOwnProperty('impact')
    },
    displayPercentage() {
      let { lastMonthImpact, thisMonthImpact } = this
      return lastMonthImpact === 0
        ? false
        : thisMonthImpact === 0
          ? false
          : true
    },
    scale() {
      let { lastMonthImpact, thisMonthImpact } = this
      return lastMonthImpact < thisMonthImpact
    },
    backgroundColor() {
      let { scale } = this
      return scale
        ? 'backgroundSemanticRedSubtle'
        : 'backgroundSemanticGreenLight'
    },
    percent() {
      if (!this.displayPercentage) return '0 %'
      else {
        let { lastMonthImpact, thisMonthImpact } = this
        let percentage = 0
        if (thisMonthImpact !== 0) {
          percentage =
            (Math.abs(thisMonthImpact - lastMonthImpact) / lastMonthImpact) *
            100
        }
        return Number.isInteger(percentage)
          ? percentage + '%'
          : percentage.toFixed(2) + '%'
      }
    },
  },
  methods: {
    async loadRecords() {
      let { details: alarm, isCostImpact } = this
      let { rule, resource } = alarm || {}
      let { id: ruleId } = rule || {}
      let { id: parentId } = resource || {}
      let params = {
        ruleId,
        parentId,
        isCostImpact,
      }
      this.isLoading = true
      let { data = {}, error } = await API.get(
        '/v3/newreadingalarm/fetchImpact',
        params
      )
      if (error) {
        ftoast.critical(error.message)
      } else {
        let { result } = data || {}
        let { lastMonth, thisMonth } = result
        setProperty(this, 'thisMonthImpact', Number(thisMonth))
        setProperty(this, 'lastMonthImpact', Number(lastMonth))
      }
      this.isLoading = false
    },
  },
}
</script>
