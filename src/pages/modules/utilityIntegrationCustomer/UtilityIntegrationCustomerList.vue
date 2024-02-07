<script lang="jsx">
import { API } from '@facilio/api'
import ModuleList from '../../list/ModuleList.vue'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import {
  FContainer,
  FText,
  FButton,
  ftoast,
  FTooltip,
  FIcon,
} from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  extends: ModuleList,
  name: 'UtilityIntegrationCustomerList',
  computed: {
    createBtnText() {
      return this.$t('utility.new_utility_customer', { ns: 'energy' })
    },
    slotList() {
      return [
        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 80,
            displayName: 'ID',
            fixed: true,
          },
        },

        {
          criteria: JSON.stringify({ name: 'name' }),
          columnAttrs: {
            width: 350,
          },
        },
      ]
    },
  },
  methods: {
    getProperty,

    async redirectToFormCreation() {
      let { moduleName } = this
      let { error, data } = await API.get(
        `v3/utilityIntegration/createUtilityAccounts`,
        {}
      )
      if (error) {
        ftoast.critical(this.$t('utility.error_occured', { ns: 'energy' }))
      } else {
        let secretState = getProperty(data, 'state', {})
        if (!isEmpty(secretState)) {
          let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}
          if (!isEmpty(name)) {
            this.$router.push({
              name,
              query: { secretState },
            })
          }
        }
      }
    },
    slotsContent() {
      let { slotList, mainFieldName } = this || {}
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return (
            <div>
              <FText color="textMain">{'#' + record.id}</FText>
            </div>
          )
        },
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FText
                slot="title"
                fontsize="body3"
                fontWeight="medium"
                color="backgroundCanvas"
              >
                {getProperty(record, mainFieldName)}
              </FText>
              <FButton
                appearance="link"
                vOn:click={() => this.redirectToOverview(record.id)}
              >
                <FText
                  fontsize="body3"
                  fontWeight="medium"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {getProperty(record, mainFieldName)}
                </FText>
              </FButton>
            </FTooltip>
          )
        },
      }
    },
  },
}
</script>
