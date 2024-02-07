export default {
  components: {
    itemTypesDetailsCard: () =>
      import('./widgets/ItemAndToolTypeCardDetails.vue'),
    whereUsed: () => import('./widgets/ItemTypeWhereUsed.vue'),
    storeroom: () => import('./widgets/ItemAndToolTypeStoreRoom.vue'),
    transactionsitem: () => import('./widgets/ItemAndToolTransaction.vue'),
    transactionstool: () => import('./widgets/ItemAndToolTransaction.vue'),
  },
}
