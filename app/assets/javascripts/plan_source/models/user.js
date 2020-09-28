PlanSource.User = Ember.Object.extend({

  fullName : function(){
    return this.get("first_name") + " " + this.get("last_name");
  }.property("first_name", "last_name"),

  isManager : function(){
    return PlanSource._user_type == "Manager"
  }.property()

});

PlanSource.Contact = Ember.Object.extend({
  sort_email : function(){
    var p = this.get("email").split("@");
    return p[1] + p[0];
  }.property("email")
});

PlanSource.Contact.reopenClass({
  baseUrl : "/api/user/contacts",

  url : function(){
    var pathArray = window.location.href.split( '/' ),
      host = pathArray[2],
      u = PlanSource.getProtocol() + host + PlanSource.Contact.baseUrl;
    return u;
  },

  findAll : function(){
    var users = Em.A();
    $.get(PlanSource.Contact.url()).then(function(data){
      var u = [];
      data.users.forEach(function(user){
        users.pushObject(PlanSource.Contact.create(user.users));
      });
      return true;
    });
    return users;
  }

});
