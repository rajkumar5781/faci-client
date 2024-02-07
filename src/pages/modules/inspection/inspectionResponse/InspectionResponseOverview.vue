<script lang="jsx">
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'InspectionSummary',
  extends: ModuleSummary,
  data() {
    return {
      downloadUrl: null,
    }
  },
  computed: {
    systemBtnList() {
      const buttonList = []

      if (this.canShowLiveForm) {
        buttonList.push({
          name: this.liveFormBtnText(),
          identifier: 'conductInspection',
          clickAction: this.openLiveForm,
        })
      }

      return buttonList
    },
    moreButtonList() {
      return [
        {
          name: 'Download PDF',
          identifier: 'downloadPdf',
          clickAction: this.downloadPdf,
        },
        {
          name: 'Print',
          identifier: 'print',
          clickAction: this.openPrintPreview,
        },
      ]
    },
    canShowLiveForm() {
      let { record, $account } = this
      let peopleId = getProperty(record, 'people.id')
      let assignedToId = getProperty(record, 'assignedTo.id')
      let currUserPeopleId = getProperty($account, 'user.peopleId')
      let userId = getProperty($account, 'user.id')
      let isCurrentUser =
        peopleId === currUserPeopleId || assignedToId === userId
      let responseStatus = getProperty(record, 'responseStatus')
      let canEditRecord = getProperty(this, 'canEditRecord', true)

      let returnVal =
        record &&
        ![1, 4].includes(responseStatus) &&
        !getProperty(record, 'parent.deleted') &&
        isCurrentUser &&
        canEditRecord

      return returnVal
    },
    canEditRecord() {
      let { isRecordLocked, isRequestedState } = this
      return !isRecordLocked && !isRequestedState
    },
  },
  methods: {
    liveFormBtnText() {
      let { record = {} } = this
      let currOrg = getProperty(this, '$account.org.id')
      let { picklist } = record
      let valueMap = { inspectionType: 1 }

      if (currOrg !== 17) {
        return 'Conduct Inspection'
      } else {
        if (picklist === valueMap['inspectionType']) return 'Conduct Inspection'
        return 'Conduct Audit'
      }
    },
    openLiveForm() {
      let id = getProperty(this.record, 'id', '')

      let customPath = this.$router.resolve({
        name: 'inspection-live-form',
        params: { id },
      }).href

      this.$router.push({ path: customPath })
    },
    async downloadPdf() {
      this.downloadUrl = null
      let options = {
        manualClear: false,
        menuType: 'toast',
        timeout: 2000,
      }
      ftoast.information('Downloading...', options)

      let additionalInfo = {
        showFooter: false,
        footerStyle: 'p {font-size:12px; margin-left:500px}',
        footerHtml:
          '<p>Page  <span class="pageNumber"></span> / <span class="totalPages"></span></p>',
      }
      let url = await this.constructDownloadUrl()
      await API.post(`/v2/integ/pdf/inspectionResponse/create`, {
        url,
        isNewExport: true,
        additionalInfo,
      }).then(({ data, error }) => {
        if (error) {
          let { message = 'Unable to fetch inspection download link' } = error
          ftoast.critical(message)
        } else {
          let { fileUrl } = data || {}
          if (!isEmpty(fileUrl)) {
            this.downloadUrl = fileUrl
            setTimeout(() => {
              this.downloadUrl = null
            }, 1000)
          }
        }
      })
    },
    defaultSpace() {
      return (
        <template>
          {this.downloadUrl && (
            <iframe src={this.downloadUrl} style="display: none;"></iframe>
          )}
        </template>
      )
    },
    async constructDownloadUrl() {
      let url = `/legacy/${getApp().linkName}/iframe/${this.getPath()}`
      return url
    },
    async constructPrintUrl() {
      let url = ''
      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:9091/legacy/${
          getApp().linkName
        }/iframe/${this.getPath()}`
      } else {
        url = `${window.location.origin}/legacy/${
          getApp().linkName
        }/iframe/${this.getPath()}`
      }
      return url
    },
    getPath() {
      let id = getProperty(this.record, 'id', '')
      return `pdf/inspectionPdf?id=${id}`
    },
    async openPrintPreview() {
      let url = await this.constructPrintUrl()
      window.open(url)
    },
  },
}
</script>
