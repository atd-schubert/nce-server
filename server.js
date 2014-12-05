"use strict";

module.exports = function(cms){
  if(!cms) throw new Error("You have to specify the cms object");
  
//# Mandantory Setup:
  var ext = cms.createExtension({package: require("./package.json")});
  
  ext.on("install", function(event){ // set options, but don't run or make available in cms
    //# Seting extension-config:
    
    ext.config.logger = ext.config.logger || {};

    //# Declarations and settings:

    ext.logger = cms.getExtension("winston").createLogger(ext.name, ext.config.logger);

    ext.config.disableCompression = ext.config.disableCompression || false;
    ext.config.disableCookieParser = ext.config.disableCookieParser || false;
    ext.config.disableSession = ext.config.disableSession || false;
    ext.config.sessionSecret = ext.config.sessionSecret || createSecret();
    ext.config.port = ext.config.port || 3000;
    ext.express = require('express');
    ext.app = ext.express();
  });
  
  ext.on("uninstall", function(event){ // undo installation
    //# Undeclare:
    
  });
  
  ext.on("activate", function(event){
    if(!ext.config.disableCompression) ext.app.use(require('compression')());
    if(!ext.config.disableCookieParser) ext.app.use(require("cookie-parser")());
    if(!ext.config.disableSession) ext.app.use(require("express-session")({ secret: ext.config.sessionSecret, resave:false, saveUninitialized: true }));
    
    ext.app.use(cms.middleware);
    ext.app.listen(ext.config.port, function(){
      ext.logger.info("NC Content-Management-System is listening on port %d in %s mode.", ext.config.port, ext.app.settings.env);
    });
  });
  
  ext.on("deactivate", function(event){ // undo activation
    
  });
  
//# Private declarations:
  var createSecret = function(){
    var rg = require('crypto').randomBytes(32).toString('hex');
    ext.logger.warn("You don't have setted a session secret: setting random session sectret to '"+rg+"'.");
    return rg;
  };

//# Public declarations and exports:
  ext.dummy = function(opts, cb){
    // a dummy method here...
  }
  
  return ext;
}