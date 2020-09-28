PlanSource.UploadPhotosController = PlanSource.ModalController.extend({
  // The errors for the submittal form.
  errors: {},

  submitPhotos: function () {
    var photos = this.getPhotos();
    var job = this.get("model");
    var self = this;

    this.disableButtons();

    for (var i = 0; i < photos.length; i++) {
      var photo = photos[i];
      if (!photo.date_taken) {
        $("#upload-error").text("You need to pick a date for all of your photos.");
        this.enableButtons();
        return;
      }
    }

    PlanSource.Photo.submitPhotos(photos, job.get("id"), function (success) {
      self.get("parent").updatePlans();
      self.send("close");
    });
  },

  getPhotos: function () {
    var photos = [];
    var $photos= $("#uploaded-photos .file-preview");

    $photos.each(function (i, el) {
      var $el = $(el);
      var $chooseDateLink = $el.find(".choose-date");

      photos.push({
        id: $el.data("id"),
        date_taken: $chooseDateLink.data("date-taken")
      });
    });

    return photos;
  },

	keyPress : function(e){
		if (e.keyCode == 27){
			this.send('close');
		}
	}
});
