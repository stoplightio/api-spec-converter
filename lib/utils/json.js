module.exports = {
  parse: function(data){
    try{
      var result = JSON.parse(data);
      if ((typeof result) === 'string') {
        return this.parse(result);
      }
      return result;
    } catch(err) {
      //can't parse, use as it is
      return data;
    }
  },
  stringify: function(jsonObj, spacing){
    if ((typeof jsonObj) === 'string') {
      return jsonObj;
    }
    if (!spacing) {
      spacing = 0;
    }
    return JSON.stringify(jsonObj, null, spacing);
  },
  //format given object/json string with pretty print style
  format: function(data){
    if ((typeof data) !== 'string') {
      if ((typeof data) === 'object') {
        return this.stringify(data, 2);
      }
      return data;
    }
    //try parse
    var result = this.parse(data);
    if ((typeof result) === 'string') {
      //not parsable, no formatting possible
      return data;
    }
    return this.stringify(result, 2);
  }
};
