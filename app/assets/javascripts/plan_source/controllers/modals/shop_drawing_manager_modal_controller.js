PlanSource.ShopDrawingManagerController = Ember.ArrayController.extend({
  sortProperties: ['first_name'],
  sortAscending: true,

  sort: function(sorter){
    this.set("sortProperties", [sorter]);
  },

  selectContact: function (contact) {
    var self = this;
    var job = this.get("parent.model");

    $.post("/api/jobs/" + job.id + "/shop_drawing_manager", {
      shop_drawing_manager_user_id: contact.id,
    }, function (data) {
      if (data.shop_drawing_manager) {
        job.setProperties({ "shop_drawing_manager": data.shop_drawing_manager })

        toastr["success"]("Succesfully updated Shop Drawing manager!");

        self.send('close');
      } else {
        toastr["error"]("Sorry, there was a problem.")
      }
    }, "json");
  },

  keyPress : function(e){
  }
});
