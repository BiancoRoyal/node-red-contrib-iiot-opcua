/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";
import coreDiscovery from "./core/opcua-iiot-core-discovery";
import {OPCUADiscoveryServer, OPCUAServerEndPoint} from "node-opcua";
import {InjectMessage} from "./opcua-iiot-inject";
import {NodeMessageInFlow} from "node-red";
interface OPCUAIIoTDiscovery extends nodered.Node {
  discoveryPort: number
  bianco?: Todo
}
interface OPCUAIIoTDiscoveryDef extends nodered.NodeDef {
  discoveryPort: number
}

export interface DiscoveryMessage extends NodeMessageInFlow {
  payload: DiscoveryMessagePayload
}

interface DiscoveryMessagePayload {
  discoveryUrls: string[]
  endpoints: OPCUAServerEndPoint[]
}
/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTDiscovery (this: OPCUAIIoTDiscovery, config: OPCUAIIoTDiscoveryDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.discoveryPort = config.discoveryPort || coreDiscovery.DEFAULT_OPCUA_DISCOVERY_PORT

    let node = this

    const discoveryServer = new OPCUADiscoveryServer({ port: node.discoveryPort })

    this.status({ fill: 'yellow', shape: 'ring', text: 'starting' })

    coreDiscovery.detailDebugLog('discovery endpoints:' + discoveryServer._get_endpoints())

    discoveryServer.start(() => {
      coreDiscovery.internalDebugLog('discovery server started')
      this.status({ fill: 'green', shape: 'dot', text: 'active' })
    })

    this.on('input', (msg) => {
      const outputMessage: DiscoveryMessage = {
        ...msg,
        payload: {
          discoveryUrls: discoveryServer.getDiscoveryUrls() || [],
          endpoints: discoveryServer.endpoints || []
        }
      }
      this.send(outputMessage)
    })

    this.on('close', function (done: () => void) {
      if (discoveryServer) {
        discoveryServer.shutdown(function () {
          coreDiscovery.internalDebugLog('shutdown')
          done()
        })
      } else {
        done()
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Discovery', OPCUAIIoTDiscovery)
}
