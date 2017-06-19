![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](http://b.repl.ca/v1/Node--RED-IIoT_OPC_UA-blue.png)
![Repository GitLab](http://b.repl.ca/v1/Repository-GitLab-orange.png)
![Quality GitLab CI](http://b.repl.ca/v1/Quality-GitLab_CI_and_CD-green.png)
![ES_Sourdce_Version](http://b.repl.ca/v1/JS_Source-ES6-yellow.png)
![ES_Deploy_Version](http://b.repl.ca/v1/JS_Deploy-ES2015-yellow.png)

# node-red-iiot-opcua 

## !!! PUBLIC BETA !!! PUBLIC BETA !!!


[![opcuaiiot64](images/opcua-iiot-logo64-glass.png)](https://www.npmjs.com/package/node-red-iiot-opcua)

If you like that contributor's package for OPC UA, then please give us your star at [GitHub][3] !

[Support the project now!][2]

## Install

Run command on Node-RED installation directory.

	npm install node-red-iiot-opcua

or run command for global installation.

	npm install -g node-red-iiot-opcua

try these options on npm install to build, if you have problems to install

    --unsafe-perm --build-from-source
    
## Usage

### OPC UA Server

### OPC UA Client

### Debug

start debug with Node-RED in verbose (-v) mode

    DEBUG=opcuaIIoT:* node-red -v
      
DEBUG options opcuaIIoT:
 
 * core
    * core:details 
    * core:special
 * connector
 * browser
 * filter
 * listener
    * listener:subscribe
    * listener:event
 * client
    * client:read
    * client:write
 * server
    * server:ISA95

Examples:

    DEBUG=opcuaIIoT:client,opcuaIIoT:client:read,opcauaIIoT:connector node-red -v
    
    DEBUG=opcuaIIoT:client*,opcuaIIoT:listener*,opcauaIIoT:connector node-red -v

    DEBUG=opcuaIIoT:filter node-red
    
### Wiki

Follow the [white rabbit][4]!

## Package Information

## Known Issues

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
 
### License

The BSD 3-Clause License

[Klaus Landsdorf][1]

### Features

[1]:https://bianco-royal.cloud/
[2]:https://bianco-royal.cloud/supporter/
[3]:https://github.com/biancode/node-red-iiot-opcua
[4]:https://github.com/biancode/node-red-iiot-opcua/wiki
[5]:https://github.com/node-opcua/node-opcua/commit/fa0efb772353adbc901f47d8787a13597d595cd7
