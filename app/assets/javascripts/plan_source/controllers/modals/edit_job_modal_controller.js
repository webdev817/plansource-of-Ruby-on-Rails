PlanSource.EditJobController = PlanSource.ModalController.extend({

	editJob : function(){
		var container = $("#edit-job-name"),
    		name = container.val();
    this.clearAllErrors();
    if(!name || name == ""){
    	this.error("#edit-job-name", "You need to enter a job name!")
    	return;
    }
    if(this.get("parent").jobExists(name)){
    	this.error("#edit-job-name", "That job name already exists!");
    	return;
    }
    this.get("model").set("name", name);
		this.get("model").save();
		this.send("close");
	},

	keyPress : function(e){
		if (e.keyCode == 13)
			this.editJob();
	},

	jobError : function(error){
		var text = $("#edit-job-name").siblings(".help-inline"),
			cont = text.parent().parent();
		cont.addClass("error");
		text.text(error);
	}

});
