"use strict";

var http = require("http");
var https = require("https");
var url = require("url");

module.exports = function(nce){
  if(!nce) throw new Error("You have to specify the nce object");
  
//# Mandantory Setup:
  var ext = nce.createExtension({package: require("./package.json")});
  
  ext.on("install", function(event){ // set options, but don't run or make available in nce
    //# Seting extension-config:
    
    ext.config.logger = ext.config.logger || {};

    //# Declarations and settings:

    ext.logger = nce.getExtension("winston").createLogger(ext.name, ext.config.logger);

    ext.config.http = ext.config.http || {};
    ext.config.http.port = ext.config.http.port || 3000;
    ext.config.http.disabled = ext.config.http.disabled || false;

    ext.config.https = ext.config.https || {};
    ext.config.https.port = ext.config.https.port || 3001;
    ext.config.https.key = ext.config.https.key || false;
    ext.config.https.cert = ext.config.https.cert || false;
    if(!ext.config.https.key || !ext.config.https.cert) ext.config.https.disabled = true;
    ext.config.https.disabled = ext.config.https.disabled || false;

    ext.config.disableParseQuery = ext.config.disableParseQuery || false;
    ext.config.disableCompression = ext.config.disableCompression || false;
    ext.config.disableCookieParser = ext.config.disableCookieParser || false;
    ext.config.disableSession = ext.config.disableSession || false;
    ext.config.sessionSecret = ext.config.sessionSecret || createSecret();
    ext.config.sessionResave = ext.config.sessionResave || false;
    if(!("sessionSaveUninitialized" in ext.config)) ext.config.sessionSaveUninitialized = true;

    middlewares.cookies = require("cookie-parser")();
    middlewares.compression = require('compression')();
    middlewares.session = require("express-session")({ secret: ext.config.sessionSecret, resave: ext.config.sessionResave, saveUninitialized: true });
    middlewares.parseQuery = function(req, res, next){
      var tmp = url.parse(req.url).query;
      var query = {};
      var i;
      var tmp;
      
      if(tmp) {
        queries = tmp.split("&");
        for (i=0; i<queries.length; i++) {
          tmp = queries[i].split("=");
          query[tmp[0]] = tmp[1];
        }
      }
      req.query = query;
      next();
    }
  });
  
  ext.on("uninstall", function(event){ // undo installation
    //# Undeclare:
    nce.getExtension("winston").removeLogger(ext.name);
    
    delete middlewares.cookies;
    delete middlewares.compression;
    delete middlewares.session;
    delete middlewares.parseQuery;
    delete ext.logger;
  });
  
  ext.on("activate", function(event){
    if(!ext.config.disableParseQuery && nce.requestMiddlewares.indexOf(middlewares.parseQuery) === -1) {
		  nce.requestMiddlewares.push(middlewares.parseQuery);
	  }
    if(!ext.config.disableCompression && nce.requestMiddlewares.indexOf(middlewares.compression) === -1) {
		  nce.requestMiddlewares.push(middlewares.compression);
	  }
    if(!ext.config.disableCookieParser && nce.requestMiddlewares.indexOf(middlewares.cookies) === -1) {
		  nce.requestMiddlewares.push(middlewares.cookies);
	  }
    if(!ext.config.disableSession && nce.requestMiddlewares.indexOf(middlewares.session) === -1) {
		  nce.requestMiddlewares.push(middlewares.session);
	  }
    
    if(!ext.config.http.disabled) {
      servers.http = http.createServer(nextedCallback(nce.middleware)).listen(ext.config.http.port, function(){
        ext.emit("http:listen");
        ext.logger.info("NCE server is listening with http on port " + ext.config.http.port + ".");
      });
    }
    if(!ext.config.https.disabled) {
      servers.https = https.createServer({key: ext.config.https.key, cert: ext.config.https.cert}, nextedCallback(nce.middleware)).listen(ext.config.https.port, function(){
        ext.emit("https:listen");
        ext.logger.info("NCE server is listening with https on port " + ext.config.https.port + ".");
      });
    }
  });
  
  ext.on("deactivate", function(event){ // undo activation
    
	  if(nce.requestMiddlewares.indexOf(middlewares.parseQuery) !== -1) {
		  nce.requestMiddlewares.splice(nce.requestMiddlewares.indexOf(middlewares.parseQuery), 1);
	  }
	  if(nce.requestMiddlewares.indexOf(middlewares.compression) !== -1) {
		  nce.requestMiddlewares.splice(nce.requestMiddlewares.indexOf(middlewares.compression), 1);
	  }
	  if(nce.requestMiddlewares.indexOf(middlewares.cookies) !== -1) {
		  nce.requestMiddlewares.splice(nce.requestMiddlewares.indexOf(middlewares.cookies), 1);
	  }
	  if(nce.requestMiddlewares.indexOf(middlewares.session) !== -1) {
		  nce.requestMiddlewares.splice(nce.requestMiddlewares.indexOf(middlewares.session), 1);
	  }
	  
    if(servers.http) servers.http._handle.close(function(){
      ext.logger.info("NCE http server stopped.");
      delete servers.http;
    });
    if(servers.https) servers.https._handle.close(function(){
      ext.logger.info("NCE https server stopped.");
      delete servers.https;
    });
  });
  
//# Private declarations:
  var middlewares = {};
  var nextedCallback = function(cbWithNext){
    return function(req, res){
      cbWithNext(req, res, function(err){
        if(err) {
          res.writeHead(500, {"content-type":"text/plain"});
          if("stack" in err) return res.end(err.stack);
          return res.end(err.toString());
        }
        
        res.writeHead(404, {"content-type":"text/plain"});
        res.end("Can not " + req.method + " " + req.url);
      });
    };
  };
  var servers = {}; // http, https
  var createSecret = function(){
    var rg = require('crypto').randomBytes(32).toString('hex');
    ext.logger.warn("You don't have setted a session secret: setting random session sectret to '"+rg+"'.");
    return rg;
  };

//# Public declarations and exports:
  
  return ext;
}