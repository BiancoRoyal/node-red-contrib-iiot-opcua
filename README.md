
# node-red-contrib-iiot-opcua 

![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](http://b.repl.ca/v1/Node--RED-IIoT_OPC_UA-blue.png)
![License](http://b.repl.ca/v1/License-LicenseType-orange.png)
[![NPM version](https://badge.fury.io/js/node-red-contrib-iiot-opcua.png)](https://www.npmjs.com/package/node-red-contrib-iiot-opcua)
![ES_Deploy_Version](http://b.repl.ca/v1/TypeScript-4.6.4-yellow.png)
![NodeJS_Version](http://b.repl.ca/v1/NodeJS-14.19.1-green.png)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![NPM download](https://img.shields.io/npm/dm/node-red-contrib-iiot-opcua.svg)](https://www.npmtrends.com/node-red-contrib-iiot-opcua)
[![Build Status](https://travis-ci.org/BiancoRoyal/node-red-contrib-iiot-opcua.svg?branch=master)](https://travis-ci.org/BiancoRoyal/node-red-contrib-iiot-opcua)
[![Maintainability badge](codeclimate)](a url to CodeCliemate)

## The IoT/IIoT OPC UA toolbox package for [Node-RED][3] based on [node-opcua][4].

This is an updated version of the project of the same name, which was deprecated by the [original developer][1] in April 2020. 
The original repository has been deleted from Github, so this is based on [this fork of a slightly outdated version of the project](https://github.com/cacamille3/node-red-contrib-iiot-opcua).* 
This project upgrades the original work by migrating to TypeScript, and updating dependencies, including updates to new major release versions of Node-RED (v0.19 to v2.2.2) and node-opcua (v0.4 to v2.64.1).

[![ISA95](images/logoISA95blue2.png)](https://opcfoundation.org/developer-tools/specifications-unified-architecture/isa-95-common-object-model/)
[![ISA95](images/logoRAMI40blue.png)](http://www.plattform-i40.de/)

*The latest version published to NPM was 3.12.1, while our version is based on 3.10.2.

## Installing

1. Navigate to your Node-RED data directly. This defaults to `$HOME/.node-red/`
2. Install via npm.
   ```shell
   npm install node-red-contrib-iiot-opcua
   ```

## Migrating from previous versions

The update from v3.x to v4.x changed the way some nodes are implemented.

### General Changes
- The message format was standardized. While in older versions, a lot of additional properties were placed directly into the message,
they have been moved into the message's payload (`msg.payload`). This is to ensure the standard Node-RED message format is used, where the message
itself may only contain an ID, a topic, and a payload. This means that any references like `msg.nodetype` should be changed to `msg.payload.nodetype`.

### Browser
- The option `singleBrowseResult` has been replaced with `multipleOutputs`, and the default value now combines all outputs into one message. To maintain the same output, replace `singleBrowseResult` with `multipleOutputs` and swap the corresponding boolean value (true becomes false, false becomes true).

### Flex-Server
- The `node-opcua` library is now directly accessible as `opcua`. This means all references to `coreServer.core.nodeOPCUA` should be replaced with `opcua`.
- `node.iiot.assert` is no longer accessible. The functionality can be replaced by using an `if` statement that throws a new error (`if (errorConfition) throw new Error('Error Message'`). Errors can be displayed by using a `catch` node connected to a `debug` node, which displys the entire message.


## Contributing

Every bit helps! If you come across any bugs, please [open an issue](https://github.com/DATATRONiQ/node-red-contrib-iiot-opcua/issues/new/choose), or if you feel inclined to try to fix it yourself, [submit a pull request](https://github.com/DATATRONiQ/node-red-contrib-iiot-opcua/compare).

##### Stuff from original README.md

Let's work together!
Please, read and in best case accept [CONTRIBUTING](.github/CONTRIBUTING.md) by your sign and send it via E-Mail.
You could also just send a pull request or issues while testing, please!


### Setting up local development
1. Ensure you are using node 14. This has been developed using node v14.19.1. If using Node Version Manager: `nvm install v14.19.1`
2. Install Node-RED to a separate directory.
   ```shell
   git clone git@github.com:node-red/node-red.git
   cd node-red
   git checkout tags/2.2.2
   npm install
   npm run build
   npm run start # This must be run once to initialize the ~/.node-red directory
   ```
3. Clone this repository into its own directry
   ```shell
   git clone git@github.com:DATATRONiQ/node-red-contrib-iiot-opcua.git
   cd node-red-contrib-iiot-opcua
   git checkout development
   npm install
   npm run build
   ```
4. Add `node-red-contrib-iiot-opcua` to Node-RED
   ```shell
   cd ~/.node-red
   npm install <...>/node-red-contrib-iiot-opcua
   ```
5. Start Node-RED
   ```shell
   cd <...>/mode-red
   npm run staart
   ``` 
   
### :TODO_alert_emoji: After making changes, remember to run `npm run build` in the `node-red-contrib-iiot-opcua` directory starting Node-RED! :TODO_alert_emoji:

## Docker

### Building an image

```bash
bash build.sh <image_tag>
```

# node-red-contrib-iiot-opcua

## The IoT/IIoT OPC UA toolbox package for [Node-RED][3] based on [node-opcua][4].

[![ISA95](images/logoISA95blue2.png)](https://opcfoundation.org/developer-tools/specifications-unified-architecture/isa-95-common-object-model/)
[![ISA95](images/logoRAMI40blue.png)](http://www.plattform-i40.de/)

* tested with Node.js v14.19 and Node-RED v2.2.2
* based on node-opcua v2.64 (OPC UA v1.03)
* extendable with node-opcua-isa95

**If you like that contributor's package for OPC UA, then please give us your star at [GitHub][3]!**

[You could also help as a backer of the project.][2]

## Install

Run command on [Node-RED][3] installation directory.

	npm install node-red-contrib-iiot-opcua

or run command for global installation.

	npm install -g node-red-contrib-iiot-opcua

try these options on npm install to build, if you have problems to install

    --unsafe-perm --build-from-source

![Flow Example](images/wiki/browser-listener-flow3-active.png)

To get a special version please set the version with @M.M.F:

    npm install node-red-contrib-iiot-opcua@2.7.1

or global with the -g option of npm. You get more help in the npm docs.
    
## Contributing

Let's work together!
Please, read and in best case accept [CONTRIBUTING](.github/CONTRIBUTING.md) by your sign and send it via E-Mail.
You could also just send a pull request or issues while testing, please!

[Click here if you want to back the project!][2]

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

### Your own address space model!

With the flex server you could create your own information model with the OPC UA address space.

![Flex server Example](images/wiki/flexServerAddressSapceExamplev3.png)

### Learn with the examples!

The server node contains demo objects and variables
to start playing with OPC UA method call, read and write operations.

see Node-RED menu (right upper corner) -> Import -> Examples -> iiot opcua

![Flow Example](images/wiki/method-call3-active.png)

**... secure reading from OPC UA servers with your own key pairs ...**

![Read Example](images/wiki/read-history3-active.png)

**... and secure writing and moving data between OPC UA servers ...**

![Write Example](images/wiki/write-flow3-active.png)

![Read Write Example](images/wiki/write-read-flow3.png)

**... create your own variables and objects from events ...**

| Node-RED                                         | UAExpert / Client                                         |
|--------------------------------------------------|-----------------------------------------------------------|
| ![ASO Example](images/wiki/server-aso-flow3.png) | ![ASO UAExpert](images/wiki/ASOTestVariablesUAExpert.png) |

### Reconnect via events with the Flex Connector!

![Flow Flex Connector](images/wiki/flex-connector-flow31.png)

## Package Information

### Known Issues and TODO's

Ideas
* methods calls
  * complex
  * dynamic
  * structured object parameters

Errors
* more Bad status situations handling
* API changes to 0.4.+ bring some breaking changes in connection handling
  * Please, test and report issues via GitHub!

### License

The BSD 3-Clause License

[Klaus Landsdorf][1]

That is a whole new Node-RED package started in 2017 based on the node-opcua v0.4 and the API documentation.
The old copyrights by Mika Karaila are just to honor his pioneer work in the years 2015/2016 for Node-RED and OPC UA.

### Important

This is **not** an official product of the OPC Foundation or Plattform Industrie 4.0.

### Contribution node-opcua

I'd like to give special thanks to [Etienne Rossignon][2]
for the node-opcua packages and very special for the node-opcua-isa95 package!

[1]:https://github.com/biancode/
[2]:https://github.com/erossignon
[3]:https://github.com/node-red/node-red
[4]:https://github.com/node-opcua/node-opcua
