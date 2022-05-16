/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {NodeMessage, NodeStatus} from "node-red";
import {Todo} from "./types/placeholders";
import coreServer from "./core/opcua-iiot-core-server";
import {isInitializedIIoTNode, resetIiotNode, setNodeStatusTo} from "./core/opcua-iiot-core";

type OPCUAIIoTServer = nodered.Node & {
  asoDemo: boolean
  on(event: 'shutdown', listener: () => void): void
}

interface OPCUAIIoTServerDef extends nodered.NodeDef {
  asoDemo: boolean
}

/**
 * Server Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTServer(this: OPCUAIIoTServer, config: OPCUAIIoTServerDef) {
    RED.nodes.createNode(this, config)
    coreServer.internalDebugLog('Open Server Node')

    this.asoDemo = config.asoDemo // ASO (address space objects) Demo
    let node: Todo = this;
    coreServer.readConfigOfServerNode(this, config)
    coreServer.initServerNode(node)
    coreServer.loadNodeSets(node, __dirname)
    // node = coreServer.loadCertificates(node)

    const initNewServer = () => {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = coreServer.buildGeneralServerOptions(node, 'Fix')

      try {
        coreServer.createServer(node, serverOptions, postInitialize, statusHandler, RED.settings.verbose)
      } catch (err) {
        this.emit('server_create_error')
        handleServerError(err as Error, {payload: 'Server Failure! Please, check the server settings!'})
      }
    }

    const handleServerError = (err: Error, msg: Todo) => {
      internalDebugLog(err)
      if (node.showErrors) {
        this.error(err, msg)
      }
    }

    const statusHandler = (status: string | NodeStatus) => {
      this.status(status)
    }

    const errorHandler = (err: any, msg?: NodeMessage) => {
      this.error(err, msg)
    }

    const postInitialize = () => {
      coreServer.constructAddressSpace(node.iiot.opcuaServer, node.asoDemo)
        .then((err: Todo) => {
          if (err) {
            handleServerError(err, {payload: 'Server Address Space Problem'})
          } else {
            coreServer.start(node.iiot.opcuaServer, node)
              .then(() => {
                node.oldStatusParameter = setNodeStatusTo(node, 'active', node.oldStatusParameter, node.showStatusActivities, statusHandler)
                this.emit('server_running')
              }).catch((err: Error) => {
              if (isInitializedIIoTNode(node)) {
                node.iiot.opcuaServer = null
              }
              this.emit('server_start_error')
              node.oldStatusParameter = setNodeStatusTo(node, 'errors', node.oldStatusParameter, node.showStatusActivities, statusHandler)
              handleServerError(err, {payload: 'Server Start Failure'})
            })
          }
        }).catch(function (err: Error) {
        handleServerError(err, {payload: 'Server Address Space Failure'})
      })
    }

    initNewServer()

    this.on('input', (msg: Todo) => {
      if (!node.iiot.opcuaServer || !node.iiot.initialized) {
        handleServerError(new Error('Server Not Ready For Inputs'), msg)
        return
      }

      switch (msg.payload.injectType) {
        case 'ASO':
          changeAddressSpace(msg)
          break
        case 'CMD':
          executeOpcuaCommand(msg)
          break
        default:
          handleServerError(new Error('Unknown Inject Type ' + msg.injectType), msg)
      }

      this.send(msg)
    })

    const changeAddressSpace = (msg: Todo) => {
      // TODO: refactor to work with the new OPC UA type list and option to set add type
      if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Variable') > -1) {
        coreServer.addVariableToAddressSpace(node, msg, msg.payload.objecttype, false, handleServerError)
      } else if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Property') > -1) {
        coreServer.addVariableToAddressSpace(node, msg, msg.payload.objecttype, true, handleServerError)
      } else {
        coreServer.addObjectToAddressSpace(node, msg, msg.payload.objecttype, handleServerError)
      }
    }

    const executeOpcuaCommand = (msg: Todo) => {
      switch (msg.payload.commandType) {
        case 'restart':
          restartServer()
          break
        case 'deleteNode':
          coreServer.deleteNodeFromAddressSpace(node, msg, handleServerError)
          break
        default:
          handleServerError(new Error('Unknown OPC UA Command'), msg)
      }
    }

    const sendHandler = (msg: Todo) => {
      this.send(msg)
    }

    const emitHandler = (eventName: string | symbol, ...args: any[]) => {
      this.emit(eventName, ...args)
    }

    const restartServer = () => {
      coreServer.internalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node, statusHandler, emitHandler, sendHandler)

      if (node.iiot.opcuaServer) {
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    this.on('close', (done: () => void) => {
      closeServer(() => {
        coreServer.internalDebugLog('Close Server Node')
        resetIiotNode(node)
        done()
      })
    })

    this.on('shutdown', () => {
      this.status({fill: 'yellow', shape: 'dot', text: 'restarting'})
      closeServer(() => {
        coreServer.internalDebugLog('Server Node Shutdown')
      })
      node.iiot.opcuaServer = null
      initNewServer()
    })

    const closeServer = (done: () => void) => {
      coreServer.destructAddressSpace(() => {
        node.iiot.opcuaServer.removeAllListeners()
        node.iiot.opcuaServer.shutdown(node.delayToClose, done)
      })
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)
}
