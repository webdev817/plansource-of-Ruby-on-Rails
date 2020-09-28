PlanSource.Job = Ember.Object.extend({
  init : function(){
    this.setProperties(this.getProperties("user", "project_manager", "shop_drawing_manager", "plans",
      "unlinked_asis", "rfis", "photos", "shares", "submittals"));
  },

  planCount:function(){
    return this.get('plans').length
  }.property('planCount'),

  setProperties : function(hash){
    if(hash.user){
      this.set("user", PlanSource.User.create(hash.user));
      delete hash.user;
    }

    if(hash.project_manager){
      this.set("project_manager", Ember.Object.create(hash.project_manager));
      delete hash.project_manager;
    }

    if(hash.shop_drawing_manager){
      this.set("shop_drawing_manager", Ember.Object.create(hash.shop_drawing_manager));
      delete hash.shop_drawing_manager;
    }

    if(hash.plans){
      var plans = Em.A();
      hash.plans.forEach(function(plan){
        plans.pushObject(PlanSource.Plan.create(plan));
      });
      this.set("plans", plans);
      delete hash.plans;
    }

    if(hash.unlinked_asis){
      var unlinkedASIs = Em.A();
      hash.unlinked_asis.forEach(function(asi){
        unlinkedASIs.pushObject(PlanSource.ASI.create(asi));
      });
      this.set("unlinked_asis", unlinkedASIs);
      delete hash.unlinked_asis;
    }

    if(hash.rfis){
      var RFIs = Em.A();
      hash.rfis.forEach(function(rfi){
        RFIs.pushObject(PlanSource.RFI.create(rfi));
      });
      this.set("rfis", RFIs);
      delete hash.rfis;
    }

    if(hash.photos){
      var photos = Em.A();
      hash.photos.forEach(function(photo){
        photos.pushObject(PlanSource.Photo.create(photo));
      });
      this.set("photos", photos);
      delete hash.photos;
    }

    if(hash.shares){
      var shares = Em.A();
      hash.shares.forEach(function(share){
        shares.pushObject(PlanSource.Share.create(share));
      });
      this.set("shares", shares);
      delete hash.shares;
    }

    if(hash.submittals){
      var submittals = Em.A();
      hash.submittals.forEach(function(submittal){
        submittals.pushObject(PlanSource.Submittal.create(submittal));
      });
      this.set("submittals", submittals);
      delete hash.submittals;
    }

    Ember.setProperties(this, hash);
  },

  getPlansByTab: function(tab) {
    if (tab === "Photos") return this.get('photos');

    var plansForTab = Em.A();
    var plans = this.get('plans');

    // Find plans for tab
    for (var i = 0; i < plans.length; i++) {
      if(plans[i].get('tab') === tab) {
        plansForTab.pushObject(plans[i]);
      }
    }

    var currentPlanId = null;
    // Give plan_num to plans through the linked list data structure.
    // First i loop is only to give us an index for the plan
    for (var i = 0; i < plansForTab.length; i++) {
      for (var j = 0; j < plansForTab.length; j++) {
        var plan = plansForTab[j];

        if (plan.get('previous_plan_id') === currentPlanId) {
          plan.set('plan_num', i + 1);
          currentPlanId = plan.get('id')
          break;
        }
      }
    }

    return plansForTab;
  },

  getFilteredSpecialInspections: function (filter) {
    var filter = filter || 'all';
    var filterParams = {};
    var plans = [];

    switch (filter) {
      case 'me':
        filterParams['assigned_user.id'] = window.user_id;
        break;
      case 'all':
      default:
        break;
    }

    var shops = this.getPlansByTab('Special Inspections');
    for (var i = 0; i < shops.length; i++) {
      var shop = shops[i];
      var shouldAdd = true;

      Object.keys(filterParams).forEach(function (key) {
        shouldAdd = shouldAdd && shop.get(key) === filterParams[key];
      });

      if (shouldAdd) plans.push(shop);
    }

    return plans;
  },

  getFilteredShops: function (filter) {
    var filter = filter || 'all';
    var filterParams = {};
    var plans = [];

    switch (filter) {
      case 'me':
        filterParams['assigned_user.id'] = window.user_id;
        break;
      case 'all':
      default:
        break;
    }

    var shops = this.getPlansByTab('Shops');
    for (var i = 0; i < shops.length; i++) {
      var shop = shops[i];
      var shouldAdd = true;

      Object.keys(filterParams).forEach(function (key) {
        shouldAdd = shouldAdd && shop.get(key) === filterParams[key];
      });

      if (shouldAdd) plans.push(shop);
    }

    return plans;
  },

  getFilteredRFIsAndASIs: function (filter) {
    var filter = filter || 'all';
    var filterParams = {};
    var plans = [];

    switch (filter) {
      case 'open':
        filterParams['status'] = 'Open';
        break;
      case 'closed':
        filterParams['status'] = 'Closed';
        break;
      case 'me':
        filterParams['assigned_user_id'] = window.user_id;
        break;
      case 'all':
      default:
        break;
    }

    var RFIs = this.get('rfis');
    for (var i = 0; i < RFIs.length; i++) {
      var RFI = RFIs[i];
      var shouldAdd = true;

      Object.keys(filterParams).forEach(function (key) {
        shouldAdd = shouldAdd && RFI.get(key) === filterParams[key];
      });

      if (shouldAdd) plans.push(RFI);
    }

    var unlinkedASIs = this.get('unlinked_asis');
    for (var i = 0; i < unlinkedASIs.length; i++) {
      var ASI = unlinkedASIs[i];
      var shouldAdd = true;

      Object.keys(filterParams).forEach(function (key) {
        shouldAdd = shouldAdd && ASI.get(key) === filterParams[key];
      });

      if (shouldAdd) plans.push(ASI);
    }

    return plans;
  },

	username : function(){
		if(this.get("user"))
    	return this.get('user').get('id') == user_id ? "Me" : this.get("user").get("fullName");
    else
    	return "";
	}.property('user'),

	isShared : function(){
  	if(this.get("user")) return !this.get("isMyJob");
    return false;
  }.property("user"),

  isMyJob : function(){
    if(!this.get("user")) return false;
    return this.get("user.id") == user_id;
  }.property("user"),

  amIShopDrawingManager: function(){
    if(!this.get("shop_drawing_manager")) {
      return false;
    }
    return this.get("shop_drawing_manager").get("id") == user_id;
  }.property("shop_drawing_manager"),

  canViewTab: function(tab) {
    if(this.get('isMyJob')) { return true; }

    var shares = this.get('shares');
    for(var i = 0; i < shares.length; i++) {
      if(shares[i].get('user.id') == user_id) {
        var t = (tab || "").replace(/[ &-]/g, "");
        return shares[i].get('has' + t + 'Shared');
      }
    }
    return false;
  },

  canViewPreDevelopmentTab: function() {
    return this.canViewTab('Pre-Development');
  }.property('shares.@each'),

  canViewPlansTab: function() {
    return this.canViewTab('Plans');
  }.property('shares.@each'),

  canViewShopsTab: function() {
    return this.canViewTab('Shops');
  }.property('shares.@each'),

  canViewSpecialInspectionsTab: function() {
    return this.canViewTab('Special Inspections');
  }.property('shares.@each'),

  canViewConsultantsTab: function() {
    return this.canViewTab('Consultants');
  }.property('shares.@each'),

  canViewClientTab: function() {
    return this.canViewTab('Client');
  }.property('shares.@each'),

  canViewCalcsTab: function() {
    return this.canViewTab('Calcs');
  }.property('shares.@each'),

  canViewPhotosTab: function() {
    return this.canViewTab('Photos');
  }.property('shares.@each'),

  canViewRenderingsTab: function() {
    return this.canViewTab('Renderings');
  }.property('shares.@each'),

  sorter : function(){ //either a 1 or 0 depending on isShared. Its for order
    var s = this.get("isShared") == false ? '0' : '1';
    return s + this.get("name").toLowerCase();
  }.property("isShared"),

  getPhotos: function (callback) {
    var self = this;

    $.get("/api/jobs/" + this.get("id") + "/photos").then(function(data){
      var photosJSON = data.photos;
      var photos = [];

      for (var i = 0; i < photosJSON.length; i++) {
        photos.push(PlanSource.Photo.create(photosJSON[i]));
      }

      self.set("photos", photos);

      callback(photos);
    });
  },

  getRenderings: function (callback) {
    var self = this;

    $.get("/api/jobs/" + this.get("id") + "/renderings").then(function(data){
      var renderingsJSON = data["renderings"];
      var renderings = [];

      for (var i = 0; i < renderingsJSON.length; i++) {
        renderings.push(Ember.Object.create(renderingsJSON[i]));
      }

      self.set("renderings", renderings);
      self.set("finish_selections_url", data["finish_selections_url"] || null);

      callback(renderings);
    });
  },

  getEligibleProjectManagers: function(){
    var users = Em.A();
    var url = PlanSource.Job.url(this.get('id')) + '/eligible_project_managers';

    $.get(url).then(function(data){
      data.users.forEach(function(user){
        users.pushObject(PlanSource.Contact.create(user));
      });

      return true;
    });

    return users;
  },

  getEligibleShopDrawingManagers: function(){
    var users = Em.A();
    var url = PlanSource.Job.url(this.get('id')) + '/eligible_shop_drawing_managers';

    $.get(url).then(function(data){
      data.users.forEach(function(user){
        users.pushObject(PlanSource.Contact.create(user));
      });

      return true;
    });

    return users;
  },

  getEligibleRFIAssignees: function(){
    var users = Em.A();
    var url = PlanSource.Job.url(this.get('id')) + '/eligible_rfi_assignees';

    $.get(url).then(function(data){
      data.users.forEach(function(user){
        users.pushObject(PlanSource.Contact.create(user));
      });

      return true;
    });

    return users;
  },

  getEligibleShopsAssignees: function(){
    var users = Em.A();
    var url = PlanSource.Job.url(this.get('id')) + '/eligible_shops_assignees';

    $.get(url).then(function(data){
      data.users.forEach(function(user){
        users.pushObject(PlanSource.Contact.create(user));
      });

      return true;
    });

    return users;
  },

  deleteRecord : function(){
    this.destroy();
  },

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

  _createRequest : function(){
    var self = this;
    return Em.Deferred.promise(function(p){
      p.resolve($.ajax({
            url: PlanSource.Job.url(),
            type: 'POST',
            data : { job : self.getProperties("name")}
        }).then(function(data, t, xhr){
          if(!$.isEmptyObject(data)){
            self.setProperties(data.job);
            return true;
          }else
            return false;
        })
      );
    });
  },

  _updateRequest : function(){
    var self = this;
    return Em.Deferred.promise(function(p){
      p.resolve($.ajax({
            url: PlanSource.Job.url(self.get("id")),
            type: 'PUT',

            data : { job : self.getProperties("name", "archived", "subscribed")},
            success:function(data){
              toastr["success"]("Successfully saved " + self.get('name'));
            },
            error:function(){
              toastr["error"]("Could not save " + self.get('name'));
            }
        }).then(function(data){
          self.setProperties(data.job);
        })
      );
    });
  },

  _deleteRequest : function(){
    var self = this;
    return Em.Deferred.promise(function(p){
      p.resolve($.ajax({
            url: PlanSource.Job.url(self.get("id")),
            type: 'DELETE',
            success:function(data){
              toastr["success"]("Successfully deleted job")
            },
            error:function(){
              toastr["error"]("Could not delete job")
            }
        }).then(function(data){

        })
      );
    });
  }

});

PlanSource.Job.reopenClass({
  baseUrl : "/api/jobs",

  nonArchivedJobs: Em.A(),
  archivedJobs: Em.A(),

  url : function(id){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.Job.baseUrl;
    if(id) return u + "/" + id;
    return u;
  },

  findNonArchivedJobs: function() {
    this._getJobsFromServer(false);
    return this.nonArchivedJobs;
  },

  findArchivedJobs: function() {
    this._getJobsFromServer(true);
    return this.archivedJobs;
  },

  _getJobsFromServer: function(archived) {
    var that = this;

    Em.Deferred.promise(function(p){
      p.resolve($.get(PlanSource.Job.url() + "?archived=" + !!archived).then(function(data){
        var arr = that.nonArchivedJobs;
        if(archived) arr = that.archivedJobs;

        // Remove old entries
        var l = arr.length;
        for(var i = 0; i < l; i++) {
          arr.removeAt(0);
        }

        // Add new entries
        data.jobs.forEach(function(job){
          arr.pushObject(PlanSource.Job.create(job));
        });

        return that.jobs;
      }));
    });
  },

  find : function(id){
    return Em.Deferred.promise(function(p){
      p.resolve($.get(PlanSource.Job.url(id)).then(function(data){
        return PlanSource.Job.create(data.job);
      }));
    });
  },
});
