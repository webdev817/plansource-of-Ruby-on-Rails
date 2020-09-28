PlanSource.CSIField = Ember.TextField.extend({

	attributeBindings : ["inline", "placeholder", "value"],

	formatCSI:function(current){
		csiArr = current.split('');
		csiArr.splice(4, 0, " "); // Go backwards to preserve index
		csiArr.splice(2, 0, " ");
		return csiArr.join("")
	},

	didInsertElement : function(){
		var placeholder = this.get("placeholder");
		if(placeholder)
			this.set("placeholder", placeholder);
		if(this.get("focus"))
			this.$().focus();
		if(this.get("modelAttr")){
			var current = this.get("controller").get("model").get(this.get("modelAttr"))
			if(current)
				this.set("value", this.formatCSI(current))
		}
	},

	updateCSI:function(){
		console.log("Updating!")
		var current = this.get("controller").get("model").get(this.get("modelAttr"))
		this.set("value", this.formatCSI(current))

	},

	keyPress : function(e){
		this.get("controller").keyPress(e);
	}

});
