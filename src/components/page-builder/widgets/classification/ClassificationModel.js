import { SetupData, prop } from '@facilio/data'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

export class ClassificationListModel extends SetupData {
  static props = [
    'id',
    'name',
    'description',
    'appliedModuleIds',
    'hasChild',
    'parentClassification',
    'classificationPath',
    'attributes',
  ]
  name = ''
  description = ''
  appliedModuleIds = []
  hasChild = false
  parentClassification = null
  classificationPath = null
  attributes = []
  constructor(data) {
    super(data)
    this.setResourceProperties()

    let parentProperties = Object.getPrototypeOf(this)
    if (!isEmpty(Object.keys(parentProperties))) {
      Object.entries(parentProperties).forEach(
        ([key, value]) => (this[key] = value)
      )
    }

    if (!isEmpty(data)) {
      let currentData = { ...this, ...data }
      let deserializedData = this.deserialize(currentData)
      this.updateDataProperty(deserializedData)
    }
  }

  static resourceProperties = {
    totalCount: {
      deserialize: () => {
        return null
      },
    },
    moduleName: {
      deserialize: () => {
        return 'classification'
      },
    },
    id: { primary: true },
    name: {},
    description: {},
    appliedModuleIds: {},
    hasChild: { serialize: null },
    parentClassification: {},
    classificationPath: { serialize: null },
    attributes: {},
  }
  static async fetchAllRecords(payload) {
    let { error, list, meta } = await API.fetchAll('classification', payload)

    if (error) {
      throw error
    } else {
      this.totalCount = getProperty(meta, 'pagination.totalCount', null)
      return {
        data: list || [],
      }
    }
  }
  static async fetchRecord(payload) {
    let { classification, error } = await API.fetchRecord(
      'classification',
      payload
    )
    if (error) {
      throw error
    } else {
      return { data: classification || {} }
    }
  }

  async saveRecord(serializedData) {
    let { id } = serializedData || {}
    let moduleName = 'classification'
    let response = []

    if (isEmpty(id)) {
      response = await API.createRecord(moduleName, {
        data: serializedData,
      })
    } else {
      response = await API.updateRecord(moduleName, {
        id: id,
        data: serializedData,
      })
    }
    let { error } = response
    if (error) {
      throw error
    }
  }
}
