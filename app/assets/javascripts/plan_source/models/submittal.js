PlanSource.Submittal = Ember.Object.extend({
  setProperties: function (hash) {
    if (hash.data && typeof hash.data === String) {
      this.set("rawData", hash.data);
      this.set("data", JSON.parse(hash.data))
      // Don't want to set data after we manually did it.
      delete hash.data
    }

    if(hash.user){
      this.set("user", PlanSource.User.create(hash.user));
      delete hash.user
    }

    Ember.setProperties(this, hash);
  },

  dateSubmitted: function () {
		return moment(this.get("created_at")).format("LL");
  }.property("created_at"),

  validate: function () {
    var errors = { data: {} };
    if (!this.get("data.description")) {
      errors.data.description = "Can't be blank.";
    }

    if (this.get("is_accepted") && !this.get("plan_id")) {
      errors.plan_id = "Select a plan before accepting.";
    }

    if ($.isEmptyObject(errors.data)) delete errors.data;

    return $.isEmptyObject(errors) ? undefined : errors;
  },

  submit: function (callback) {
    var self = this;
    this.set("job_id", this.get("job_id") || this.get("job").get("id"))

    $.ajax({
        url: PlanSource.Submittal.url(),
        type: 'POST',
        data : { submittal: this.getProperties(["job_id", "data", "attachment_ids"]) },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        self.setProperties(data.submittal);
        return callback(self);
      } else {
        return callback(undefined);
      }
    })
  },

  save: function (callback) {
    var self = this;
    var submittalJson = this.getProperties(["plan_id", "data", "is_accepted"]);

    $.ajax({
        url: PlanSource.Submittal.saveUrl(this.get("id")),
        type: 'POST',
        data : { submittal: submittalJson },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        self.setProperties(data.submittal);
        return callback(self);
      } else {
        return callback(undefined);
      }
    })
  },

  delete: function (callback) {
    $.ajax({
        url: PlanSource.Submittal.deleteUrl(this.get("id")),
        type: 'POST',
    }).then(function(data, t, xhr){
      return callback();
    })
  }
});

PlanSource.Submittal.reopenClass({
  baseUrl : "/api/submittals",

  deleteUrl: function (id) {
    return PlanSource.Submittal.url() + "/" + id + "/destroy";
  },

  saveUrl: function (id) {
    return PlanSource.Submittal.url() + "/" + id;
  },

  url : function(plan_id){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.Submittal.baseUrl;
    if(plan_id) return u + "/" + plan_id;
    return u;
  }

});
