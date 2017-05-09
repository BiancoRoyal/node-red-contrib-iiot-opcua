![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](http://b.repl.ca/v1/Node--RED-IIoT_OPC_UA-blue.png)
![Repository GitLab](http://b.repl.ca/v1/Repository-GitLab-orange.png)
![Quality GitLab CI](http://b.repl.ca/v1/Quality-GitLab_CI-green.png)

# node-red-iiot-opcua

[![opcuaiiot64](images/opcua-iiot-logo64-glass.png)](https://www.npmjs.com/package/node-red-iiot-opcua)

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
 * connector
 * browser
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

### Wiki

Link to Wiki

## Package Information

### License

The BSD 3-Clause License

[Klaus Landsdorf][1]

### Members

Stefanie Schima

### Features

[1]:http://bianco-royal.de/
