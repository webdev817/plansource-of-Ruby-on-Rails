//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require moment
//= require async
//= require ./application/vendor/toastr.min.js

$(document).ready(function(){
	var xhr2 = ( window.FormData !== undefined );
	if(!xhr2){
		$(".browser-error").attr("class", "browser-error");
		$("body").css("padding-top", "40px");
	}
});

// Toaster options!
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};
