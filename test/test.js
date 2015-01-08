"use strict";
var NCE = require("nce");
var ExtMgr = require("nce-extension-manager");
var Ext = require("../");

var Logger = require("nce-winston");
var http = require("http");
var freeport = require("freeport");

var loggingLevel = 10;

describe('Basic integration in NCE', function(){
  var nce = new NCE();
  it('should be insertable into NCE', function(done){
    var ext = Ext(nce);
    if(ext) return done();
    return done(new Error("Is not able to insert extension into NCE"));
  });
});
describe('Basic functions in NCE', function(){
  freeport(function(err, port){
    if(err) throw err;

    var nce = new NCE({server:{http:{port:port}, logger:{level:loggingLevel}}});
    var ext = Ext(nce);
    var extMgr = ExtMgr(nce);
    extMgr.activateExtension(extMgr);
    
    it('should be installable', function(done){
      if(extMgr.installExtension(ext) && ext.status === "installed") return done();
      return done(new Error("Can not install extension"));
    });
    it('should be activatable', function(done){
      if(extMgr.activateExtension(ext) && ext.status === "activated") return done();
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
});
describe('Test server', function(){
  
  var nce = new NCE({server:{logger:{level:loggingLevel}}});
  var ext = Ext(nce);
  var extMgr = ExtMgr(nce);
  extMgr.activateExtension(extMgr);
  extMgr.activateExtension(ext);
  
  nce.requestMiddlewares.push(function(req, res, next){res.end("OK")});
  
  ext.on("http:listen", function(){
    it('should be reachable on port 3000', function(done){
      http.get("http://localhost:3000/", function(res) {
        if(res.statusCode === 200) return done();
        done(new Error("Wrong statuscode!"))
      }).on('error', function(e) {
        done(e);
      });
    });
  });
});