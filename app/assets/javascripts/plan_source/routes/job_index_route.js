PlanSource.JobIndexRoute = Ember.Route.extend({
	redirect : function(){
    var model = this.modelFor("job");
    if (!model) return this.transitionTo("jobs");

    if (model.get("canViewPlansTab")) {
      this.transitionTo("job.plans");
    } else if (model.get("canViewPreDevelopmentTab")) {
      this.transitionTo("job.pre_development");
    } else if (model.get("canViewShopsTab")) {
      this.transitionTo("job.shops");
    } else if (model.get("canViewSpecialInspectionsTab")) {
      this.transitionTo("job.special_inspections");
    } else if (model.get("canViewConsultantsTab")) {
      this.transitionTo("job.support");
    } else if (model.get("canViewClientTab")) {
      this.transitionTo("job.client");
    } else if (model.get("canViewCalcsTab")) {
      this.transitionTo("job.calcs");
    } else if (model.get("canViewPhotosTab")) {
      this.transitionTo("job.photos");
    } else if (model.get("canViewRenderingsTab")) {
      this.transitionTo("job.renderings");
    } else {
      // Default for safety
      this.transitionTo("job.plans");
    }
	}
});
