
Ember.Handlebars.registerHelper('eq', function eq(one, two){
    if (one == two){
      return true
    }
    return false
});
