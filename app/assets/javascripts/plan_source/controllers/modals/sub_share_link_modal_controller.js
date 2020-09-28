PlanSource.SubShareLinkController = PlanSource.ModalController.extend({

	sendLink : function(){
    var emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    var host = window.location.href.split('/')[2];
    var shareLinkUrl = '//' + host + '/api/jobs/share_link';

		var container = $("#share-link-email"),
    		email = container.val().trim();

   	this.clearAllErrors();

    if(!email || email == ""){
    	this.error("#share-link-email", "You need to enter an email");
    	return;
    }

    if(!email.match(emailRegex)) {
    	this.error("#share-link-email", "Please enter a valid email");
    	return;
    }

    // Make a post request to the server to send an email witha link to email.
    // Success or fail, give a notification.
    $.ajax({
        url: shareLinkUrl,
        type: 'POST',
        data : {
          'job_id': this.get('model.id'),
          'email_to_share_with': email
        }
    }).done(function(data){
			console.log("Sent email link.")
			toastr["success"]("Sent link to " + email);
    }).fail(function(data){
			toastr["warning"]("Failed to send link to " + email);
    });
    this.send('close');
	},

	keyPress : function(e){
		if (e.keyCode == 13)
			this.sendLink();
	}
});
