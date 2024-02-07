export default {
    components: {
        criteriaListView: () => import('./CriteriaFieldsWidget.vue'),
        commandsListView: () => import('./CommandsList.vue'),
        actionsListView: () => import('./ActionsListView.vue'),
    }
}