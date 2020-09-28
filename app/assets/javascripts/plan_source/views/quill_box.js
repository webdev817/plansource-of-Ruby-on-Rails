PlanSource.QuillBox = Ember.View.extend({
  didInsertElement:function(){
    console.log("Inserted Quill Details");
    if(this.get("modelAttr")){
      var current = this.get("controller").get("model").get(this.get("modelAttr"))
      if(current){
        editor.setContents(JSON.parse(this.get('controller').get("model").get("description")));
      }

    }
  }
});
