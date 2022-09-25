
# node-red-contrib-iiot-opcua 

![Platform Node-RED](https://img.shields.io/badge/Platform-Node--RED-red.png)
![Node-RED IIoT OPC UA](https://img.shields.io/badge/Node--RED-IIoT_OPC_UA-blue.png)
![License](https://img.shields.io/badge/License-BSD--3-orange.png)
[![NPM version](https://badge.fury.io/js/node-red-contrib-iiot-opcua.png)](https://www.npmjs.com/package/node-red-contrib-iiot-opcua)
![ES_Deploy_Version](https://img.shields.io/badge/TypeScript-4.6.4-yellow.png)
![NodeJS_Version](https://img.shields.io/badge/NodeJS-14.19.1-green.png)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![NPM download](https://img.shields.io/npm/dm/node-red-contrib-iiot-opcua.svg)](https://www.npmtrends.com/node-red-contrib-iiot-opcua)
[![Build status](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/actions/workflows/build.yml/badge.svg)](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/actions/workflows/build.yml)
[![Test Coverage](badges/badge-lines.svg)](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/actions/workflows/summary.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/9a7257e1cd3c4b8ca4a3f8b30c00a78a)](https://www.codacy.com/gh/BiancoRoyal/node-red-contrib-iiot-opcua/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=BiancoRoyal/node-red-contrib-iiot-opcua&amp;utm_campaign=Badge_Grade)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua)

## The IoT/IIoT OPC UA toolbox package for [Node-RED][3] based on [node-opcua][4]

* tested with Node.js v16.15 and Node-RED v3.0.0
* tested with Node.js v14.19 and Node-RED v2.2.2
* based on node-opcua v2.64

The actual [DATATRONiQ][5] and [Iniationware][6] contributions to v4.x+ upgrade the original work of v3.x by migrating to TypeScript, breaking-changes,
and updating dependencies, including updates to new major release versions of Node-RED (v1.x to v2.x and higher) and node-opcua (v0.7 to v2.64 and higher).
Now [DATATRONiQ][5] and [Iniationware][6] working together and try to build a community from the industry and individuals to provide an LTS Industrial IoT package for OPC UA.

## International IIoT Website for Node-RED

For an international area, [Iniationware][6] has provided the [PLUS for Node-RED International][8] website.

## IIoT Webseite Deutschland für Node-RED

Für einen deutschsprachigen Bereich hat [Iniationware][6] die Webseite [PLUS for Node-RED Germany][7] bereitgestellt.

## Installing

### Node-RED
   Use the Node-RED "Manage Pallet" to install it via Node-RED

### Manual

1. Navigate to your Node-RED data directly. This defaults to `$HOME/.node-red/`
2. Install via npm.
   ```shell
   npm install node-red-contrib-iiot-opcua
   ```

## Migrating from previous versions

The update from v3.x to v4.x changed the way some nodes are implemented.
As a major version v4.x has breaking-changes. 

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

Every bit helps! If you come across any bugs, 
please [send a bug report](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/new?type=bug), 
or if you feel inclined to fix it yourself, [submit a pull request](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare).

### Debugging

To increase the verbosity of logging, enable debug modes and verbose logging.

Start debug with Node-RED in verbose (-v) mode to get a verbose logging:

    DEBUG=opcuaIIoT* npm run start -v 1>nodeREDIIoTOPCUA.log 2>&1



## Examples

### Basic Flow

![Flow Example](images/wiki/browser-listener-flow3-active.png)

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

### License

The BSD 3-Clause License

[DATATRONiQ][5], is the current maintainer 
of the [DATATRONiQ node-red-contrib-iiot-opcua detached Fork](https://github.com/DATATRONiQ/node-red-contrib-iiot-opcua)

This Node-RED package has been revitalized in 2022 and is based on the node-red-contrib-iiot-opcua package created by [Klaus Landsdorf][1] in 2017.
Copyright notices by Mika Karaila, Klaus Landsdorf, and others are to honor their work in previous years on Node-RED, 
OPC-UA, and node-red-contrib-iiot-opcua; we are very grateful for all the time and energy they've invested!!

[Klaus Landsdorf][1], creator and current maintainer of the Bianco-Royal node-red-contrib-iiot-opcua

That is a whole new Node-RED package started in 2017 based on the node-opcua v0.4 and the API documentation.
The old copyrights by Mika Karaila are just to honor his pioneer work in the years 2015/2016 for Node-RED and OPC UA.

### Important

This is **not** an official product of the OPC Foundation or Plattform Industrie 4.0.

### Special thanks

Special thanks go to [Etienne Rossignon][2] for the [node-opcua][4] packages and very special for the node-opcua-isa95 package!
Special thanks also go to [Klaus Landsdorf][1] for creating _node-red-contrib-iiot-opcua_ in the first place!

[1]:https://github.com/biancode
[2]:https://github.com/erossignon
[3]:https://github.com/node-red/node-red
[4]:https://github.com/node-opcua/node-opcua
[5]:https://github.com/DATATRONiQ
[6]:https://github.com/Iniationware
[7]:https://www.noderedplus.de/de/
[8]:https://www.noderedplus.de/
