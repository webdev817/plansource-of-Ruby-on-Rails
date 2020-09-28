PlanSource.EditPhotoController = Ember.ObjectController.extend({
	updatePhoto: function(){
    var photo = this.get("model");
		var description = $("#edit-photo-description").val();
    var self = this;

    photo.set("description", description);
    photo.save(function (photo) {
      self.send("close");
    });
	},

	keyPress : function(e){
		if (e.keyCode == 13) this.updatePhoto();
	}
});
