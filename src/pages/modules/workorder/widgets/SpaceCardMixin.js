import { findRouteForTab, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { getFieldOptions } from '../../../../utils/picklist'
export default {
  computed: {
    findRoute() {
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      return name
    },
  },
  methods: {
    async getSites(siteId) {
      if (isEmpty(siteId)) return {}
      let defaultIds = [siteId]
      let params = {
        field: { lookupModuleName: 'site' },
        defaultIds,
        perPage: 1,
      }
      let { error, options } = await getFieldOptions(params)
      if (!error) {
        return options[0]
      }
    },
    async initHierarchy(record) {
      let spaceType = getProperty(record, 'spaceType', null)
      let siteId = getProperty(record, 'siteId', null)
      let building = getProperty(record, 'building', null)
      let floor = getProperty(record, 'floor', null)
      let space1 = getProperty(record, 'space1', null)
      let space2 = getProperty(record, 'space2', null)
      let space3 = getProperty(record, 'space3', null)
      let space4 = getProperty(record, 'space4', null)
      let space5 = getProperty(record, 'space5', null)
      let space = getProperty(record, 'space', null)
      let breadCrumbObj = []
      let routeName = this.findRoute
      let recordName = getProperty(record, 'name', null)
      let routeParams = {
        moduleName: 'site',
        id: 1,
      }
      if (!isEmpty(siteId)) {
        let site = await this.getSites(siteId)
        routeParams = {
          moduleName: 'site',
          id: siteId,
        }
        breadCrumbObj.push({
          displayName: site.label,
          routeParams,
        })
        if (!isEmpty(building)) {
          let { name, id } = building

          routeParams = {
            moduleName: 'building',
            id: id,
          }
          breadCrumbObj.push({
            displayName: spaceType === 2 ? recordName : name,
            routeParams,
          })
        }
        if (!isEmpty(floor)) {
          let { name, id } = floor

          routeParams = {
            moduleName: 'floor',
            id: id,
          }
          breadCrumbObj.push({
            displayName: spaceType === 3 ? recordName : name,
            routeParams,
          })
        }
        if (!isEmpty(space1)) {
          let { name, id } = space1
          routeParams = {
            moduleName: 'space',
            id: id,
          }
          breadCrumbObj.push({
            displayName: name,
            routeParams,
          })
        }
        if (!isEmpty(space2)) {
          let { name, id } = space2
          routeParams = {
            moduleName: 'space',
            id: id,
          }
          breadCrumbObj.push({
            displayName: name,
            routeParams,
          })
        }
        if (!isEmpty(space3)) {
          let { name, id } = space3
          routeParams = {
            moduleName: 'space',
            id: id,
          }
          breadCrumbObj.push({
            displayName: name,
            routeParams,
          })
        }
        if (!isEmpty(space4)) {
          let { name, id } = space4
          routeParams = {
            moduleName: 'space',
            id: id,
          }
          breadCrumbObj.push({
            displayName: name,
            routeParams,
          })
        }
        if (!isEmpty(space5)) {
          let { name, id } = space5
          routeParams = {
            moduleName: 'space',
            id: id,
          }
          breadCrumbObj.push({
            displayName: name,
            routeParams,
          })
        }
        if (!isEmpty(space) && spaceType === 4) {
          let { id } = space
          routeParams = {
            moduleName: 'space',
            id: id,
          }
          breadCrumbObj.push({
            displayName: recordName,
            routeParams,
          })
        }
      }
      return breadCrumbObj
    },
    redirect(params) {
      let routeName = this.findRoute
      routeName && this.$router.push({ name: routeName, params })
    },
  },
}
