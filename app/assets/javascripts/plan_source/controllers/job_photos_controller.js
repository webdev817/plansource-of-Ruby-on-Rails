PlanSource.JobPhotosController = PlanSource.ArrayController.extend({
  tab: 'Photos',
	sortProperties: ['date_taken', 'created_at', 'id'],
  sortAscending: false,
  currentView: "table",

  setPhotosView: function (viewType) {
    this.set("currentView", viewType);
  },

  isTableView: function () {
    return this.get("currentView") === "table";
  }.property("currentView"),

  openPhotoViewer: function (photo) {
    photo = photo || {};
    var url = "/photos/" + photo.get("id") + "/gallery";
    window.open(url, '_blank'); ;
  },

  // When photos change, we need to update content here.
  updatePhotos: function () {
    var job = this.get('jobController.model');

    this.set('content', job.get('photos'));
  }.observes(
    'jobController.model.photos',
    'jobController.model.photos.@each'
  ),

  // Updating the job means we need to reload photos
  reloadPhotos: function () {
    var job = this.get('jobController.model');
    var self = this;

    job.getPhotos(function (photos) {
      console.log('done');
      self.set('content', photos);
    });
  }.observes('jobController.model')
});
