PlanSource.AddJobController = PlanSource.ModalController.extend({

	content : {},

	addJob : function(){
		var container = $("#new-job-name"),
    		name = container.val();
    this.clearAllErrors();
    if(!name || name == ""){
    	this.error("#new-job-name", "You need to enter a name!");
    	return;
    }
    var job = PlanSource.Job.create({"name" : name});
		if(this.get("parent").addJob(job))
			this.send("close");
		else
			this.error("#new-job-name", "The job already exists!");
	},

	keyPress : function(e){
		if (e.keyCode == 13)
			this.addJob();
	}

});
