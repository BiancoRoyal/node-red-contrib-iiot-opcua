![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](http://b.repl.ca/v1/Node--RED-IIoT_OPC_UA-blue.png)
![Repository GitLab](http://b.repl.ca/v1/Repository-GitLab-orange.png)
![Quality GitLab CI](http://b.repl.ca/v1/Quality-GitLab_CI_and_CD-green.png)
![ES_Sourdce_Version](http://b.repl.ca/v1/JS_Source-ES6-yellow.png)
![ES_Deploy_Version](http://b.repl.ca/v1/JS_Deploy-ES2015-yellow.png)
![NodeJS_Version](http://b.repl.ca/v1/NodeJS-6.x-green.png)

# node-red-iiot-opcua 

## !!! PUBLIC BETA !!! PUBLIC BETA !!!
### We start to work on issues from August - Have a great summer time!

[![opcuaiiot64](images/opcua-iiot-logo64-glass.png)](https://www.npmjs.com/package/node-red-iiot-opcua)

If you like that contributor's package for OPC UA, then please give us your star at [GitHub][3] !

## [Support via Kickstarter][9]
## [Support for the project straight away!][2]

## Code Release GitHub

The release of the source code will follow later at the end of the year.

## Install

Run command on Node-RED installation directory.

	npm install node-red-iiot-opcua

or run command for global installation.

	npm install -g node-red-iiot-opcua

try these options on npm install to build, if you have problems to install

    --unsafe-perm --build-from-source
    
## Contributing

Let's work together! 
Please read and accepted [CONTRIBUTING](CONTRIBUTING.md) by your sign and send it via E-Mail.

### Debug

Debugging on remote devices is important to help users. The verbose logging
provides interesting points in different abstractions if IDE or console debugging is not possible.

Start debug with Node-RED in verbose (-v) mode to get a verbose logging:

    DEBUG=opcuaIIoT:* node-red -v

Please, read the [Wiki article][7]

#### options

console DEBUG=opcuaIIoT:{option},opcuaIIoT:{option},...
 
 * core
    * core:details 
    * core:special
 * connector
    * connector:details
    * connector:nodeopcua
 * inject
    * inject:details
 * browser
    * browser:details
 * filter
    * filter:details
 * listener
    * listener:details
    * listener:subscribe
        * listener:subscribe:details
    * listener:event
        * listener:event:details
 * client
    * client:details
    * client:read
        * client:read:details
    * client:write
        * client:write:details
 * server
    * server:details
    * server:nodeopcua
    * server:ISA95
        * server:ISA95:details
 * response
    * response:details

#### verbose examples

    DEBUG=opcuaIIoT:client:*,opcuaIIoT:connector,opcuaIIoT:browser,opcuaIIoT:listener:*,opcuaIIoT:server node-red -v

    DEBUG=opcuaIIoT:client*,opcuaIIoT:client:read*,opcauaIIoT:connector* node-red -v
    
    DEBUG=opcuaIIoT:client*,opcuaIIoT:listener*,opcauaIIoT:connector node-red -v

    DEBUG=opcuaIIoT:filter node-red

    DEBUG=opcuaIIoT:connector* node-red

#### moderate examples

    DEBUG=opcuaIIoT:client,opcuaIIoT:client:read,opcuaIIoT:client:write,opcuaIIoT:connector,opcuaIIoT:server node-red

    DEBUG=opcuaIIoT:client,opcuaIIoT:client:read,opcauaIIoT:connector node-red

    DEBUG=opcuaIIoT:client,opcuaIIoT:client:read,opcuaIIoT:listener,opcuaIIoT:listener:subscribe,opcauaIIoT:connector node-red

    DEBUG=opcuaIIoT:filter node-red

    DEBUG=opcuaIIoT:connector node-red
    
### Wiki

Follow the [white rabbit][4]!

## Package Information

### Known Issues

Ideas
* converting in Result Filter is not finished yet
* dynamic methods
* dynamic IP for connector

Errors
* Connector
    * session closing
    * connection reset on errors
* Sign error on private package
* Bad XYZ situations handling
* Publish Engine Error
* Events doesn't work sometimes see [node-opcua issue][8]


### License

The BSD 3-Clause License

[Klaus Landsdorf][1]

That is a whole new Node-RED package based on the node-opcua examples and the API documentation.
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
[9]:https://www.kickstarter.com/projects/biancode/node-red-iiot-opc-ua-package
