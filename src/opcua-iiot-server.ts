/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
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
    let self: Todo = this;
    coreServer.readConfigOfServerNode(this, config)
    coreServer.initServerNode(self)
    coreServer.loadNodeSets(self, __dirname)
    // node = coreServer.loadCertificates(node)

    const initNewServer = () => {
      self = coreServer.initRegisterServerMethod(self)
      let serverOptions = coreServer.buildGeneralServerOptions(self, 'Fix')

      try {
        coreServer.createServer(self, serverOptions, postInitialize, statusHandler, RED.settings.verbose)
      } catch (err) {
        this.emit('server_create_error')
        handleServerError(err as Error, {payload: 'Server Failure! Please, check the server settings!'})
      }
    }

    const handleServerError = (err: Error, msg: Todo) => {
      coreServer.internalDebugLog(err)
      if (self.showErrors) {
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
      coreServer.constructAddressSpace(self.iiot.opcuaServer, self.asoDemo)
        .then((err: Todo) => {
          if (err) {
            handleServerError(err, {payload: 'Server Address Space Problem'})
          } else {
            coreServer.start(self.iiot.opcuaServer, self)
              .then(() => {
                self.oldStatusParameter = setNodeStatusTo(self, 'active', self.oldStatusParameter, self.showStatusActivities, statusHandler)
                this.emit('server_running')
              }).catch((err: Error) => {
              if (isInitializedIIoTNode(self)) {
                self.iiot.opcuaServer = null
              }
              this.emit('server_start_error')
              self.oldStatusParameter = setNodeStatusTo(self, 'errors', self.oldStatusParameter, self.showStatusActivities, statusHandler)
              handleServerError(err, {payload: 'Server Start Failure'})
            })
          }
        }).catch(function (err: Error) {
        handleServerError(err, {payload: 'Server Address Space Failure'})
      })
    }

    initNewServer()

    this.on('input', (msg: Todo) => {
      if (!self.iiot.opcuaServer || !self.iiot.initialized) {
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
        coreServer.addVariableToAddressSpace(self, msg, msg.payload.objecttype, false, handleServerError)
      } else if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Property') > -1) {
        coreServer.addVariableToAddressSpace(self, msg, msg.payload.objecttype, true, handleServerError)
      } else {
        coreServer.addObjectToAddressSpace(self, msg, msg.payload.objecttype, handleServerError)
      }
    }

    const executeOpcuaCommand = (msg: Todo) => {
      switch (msg.payload.commandType) {
        case 'restart':
          restartServer()
          break
        case 'deleteNode':
          coreServer.deleteNodeFromAddressSpace(self, msg, handleServerError)
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
      coreServer.restartServer(self, statusHandler, emitHandler, sendHandler)

      if (self.iiot.opcuaServer) {
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    this.on('close', (done: () => void) => {
      closeServer(() => {
        coreServer.internalDebugLog('Close Server Node')
        resetIiotNode(self)
        done()
      })
    })

    this.on('shutdown', () => {
      this.status({fill: 'yellow', shape: 'dot', text: 'restarting'})
      closeServer(() => {
        coreServer.internalDebugLog('Server Node Shutdown')
      })
      self.iiot.opcuaServer = null
      initNewServer()
    })

    const closeServer = (done: () => void) => {
      coreServer.destructAddressSpace(() => {
        self.iiot.opcuaServer.removeAllListeners()
        self.iiot.opcuaServer.shutdown(self.delayToClose, done)
      })
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)
}
