PlanSource.AssignRfiController = Ember.ArrayController.extend({
  sortProperties: ['first_name'],
  sortAscending: true,

  sort: function(sorter){
    this.set("sortProperties", [sorter]);
  },

  selectContact: function (contact) {
    var self = this;
    var rfi_asi = this.get("rfiAsi");
    var urlPrefix = "/api/rfis/";

    // Make sure we are setting RFI if it exsists
    if (rfi_asi.get('getRFI')) {
      rfi_asi = rfi_asi.get('getRFI');
    } else {
      rfi_asi = rfi_asi.get('getASI');
      urlPrefix = "/api/asis/";
    }

    $.post(urlPrefix + rfi_asi.id + "/assign", {
      assign_to_user_id: contact.id,
    }, function (data) {
      var obj = data.rfi || data.asi;

      if (obj) {
        rfi_asi.setProperties({ assigned_user: obj.assigned_user });

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
