function Group(name) {
  this.groupName = name;
  this.items = [];
}

Group.prototype = {
  set Items(itemArray) {
    this.items = itemArray;
  }
};

Group.prototype.toJSON = function() {
  return {
    groupName: this.groupName,
    items: this.items
  };
};

module.exports = Group;
