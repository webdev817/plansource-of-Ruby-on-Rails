PlanSource.JobsIndexRoute = Ember.Route.extend({
  events : {
    close : function(){
      this.render("nothing", {into : "jobs", outlet : "modal"});
    },

    openAddJobModal : function(){
      this.controllerFor("add_job").set("parent", this.get("controller"));
      this.render("modals/add_job", {into : "jobs", outlet : "modal", controller : "add_job"});
    },

    openMessageGroupModal : function(model){
      if(model)
        this.controllerFor("message_group").set("model", model);
      this.controllerFor("message_group").set("parent", this.get("controller"));
      this.render("modals/message_group", {into : "jobs", outlet : "modal", controller : "message_group"});
    },

    openContactListModal: function(model){
      if(model)
        this.controllerFor("contact_list").set("job", model);
      this.controllerFor("contact_list").set("content", PlanSource.Contact.findAll());
      this.render("modals/contact_list", {into : "jobs", outlet : "modal", controller : "contact_list"});
    },

    openDeleteJobModal : function(model){
      this.controllerFor("delete_job").set("model", model);
      this.controllerFor("delete_job").set("parent", this.get("controller"));
      this.render("modals/delete_job", {into : "jobs", outlet : "modal", controller : "delete_job"});
    },

    openEditJobModal : function(model){
      this.controllerFor("edit_job").set("model", model);
      this.controllerFor("edit_job").set("parent", this.get("controller"));
      this.render("modals/edit_job", {into : "jobs", outlet : "modal", controller : "edit_job"});
    },

    openUnshareJobModal : function(model){
      this.controllerFor("unshare_job").set("model", model);
      this.controllerFor("unshare_job").set("parent", this.get("controller"));
      this.render("modals/unshare_job", {into : "jobs", outlet : "modal", controller : "unshare_job"});
    }
  },

  model : function(){
    if(this.controllerFor('jobs_index').showingArchivedJobs) {
      return PlanSource.Job.findArchivedJobs();
    } else {
      return PlanSource.Job.findNonArchivedJobs();
    }
  }
});
