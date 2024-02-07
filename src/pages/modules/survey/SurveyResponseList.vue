<script lang="jsx">
import ModuleList from '../../../../src/pages/list/ModuleList.vue'
import {
  FTags,
  FContainer,
  FSpinner,
  FModal,
  FText,
  ftoast,
  FTooltip,
} from '@facilio/design-system'

import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import SurveyOverview from './SurveyQuickSummary.vue'
export default {
  extends: ModuleList,
  name: 'SurveyResponseList',
  components: {
    FTags,
    FContainer,
    FSpinner,
    FModal,
    FText,
    FTooltip,
  },
  // data() {
  //   return {
  //     loading: false,
  //     showSurveyOverview: false,
  //     surveyResponseData: null,
  //     displayName: null,
  //     id: null,
  //   }
  // },
  computed: {
    filters() {
      let { query } = this.$route || {}
      let { search } = query || {}
      let searchdata = !isEmpty(search) ? JSON.parse(search) : null
      let { viewname } = this
      let moduleFilter = null
      if (viewname === 'workorder') {
        moduleFilter = 'workOrderId'
      } else if (viewname === 'serviceRequest') {
        moduleFilter = 'serviceRequestId'
      }
      let filter = null
      if (!isEmpty(moduleFilter)) {
        filter = {
          [moduleFilter]: {
            operatorId: 2,
            value: null,
          },
        }
      }
      let filters = { ...searchdata, ...filter }
      return filters
    },
    // getServiceRequestName() {
    //   let { subject } =
    //     this.surveyResponseData?.serviceRequestId ||
    //     this.surveyResponseData?.workOrderId
    //   return subject || '---'
    // },
  },
  // methods: {
  //   defaultSpace() {
  //     return (
  //       <FContainer>
  //         {this.showSurveyOverview && (
  //           <SurveyOverview
  //             showSurveyOverview={this.showSurveyOverview}
  //             moduleName={this.moduleName}
  //             id={this.id}
  //           />
  //         )}
  //       </FContainer>
  //     )
  //   },
  //   async getRecord(id) {
  //     this.loading = true
  //     let { error, data } = await API.get(
  //       '/v3/modules/data/summary?id=' + id + '&moduleName=surveyResponse'
  //     )
  //     if (error) {
  //       ftoast.critical(error.message || 'Error Occurred')
  //     } else {
  //       let { surveyResponse } = data || {}
  //       this.surveyResponseData = surveyResponse || {}
  //     }
  //     this.loading = false
  //   },
  //   redirectToOverview(id) {
  //     this.getRecord(id)
  //     this.showSurveyOverview = true
  //   },
  //   mainFieldRedirection({ record, value }) {
  //     let { id } = record || {}
  //     this.showSurveyOverview = true
  //     this.id = id
  //     return {
  //       text: value,
  //       id,
  //       clickAction: (field, e) => this.mainFieldClickAction(id, e),
  //       ...value,
  //     }
  //     // }
  //   },
  //   mainFieldClickAction(id, e) {
  //     this.id = id
  //     this.redirectToOverview(id)
  //     e.preventDefault()
  //   },
  //   handleCancel(val) {
  //     this.showSurveyOverview = false
  //   },
  // },
}
</script>
