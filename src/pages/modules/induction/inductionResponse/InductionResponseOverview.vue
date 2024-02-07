<script lang="jsx">
import InspectionResponseOverview from '../../inspection/inspectionResponse/InspectionResponseOverview.vue'
import getProperty from 'dlv'

export default {
  name: 'InductionSummary',
  extends: InspectionResponseOverview,
  computed: {
    systemBtnList() {
      const buttonList = []

      if (this.canShowLiveForm) {
        buttonList.push({
          name: 'Attend Induction',
          identifier: 'attendInduction',
          clickAction: this.openLiveForm,
        })
      }

      return buttonList
    },
    pdfUrl() {
      return `${window.location.protocol}//${window.location.host}/${appName}/pdf/inductionPdf?id=${this.id}`
    },
    canShowLiveForm() {
      let { record, $account } = this
      let peopleId = getProperty(record, 'people.id')
      let currUserPeopleId = getProperty($account, 'user.peopleId')
      let responseStatus = getProperty(record, 'responseStatus')
      let canEditRecord = getProperty(this, 'canEditRecord', true)
      let returnVal =
        record &&
        ![1, 4].includes(responseStatus) &&
        !getProperty(record, 'parent.deleted') &&
        peopleId === currUserPeopleId &&
        canEditRecord

      return returnVal
    },
  },
  methods: {
    openLiveForm() {
      let id = getProperty(this.record, 'id', '')

      let customPath = this.$router.resolve({
        name: 'induction-live-form',
        params: { id },
      }).href

      this.$router.push({ path: customPath })
    },
  },
}
</script>
