PlanSource.RFI = Ember.Object.extend({
  init : function() {
    this.setProperties(this.getProperties('asi', 'assigned_user'));
  },

  setProperties : function(hash) {
    // Make sure hash exists
    hash = hash || {};

    if(hash.asi){
      var asi = PlanSource.ASI.create(hash.asi);
      // Pass a reference of this RFI to ASI
      asi.set('rfi', this);
      this.set('asi', asi);

      delete hash.asi
    }

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
    return this.get('asi');
  }.property('asi', 'asi.id'),

  getRFI: function () {
    return this;
  }.property(),

  asi_num: function () {
    return !this.get('asi') ? null : this.get('asi.asi_num');
  }.property('asi', 'asi.id', 'asi.asi_num'),

  status: function () {
    return !this.get('asi') ? 'Open' : this.get('asi.status') || 'Open';
  }.property('asi', 'asi.status'),

  plan_sheets_affected: function () {
    return !this.get('asi') ? '' : this.get('asi.plan_sheets_affected');
  }.property('asi', 'asi.plan_sheets_affected'),

  in_addendum: function () {
    return !this.get('asi') ? '' : this.get('asi.in_addendum');
  }.property('asi', 'asi.in_addendum'),

  targetResponse: function () {
    if (!this.get("due_date")) return "";
		return moment(this.get("due_date")).format("ll");
  }.property('due_date'),

  targetResponseSort: function () {
    // No due date.  0 means zero milliseconds (start of dates)
    if (!this.get("due_date")) return 0;
		return moment(this.get("due_date")).valueOf();
  }.property('due_date'),

  daysPastDue: function () {
    if (!this.get("isOpen") || !this.get("due_date")) return "";
		var daysPast = moment().diff(moment(this.get("due_date")), 'days')
    return daysPast > 0 ? daysPast : "";
  }.property('due_date'),

  daysPastDueSort: function () {
    // No due date.  Group as lowest
    if (!this.get("due_date")) return -99999;
		return moment().diff(moment(this.get("due_date")), 'days')
  }.property('due_date'),

  dateSubmitted: function () {
		return moment(this.get("created_at")).format("ll");
  }.property('created_at'),

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
        url: PlanSource.RFI.url(),
        type: 'POST',
        data : { rfi: this.getProperties([
          "job_id",
          "subject",
          "notes",
          "updated_attachments"
        ]) },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        self.setProperties(data.rfi);
        return callback(self);
      } else {
        return callback(undefined);
      }
    })
  },

  update: function (callback) {
    var self = this;

    $.ajax({
      url: PlanSource.RFI.saveUrl(this.get('id')),
      type: 'PUT',
      data : {
        rfi: this.getProperties([ "subject", "notes", "due_date" ])
      },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        self.setProperties(data.rfi);
        return callback(self);
      } else {
        return callback(undefined);
      }
    })
  },

  destroy: function (callback) {
    $.ajax({
      url: PlanSource.RFI.saveUrl(this.get('id')),
      type: 'DELETE',
      data : {},
    }).then(function(data, t, xhr){
      if (data.rfi) {
        return callback(true);
      } else {
        return callback(undefined);
      }
    })
  }
});

PlanSource.RFI.reopenClass({
  baseUrl : "/api/rfis",

  deleteUrl: function (id) {
    return PlanSource.RFI.url() + "/" + id + "/destroy";
  },

  saveUrl: function (id) {
    return PlanSource.RFI.url() + "/" + id;
  },

  url : function(){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.RFI.baseUrl;
    return u;
  }
});
