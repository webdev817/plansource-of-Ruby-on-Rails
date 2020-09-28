PlanSource.JobPlansRoute = Ember.Route.extend({
  tab: 'Plans',

  setupController: function (controller) {
    var jobController = this.controllerFor('job');
    var job = jobController.get('model');

    jobController.set('currentTab', this.tab);
    controller.set('jobController', jobController);
    controller.set('content', job.getPlansByTab(this.tab));
  },

  renderTemplate: function (controller) {
    this.render('job/plans', { controller: controller });
  },

  redirect: function () {
    var jobController = this.controllerFor('job');
    var model = jobController.get("model");
    if (!model || !model.canViewTab(this.tab)) this.transitionTo("job.index");
  }
});

PlanSource.JobPreDevelopmentRoute = PlanSource.JobPlansRoute.extend({ tab: 'Pre-Development' });
PlanSource.JobAddendumsRoute = PlanSource.JobPlansRoute.extend({ tab: 'Addendums' });
PlanSource.JobSupportRoute = PlanSource.JobPlansRoute.extend({ tab: 'Consultants' });
PlanSource.JobClientRoute = PlanSource.JobPlansRoute.extend({ tab: 'Client' });
PlanSource.JobCalcsRoute = PlanSource.JobPlansRoute.extend({ tab: 'Calcs & Misc' });
