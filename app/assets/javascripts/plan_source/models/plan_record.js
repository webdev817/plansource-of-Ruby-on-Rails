PlanSource.PlanRecord = Ember.Object.extend({

  init : function(){
    this.setProperties(this.getProperties("plan"));
  },

  setProperties : function(hash){
    if(hash.plan){
      var plan = plan
      this.set("plan", plan);
      delete hash.plan
    }
    Ember.setProperties(this, hash);
  },

  archivedToChecked:function(){
		if(this.isArchived()){
			return "checked";
		}
		return "";
	}.property(),

  isArchived:function(){
		return this.get("archived") == true
	},

  isArchivedProp:function(){
		return this.isArchived();
	}.property()
});

PlanSource.PlanRecord.reopenClass({
  baseUrl : "/api/plans/records",

  url : function(id){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.PlanRecord.baseUrl;
    if(id) return u + "/" + id;
    return u;
  }

});
