var expect   = require("chai").expect,
    converter = require("../lib/converter");

describe("Converter", function() {
    describe("constructor", function(){
      it('should successfully create new converter instance');
      it('should validate from/to format, throw error otherwise');
    });
    describe("loadFile", function(){
      it('should successfully load comaptible file');
      it('should throw error for format incompatible file');
    });
    describe("loadData", function(){
      it('should successfully load raw data');
      it('should throw error for format incompatible data');
    });
    describe("convert", function(){
      it('should successfully convert and return converted data');
    });
});
