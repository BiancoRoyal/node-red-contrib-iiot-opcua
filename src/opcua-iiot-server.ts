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

interface OPCUAIIoTServer extends nodered.Node {
  asoDemo: string
}
interface OPCUAIIoTServerDef extends nodered.NodeDef {
  asoDemo: string
}

/**
 * Server Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED
  let coreServer = require('./core/opcua-iiot-core-server')

  function OPCUAIIoTServer (this: OPCUAIIoTServer, config: OPCUAIIoTServerDef) {
    RED.nodes.createNode(this, config)
    coreServer.internalDebugLog('Open Server Node')

    this.asoDemo = config.asoDemo // ASO (address space objects) Demo
    let node = coreServer.readConfigOfServerNode(this, config)
    node = coreServer.initServerNode(node)
    node = coreServer.loadNodeSets(node, __dirname)
    node = coreServer.loadCertificates(node)
    coreServer.core.assert(node.iiot)

    node.iiot.buildServerOptions = function () {
      let serverOptions = coreServer.buildServerOptions(node, 'Fix')
      serverOptions.userManager = {
        isValidUser: function (userName: string, password: string) {
          return coreServer.checkUser(node, userName, password)
        }
      }
      return coreServer.setDiscoveryOptions(node, serverOptions)
    }

    node.iiot.createServer = function (serverOptions: Todo) {
      if (RED.settings.verbose) {
        coreServer.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
      }
      node.iiot.opcuaServer = coreServer.createServerObject(node, serverOptions)
      coreServer.core.setNodeStatusTo(node, 'waiting')
      node.iiot.opcuaServer.initialize(node.iiot.postInitialize)
      coreServer.setOPCUAServerListener(node)
    }

    node.iiot.initNewServer = function () {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = node.iiot.buildServerOptions()
      serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)

      try {
        node.iiot.createServer(serverOptions)
      } catch (err) {
        node.emit('server_create_error')
        coreServer.handleServerError(node, err, { payload: 'Server Failure! Please, check the server settings!' })
      }
    }

    node.iiot.postInitialize = function () {
      coreServer.constructAddressSpace(node.iiot.opcuaServer, node.asoDemo)
        .then(function (err: Error) {
          if (err) {
            coreServer.handleServerError(node, err, { payload: 'Server Address Space Problem' })
          } else {
            coreServer.start(node.iiot.opcuaServer, node)
              .then(function () {
                coreServer.core.setNodeStatusTo(node, 'active')
                node.emit('server_running')
              }).catch(function (err: Error) {
                if (coreServer.core.isInitializedBiancoIIoTNode(node)) {
                  node.iiot.opcuaServer = null
                }
                node.emit('server_start_error')
                coreServer.core.setNodeStatusTo(node, 'errors')
                coreServer.handleServerError(node, err, { payload: 'Server Start Failure' })
              })
          }
        }).catch(function (err: Error) {
          coreServer.handleServerError(node, err, { payload: 'Server Address Space Failure' })
        })
    }

    node.iiot.initNewServer()

    node.on('input', function (msg: Todo) {
      if (!node.iiot.opcuaServer || !node.iiot.initialized) {
        coreServer.handleServerError(node, new Error('Server Not Ready For Inputs'), msg)
        return
      }

      switch (msg.injectType) {
        case 'ASO':
          node.iiot.changeAddressSpace(msg)
          break
        case 'CMD':
          node.iiot.executeOpcuaCommand(msg)
          break
        default:
          coreServer.handleServerError(node, new Error('Unknown Inject Type ' + msg.injectType), msg)
      }

      node.send(msg)
    })

    node.iiot.changeAddressSpace = function (msg: Todo) {
      // TODO: refactor to work with the new OPC UA type list and option to set add type
      if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Variable') > -1) {
        coreServer.addVariableToAddressSpace(node, msg, msg.payload.objecttype, false)
      } else if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Property') > -1) {
        coreServer.addVariableToAddressSpace(node, msg, msg.payload.objecttype, true)
      } else {
        coreServer.addObjectToAddressSpace(node, msg, msg.payload.objecttype)
      }
    }

    node.iiot.executeOpcuaCommand = function (msg: Todo) {
      switch (msg.commandType) {
        case 'restart':
          node.iiot.restartServer()
          break
        case 'deleteNode':
          coreServer.deleteNOdeFromAddressSpace(node, msg)
          break
        default:
          coreServer.handleServerError(node, new Error('Unknown OPC UA Command'), msg)
      }
    }

    node.iiot.restartServer = function () {
      coreServer.internalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node)

      if (node.iiot.opcuaServer) {
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    node.on('close', (done: () => void) => {
      node.iiot.closeServer(() => {
        coreServer.internalDebugLog('Close Server Node')
        coreServer.core.resetBiancoNode(node)
        done()
      })
    })

    node.on('shutdown', () => {
      node.iiot.opcuaServer = null
      node.iiot.initNewServer()
    })

    node.iiot.closeServer = function (done: () => void) {
      coreServer.destructAddressSpace(() => {
        node.iiot.opcuaServer.removeAllListeners()
        node.iiot.opcuaServer.shutdown(node.delayToClose, done)
      })
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)
}
