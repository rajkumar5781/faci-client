<template>
  <div class="service-vendor-container">
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal
        :to="`action-${widget.id}-${widget.name}`"
        v-if="!isEmpty(serviceVendorList)"
      >
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="addVendor()"
        >
          {{ $t('inventory.service.add_vendor', { ns: 'inventory' }) }}
        </FButton>
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(serviceVendorList)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('inventory.service.no_data_available', { ns: 'inventory' })"
        :vertical="true"
        :size="'M'"
      >
        <template #buttons>
          <FContainer display="flex" cursor="pointer" @click="addVendor()">
            <FButton
              appearance="secondary"
              size="medium"
              iconGroup="navigation"
              iconName="addition"
              iconPosition="prefix"
            >
              <FText appearance="headingMed14">
                {{ $t('inventory.service.add_vendor', { ns: 'inventory' }) }}
              </FText>
            </FButton>
          </FContainer></template
        >
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflow="scroll">
        <FTable
          :columns="column"
          :data="serviceVendorList"
          :rounded="false"
          :hideBorder="false"
        >
          <template
            #[`cell.lastPrice`]="{ row, prop }"
            v-if="$access.hasPermission('inventory:UPDATE')"
          >
            <FContainer
              width="30%"
              class="border-none"
              hover-border="1px solid"
              hover-borderColor="borderNeutralBaseSubtler"
              hover-borderRadius="medium"
            >
              <FInput
                v-model="row[prop]"
                appearance="default"
                size="medium"
                type="number"
                @input="changePrice(row, prop)"
                @change="updatePrice"
              />
            </FContainer>
          </template>
          <template
            #[`cell.action`]="{ row }"
            v-if="$access.hasPermission('inventory:UPDATE')"
          >
            <div style="display: flex">
              <FIcon
                group="default"
                name="trash-can"
                size="16"
                @click="remove(row)"
              />
            </div>
          </template>
        </FTable>
      </FContainer>
    </FContainer>
    <FContainer v-if="showPopup && !isLoading">
      <FModal
        :title="$t('inventory.service.add_vendor', { ns: 'inventory' })"
        :visible="showPopup"
        :cancelText="$t('inventory.service.cancel', { ns: 'inventory' })"
        :saveText="$t('inventory.service.save', { ns: 'inventory' })"
        size="S"
        :hideFooter="false"
        @ok="saveVendor"
        @cancel="handleCancel"
      >
        <FContainer
          display="flex"
          paddingTop="containerXxLarge"
          paddingLeft="containerXxLarge"
          paddingRight="containerXxLarge"
          width="100%"
          marginLeft="containerLarge"
          v-if="!isEmpty(serviceVendors)"
        >
          <FContainer width="42%">
            <FText appearance="headingMed14" color="textMain">
              {{ $t('inventory.service.vendor', { ns: 'inventory' }) }}
            </FText>
          </FContainer>
          <FContainer marginLeft="containerXxLarge" width="50%">
            <FText appearance="headingMed14" color="textMain">
              {{ $t('inventory.service.price', { ns: 'inventory' }) }}
            </FText>
          </FContainer>
        </FContainer>
        <FContainer v-for="(data, index) in serviceVendors" :key="index">
          <FContainer
            display="flex"
            paddingTop="containerXxLarge"
            paddingLeft="containerXxLarge"
            paddingRight="containerXxLarge"
            marginLeft="containerLarge"
          >
            <FContainer width="45%">
              <FSelect
                v-model="data.vendorId"
                :placeholder="
                  $t('inventory.service.select_vendor', { ns: 'inventory' })
                "
                :options="vendors"
                size="medium"
              >
              </FSelect>
            </FContainer>
            <FContainer marginLeft="containerXxLarge" width="45%">
              <FInput
                v-model="data.lastPrice"
                appearance="default"
                :placeholder="
                  $t('inventory.service.enter_price', { ns: 'inventory' })
                "
                size="medium"
                type="number"
              />
            </FContainer>
            <FContainer marginLeft="containerXxLarge" width="10%">
              <FButton
                iconGroup="action"
                iconName="delete"
                size="medium"
                appearance="tertiary"
                @click="removeVendor(index)"
              ></FButton>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer
          paddingTop="containerXxLarge"
          paddingBottom="containerXLarge"
          paddingLeft="containerXLarge"
          paddingRight="containerXLarge"
          marginLeft="containerLarge"
        >
          <FButton
            iconGroup="sign-symbols"
            iconName="addition"
            size="medium"
            appearance="tertiary"
            @click="appendVendors()"
            iconPosition="prefix"
            color="backgroundPrimaryDefault"
          >
            <FText color="backgroundPrimaryDefault">
              {{ $t('inventory.service.add', { ns: 'inventory' }) }}
            </FText>
          </FButton>
        </FContainer>
      </FModal>
    </FContainer>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  FButton,
  FSelect,
  ftoast,
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'

export default {
  props: ['details', 'widget', 'fitToViewArea'],
  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    FSelect,
    FSpinner,
    FForm,
    FFormItem,
    LookupWizard,
    FEmptyState,
    FPagination,
    FInput,
  },
  data() {
    return {
      serviceVendors: [],
      isLoading: false,
      val: '',
      showPopup: false,
      column: [
        { displayName: 'Name', name: 'name', id: 1, fixed: true },
        { displayName: 'Price', name: 'lastPrice', id: 2, fixed: true },
      ],
      vendors: [],
      serviceVendorList: [],
    }
  },
  created() {
    this.serviceVendors = []
    this.loadVendors()
    this.getServiceVendorList()
    this.fitToViewArea()
  },
  computed: {
    moduleName() {
      return 'service'
    },
  },
  methods: {
    isEmpty,
    async loadVendors() {
      this.isLoading = true
      let { data, error } = await API.get('/v2/vendors/view/all')
      if (!error) {
        let { vendors = [] } = data || {}
        let vendorlist = []
        vendors.forEach(vendor => {
          let vendorObj = {}
          let { name, id } = vendor
          vendorObj.label = name
          vendorObj.value = id
          vendorlist.push(vendorObj)
        })
        this.vendors = vendorlist
      } else {
        ftoast.critical('Error Occured', {
          title: '',
          menuType: 'alerts',
          timeout: 5000,
        })
      }

      this.isLoading = false
    },
    getServiceVendorList() {
      this.isLoading = true
      let { details } = this
      let { serviceVendors = [] } = details || {}
      let vendorList = serviceVendors.map(service => {
        let serviceName = null

        let { vendor } = service || {}
        let { name, id } = vendor || {}
        if (isEmpty(name)) {
          let { vendors = [] } = this
          let { label } = vendors.find(vendor => {
            return vendor.value === id
          })
          serviceName = label
        } else {
          serviceName = name
        }
        return { ...service, name: serviceName }
      })

      this.serviceVendorList = vendorList
      this.isLoading = false
    },
    getAllServiceVendors() {
      this.isLoading = true
      let { details } = this
      let { serviceVendors = [] } = details || {}
      serviceVendors.forEach(service => {
        let { vendor } = service || {}
        let { id } = vendor || {}
        service.vendorId = id
      })
      this.serviceVendors = serviceVendors
      this.isLoading = false
    },
    addVendor() {
      this.serviceVendors = []
      this.getAllServiceVendors()
      let { serviceVendors } = this
      if (isEmpty(serviceVendors)) {
        this.appendVendors()
      }
      this.showPopup = true
    },
    handleCancel() {
      this.showPopup = false
    },
    reLoadPage() {
      this.getServiceVendorList()
    },
    async saveVendor() {
      let { id } = this.details || {}
      let { serviceVendors = [] } = this
      serviceVendors.forEach((service, index) => {
        let { vendorId, lastPrice } = service
        if (isEmpty(vendorId) || isEmpty(lastPrice)) {
          this.removeVendor(index)
        }
        let vendor = { id: vendorId }
        service.vendor = vendor
      })
      this.serviceVendors = serviceVendors
      let param = {
        id,
        data: {
          serviceVendors: this.serviceVendors,
        },
      }

      let { error } = await API.updateRecord(this.moduleName, param)

      if (error) {
        ftoast.critical('Error Occured', {
          title: '',
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        ftoast.success(
          this.$t('inventory.service.vendor_added_successfully', {
            ns: 'inventory',
          })
        )
      }
      this.reLoadPage()
      this.handleCancel()
    },

    removeVendor(index) {
      let { serviceVendors } = this
      serviceVendors.splice(index, 1)
      this.serviceVendors = serviceVendors
    },
    appendVendors() {
      let vendorObj = {
        vendorId: null,
        lastPrice: null,
      }
      this.serviceVendors.push(vendorObj)
    },
    remove(vendor = {}) {
      let { id: vendorId } = vendor
      let { serviceVendorList = [] } = this
      if (serviceVendorList.length < 2) {
        ftoast.critical(
          this.$t('inventory.service.atleast_one_vendor_required', {
            ns: 'inventory',
          })
        )
        return
      }
      let index = this.serviceVendorList.findIndex(
        vendor => vendor.id === vendorId
      )
      this.serviceVendorList.splice(index, 1)
      this.removeVendor(index)

      this.patchUpdateRecord(
        this.$t('inventory.service.vendor_removed_successfully', {
          ns: 'inventory',
        })
      )
    },
    async patchUpdateRecord(message) {
      let { id } = this.details || {}
      let param = {
        id,
        data: {
          serviceVendors: this.serviceVendorList,
        },
      }

      let { error } = await API.updateRecord(this.moduleName, param)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        ftoast.success(message)
        this.serviceVendors = []
        this.loadVendors()
        this.getAllServiceVendors()
      }
    },
    updatePrice() {
      this.patchUpdateRecord(
        this.$t('inventory.service.price_edited_successfully', {
          ns: 'inventory',
        })
      )
    },
    changePrice(row, prop) {
      let updatingRow = this.serviceVendorList.find(data => data.id == row.id)
      this.$set(updatingRow, 'lastPrice', row[prop])
    },
  },
}
</script>
<style lang="scss">
.service-vendor-container {
  .border-none {
    div {
      border: none !important;
    }
  }
}
</style>
