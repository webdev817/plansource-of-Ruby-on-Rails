PlanSource.JobRenderingsController = PlanSource.ArrayController.extend({
  tab: 'Renderings',
	sortProperties: ['name'],
  sortAscending: true,

  // When photos change, we need to update content here.
  updateRenderings: function () {
    var job = this.get('jobController.model');

    this.set('content', job.get('renderings'));
  }.observes(
    'jobController.model.renderings',
    'jobController.model.renderings.@each'
  ),

});
