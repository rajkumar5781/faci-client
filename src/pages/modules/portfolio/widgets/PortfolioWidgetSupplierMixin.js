export default {
  components: {
    spaceInsights: () => import('../SpaceInsights.vue'),
    spaceLocation: () => import('../../site/widgets/SiteLocationWidget.vue'),
    hourlyForecast: () => import('../widgets/WeatherTable.vue'),
    weatherCard: () => import('../../site/widgets/NewWeatherCard.vue'),
    buildings: () => import('./SpaceListWidget.vue'),
    spaces: () => import('./SpaceListWidget.vue'),
    subSpaces: () => import('./SpaceListWidget.vue'),
    floors: () => import('./SpaceListWidget.vue'),
    relatedReadings: () => import('./NewRelatedReadings.vue'),
    depreciationAnalysis: () => import('../../site/widgets/WeatherGraph.vue'),
    energySpaceInsights: () => import('../EnergySpaceInsights.vue'),
  },
}
