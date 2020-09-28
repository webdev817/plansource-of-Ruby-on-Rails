PlanSource.SubmittalListController = PlanSource.ModalController.extend({
	keyPress : function(e){
		if (e.keyCode == 27){
			this.send('close');
		}
	}
});
