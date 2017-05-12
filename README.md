![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](http://b.repl.ca/v1/Node--RED-IIoT_OPC_UA-blue.png)
![Repository GitLab](http://b.repl.ca/v1/Repository-GitLab-orange.png)
![Quality GitLab CI](http://b.repl.ca/v1/Quality-GitLab_CI-green.png)

# node-red-iiot-opcua

[![opcuaiiot64](images/opcua-iiot-logo64-glass.png)](https://www.npmjs.com/package/node-red-iiot-opcua)

## Start your membership

<form name="_xclick" action="https://www.paypal.com/cgi-bin/webscr" method="post">
<input type="hidden" name="cmd" value="_xclick-subscriptions">
<input type="hidden" name="business" value="zahlungen@bianco-royal.de">
<input type="hidden" name="currency_code" value="EUR">
<input type="hidden" name="no_shipping" value="1">
<input type="image" src="http://www.paypal.com/de_DE/i/btn/x-click-but20.gif" border="0" name="submit" alt="Make payments with PayPal - it's fast, free and secure!">
<input type="hidden" name="a3" value="10.00">
<input type="hidden" name="p3" value="1">
<input type="hidden" name="t3" value="M">
<input type="hidden" name="src" value="1">
<input type="hidden" name="sra" value="1">
</form>

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
