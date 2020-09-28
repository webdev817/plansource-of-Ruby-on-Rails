PlanSource.JobRfiAsiRoute = Ember.Route.extend({
  tab: 'ASI',

  setupController: function (controller) {
    var jobController = this.controllerFor('job');
    var job = jobController.get('model');
    var currentFilter = controller.get('currentFilter') || 'all';

    jobController.set('currentTab', this.tab);
    controller.set('jobController', jobController);
    controller.set('content', job.getFilteredRFIsAndASIs(currentFilter));
  },

  redirect: function () {
    var jobController = this.controllerFor('job');
    var model = jobController.get("model");
    if (!model || !model.canViewTab(this.tab)) this.transitionTo("job.index");
  }
});

