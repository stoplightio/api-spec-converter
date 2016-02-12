function Text(name) {
  this._id = null;
  this.name = name;
  this.content = '';
  this.public = '';
}

Text.prototype = {
  get Id() {
    return this._id;
  },
  set Id(id) {
    this._id = id;
  },
  get Name() {
    return this.name;
  },
  set Name(name) {
    this.name = name;
  },
  set Content(content) {
    this.content = content;
  },
  get Content() {
    return this.content;
  },
  set Public(public) {
    this.public = public;
  },
  get Public() {
    return this.public;
  }
};

//used for stoplightx export only
Text.prototype.toJSON = function() {
  return {
    id: this.Id,
    name: this.Name,
    content: this.Content,
    public: this.Public
  };
};

module.exports = Text;
