PlanSource.IndexRoute = Ember.Route.extend({

	redirect : function(){
		this.transitionTo("jobs");
	}

});