module.exports = {
  groupBy: function groupBy(array, f) {
    var groups = {};

    array.forEach((o) => {
      var group = JSON.stringify(f(o));

      groups[group] = groups[group] || [];
      groups[group].push(o);
    });

    return Object.keys(groups).map(group => groups[group]);
  },
};
