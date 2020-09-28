PlanSource.SubmittalController = PlanSource.ModalController.extend({
  // 3 states: new, review, and view
  // new - no model
  // review - model exists but is in review
  // view - model exists and is not in review

  // The errors for the submittal form.
  errors: {},

  isNew: function () {
    return !this.get("model").get("id");
  }.property("model", "model.id"),

  isInReview: function () {
    var submittal = this.get("model");
    return !this.get("isNew") && !submittal.get("is_accepted");
  }.property("isNew", "is_accepted"),

  isAccepted: function () {
    return this.get("is_accepted");
  }.property("is_accepted"),

  shopPlans: function () {
    var shops = this.get("job").getPlansByTab('Shops');
    var specialInspections = this.get("job").getPlansByTab('Special Inspections');

    specialInspections.forEach(si => shops.pushObject(si));

    return shops;
  }.property("job.plans.@each"),

  submitSubmittal: function () {
    var self = this;
    var submittal = this.get("model");
    var data = this.getSubmittalData();
    var attachments = this.getAttachments();

    submittal.set("data", data);
    submittal.set("attachment_ids", attachments);

    var errors = submittal.validate();
    this.set("errors", errors);
    if (errors) return;

    submittal.submit(function (submittal) {
      if (submittal) {
        // No need to add submittal to job since submittals are submitted
        // by viewers and not owners. Owners review submittals.
        toastr.success("Submitted, thanks!");
        self.send("close");
      } else {
        // Error
        toastr.error("Sorry, try again later!", "error");
      }
    });
  },

  promptDeleteSubmittal: function () {
    var submittal = this.get("model");
    var shouldDelete = window.confirm("Are you sure you want to delete '" + submittal.get("data.description") + "'?");
    if (shouldDelete) this.deleteSubmittal();
  },

  deleteSubmittal: function () {
    var self = this;
    var submittal = this.get("model");

    submittal.delete(function () {
      var job = self.get("job");
      var purgedSubmittals = job.get("submittals").reduce(function (subs, sub) {
        if (sub.get("id") !== submittal.get("id")) subs.push(sub);
        return subs;
      }, []);
      job.set("submittals", purgedSubmittals);

      // Remove from plan if plan_id exists
      var plan = job.get("plans").find(function (plan) {
        return plan.get("id") === submittal.get("plan_id");
      });

      if (plan) {
        var purgedPlanSubmittals = plan.get("submittals").reduce(function (subs, sub) {
          if (sub.get("id") !== submittal.get("id")) subs.push(sub);
          return subs;
        }, []);
        plan.set("submittals", purgedPlanSubmittals);
      }

      toastr.success("Submittal deleted!");
      self.send("close");
    });
  },

  updateSubmittal: function (shouldAccept) {
    var self = this;
    var submittal = this.get("model");
    var data = this.getSubmittalData();
    var planId = $("#submittal-job-id").val();

    submittal.set("data", data);
    if (!submittal.get("is_accepted")) {
      submittal.set("plan_id", planId);
      submittal.set("is_accepted", shouldAccept);
    }

    var errors = submittal.validate();
    this.set("errors", errors);
    if (errors) {
      submittal.set("is_accepted", false);
      return;
    }

    submittal.save(function (submittal) {
      if (submittal && submittal.get("is_accepted")) {
        // Don't need to add submittal to plan since opening the plan details
        // modal refetches approved submittals for that plan.
        // We do have to remove the submittal from the job though.
        var job = self.get("job");
        var purgedSubmittals = job.get("submittals").reduce(function (subs, sub) {
          if (sub.get("id") !== submittal.get("id")) subs.push(sub);
          return subs;
        }, []);
        job.set("submittals", purgedSubmittals);

        // And update plans. We can't cherry pick the plan and upgrade since
        // status is unbound... Two-way binding bullshit.  React FTW!
        self.get("parent").updatePlans();

        toastr.success("Submittal accepted!");
        self.send("close");
      } else if (submittal && !submittal.get("is_accepted")) {
        self.send("close");
      } else {
        // Error
      }
    });
  },

  getSubmittalData: function () {
    return {
      csi_code:  $("#submittal-csi-code").val(),
      description: $("#submittal-description").val(),
      notes: $("#submittal-notes").val(),
    };
  },

  getAttachments: function () {
    var attachments = [];
    var $attachments = $(".file-preview");

    $attachments.each(function (i, el) {
      attachments.push($(el).attr("data-id"));
    });

    return attachments;
  },

	keyPress : function(e){
		if (e.keyCode == 27){
			this.send('close');
		}
	}
});
