<template>
  <FContainer padding="containerXxLarge">
    <FContainer
      v-if="loading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      ><FSpinner :size="30" padding="containerXxLarge"></FSpinner
    ></FContainer>
    <FContainer v-else display="flex" flexDirection="column">
      <FContainer display="flex" flexDirection="column">
        <FText appearance="headingMed16">
          {{
            $t('summary.assets', 'Assets', {
              ns: 'rule',
            })
          }}
        </FText>
        <FContainer
          display="flex"
          alignItems="center"
          paddingTop="containerXLarge"
        >
          <FContainer
            class="iconCircle"
            backgroundColor="backgroundAccentBlueSubtle"
          >
            <FIcon
              group="webtabs"
              name="asset"
              size="20"
              padding="6px"
              :pressable="false"
            ></FIcon>
          </FContainer>
          <FText
            appearance="headingMed14"
            paddingLeft="containerXLarge"
            color="backgroundAccentBlueDark"
            >{{ resourceLabels }}</FText
          >
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        flexDirection="column"
        paddingTop="sectionLarge"
      >
        <FText appearance="headingMed16">{{
          $t('summary.faults', 'Faults', {
            ns: 'rule',
          })
        }}</FText>
        <FContainer
          paddingTop="containerXLarge"
          @click="values.activeAlarms > 0 ? openAlarm(true) : null"
          display="flex"
          alignItems="center"
        >
          <FContainer
            class="iconCircle"
            backgroundColor="borderSemanticRedSubtle"
          >
            <FIcon
              group="alert"
              name="ringing"
              size="20"
              padding="6px"
              :pressable="false"
            ></FIcon>
          </FContainer>

          <FText
            appearance="headingMed14"
            paddingLeft="containerXLarge"
            color="borderAccentBlueDark"
          >
            {{ alarmCountString }}</FText
          >
        </FContainer>
        <FContainer
          paddingTop="containerXLarge"
          @click="values.alarmRuleThisWeek > 0 ? openAlarm() : null"
          display="flex"
          alignItems="center"
        >
          <FContainer
            class="iconCircle"
            backgroundColor="backgroundSemanticOrangeLight"
          >
            <FIcon
              padding="6px"
              group="dsm"
              name="calendar"
              size="20"
              :pressable="false"
            ></FIcon>
          </FContainer>

          <FText
            appearance="headingMed14"
            paddingLeft="containerXLarge"
            color="borderAccentBlueDark"
            >{{ alarmRuleThisWeek }}</FText
          >
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { getWorkFlowResult } from './util.js'
import { FContainer, FText, FSpinner, FIcon } from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

export default {
  props: ['details', 'widget'],

  components: {
    FContainer,
    FText,
    FIcon,
    FSpinner,
  },
  data() {
    return {
      loading: false,
      values: null,
      category: null,
      assetCount: null,
      selectedResourceList: null,
      assetCategoryList: [],
      assetCatListLoaded: false,
    }
  },
  created() {
    this.loadAssetCategories()
    this.loadAlarmDetails()
  },
  computed: {
    resourceLabels() {
      return this.resourceLabel()
    },
    ruleId() {
      let { details } = this
      let { id: ruleId } = details || {}
      return ruleId
    },
    assetCategoryId() {
      let { details } = this
      let { assetCategory: { id } = {} } = details || {}
      return id
    },
    specificAssets() {
      let { details } = this || {}
      let { assets } = details || {}
      return assets
    },

    alarmCountString() {
      let { values } = this
      let { activeAlarms } = values || {}
      let alarmCount =
        activeAlarms > 0
          ? activeAlarms
          : this.$t('summary.no', 'No', {
              ns: 'rule',
            })

      return (
        alarmCount +
        ' ' +
        this.$t('summary.active_faults', 'Active Faults', {
          ns: 'rule',
        })
      )
    },
    alarmRuleThisWeek() {
      let { values } = this
      let { alarmRuleThisWeek: alarms, alarmThisWeekResources } = values || {}
      let alarmString1 =
        alarms > 0
          ? alarms
          : this.$t('summary.no', 'No', {
              ns: 'rule',
            })
      let alarmString2 =
        alarms > 0 ? ' across ' + alarmThisWeekResources.length + ' Assets' : ''
      return (
        alarmString1 +
        '  ' +
        this.$t('create.faults_this_week', 'Faults this week', {
          ns: 'rule',
        }) +
        ' ' +
        alarmString2
      )
    },
  },
  methods: {
    loadAlarmDetails() {
      this.loading = true
      let workFlowId = null
      let { ruleId } = this

      getWorkFlowResult('assetNdAlarm', ruleId ? ruleId : null).then(d => {
        this.values = d
        this.loading = false
      })
    },
    async loadAssetCount() {
      let { category } = this
      if (isEmpty(category)) return
      let url = 'v2/newreadingrules/assetCount?viewName=all&count=true'
      let query = {
        category: { operatorId: 36, value: [JSON.stringify(this.category.id)] },
      }
      let filterString = encodeURIComponent(JSON.stringify(query))
      url = url + '&filters=' + filterString
      let { data = {}, error } = await API.get(url)

      if (!error) {
        let { count } = data
        this.assetCount = count
      }
    },
    openAssets() {
      let { category } = this
      if (isEmpty(category)) return
      let values = []
      let url = '/app/at/assets/all?search='
      let filterObj = null
      if (this.selectedResourceList) {
        this.selectedResourceList.forEach(element => {
          values.push(`${element.id}`)
        })
        filterObj = {
          id: [
            {
              operatorId: 36,
              value: values,
            },
          ],
        }
        url += encodeURIComponent(JSON.stringify(filterObj))
      } else if (!isEmpty(this.specificAssets)) {
        if (this.specificAssets) {
          this.specificAssets.forEach(element => {
            values.push(`${element}`)
          })
        }
        filterObj = {
          id: {
            operatorId: 36,
            value: values,
          },
        }
        url += encodeURIComponent(JSON.stringify(filterObj))
      } else {
        filterObj = {
          category: {
            operatorId: 36,
            value: [JSON.stringify(this.category.id)],
          },
        }
        url += encodeURIComponent(JSON.stringify(filterObj))
      }
      if (isWebTabsEnabled()) {
        let filter = JSON.stringify(filterObj)
        let { name } = findRouteForModule('asset', pageTypes.LIST)
        if (name) {
          this.$router.push({
            name,
            params: { viewname: 'all' },
            query: { search: filter },
          })
        }
      } else {
        this.$router.push({ path: url })
      }
    },
    openAlarm(isActive) {
      let url = '/app/fa/faults/'
      let filterObj = null
      if (!isActive) {
        filterObj = {
          rule: {
            operatorId: 36,
            value: [JSON.stringify(this.ruleId)],
          },
          lastOccurredTime: { operatorId: 31 },
        }
        url += 'all?search=' + encodeURIComponent(JSON.stringify(filterObj))
      } else {
        filterObj = {
          rule: {
            operatorId: 36,
            value: [JSON.stringify(this.ruleId)],
          },
        }
        url +=
          'active?&includeParentFilter=true&search=' +
          encodeURIComponent(JSON.stringify(filterObj))
      }
      if (isWebTabsEnabled()) {
        let filter = JSON.stringify(filterObj)
        let { name } = findRouteForModule('newreadingalarm', pageTypes.LIST)
        if (name) {
          this.$router.push({
            name,
            params: { viewname: isActive ? 'active' : 'all' },
            query: { search: filter },
          })
        }
      } else {
        this.$router.push({ path: url })
      }
    },

    resourceLabel() {
      let {
        details = {},
        category = {},
        assetCategoryId = 0,
        specificAssets = [],
      } = this
      let { matchedassetcount = 0 } = details
      let { name } = category || {}
      if (assetCategoryId > 0) {
        this.category = this.getAssetCategory(assetCategoryId)
      }

      if (!isEmpty(specificAssets)) {
        this.assetCount = specificAssets.length
        let { assetCount = 0 } = this
        let suffix =
          assetCount > 1
            ? ` ${this.$t('summary.assets', 'Assets', { ns: 'rule' })}`
            : ` ${this.$t('summary.asset', 'Asset', { ns: 'rule' })}`

        let { category: { name } = {} } = this
        return `${this.$t('specific_assets', 'Specific Assets', {
          ns: 'rule',
        })} -
          ${name}
          (
          ${assetCount}
          ${suffix}
          )`
      } else {
        let { details: { matchedassetids } = {} } = this
        if (matchedassetids) {
          this.selectedResourceList = matchedassetids.map(id => ({
            id: id,
          }))
        }

        this.loadAssetCount()

        if (!matchedassetids || this.assetCount === matchedassetcount) {
          let suffix =
            this.assetCount > 1
              ? ` ${this.$t('summary.assets', 'Assets', { ns: 'rule' })}`
              : ` ${this.$t('summary.asset', 'Asset', { ns: 'rule' })}`

          return `All ${name} ( ${this.assetCount} ${suffix} )`
        } else if (matchedassetcount === 0) {
          return `No  ${name}`
        }
        return `${matchedassetcount} ${name} included`
      }
    },
    async loadAssetCategories() {
      let params = {
        page: 1,
        perPage: 5000,
        withCount: true,
      }
      let { data = {}, error } = await API.get(
        `v3/unrelated/newreadingrules/fetchAll/assetcategory`,
        params
      )
      if (isEmpty(error)) {
        let { assetcategory = [] } = data
        this.assetCategoryList = assetcategory
        this.assetCatListLoaded = true
      }
    },
    getAssetCategory(assetCatId) {
      let { assetCategoryList } = this
      if (assetCategoryList && assetCategoryList.length > 0)
        return assetCategoryList.find(
          assetCategory => assetCategory.id === assetCatId
        )
    },
  },
}
</script>

<style scoped>
.iconCircle {
  border-radius: 12.5rem;
  padding: 5px 7px;
}
</style>
