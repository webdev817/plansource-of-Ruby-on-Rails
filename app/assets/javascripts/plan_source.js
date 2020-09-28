//= require handlebars
//= require ember
//= require ember-data
//= require ./plan_source/vendor/dropzone
//= require ./plan_source/vendor/pikaday
//= require_self
//= require ./plan_source/store
//= require_tree ./plan_source/models
//= require_tree ./plan_source/controllers
//= require_tree ./plan_source/views
//= require_tree ./plan_source/helpers
//= require_tree ./plan_source/templates
//= require ./plan_source/router
//= require_tree ./plan_source/routes

// Drag n Drop file upload.  Turn off auto discover forms.
// We create them in Ember.
Dropzone.autoDiscover = false;

PlanSource = Ember.Application.create({
	rootElement: "#ember-job-app",
	LOG_TRANSITIONS: true
});

PlanSource.isUploading = false;

Ember.Handlebars.registerBoundHelper("encode_URL", function(url) {
	if(url) {
		return encodeURIComponent(url);
	} else {
		return "";
  }
});

Ember.Handlebars.registerBoundHelper("csi_formatter", function(csi) {
	if(csi) {
		csiArr = csi.split('');
		csiArr.splice(4, 0, " "); // Go backwards to preserve index
		csiArr.splice(2, 0, " ");

		return csiArr.join("");
	} else {
		return "";
  }
});

Ember.Handlebars.registerBoundHelper("date", function(date) {
	if (date) {
		return moment(date).fromNow();
  } else {
		return "";
  }
});

Ember.Handlebars.registerBoundHelper("format-date", function(date) {
	if (date) {
		return moment(date).format('ll');
  } else {
		return "";
  }
});

Ember.Handlebars.registerBoundHelper("boolean", function(val) {
  return !!val + "";
});

Handlebars.registerHelper('manager', function(options) {
	if (PlanSource._user_type == "Manager" || PlanSource._user_type == "Admin") {
		return options.fn(this);
  } else {
		return options.inverse(this);
  }
});

Handlebars.registerHelper('admin', function(options) {
	if(PlanSource._user_type === "Admin") {
		return options.fn(this);
  } else {
		return options.inverse(this);
  }
});

Handlebars.registerHelper('can_share_link', function(options) {
	if(PlanSource._can_share_link) {
		return options.fn(this);
  } else {
		return options.inverse(this);
  }
});

Handlebars.registerHelper('can_delete_plan', function(options) {
	if(PlanSource._can_delete_plan) {
		return options.fn(this);
  } else {
		return options.inverse(this);
  }
});

Handlebars.registerHelper('eq', function(one, two) {
	return one === two;
});

Ember.Handlebars.registerBoundHelper('ifCond', function(one, two, options) {
	if (one === two) {
		return options.fn(this);
	}
	return options.inverse(this);
});

Ember.Handlebars.registerBoundHelper ('truncate', function (str) {
	if (!str) return str;

	var len = 35;

  if (str.length > len) {
    var new_str = str.substr(0, len + 1);
    return new Handlebars.SafeString(new_str + '...');
  }

  return str;
});

PlanSource.getProtocol = function(){
	if (window.location.protocol == "https:") {
		return "https://";
  } else {
		return "http://";
  }
}

PlanSource.showNotification = function(msg, type) {
  if(!type) { type = 'success'; }

  var body = [
    '<div class="alert alert-' + type + '">',
      '<a class="close" data-dismiss="alert">&#215;</a>',
      '<div>' + msg + '</div>',
    '</div>'
  ].join("\n");

  $('#site-notifications .col-sm-12').append(body);
};

(function($){
	$.fn.upload = function(remote, successFn, progressFn) {
		return this.each(function() {
			var formData = new FormData(this);

			PlanSource.isUploading = true;

			$.ajax({
				url: remote,
				type: 'POST',
				xhr: function() {
					var myXhr = $.ajaxSettings.xhr();

					if(myXhr.upload && progressFn) {
						myXhr.upload.addEventListener('progress', progressFn, false);
					}

					return myXhr;
				},
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				complete : function(res) {
					if(successFn) successFn(res);

					PlanSource.isUploading = false;
				}
			});
		});
	}
})(jQuery);

PlanSource.download = function(plan_id) {
	if (plan_id) $(".downloader").attr("src", "/api/download/" + plan_id);
};
