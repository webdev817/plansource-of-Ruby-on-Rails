PlanSource.Plan = Ember.Object.extend({
  statusOptions:['', 'Submitted', 'Special Inspection', 'Approved', 'Approved as Noted', 'Revise & Resubmit', 'Record Copy'],
  planRecords: [],
  submittals: [],

  init:function(){
    // this.getPlanRecords();
  },

  isSelected : function(option, status){
    if (status == option){
      return "selected";
    }
    return "";
  }.property('isSelected'),

  hasPlan: function() {
    return this.get("filename") != null && this.get("filename") != "";
  }.property("filename"),

  hasLink: function() {
    return this.get("plan_link") != null && this.get("plan_link") != "";
  }.property("plan_link"),

  belongsToShops: function() {
    if (this.get("tab") === 'Shops'){
      return true;
    }else{
      return false;
    }
  }.property('belongsToShops'),

  belongsToASI: function() {
    if (this.get("tab") === 'ASI'){
      return true;
    }else{
      return false;
    }
  }.property('belongsToASI'),

  isNotShopOrASI:function(){
    return !(this.get("belongsToShops") || this.get("belongsToASI"))
  }.property('isNotShopOrASI'),

  fileIsPDF:function(){
    if(this.get('filename').toLowerCase().indexOf('.pdf') > 0){
      return true;
    }
    return false;
  }.property('fileIsPDF'),

  deleteRecord : function(){
    this.destroy();
  },

  getDescriptionString:function(){
    var tempCont = document.createElement("div");
    var quil = new Quill(tempCont);
    if(this.get('description') != null){
      quil.setContents(JSON.parse(this.get("description")));
      return quil.getText();
    }
    return ""
  }.property("getDescriptionString"),

  getDescriptionHTML:function(){
    var tempCont = document.createElement("div");
    var quil = new Quill(tempCont);
    quil.setContents(JSON.parse(this.get("description")));
    return quil.root.innerHTML;
  }.property('getDescriptionHTML'),

  tagsOrDefault:function(){
    if(this.get('tags') == null)
    return 'None';
    return this.get('tags');
  }.property('tagsOrDefault'),

  planRecordsProp:function(){
    return this.get('planRecords');
  }.property('planRecordsProp'),

  planRecordsArchivedProp:function(){
    return this.get('planRecords').filter(function(item){
      return item.archived == false;
    });
  }.property(),

  submittalsProp: function () {
    return this.get('submittals');
  }.property(),

  save : function(){
    if(this.get("isDestroyed") || this.get("isDestroying")){
      return this._deleteRequest();
    }else{
      if(this.get("id")) ///Not news
      return this._updateRequest();
      else
      return this._createRequest();
    }
  },

  getPlanRecords:function(){
    var self = this;
    Em.Deferred.promise(function(p){
      p.resolve($.get(PlanSource.PlanRecord.url(self.get('id'))).then(function(data){
        self.clearPlanRecords();
        data.plans.forEach(function(planRecord){
          self.planRecords.push(PlanSource.PlanRecord.create(planRecord.plans));
        });
        return self.planRecords;
      }));
    });
  },

  getPlanRecordsSync:function(callback){
    var self = this;
    Em.Deferred.promise(function(p){
      p.resolve($.get(PlanSource.PlanRecord.url(self.get('id'))).then(function(data){
        self.clearPlanRecords();
        data.plans.forEach(function(planRecord){
          self.planRecords.push(PlanSource.PlanRecord.create(planRecord.plans));
        });
        callback();

      }));
    });
  },

  getSubmittalsSync: function(callback) {
    var self = this;
    Em.Deferred.promise(function(p){
      p.resolve($.get(PlanSource.Submittal.url(self.get('id'))).then(function(data){
        self.clearSubmittals();
        data.submittals.forEach(function(submittal){
          self.submittals.push(PlanSource.Submittal.create(submittal));
        });
        callback();

      }));
    });
  },

  clearPlanRecords: function() {
    var emptyArray = [];
    this.set('planRecords', emptyArray);
  },

  clearSubmittals: function() {
    var emptyArray = [];
    this.set('submittals', emptyArray);
  },

  upatePlanRecords : function(updateData){
    var updateDataString = JSON.stringify(updateData);
    var self = this;
    return Em.Deferred.promise(function(p){
      p.resolve($.ajax({
        url: PlanSource.PlanRecord.baseUrl,
        type: 'POST',
        data : { update : updateDataString },
        success:function(data){
        },
        error:function(err){
          toastr["error"]("Could not save " + self.get('plan_name'));
        }
      }).then(function(data){
        // self.setProperties(data.plan);
      })
    );
  });
},

_createRequest : function(){
  var self = this;
  return Em.Deferred.promise(function(p){
    p.resolve($.ajax({
      url: PlanSource.Plan.url(),
      type: 'POST',
      data : { plan : {
        plan_name : self.get("plan_name"),
        csi : self.get("csi"),
        job_id : self.get("job").get("id"),
        tab: self.get('tab')
      }}
    }).then(function(data, t, xhr){
      if(!$.isEmptyObject(data)){
        self.setProperties(data.plan);
        return true;
      } else {
        return false;
      }
    })
  );
});
},

_updateRequest : function(){
  var self = this;
  return Em.Deferred.promise(function(p){
    p.resolve($.ajax({
      url: PlanSource.Plan.url(self.get("id")),
      type: 'PUT',
      data : { plan : {
        plan_num : self.get("plan_num"),
        csi : self.get("csi"),
        plan_name : self.get("plan_name"),
        status: self.get("status"),
        description: self.get('description'),
        code: self.get('code'),
        tags: self.get('tags'),
        tab: self.get('tab'),
        new_file_id: self.get('new_file_id'),
        new_file_original_filename: self.get('new_file_original_filename'),
        new_plan_link: self.get('new_plan_link'),
      }},
      success:function(data){
        toastr["success"]("Successfully saved " + self.get('plan_name'));
      },
      error:function(){
        toastr["error"]("Could not save " + self.get('plan_name'));
      }
    }).then(function(data){
      self.setProperties(data.plan);
    })
  );
});
},

_deleteRequest : function(){
  var self = this;
  var preDeleteName = self.get('plan_name');
  return Em.Deferred.promise(function(p){
    p.resolve($.ajax({
      url: PlanSource.Plan.url(self.get("id")),
      type: 'DELETE',
      success:function(data){
        toastr["success"]("Successfully deleted " + preDeleteName);
      },
      error:function(){
        toastr["error"]("Could not delete " + preDeleteName);
      }
    }).then(function(data){

    })
  );
});
}

});

PlanSource.Plan.reopenClass({
  baseUrl : "/api/plans",

  url : function(id){
    var pathArray = window.location.href.split( '/' ),
    host = pathArray[2],
    u = PlanSource.getProtocol() + host + PlanSource.Plan.baseUrl;
    if(id) return u + "/" + id;
    return u;
  }

});
