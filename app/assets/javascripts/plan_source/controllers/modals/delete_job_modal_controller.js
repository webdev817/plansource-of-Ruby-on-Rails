PlanSource.DeleteJobController = Ember.ObjectController.extend({

	deleteJob : function(){
		var job = this.get("model");
		this.get("parent").removeJob(job);
		this.send("close");
	},

	keyPress : function(e){
		if (e.keyCode == 13)
			this.deleteJob();
	}

});