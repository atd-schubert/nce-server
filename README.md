# NCE server extension
## Description
A server extension for nce cms based on express.

## How to install
Install with npm: `npm install --save nce-server`

Integrate in NCE:

```
var fs = require("fs");
var NCE = require("nce");
var nce = new NCE(/*{
  server:{
    disableCompression: false,
    disableCookieParser: false,
    disableSession: false,
    sessionSecret: "if not specified the extension create a random one",
    http:{
      port: 3000,
      disabled: false
    },
    https:{
      port: 3001,
      key: fs.readSync("path/to/key"),
      cert: fs.readSync("path/to/cert"),
      disabled: false
    }
  }
}*/);
var server = require("nce-server");
var ext = server(nce);
ext.install();
ext.activate();
```

Or use nce-extension-manager...

## How to use
Just configure this extension and activate it after that.