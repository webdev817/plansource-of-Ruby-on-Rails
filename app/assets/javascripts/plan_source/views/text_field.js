PlanSource.TextField = Ember.TextField.extend({

	attributeBindings : ["inline", "placeholder", "value", "autocomplete"],

	didInsertElement : function(){
		var placeholder = this.get("placeholder");
		if(placeholder)
			this.set("placeholder", placeholder);
		if(this.get("focus"))
			this.$().focus();
		if(this.get("modelAttr"))
			this.set("value", this.get("controller").get("model").get(this.get("modelAttr")))
	},

	doAutocomplete : function(){
		this.$().autocomplete({
      source: function( request, response ) {
        $.ajax({
          url: "/api/autocomplete",
          dataType: "json",
          data: {
            num: 10,
            starts_with: request.term
          },
          success: function( data ) {
            response(data.users);
          }
        });
      },
      minLength: 2
    });
	},

	keyPress : function(e){
		this.get("controller").keyPress(e);
	}

});
