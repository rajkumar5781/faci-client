<template>
  <FContainer
    display="flex"
    justifyContent="center"
    height="100%"
    alignItems="center"
  >
    <FContainer
      v-if="showLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner v-if="showLoading" :size="20" />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap="containerLarge"
    >
      <FText appearance="bodyReg14" color="textCaption">{{
        this.$t('groupinvite.no_of_checked_in', 'No.of Checked-In Invites', {
          ns: 'visitor',
        })
      }}</FText>
      <FText
        appearance="headingMed20"
        color="textMain"
        class="totalcheckedInWidgetCount"
        >{{ totalCheckedInCount }}</FText
      >
    </FContainer>
  </FContainer>
</template>
<script>
import { FText, FContainer, FSpinner } from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'

export default {
  props: ['details'],
  data() {
    return {
      totalCheckedInCount: 0,
      showLoading: false,
    }
  },
  components: { FText, FContainer, FSpinner },
  created() {
    this.fetchData()
  },
  coumputed: {
    moduleName() {
      return 'groupinvite'
    },
  },
  methods: {
    async fetchData() {
      this.showLoading = true
      let { id } = this.details || {}
      let params = {
        moduleName: 'invitevisitor',
        filters: JSON.stringify({
          groupId: { operatorId: 36, value: [`${id}`] },
          hasCheckedIn: { operatorId: 15, value: ['true'] },
        }),
        includeParentFilter: false,
      }
      let { data, error } = await API.get('v3/modules/data/count', params)

      if (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      } else {
        this.totalCheckedInCount = getProperty(data, 'count', 0)
      }
      this.showLoading = false
    },
  },
}
</script>
