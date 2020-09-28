PlanSource.JobRenderingsRoute = Ember.Route.extend({
  tab: 'Renderings',

  setupController: function (controller) {
    var jobController = this.controllerFor('job');
    var job = jobController.get('model');
    var resolvedRenderings = Em.A();

    job.getRenderings(function (renderings) {
      for (var i = 0; i < renderings.length; i++) {
        resolvedRenderings.push(renderings[i]);
      }
    });

    jobController.set('currentTab', this.tab);
    controller.set('jobController', jobController);
    controller.set('content', resolvedRenderings);
  }
});
