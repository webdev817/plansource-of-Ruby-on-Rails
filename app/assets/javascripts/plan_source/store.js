PlanSource.Store = DS.Store.extend({
	revision : 1,
	adapter : DS.RESTAdapter.extend({
		url : "/api"
	})
});