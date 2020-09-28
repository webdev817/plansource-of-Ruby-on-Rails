PlanSource.JobShopsController = PlanSource.JobPlansController.extend({
  tab: 'Shops',
  currentFilter: 'all',

  filter: function (filter) {
    // Reset filters to the default when going with a preset filter.
    this.set('sortProperties', ['status', 'rfi_num', 'asi_num'])
    this.set('currentFilter', filter);
  },

  // When photos change, we need to update content here.
  updatePlans: function () {
    var job = this.get('jobController.model');

    this.set('content', job.getFilteredShops(this.get('currentFilter')));
  }.observes(
    'currentFilter',
    'jobController.model',
    'jobController.model.plans',
    'jobController.model.plans.@each',
    'jobController.model.plans.@each.id',
    'jobController.model.plans.@each.assigned_user.id'
  ),

  isFilter: function (filter) {
    return filter === this.get('currentFilter');
  },

  isAllFilter: isFilterProp('all'),
  isMeFilter: isFilterProp('me'),

  shopDrawingManager: function () {
    return this.get('jobController.model.shop_drawing_manager')
  }.property("jobController.model.shop_drawing_manager")
});
