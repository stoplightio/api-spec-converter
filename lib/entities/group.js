function Group(name) {
  this.groupName = name;
  this.items = [];
}

Group.prototype = {
  set Items(itemArray) {
    this.items = itemArray;
  }
};

module.exports = Group;
