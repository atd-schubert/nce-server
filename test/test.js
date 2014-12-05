"use strict";
var NCE = require("nce");
var Ext = require("../");

var Logger = require("nce-winston");
var http = require("http");

describe('Basic integration in NCE', function(){
  var nce = new NCE();
  it('should be insertable into NCE', function(done){
    var ext = Ext(nce);
    if(ext) return done();
    return done(new Error("Is not able to insert extension into NCE"));
  });
});
describe('Basic functions in NCE', function(){
  var nce = new NCE();
  var ext = Ext(nce);
  
  var logger = Logger(nce);
  logger.install();
  logger.activate();
  
  nce.requestMiddlewares.push(function(req, res, next){res.end("OK")});
  
  it('should be installable', function(done){
    if(ext.install()) return done();
    return done(new Error("Can not install extension"));
  });
  it('should be activatable', function(done){
    if(ext.activate()) return done();
    return done(new Error("Can not activate extension"));
  });
  it('should be deactivatable', function(done){
    if(ext.deactivate()) return done();
    return done(new Error("Can not deactivate extension"));
  });
  it('should be uninstallable', function(done){
    if(ext.uninstall()) return done();
    return done(new Error("Can not uninstall extension"));
  });
});
describe('Test server', function(){
  it('should be reachable on port 3000', function(done){
    this.timeout(10000);
    http.get("http://localhost:3000/", function(res) {
      if(res.statusCode === 200) return done();
      done(new Error("Wrong statuscode!"))
    }).on('error', function(e) {
      done(e);
    });
  });
});