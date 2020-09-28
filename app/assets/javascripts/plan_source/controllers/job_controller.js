var isTabProp = function (tab) {
  return function () { return this.isTab(tab); }.property('currentTab');
};

PlanSource.JobController = Ember.ObjectController.extend({
  // Safe default
  currentTab: 'Plans',

  submittalCount: function () {
    return this.get('model.submittals').length;
  }.property('model.submittals'),

  addPlan : function(plan){
  	if(this.planExists(plan)) return false;

  	var self = this;
    this.get("model.plans").pushObject(plan);

		plan.save().then(function(data){
      if (data == false) {
        self.get("model.plans").removeObject(plan);
      }
    });

    return true;
	},

	removePlan: function(plan) {
		var self = this;
		this.get("model.plans").removeObject(plan);

		plan.deleteRecord();
		plan.save().then(function() {
			self.updatePlans();
		});
	},

	updatePlans: function() {
		var self = this;
    var jobId = this.get("model.id");

		PlanSource.Job.find(jobId).then(function(job){
			self.set("model", job);
		});
	},

	planExists: function(new_plan) {
		var name;
		if (typeof new_plan == 'string' || new_plan instanceof String) {
			name = new_plan;
    } else {
			name = new_plan.get("plan_name");
    }

    for(var i = 0 ; i < this.get("content").length ; i++){
      var plan = this.get("content")[i];
      if(plan.get("plan_name") == name)
        return true;
    }

    return false;
  },

  archiveJob: function () {
    if (!confirm("Are you sure you want to archive this job?")) return;

    var job = this.get('model');

    job.set('archived', true);
    job.save();
  },

  unarchiveJob: function () {
    var job = this.get('model');

    job.set('archived', false);
    job.save();
  },

  subscribeJob: function () {
    var job = this.get('model');

    job.set('subscribed', true);
    job.save();
  },

  unsubscribeJob: function () {
    var job = this.get('model');

    job.set('subscribed', false);
    job.save();
  },

  isTab: function (tab) {
    return tab === this.get('currentTab');
  },

  isPreDevelopmentTab: isTabProp('Pre-Development'),
  isPlansTab: isTabProp('Plans'),
  isAddendumsTab: isTabProp('Addendums'),
  isASITab: isTabProp('ASI'),
  isShopsTab: isTabProp('Shops'),
  isSpecialInspectionsTab: isTabProp('Special Inspections'),
  isConsultantsTab: isTabProp('Consultants'),
  isClientTab: isTabProp('Client'),
  isCalcTab: isTabProp('Calcs'),
  isPhotosTab: isTabProp('Photos'),
  isRenderingsTab: isTabProp('Renderings'),
});
