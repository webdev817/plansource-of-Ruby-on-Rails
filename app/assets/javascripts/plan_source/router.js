PlanSource.Router.map(function (){
	this.resource('jobs', function (){
		this.resource('job', { path : ":job_id" }, function () {
      this.route('pre_development');
      this.route('plans');
      this.route('addendums');
      this.route('rfi_asi');
      this.route('shops');
      this.route('special_inspections');
      this.route('support');
      this.route('client');
      this.route('calcs');
      this.route('photos');
      this.route('renderings');
    });
	});
});

PlanSource.Router.reopen({
  didTransition: function() {
    // Wait a second so the current url is correct.
    setTimeout(function () {
      gtag('config', 'UA-149703468-2', {
        'page_path': location.pathname + location.search + (location.hash || "#").substr(1)
      });
    }, 1000);
  }
});
