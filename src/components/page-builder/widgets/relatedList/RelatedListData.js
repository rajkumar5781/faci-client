import getProperty from 'dlv'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { CustomModuleData } from '../../../../data/CustomModuleData.js'

export class RelatedListData extends CustomModuleData {
  static async fetchAllRecords(payload) {
    let {
      moduleName,
      filters,
      perPage,
      force = false,
      recordId,
      relatedFieldName,
      currentModuleName,
    } = payload || {}
    let params = {
      ...(payload || {}),
      filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
      includeParentFilter: !isEmpty(filters),
      perPage: perPage || 50,
      withCount: true,
      fetchOnlyViewGroupColumn: true,
      withoutCustomButtons: true,
      force: null,
    }
    let config = { force }

    let url = `v3/modules/${currentModuleName}/${recordId}/relatedList/${moduleName}/${relatedFieldName}`
    let { data, error, meta } = await API.get(url, params, config)

    if (error) {
      throw error
    } else {
      this.recordListCount = getProperty(meta, 'pagination.totalCount', null)

      let list = getProperty(data, moduleName) || []
      return { data: list, moduleName }
    }
  }
}
