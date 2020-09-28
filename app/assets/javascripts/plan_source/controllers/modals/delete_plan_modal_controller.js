PlanSource.DeletePlanController = Ember.ObjectController.extend({

	deletePlan : function(){
		this.get("parent").removePlan(this.get("model"));
		this.send("close");
	},

	keyPress : function(e){
		if (e.keyCode == 13)
			this.deletePlan();
	}

});