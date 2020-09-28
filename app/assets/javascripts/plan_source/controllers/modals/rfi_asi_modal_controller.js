PlanSource.RfiAsiController = PlanSource.ModalController.extend({
  reopen: function () {
    var asi = this.get('model.getASI');

    if (!this.get('canReopenASI')) return;

    asi.set('status', 'Open');
  },

  save: function () {
    var self = this;
    var RFI = this.get('model.getRFI');
    var ASI = this.get('model.getASI');

    var handlers = [];
    var RFIHandler = this.updateRFI.bind(this);
    var ASIHandler = this.updateASI.bind(this);

    if (RFI && RFI.get('isNew')) RFIHandler = this.submitRFI.bind(this);
    if (ASI && ASI.get('isNew')) ASIHandler = this.submitASI.bind(this);

    if (RFI && ASI) {
      handlers = [ RFIHandler, ASIHandler ];
    } else if (RFI) {
      handlers = [ RFIHandler ];
    } else if (ASI) {
      handlers = [ ASIHandler ];
    }

    async.parallel(handlers, function (err, results) {
      var RFIResult = results[0];
      var ASIResult = results[1];

      if (err) return toastr.error(err);

      // Since RFIs and ASIs get updated in place, rebuild the relationship.
      if (RFIResult && ASIResult) {
        RFIResult.set("asi", ASIResult);
        ASIResult.set("rfi", RFIResult);
      }

      if (RFIResult) toastr.success("RFI saved, thanks!");
      if (ASIResult) toastr.success("ASI saved, thanks!");

      self.send("close");
    });
  },

  submitRFI: function (callback) {
    var self = this;
    var rfi = this.get("model.getRFI");
    var job = this.get("parent.model");

    rfi.set("job_id", job.get("id"));
    rfi.setProperties(this.getRFIData());
    rfi.set("updated_attachments", this.getRFIAttachments());

    var errors = rfi.validate();
    this.set("rfiErrors", errors);
    if (errors) return;

    rfi.submit(function (rfi) {
      if (rfi) {
        job.get('rfis').pushObject(rfi);
        callback(null, rfi);
      } else {
        callback("Sorry, try again later!");
      }
    });
  },

  updateRFI: function (callback) {
    var self = this;
    var rfi = this.get("model.getRFI");

    // Not an error, but we don't want to do anything
    if (!this.get('canEditRFI')) return callback(null);

    rfi.setProperties(this.getRFIData());

    var errors = rfi.validate();
    this.set("rfiErrors", errors);
    if (errors) return;

    rfi.update(function (rfi) {
      if (rfi) {
        callback(null, rfi);
      } else {
        callback("Sorry, try again later!");
      }
    });
  },

  deleteRFI: function () {
    var self = this;
    var rfi = this.get("model.getRFI");
    var asi = this.get("model.getASI");
    var job = this.get("parent.model");

    // Not an error, but we don't want to do anything
    if (!this.get('canDeleteRFI')) return;

    var message = "Are you sure you want to delete RFI '" + rfi.get("rfi_num") + "'";
    if (asi) message += " and ASI '" + asi.get("asi_num") + "'";
    message += "?";

    var shouldDelete = window.confirm(message);

    if (!shouldDelete) return;

    rfi.destroy(function (success) {
      if (success) {
        job.get("rfis").removeObject(rfi);
        toastr.success("RFI deleted, thanks!");
        self.send("close");
      } else {
        toastr.error("Sorry, try again later!");
      }
    });
  },

  deleteASI: function () {
    var self = this;
    var asi = this.get("model.getASI");
    var job = this.get("parent.model");

    // Not an error, but we don't want to do anything
    if (!asi || !this.get('canDeleteASI')) return;

    var shouldDelete = window.confirm(
      "Are you sure you want to delete ASI '" + asi.get("asi_num") + "'?"
    );

    if (!shouldDelete) return;

    asi.destroy(function (success) {
      if (success) {
        job.get("unlinked_asis").removeObject(asi);
        toastr.success("ASI deleted, thanks!");
        self.send("close");
      } else {
        toastr.error("Sorry, try again later!");
      }
    });
  },

  submitASI: function (callback) {
    var self = this;
    var rfi = this.get("model.getRFI");
    var asi = this.get("model.getASI");
    var job = this.get("parent.model");

    // Not errors, but we don't want to do anything
    if (!rfi && !this.get('canCreateUnlinkedASI')) return callback(null);
    if (rfi && !this.get('canCreateLinkedASI')) return callback(null);

    asi.set("job_id", job.get("id"));
    asi.setProperties(this.getASIData());
    asi.set("updated_attachments", this.getASIAttachments());

    // Wire up RFI relationship if RFI exists
    if (rfi) asi.set("rfi_id", rfi.get("id"));

    var errors = asi.validate();
    this.set("asiErrors", errors);
    if (errors) return;

    asi.submit(function (asi) {
      if (asi) {
        // If no RFI for this ASI, then it's unlinked and we need to push to list
        if (!rfi) job.get('rfis').pushObject(asi);
        callback(null, asi);
      } else {
        callback("Sorry, try again later!");
      }
    });
  },

  updateASI: function (callback) {
    var self = this;
    var asi = this.get("model.getASI");

    // Not an error, but we don't want to do anything
    if (!this.get('canEditASI')) return callback(null);

    asi.setProperties(this.getASIData());
    asi.set('updated_attachments', this.getASIAttachments());

    var errors = asi.validate();
    this.set("asiErrors", errors);
    if (errors) return;

    asi.update(function (asi) {
      if (asi) {
        callback(null, asi);
      } else {
        callback("Sorry, try again later!");
      }
    });
  },

  addASI: function () {
    if (!this.get('canCreateLinkedASI')) return;
    this.get("model").set("asi", PlanSource.ASI.create());
  },

  getRFIData: function () {
    var responseRequested = $("#rfi-response-requested").val();
    var due_date = undefined;

    if (responseRequested) {
      due_date = moment(responseRequested, 'll').format();
    }

    return {
      subject:  $("#rfi-subject").val(),
      notes: $("#rfi-notes").val(),
      due_date: due_date,
    };
  },

  getASIData: function () {
    var $dateSubmitted = $("#asi-date-submitted");
    var dateSubmitted = $dateSubmitted.val();
    // This data attr is used to check if date submitted has been selected
    // or is created_at date.
    var hasDateSubmitted = $dateSubmitted.attr('data-has-date-submitted') === 'true';
    var date_submitted = undefined;

    if (hasDateSubmitted && dateSubmitted) {
      date_submitted = moment(dateSubmitted, 'll').format();
    }

    return {
      date_submitted: date_submitted,
      status: $("#asi-status").val(),
      subject: $("#asi-subject").val(),
      notes: $("#asi-notes").val(),
      plan_sheets_affected: $("#asi-plan-sheets-affected").val(),
      in_addendum: $("#asi-in-addendum").val(),
    };
  },

  getRFIAttachments: function () {
    return this.getAttachments("#rfi-attachments");
  },

  getASIAttachments: function () {
    return this.getAttachments("#asi-attachments");
  },

  getAttachments: function (id) {
    var id = id || "";
    var attachments = [];
    var $attachments = $(id + " .file-preview");

    $attachments.each(function (i, el) {
      var $filePreview = $(el);
      var $description = $filePreview.find(".file-preview-description");
      var uploadId = $filePreview.attr("data-upload-id");
      var attachmentId = $filePreview.attr("data-attachment-id");

      attachments.push({
        id: attachmentId,
        upload_id: uploadId,
        description: $description.val(),
      });
    });

    return attachments;
  },

  canEditRFI: function () {
    var rfi = this.get("model");
    var job = this.get("parent.model");
    var projectManager = job.get('project_manager');
    var currentUserId = window.user_id;
    var canEdit = false;

    // If RFI is closed, we can't edit.
    if (!rfi.get("isOpen")) return false;

    if (job && job.get('isMyJob')) canEdit = true;
    if (projectManager && projectManager.get('id') === currentUserId) canEdit = true;
    if (rfi && rfi.get('user.id') === currentUserId) canEdit = true;

    return canEdit;
  }.property('model.isOpen', 'parent.model.project_manager'),

  canEditAssignedTo: function () {
    var rfi = this.get("model");
    var job = this.get("parent.model");
    var projectManager = job.get('project_manager');
    var currentUserId = window.user_id;
    var canEdit = false;

    // If RFI is closed, we can't edit.
    if (!rfi.get("isOpen")) return false;

    if (job && job.get('isMyJob')) canEdit = true;
    if (projectManager && projectManager.get('id') === currentUserId) canEdit = true;

    return canEdit;
  }.property('model.isOpen', 'parent.model.project_manager'),

  canDeleteRFI: function () {
    var job = this.get("parent.model");
    var projectManager = job.get('project_manager');
    var currentUserId = window.user_id;
    var canDelete = false;

    if (job && job.get('isMyJob')) canDelete = true;
    if (projectManager && projectManager.get('id') === currentUserId) canDelete = true;

    return canDelete;
  }.property('model', 'parent.model.project_manager'),

  canDeleteASI: function () {
    return this.get('canDeleteRFI');
  }.property('canDeleteRFI'),

  canCreateUnlinkedASI: function () {
    var job = this.get("parent.model");
    var projectManager = job.get('project_manager');
    var currentUserId = window.user_id;
    var canCreate = false;

    if (job && job.get('isMyJob')) canCreate = true;
    if (projectManager && projectManager.get('id') === currentUserId) canCreate = true;

    return canCreate;
  }.property('model', 'parent.model.project_manager'),

  canCreateLinkedASI: function () {
    var rfi = this.get("model");
    var canCreate = this.get('canCreateUnlinkedASI');
    var currentUserId = window.user_id;
    var assignedUser = rfi.get('assigned_user');

    if (assignedUser && assignedUser.get('id') == currentUserId) canCreate = true;

    return canCreate;
  }.property('canCreateUnlinkedASI', 'model.assigned_user'),

  canEditASI: function () {
    // If ASI is closed, we can't edit.
    if (!this.get("model.isOpen")) return false;

    // Same permissions as canCreateLinkedASI minus isOpen check
    return this.get('canCreateLinkedASI');
  }.property('model.isOpen', 'canCreateLinkedASI'),

  canReopenASI: function () {
    if (this.get('model.isOpen')) return false;

    // Same permissions as canCreateLinkedASI.
    return this.get('canCreateUnlinkedASI')
  }.property('model.isOpen', 'canCreateUnlinkedASI'),

	keyPress: function(e) {
		if (e.keyCode == 13) {
      this.save();
    }
	},
});

