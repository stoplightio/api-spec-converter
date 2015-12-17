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
  stringify: function(jsonObj){
    if ((typeof jsonObj) === 'string') {
      return jsonObj;
    }
    return JSON.stringify(jsonObj, null, 2);
  }
};
