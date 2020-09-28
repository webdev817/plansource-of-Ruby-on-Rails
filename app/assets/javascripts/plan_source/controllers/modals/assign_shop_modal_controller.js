PlanSource.AssignShopController = Ember.ArrayController.extend({
  sortProperties: ['first_name'],
  sortAscending: true,

  sort: function(sorter){
    this.set("sortProperties", [sorter]);
  },

  selectContact: function (contact) {
    var self = this;
    var shop = this.get("shop");
    var urlPrefix = "/api/shops/";

    $.post(urlPrefix + shop.id + "/assign", {
      assign_to_user_id: contact.id,
    }, function (data) {
      var obj = data.plan;

      if (obj) {
        shop.setProperties({ assigned_user: obj.assigned_user });

        toastr["success"]("Succesfully updated assigned user!");

        self.send('close');
      } else {
        toastr["error"]("Sorry, there was a problem.")
      }
    }, "json");
  },

  keyPress : function(e){
  }
});
