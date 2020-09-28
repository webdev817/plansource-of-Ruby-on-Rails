PlanSource.ProjectManagerController = Ember.ArrayController.extend({
  sortProperties: ['first_name'],
  sortAscending: true,

  sort: function(sorter){
    this.set("sortProperties", [sorter]);
  },

  selectContact: function (contact) {
    var self = this;
    var job = this.get("parent.model");

    $.post("/api/jobs/" + job.id + "/project_manager", {
      project_manager_user_id: contact.id,
    }, function (data) {
      if (data.project_manager) {
        job.setProperties({ "project_manager": data.project_manager })

        toastr["success"]("Succesfully updated RFI manager!");

        self.send('close');
      } else {
        toastr["error"]("Sorry, there was a problem.")
      }
    }, "json");
  },

  keyPress : function(e){
  }
});
