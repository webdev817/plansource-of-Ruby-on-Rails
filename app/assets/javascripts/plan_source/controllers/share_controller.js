PlanSource.ShareController = Ember.ObjectController.extend({

  editCanShare : function(){
    var share = this.get("model");
    var self = this;
    share.set("can_reshare", !share.get("can_reshare"));
    $.ajax("api/shares/" + share.get("id"), {
      type : "PUT",
      data : {
      "share" : share.getProperties("id", "can_reshare")
      },
      error : function(){
        self.send("error", "Something went wrong.");
      },
      success : function(data){
        //Nothing to do?
      },
      dataType : "json"
    });
  },

  deleteShare : function(){
  	var share = this.get("model");
  	this.send("removeShare", share);
  	share.deleteRecord();
  	share.save();
  }

});
