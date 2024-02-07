export default {
  components: {
    itemdetailscard: () =>
      import('/src/pages/modules/inventory/Item/widgets/ItemDetailsCard.vue'),
    toolDetailsCard: () =>
      import('/src/pages/modules/inventory/tool/widgets/ToolDetailsCard.vue'),
    purchasedtools: () =>
      import('/src/pages/modules/inventory/tool/widgets/PurchasedTools.vue'),

    purchaseditems: () => import('./widgets/PurchasedItems.vue'),
    bin: () => import('./widgets/Bin.vue'),
    rotatingasset: () => import('./widgets/RotatingAsset.vue'),
    purchaseorder: () => import('./widgets/PurchaseOrderWidget.vue'),
  },
}
