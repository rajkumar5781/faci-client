<script lang="jsx">
import InventoryRelatedListWidget from '../../components/InventoryRelatedListWidget.vue'
import {
  FContainer,
  FText,
  FButton,
  FTags,
  ftoast,
} from '@facilio/design-system'
import { dset as setProperty } from 'dset'
import { API } from '@facilio/api'

import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: InventoryRelatedListWidget,
  components: {
    FContainer,
    FText,
    FButton,
    FTags,
  },

  data() {
    return {
      columns: [
        {
          displayName: this.$t('name', { ns: 'inventory' }),
          name: 'name',
          id: 1,
          fixed: true,
          width: 150,
        },
        {
          displayName: this.$t('inventory.quantity', { ns: 'inventory' }),
          name: 'quantity',
          id: 2,
          fixed: false,
          width: 150,
        },
        {
          displayName: '',
          name: 'defaultAction',
          id: 3,
          fixed: false,
          width: 600,
        },
      ],
    }
  },

  computed: {
    moduleName() {
      return 'bin'
    },

    defaultFilter() {
      let { details } = this || {}
      let { id, moduleName } = details || {}
      if (moduleName == 'item') {
        return {
          item: {
            operatorId: 36,
            value: [id + ''],
          },
        }
      } else {
        return {
          tool: {
            operatorId: 36,
            value: [id + ''],
          },
        }
      }
    },
  },
  methods: {
    async init() {
      await this.fetchRecords()
      await this.loadSystemButtons()
    },
    async fetchRecords(force = false) {
      await this.loadRecords(force)
      this.showDefaultBinFirst()
    },
    modifyRecordsAfterFetch(record) {
      let { details = {} } = this
      let { defaultBin = {} } = details
      let isDefault = defaultBin.id === record.id
      return { ...record, isDefault }
    },
    showDefaultBinFirst() {
      let { recordList = [], details } = this
      let { defaultBin } = details || {}
      if (isEmpty(defaultBin)) {
        return
      }
      let { id } = defaultBin
      let existingBin = recordList.find(r => r.id === id)
      if (existingBin) {
        recordList.splice(recordList.indexOf(existingBin), 1)
        recordList.unshift(existingBin)
      }
      setProperty(this, 'recordList', recordList)
    },
    async makeDefaultBin(row = {}) {
      let { details = {} } = this
      let { id: itemId, moduleName: parentModule } = details
      if (isEmpty(itemId)) {
        return
      }
      let { id, name } = row
      let defaultBin = { id }
      let item = {
        id: itemId,
        defaultBin,
      }
      let { error } = await API.updateRecord(parentModule, {
        id: itemId,
        data: item,
      })
      if (!error) {
        if (!isEmpty(name)) {
          ftoast.success(
            `${name} ` +
              this.$t('inventory.item.made_bin_default', {
                ns: 'inventory',
              })
          )
        }

        setProperty(this, 'details.defaultBin', defaultBin)
        await this.fetchRecords(true)
      }
    },
    table() {
      return (
        <FContainer overflow="scroll">
          <FTable
            columns={this.columns}
            data={this.recordList}
            rounded={false}
            hideBorder={false}
            {...{
              scopedSlots: {
                ['cell.defaultAction']: prop => {
                  let { row } = prop
                  let { isDefault } = row

                  return (
                    <FContainer
                      display="flex"
                      alignItems="center"
                      justifyContent="right"
                    >
                      {isDefault ? (
                        <FContainer
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          width="100px"
                        >
                          <FTags
                            appearance="accent"
                            text={'Default'}
                            disabled={false}
                            accentColor="grey"
                            accentLevel="L2"
                          />
                        </FContainer>
                      ) : (
                        <FContainer
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          width="100px"
                        >
                          <FButton
                            appearance="secondary"
                            v-on:click={() => this.makeDefaultBin(row)}
                          >
                            <FText
                              marginLeft="containerMedium"
                              appearance="headingMed14"
                              color="textDefault"
                            >
                              {this.$t('inventory.set_default', {
                                ns: 'inventory',
                              })}
                            </FText>
                          </FButton>
                        </FContainer>
                      )}
                    </FContainer>
                  )
                },
              },
            }}
          ></FTable>
        </FContainer>
      )
    },
  },
}
</script>
