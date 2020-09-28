PlanSource.AddPlanController = PlanSource.ModalController.extend({

	addPlan : function(){
		var container = $("#new-plan-name");
    var name = container.val();

   	this.clearAllErrors();

    if (!name || name == "") {
    	this.error("#new-plan-name", "You need to enter a name!");
    	return;
    }

    var plan = PlanSource.Plan.create({
      'plan_name': name,
      'job': this.get('model'),
      'tab': this.get('parent.currentTab')
    });

    if(this.get("parent").addPlan(plan)){
			this.send("close");
		} else {
			this.error("#new-plan-name","That plan already exists!");
    }
	},

	keyPress : function(e){
		if (e.keyCode == 13)
			this.addPlan();
	}
});
