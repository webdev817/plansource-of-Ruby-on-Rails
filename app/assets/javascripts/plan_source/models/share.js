PlanSource.Share = Ember.Object.extend({

  init : function(){
    this.setProperties(this.getProperties("user", "sharer"));
  },

  setProperties : function(hash){
    if(hash.user){
      this.set("user", PlanSource.User.create(hash.user));
      delete hash.user
    }
    if(hash.sharer){
      this.set("sharer", PlanSource.User.create(hash.sharer));
      delete hash.sharer
    }
    Ember.setProperties(this, hash);
  },

  deleteRecord : function(){
    this.destroy();
  },

  hasPreDevelopmentShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 7) % 2);
  }.property('permissions'),

  hasPlansShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 2) % 2);
  }.property('permissions'),

  hasAddendumsShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 2) % 2);
  }.property('permissions'),

  hasASIShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 2) % 2);
  }.property('permissions'),

  hasShopsShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 1) % 2);
  }.property('permissions'),

  hasSpecialInspectionsShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 1) % 2);
  }.property('permissions'),

  hasConsultantsShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 0) % 2);
  }.property('permissions'),

  hasClientShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 6) % 2);
  }.property('permissions'),

  hasCalcsMiscShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 3) % 2);
  }.property('permissions'),

  hasCalcsShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 3) % 2);
  }.property('permissions'),

  hasPhotosShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 4) % 2);
  }.property('permissions'),

  hasRenderingsShared: function() {
    var permissions = this.get('permissions') || 0;
    return !!((permissions >> 5) % 2);
  }.property('permissions'),

  isSharer : function(){
    if(this.get("sharer"))
      return this.get("sharer").get("id") == user_id;
    else
      return false;
  }.property("sharer"),

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

  _deleteRequest : function(){
    var self = this;
    return Em.Deferred.promise(function(p){
      p.resolve($.ajax({
            url: PlanSource.Share.url(self.get("id")),
            type: 'DELETE'
        }).then(function(data){

        })
      );
    });
  }

});

PlanSource.Share.reopenClass({
  baseUrl : "/api/shares",

  url : function(id){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.Share.baseUrl;
    if(id) return u + "/" + id;
    return u;
  }

});
