![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](http://b.repl.ca/v1/Node--RED-IIoT_OPC_UA-blue.png)
![Repository GitLab](http://b.repl.ca/v1/Repository-GitLab-orange.png)
![Quality GitLab CI](http://b.repl.ca/v1/Quality-GitLab_CI_and_CD-green.png)
![ES_Sourdce_Version](http://b.repl.ca/v1/JS_Source-ES6-yellow.png)
![ES_Deploy_Version](http://b.repl.ca/v1/JS_Deploy-ES2015-yellow.png)
![NodeJS_Version](http://b.repl.ca/v1/NodeJS-6.x-green.png)
[![NPM download](https://img.shields.io/npm/dm/node-red-contrib-iiot-opcua.svg)](http://www.npm-stats.com/~packages/node-red-contrib-iiot-opcua)
[![NPM version](https://badge.fury.io/js/node-red-contrib-iiot-opcua.png)](https://www.npmjs.com/package/node-red-contrib-iiot-opcua)

# node-red-contrib-iiot-opcua 

## The IoT/IIoT OPC UA toolbox package for Node-RED based on node-opcua.

[![opcuaiiot64](images/opcua-iiot-logo64-glass.png)](https://www.npmjs.com/package/node-red-contrib-iiot-opcua )

If you like that contributor's package for OPC UA, then please give us your star at [GitHub][3] !

## [Become a backer of the project straight away!][2]

* tested with Node 6 LTS
* tested with Node 8 LTS
* based on node-opcua v0.1.x

## Code Release GitHub

The release of the source code will follow later at the end of the year.

## Install

Run command on Node-RED installation directory.

	npm install node-red-contrib-iiot-opcua 

or run command for global installation.

	npm install -g node-red-contrib-iiot-opcua 

try these options on npm install to build, if you have problems to install

    --unsafe-perm --build-from-source
    
![Flow Example](images/opcua-iiot-v109s2.png)
  
## Contributing

Let's work together! 
Please read and accepted [CONTRIBUTING](CONTRIBUTING.md) by your sign and send it via E-Mail.

### Debug

Debugging on remote devices is important to help users. The verbose logging
provides interesting points in different abstractions if IDE or console debugging is not possible.

Start debug with Node-RED in verbose (-v) mode to get a verbose logging:

    DEBUG=opcuaIIoT* node-red -v 1>nodeREDIIoTOPCUA.log 2>&1

or on local Node-RED
    
    DEBUG=opcuaIIoT* node red.js -v 1>nodeREDIIoTOPCUAServer.log 2>&1

#### Debug Options

Please, read the [Wiki article][7]
    
### Wiki

Follow the [white rabbit][4]!

## Package Information

### Known Issues and TODO's

Ideas
* converting in Result Filter is not finished yet
* dynamic methods
* dynamic IP for connector

Errors
* Connector
    * session closing
    * connection reset on errors
* more Bad status situations handling
* Publish Engine Error
* Events doesn't work sometimes see [node-opcua issue][8]

![Flow Example](images/opcua-iiot-v109.png)

### License

The BSD 3-Clause License

[Klaus Landsdorf][1]

That is a whole new Node-RED package started in 2017 based on the node-opcua v0.1.x and the API documentation.
The old copyrights by Mika Karaila are just to honor his pioneer work in the years 2015/2016 for Node-RED and OPC UA.

### Important

This is **not** an official product of the OPC Foundation.
It is just to provide OPC UA to Node-RED based on node-opcua.

### Contribution node-opcua

I'd like to give special thanks to [Etienne Rossignon][6] 
for the node-opcua packages and very special for the node-opcua-isa95 package! 

[1]:https://bianco-royal.cloud/
[2]:https://bianco-royal.cloud/supporter/
[3]:https://github.com/biancode/node-red-iiot-opcua-publicbeta
[4]:https://github.com/biancode/node-red-iiot-opcua-publicbeta/wiki
[5]:https://github.com/node-opcua/node-opcua/commit/fa0efb772353adbc901f47d8787a13597d595cd7
[6]:https://github.com/erossignon
[7]:https://github.com/biancode/node-red-iiot-opcua-publicbeta/wiki/DEBUG
[8]:https://github.com/node-opcua/node-opcua/issues/340
