var expect   = require('chai').expect,
    Exporter = require('../../../lib/exporters/exporter'),
    Project = require('../../../lib/entities/project');

describe('Exporter', function(){
  var exporter;
  beforeEach(function(){
    exporter = new Exporter();
  });

  describe('constructor', function(){
    it('should create new exporter instance successfully');
  });
  describe('loadSLData', function(){
    it('should load Stoplight data successfully');
    it('should return error for invalid formatted data');
  });
  describe('loadProject', function(){
    it('should load an spec-converter project entity');
  });
  describe('_export', function(){
    it('should have  unimplemented _export method, throw error upon called');
  });
  describe('export', function(){
    it('should perform export and return raw data with given format');
    it('should return error if format not supported');
  });
  describe('export', function(){
    it('should perform export and return raw data with given format');
    it('should return error if format not supported');
  });
  describe('_getData', function(){
    it('should return data with given format');
    it('should return default as formatted data if format not given');
  });
  describe('Data getter', function(){
    it('should escape apostrophe char', function(){
      exporter.data = 'srtring with’ apostrophe';
      expect(exporter.Data).to.equal('srtring with\' apostrophe');
    });
  });
});
