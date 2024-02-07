<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import getProperty from 'dlv'
import { FContainer, FTags, FText } from '@facilio/design-system'
import WorkOrderSummaryPdfOptions from './widgets/WorkOrderSummaryPdfOptions.vue'


export default {
  name: 'Workorderlist',
  props: ['moduleName'],
  extends: ModuleList,
  data(){
    return {
      openPrintOptions:false
    }
  },
  components: {
    WorkOrderSummaryPdfOptions,
  },
  computed: {
    idSlotValue() {
      return 'serialNumber'
    },
    slotList() {
      return [
        {
          criteria: JSON.stringify({ name: 'moduleState' }),
        },
        {
          criteria: JSON.stringify({ name: 'noOfTasks' }),
        },
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
      ]
    },
    bulkSystemButtonsConfig() {
      return [
        {
          name: 'Delete',
          identifier: 'delete_bulk',
          action: this.deleteRecords, // default action
          positionType: 4,
          appearance: 'secondary',
        },
        {
          name: 'Print',
          identifier: 'print',
          action: this.openPrintDialog,
          positionType: 4,
          appearance: 'secondary',
        },
      ]
    },
    
  },
  methods: {
    slotsContent() {
      let { slotList } = this || {}
      return {
        [slotList[0].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="status"
                text={this.getStatusName(record)}
                statusType="information"
              />
            </FContainer>
          )
        },
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              <FText>
                {!record.noOfTasks
                  ? '--'
                  : (!record.noOfClosedTasks
                      ? '0'
                      : record.noOfClosedTasks) +
                    '/' +
                    record.noOfTasks}
              </FText>
            </FContainer>
          ) 
        },
        [slotList[2].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },
      }
    },
    defaultSpace() {
      return (
        <FContainer>
          {this.openPrintOptions && (
            <WorkOrderSummaryPdfOptions
              workorders={this.selectedListItemsIds}
              visibility={this.openPrintOptions}
              viewName={this.viewname}
              v-on:onClose={this.closeDialog}
            />
          )}
          {this.pdfUrl && (
            <PDFdownload url={this.pdfUrl} isDownload={this.isPdfDownload} v-on:closeDownload={this.closeDownload} />
          )}
        </FContainer>
      )
    },
    getStatusName(record) {
      return getProperty(record, 'moduleState.displayName', '---')
    },
    openPrintDialog(){
      this.openPrintOptions=true
    },
    closeDialog(){
      this.openPrintOptions=false
    }
  },
}
</script>
