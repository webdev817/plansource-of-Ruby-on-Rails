PlanSource.JobPhotosRoute = Ember.Route.extend({
  tab: 'Photos',

  setupController: function (controller) {
    var jobController = this.controllerFor('job');
    var job = jobController.get('model');
    var resolvedPhotos = Em.A();

    job.getPhotos(function (photos) {
      for (var i = 0; i < photos.length; i++) {
        resolvedPhotos.push(photos[i]);
      }
    });

    jobController.set('currentTab', this.tab);
    controller.set('jobController', jobController);
    controller.set('content', resolvedPhotos);
  },

  redirect: function () {
    var jobController = this.controllerFor('job');
    var model = jobController.get("model");
    if (!model || !model.canViewTab(this.tab)) this.transitionTo("job.index");
  }
});
