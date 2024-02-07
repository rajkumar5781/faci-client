export default {
  components: {
    servingsites: () =>
      import('/src/pages/modules/inventory/storeroom/widgets/ServingSites.vue'),
    storeroomitemtransactions: () =>
      import(
        '/src/pages/modules/inventory/storeroom/widgets/StoreRoomItemTransaction.vue'
      ),
    storeroomtooltransactions: () =>
      import(
        '/src/pages/modules/inventory/storeroom/widgets/StoreRoomToolTransactions.vue'
      ),

    storeroomitems: () =>
      import(
        '/src/pages/modules/inventory/storeroom/widgets/StoreRoomItems.vue'
      ),
    storeroomtools: () =>
      import(
        '/src/pages/modules/inventory/storeroom/widgets/StoreRoomTools.vue'
      ),
  },
}
