<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import ListMixin from '../../list/data/ListMixin.vue'
import WatchListOverViewShimmer from './WatchListOverViewShimmer.vue'
import getProperty from 'dlv'
import {
  FContainer,
  FSpinner,
  FModal,
  FText,
  ftoast,
  FTooltip,
  FAvatar,
  FRecordDetails,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import capitalize from 'lodash/capitalize'

export default {
  extends: ModuleList,
  mixins: [ListMixin],
  name: 'watchListDialog',
  components: {
    FContainer,
    FSpinner,
    FModal,
    FRecordDetails,
    FText,
    FTooltip,
    FAvatar,
    ftoast,
    WatchListOverViewShimmer,
  },
  data() {
    return {
      loading: false,
      showWatchListOverView: false,
      data: null,
    }
  },
  computed: {
    fieldObj() {
      let { phone, email, vip, blocked } = this.data || {}
      return {
        phone: !isEmpty(phone) ? phone : '---',
        email: !isEmpty(email) ? email : '---',
        vip: !isEmpty(vip) ? vip.toString() : '---',
        blocked: !isEmpty(blocked) ? blocked.toString() : '---',
      }
    },
    fieldsForFrecord() {
      let { phone, email, vip, blocked } = this.data || {}

      return Object.keys({ phone, email, vip, blocked }).map(key => {
        return {
          displayName: capitalize(key),
          name: key,
          span: 1,
          type: 'text',
        }
      })
    },
    nameField() {
      let { name } = this.data || {}
      return name || '---'
    },
    idField() {
      let { id } = this.data || {}
      return !isEmpty(id) ? '#' + id : '---'
    },
  },
  methods: {
    async getRecord(id) {
      this.loading = true
      let params = {
        id,
        moduleName: 'watchlist',
      }
      let { error, data } = await API.get('/v3/modules/data/summary', params)
      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred', 'Error occured')
        )
      } else {
        this.data = getProperty(data, 'watchlist') || {}
      }
      this.loading = false
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, viewname } = this
      let { id } = record || {}
      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname, id },
        }).href
        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.mainFieldClickAction(id, e),
          ...value,
        }
      }
    },
    mainFieldClickAction(id, e) {
      this.getRecord(id)
      this.showWatchListOverView = true
      e.preventDefault()
    },
    body() {
      let {
        showLoading,
        viewname,
        records,
        showWatchListOverView,
        fieldObj,
        nameField,
        idField,
        fieldsForFrecord,
      } = this || {}
      return (
        <div>
          {showLoading ? (
            <FContainer
              height="calc(100vh - 210px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FSpinner size={30} />
            </FContainer>
          ) : isEmpty(viewname) ? (
            this.viewEmptyState()
          ) : isEmpty(records) ? (
            this.recordEmptyState()
          ) : (
            this.moduleTable()
          )}
          {showWatchListOverView ? (
            <FContainer>
              <FModal
                title={this.$t('watch_list.title', 'WatchList', {
                  ns: 'visitor',
                })}
                visible={showWatchListOverView}
                size="S"
                hideFooter={true}
                vOn:cancel={this.handleCancel}
              >
                {this.loading ? (
                  <FContainer height="200px">
                    <WatchListOverViewShimmer />
                  </FContainer>
                ) : (
                  <FContainer
                    padding="containerXxLarge sectionSmall containerXxLarge sectionSmall"
                    height="210px"
                  >
                    <FContainer
                      display="flex"
                      gap="containerLarge"
                      border="1px solid"
                      borderColor="borderNeutralBaseSubtler"
                      backgroundColor="backgroundMidgroundSubtle"
                      padding="containerXLarge"
                      flexGrow="1"
                      borderRadius="high"
                      marginTop="10px"
                    >
                      <FAvatar size="L" userName={nameField}></FAvatar>

                      <FContainer
                        display="flex"
                        flexDirection="column"
                        gap="containerSmall"
                      >
                        <FText color="textCaption">{idField}</FText>
                        <FText color="textMain" appearance="headingMed16">
                          {nameField}
                        </FText>
                      </FContainer>
                    </FContainer>

                    <FContainer marginTop="containerXxLarge">
                      <FRecordDetails
                        record={fieldObj}
                        fields={fieldsForFrecord}
                        layout={2}
                      ></FRecordDetails>
                    </FContainer>
                  </FContainer>
                )}
              </FModal>
            </FContainer>
          ) : (
            <div></div>
          )}
        </div>
      )
    },
    handleCancel(val) {
      this.showWatchListOverView = false
    },
  },
}
</script>
