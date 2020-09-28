PlanSource.JobSpecialInspectionsRoute = Ember.Route.extend({
  tab: 'Special Inspections',

  setupController: function (controller) {
    var jobController = this.controllerFor('job');
    var job = jobController.get('model');

    jobController.set('currentTab', this.tab);
    controller.set('jobController', jobController);
    controller.set('content', job.getPlansByTab(this.tab));
    controller.set('sortProperties', ['csi']);
    controller.set('sortAscending', true);
  },

  redirect: function () {
    var jobController = this.controllerFor('job');
    var model = jobController.get("model");
    if (!model || !model.canViewTab(this.tab)) this.transitionTo("job.index");
  }
});

