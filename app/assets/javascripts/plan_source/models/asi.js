PlanSource.ASI = Ember.Object.extend({
  init : function() {
    this.setProperties(this.getProperties('assigned_user'));
  },

  setProperties : function(hash) {
    // Make sure hash exists
    hash = hash || {};

    if(hash.assigned_user){
      var assignedUser = PlanSource.User.create(hash.assigned_user);
      this.set('assigned_user', assignedUser);

      delete hash.assigned_user
    }

    Ember.setProperties(this, hash);
  },

  isNew: function () {
    return !this.get('id');
  }.property('id'),

  isOpen: function () {
    return this.get('status') === 'Open';
  }.property('status'),

  getASI: function () {
    return this;
  }.property(),

  getRFI: function () {
    return this.get('rfi');
  }.property('rfi'),

  rfi_num: function () {
    return null;
  }.property(),

  targetResponse: function () {
    // No due date
    return "";
  }.property('due_date'),

  targetResponseSort: function () {
    // No due date.  0 means zero milliseconds (start of dates)
    return 0;
  }.property(),

  daysPastDue: function () {
    // No due date
    return "";
  }.property('due_date'),

  daysPastDueSort: function () {
    // No due date.  Group as lowest
    return -99999;
  }.property(),

  dateSubmitted: function () {
    var date = this.get('date_submitted');
    if (!date) date = this.get('created_at');
		return moment(date).format("ll");
  }.property('date_submitted', 'created_at'),

  submittedBy: function () {
		return this.get('user.first_name') + " " + this.get('user.last_name');
  }.property('user'),

  assignedTo: function () {
    if (!this.get('assigned_user')) return null;

		return this.get('assigned_user.first_name') + " " + this.get('assigned_user.last_name');
  }.property('assigned_user', 'assigned_user.first_name', 'assigned_user.last_name'),

  validate: function () {
    var errors = {};

    if (!this.get("subject")) {
      errors.subject = "Can't be blank.";
    }

    return $.isEmptyObject(errors) ? undefined : errors;
  },

  submit: function (callback) {
    var self = this;

    $.ajax({
      url: PlanSource.ASI.url(),
      type: 'POST',
      data : {
        asi: this.getProperties([
          "job_id",
          "rfi_id",
          "plan_sheets_affected",
          "in_addendum",
          "subject",
          "notes",
          "updated_attachments"
        ])
      },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        self.setProperties(data.asi);
        return callback(self);
      } else {
        return callback(undefined);
      }
    })
  },

  update: function (callback) {
    var self = this;

    $.ajax({
        url: PlanSource.ASI.saveUrl(this.get('id')),
        type: 'PUT',
        data : {
          asi: this.getProperties([
            "status",
            "date_submitted",
            "plan_sheets_affected",
            "in_addendum",
            "subject",
            "notes",
            "updated_attachments"
          ])
        },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        self.setProperties(data.asi);
        return callback(self);
      } else {
        return callback(undefined);
      }
    })
  },

  destroy: function (callback) {
    $.ajax({
      url: PlanSource.ASI.saveUrl(this.get('id')),
      type: 'DELETE',
      data : {},
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        return callback(true);
      } else {
        return callback(undefined);
      }
    })
  }
});

PlanSource.ASI.reopenClass({
  baseUrl : "/api/asis",

  deleteUrl: function (id) {
    return PlanSource.ASI.url() + "/" + id + "/destroy";
  },

  saveUrl: function (id) {
    return PlanSource.ASI.url() + "/" + id;
  },

  url : function(){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.ASI.baseUrl;
    return u;
  }
});
