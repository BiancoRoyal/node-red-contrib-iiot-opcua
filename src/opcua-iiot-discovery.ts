/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {NodeMessageInFlow} from "node-red";
import {Todo} from "./types/placeholders";
import coreDiscovery from "./core/opcua-iiot-core-discovery";
import {
  ApplicationType,
  extractFullyQualifiedDomainName,
  makeApplicationUrn,
  OPCUACertificateManager,
  OPCUADiscoveryServer,
  OPCUAServerEndPoint
} from "node-opcua";
import path from "path";
import {ApplicationDescription} from "node-opcua-service-endpoints";

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

  function OPCUAIIoTDiscovery(this: OPCUAIIoTDiscovery, config: OPCUAIIoTDiscoveryDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.discoveryPort = config.discoveryPort || coreDiscovery.DEFAULT_OPCUA_DISCOVERY_PORT

    let node: Todo = this

    const startDiscoveryServer = async () => {

      const certificateFolder = '../certificates'

      const serverCertificateManager = new OPCUACertificateManager({
        automaticallyAcceptUnknownCertificate: true,
        rootFolder: certificateFolder,
        name: "pki"
      });

      const certificateFile = path.join(certificateFolder, "discoveryServer_cert_2048.pem");
      const privateKeyFile = serverCertificateManager.privateKey

      await serverCertificateManager.initialize()

      const discoveryServer = new OPCUADiscoveryServer({
        certificateFile,
        privateKeyFile,
        serverCertificateManager,
        serverInfo: {
          applicationUri: makeApplicationUrn(await extractFullyQualifiedDomainName(), node.name || 'discovery'),
        },
        port: node.discoveryPort,
        // certificateFile: '../certificates/discoveryServer_cert_2048.pem',
        // automaticallyAcceptUnknownCertificates: true,
      })

      try {
        await discoveryServer.start()
        this.status({fill: 'green', shape: 'dot', text: 'active'})
        coreDiscovery.internalDebugLog('discovery server started')
      } catch (err: Todo) {
        this.status({fill: 'red', shape: 'dot', text: 'error'})
        this.error(new Error('Error starting discovery server: ' + err.message))
      }

      return discoveryServer
    }



    this.status({fill: 'yellow', shape: 'ring', text: 'starting'})

    node.discoveryServer = startDiscoveryServer().then((server) => {
      this.status({fill: 'green', shape: 'dot', text: 'active'})
      return server
    }).catch((err) => {
      this.status({fill: 'red', shape: 'dot', text: 'error'})
      this.error(new Error('Error starting discovery server: ' + err.message))
      return undefined
    })

    const applicationTypeToString = (applicationType: ApplicationType): string => {
      return ApplicationType[applicationType]

    }

    const parseServerList = (serverList: ApplicationDescription[]): {discoveryUrls: string[], endpoints: Todo[]} => {
      const endpoints = serverList.map((server) => {
        return {
          applicationUri: server.applicationUri,
          productUri: server.productUri,
          applicationName: server.applicationName,
          applicationType: applicationTypeToString(server.applicationType),
          gatewayServerUri: server.gatewayServerUri,
          discoveryProfileUri: server.discoveryProfileUri,
          discoveryUrls: server.discoveryUrls,
        }
      });

      const discoveryUrls = endpoints.flatMap((server) => (server.discoveryUrls || '').toString()).filter((item, index, list) => item !== '' && list.indexOf(item) === index)

      return {
        discoveryUrls,
        endpoints,
      }
    }

    this.on('input', async (msg) => {
      const discoveryServer: OPCUADiscoveryServer = await node.discoveryServer

      if (!discoveryServer) {
        const error = new Error('Discovery server undefined')
        this.error(error)
        this.send({
          ...msg,
          payload: error.toString()
        })
        return
      }

      // ts-ignore required
      // @ts-ignore required to access discoveryServer.getServers() without arguments
      const {discoveryUrls, endpoints} = parseServerList(discoveryServer.getServers())

      const outputMessage: DiscoveryMessage = {
        ...msg,
        payload: {
          discoveryUrls,
          endpoints
        }
      }
      this.send(outputMessage)
    })

    this.on('close', function (done: () => void) {
      if (node.discoveryServer) {
        node.discoveryServer.shutdown(function () {
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
