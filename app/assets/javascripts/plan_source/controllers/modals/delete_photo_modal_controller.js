PlanSource.DeletePhotoController = Ember.ObjectController.extend({
	deletePhoto: function(){
    var photo = this.get("model");
    var self = this;

    photo.deletePhoto(function () {
      self.get("parent").updatePlans();
      self.send("close");
    });
	},

	keyPress : function(e){
		if (e.keyCode == 13) this.deletePhoto();
	}
});
