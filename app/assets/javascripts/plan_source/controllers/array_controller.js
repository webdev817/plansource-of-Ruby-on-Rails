PlanSource.ArrayController = Ember.ArrayController.extend({
	sortProperties: ['plan_num'],
  sortAscending: true,

  sort: function(sortProperty){
    if (sortProperty == this.sortProperties[0]){
      this.set("sortAscending", !this.sortAscending);
    } else {
      this.set("sortAscending", true);
    }

    this.set('sortProperties', [sortProperty, 'id']);
  },
});
