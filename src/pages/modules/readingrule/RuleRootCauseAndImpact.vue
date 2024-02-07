<template>
  <FContainer display="flex">
    <FContainer
      v-if="loading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else display="flex" flexDirection="column">
      <FText
        appearance="headingMed16"
        flex="1 0 0"
        paddingTop="containerXxLarge"
        paddingLeft="containerXxLarge"
      >
        {{
          $t('create.rootcause_impact_caps', 'Root Cause & Cost Impact', {
            ns: 'rule',
          })
        }}
      </FText>
      <RootCauseAndImpactSection
        :title="
          $t('create.root_cause', 'Root Cause', {
            ns: 'rule',
          })
        "
        :statusText="`${isRootCauseEnabled ? 'Enabled' : 'Disabled'}`"
        :statusType="rootCauseStatusType"
      />
      <RootCauseAndImpactSection
        :title="
          $t('create.impact', 'Impact', {
            ns: 'rule',
          })
        "
        :statusText="`${isImpactEnabled ? 'Enabled' : 'Disabled'}`"
        :statusType="impactStatusType"
      />
      <RootCauseAndImpactSection
        :title="
          $t(
            'crefaultToWorkorderate.fautl_to_wo_creation',
            'Fault to Workorder Creation',
            {
              ns: 'rule',
            }
          )
        "
        :statusText="`${isFaultToWo ? 'Enabled' : 'Disabled'}`"
        :statusType="faultToWoStatusType"
        class="pB50"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FText, FSpinner } from '@facilio/design-system'
import RootCauseAndImpactSection from './RootCauseAndImpactSection.vue'
import getProperty from 'dlv'
import { ftoast } from '@facilio/design-system'

export default {
  props: ['details'],
  components: {
    FContainer,
    FText,
    FSpinner,
    RootCauseAndImpactSection,
  },

  data() {
    return {
      loading: false,
    }
  },

  computed: {
    ruleId() {
      let { details: { id } = {} } = this
      return id
    },
    rootCauseStatusType() {
      let { isRootCauseEnabled } = this
      return isRootCauseEnabled ? 'success' : 'danger'
    },
    impactStatusType() {
      let { isImpactEnabled } = this
      return isImpactEnabled ? 'success' : 'danger'
    },
    faultToWoStatusType() {
      let { isFaultToWo } = this
      return isFaultToWo ? 'success' : 'danger'
    },
    isRootCauseEnabled() {
      let { details } = this
      let { rca } = details || {}
      let { rcaRuleIds } = rca || {}
      return !isEmpty(rca) && rcaRuleIds.length > 0
    },
    isImpactEnabled() {
      let { details } = this
      let { impact } = details || {}
      let { id } = impact || {}
      return id > 0
    },
    isFaultToWo() {
      let { rulewoDetails } = this || {}
      let faultToWo = false
      if (rulewoDetails && !isEmpty(rulewoDetails)) {
        let { closeWo = {}, woCreation = {} } = rulewoDetails
        let { status: closeStatus = {} } = closeWo || {}
        let { status: createStatus = {} } = woCreation || {}
        if (!isEmpty(createStatus) && !isEmpty(closeStatus)) {
          faultToWo = createStatus && closeStatus
        }
      }
      return faultToWo
    },
  },
  methods: {
    async loadRuleWoDetails() {
      this.loading = true
      let { ruleId } = this
      let params = { ruleId }
      let { error, data = {} } = await API.get(
        'v3/newreadingrules/fetchRuleWo',
        params
      )
      if (error) {
        $t('error_occurred', 'Error Occurred', {
          ns: 'rule',
        })
        ftoast.critical(
          $t('error_occurred', 'Error Occurred', {
            ns: 'rule',
          })
        )
      } else if (data) {
        let { faultToWorkorder = {} } = data
        delete faultToWorkorder.ruleId
        this.rulewoDetails = faultToWorkorder
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.pB50 {
  padding-bottom: 50px;
}
</style>
