PlanSource.DetailsPlanController = PlanSource.ModalController.extend({
	job : {},

	keyPress : function(e){
		if (e.keyCode == 27){
			this.send('close');
		}
	}
});
