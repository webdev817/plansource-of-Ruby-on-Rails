PlanSource.JobsIndexController = Ember.ArrayController.extend({
  sortProperties: ['sorter'],
  sortAscending: true,
  content : Em.A(),
  showingArchivedJobs: false,

  removeJob : function(job){
  	this.get("content").removeObject(job);
  	job.deleteRecord();
		job.save();
  },

  removeJobByID : function(job_id){
    var self = this;
    this.get("content").forEach(function(job){
      if(job.get("id") == job_id){
        self.get("content").removeObject(job);
      }
    });
  },

  addJob : function(new_job){
    if(this.jobExists(new_job)) return false;
    var self = this;
  	this.get("content").pushObject(new_job);
  	new_job.save().then(function(data){
      if(data == false)
        self.get("content").removeObject(new_job);
    });
    return true;
  },

  jobExists : function(new_job){
    var name;
    if (typeof new_job == 'string' || new_job instanceof String)
      name = new_job;
    else
      name = new_job.get("name");
    for(var i = 0 ; i < this.get("content").length ; i++){
      var job = this.get("content")[i];
      if(job.get("name") == name)
        return true;
    }
    return false;
  },

  showArchivedJobs: function() {
    this.set('showingArchivedJobs', true);
    this.set('content', PlanSource.Job.findArchivedJobs())
  },

  showNonArchivedJobs: function() {
    this.set('showingArchivedJobs', false);
    this.set('content', PlanSource.Job.findNonArchivedJobs())
  }
});
