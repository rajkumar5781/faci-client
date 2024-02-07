<script>
import PageBuilder from '../../components/page-builder/PageBuilderV1.vue'
import { isEmpty } from '@facilio/utils/validation'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import dlv from 'dlv'

export default {
  extends: PageBuilder,
  props: [
    'module',
    'id',
    'details',
    'summaryFields',
    'relatedList',
  ],
  watch: {
    summaryFields(newVal, oldVal) {
      if (!isEmpty(newVal) && !isEqual(newVal, oldVal)) {
        this.fetchPageData()
      }
    },
  },
  methods: {
    async fetchPageData(tabName) {
      let { id: recordId } = this
      this.pageId = recordId
      let summaryFields = cloneDeep(this.summaryFields)
      let count = 0
      summaryFields = (summaryFields || []).map(field => {
        return {
          ...field,
          rowIndex: count++,
          colSpan: 1,
        }
      })
      let tabs = [
        {
          columns: [
            {
              id: 'summary',
              width: 12,
              sections: [
                {
                  id: 3871,
                  name: 'summaryfields',
                  widgets: [
                    {
                      configType: 'FLEXIBLE',
                      displayName: 'Approval details',
                      height: 5,
                      id: 3865,
                      name: 'approvalFields',
                      widgetDetail: {
                        appId: 63,
                        name: 'Approval details',
                        groups: [
                          {
                            name: 'Primary details',
                            displayName: 'Primary details',
                            columns: 4,
                            fields: summaryFields,
                          },
                        ],
                      },
                      widgetTypeObj: {
                        name: 'approvalFields',
                      },
                      positionX: 0,
                      positionY: 0,
                    },
                  ],
                },
                {
                  id: 3873,
                  name: 'summaryfields',
                  widgets: [
                    {
                      configType: 'FLEXIBLE',
                      displayName: 'Approvers',
                      height: 5,
                      id: 3865,
                      name: 'approvalListWidget',
                      widgetDetail: {
                        name: 'Approvers',
                      },
                      widgetTypeObj: {
                        name: 'approvalListWidget',
                      },
                      positionX: 0,
                      positionY: 0,
                    },
                  ],
                },
                {
                  id: 3872,
                  name: 'widgetgroup',
                  widgets: [
                    {
                      configType: 'FLEXIBLE',
                      displayName: 'Widget Group',
                      hasLicenseEnabled: null,
                      height: 4,
                      id: 3866,
                      name: 'widgetgroup',
                      widgetDetail: {
                        config: {
                          configType: 'TAB',
                        },
                        sections: [
                          {
                            name: 'notes',
                            displayName: 'Notes',
                            widgets: [
                              {
                                name: 'commentwidget',
                                displayName: 'Comment',
                                widgetTypeObj: {
                                  name: 'comment',
                                },
                                configType: 'FLEXIBLE',
                                positionX: 0,
                                positionY: 4,
                                height: 5,
                              },
                            ],
                          },
                          {
                            name: 'documents',
                            displayName: 'Documents',
                            widgets: [
                              {
                                name: 'attachmentwidget',
                                displayName: 'Documents',
                                widgetTypeObj: {
                                  name: 'attachment',
                                },
                                configType: 'FLEXIBLE',
                                positionX: 0,
                                positionY: 4,
                                height: 5,
                              },
                            ],
                          },
                        ],
                      },
                      widgetTypeObj: {
                        name: 'widgetGroup',
                      },
                      positionX: 0,
                      positionY: 0,
                    },
                  ],
                },
              ],
            },
          ],
          displayName: 'Summary',
          isSelected: false,
          name: 'summary',
          status: true,
          tabType: 'SIMPLE',
          id: 'summary',
        },
      ]
      if (!isEmpty(this.relatedList)) {
        let data = {
          displayName: 'Related',
          name: 'Related',
          id: 'related',
          tabType: 'SIMPLE',
          columns: [
            {
              id: 'related',
              sections: this.relatedList,
              width: 12,
            },
          ],
        }
        tabs.push(data)
      }

      let foundTab = (tabs || []).filter(tab => tab.name == tabName)
      this.currentTab = !isEmpty(foundTab)
        ? tabName
        : dlv(tabs, `0.name`) || null
      this.tabs = await this.deserializeTabs(tabs)
      if ((tabs || []).length > 1) {
        this.$emit('appendedTabHeader')
        this.showTabHeader = true
      }
    },
  },
}
</script>
