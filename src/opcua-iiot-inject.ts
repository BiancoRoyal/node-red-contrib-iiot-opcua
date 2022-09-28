/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-iiot-opcua
 **/
'use strict'
import * as nodered from "node-red";
import {NodeMessageInFlow} from "node-red";
import {TodoTypeAny} from "./types/placeholders";
import coreInject from "./core/opcua-iiot-core-inject";
import {resetIiotNode, IotOpcUaNodeMessage} from "./core/opcua-iiot-core";
import {CronJob} from 'cron';
import {AddressSpaceItem} from "./types/helpers";

interface OPCUAIIoTInject extends nodered.Node {
  name: string
  topic: string
  payload: any
  payloadType: TodoTypeAny
  repeat: number
  crontab: string
  once: TodoTypeAny
  startDelay: number
  injectType: string
  addressSpaceItems: Array<AddressSpaceItem>
}

interface OPCUAIIoTInjectConfigurationDef extends nodered.NodeDef {
  name: string
  topic: string
  payload: string
  payloadType: string
  repeat: number
  crontab: string
  once: boolean
  startDelay: string
  injectType: string
  addressSpaceItems: Array<AddressSpaceItem>
}

export interface InjectMessage extends NodeMessageInFlow {
  payload: InjectPayload
}

export interface InjectPayload extends IotOpcUaNodeMessage {
  nodetype: 'inject' | string // Todo: fix typo to nodeType with version 5.x - first we need the cli tools working for version migrations
}

/**
 * Inject Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */

module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTInject(this: OPCUAIIoTInject, config: OPCUAIIoTInjectConfigurationDef) {
    RED.nodes.createNode(this, config)

    this.topic = config.topic
    this.payload = config.payload
    this.payloadType = config.payloadType
    this.crontab = config.crontab
    this.once = config.once
    this.startDelay = parseFloat(config.startDelay) || 10
    this.name = config.name
    this.injectType = config.injectType || 'inject'
    this.repeat = config.repeat || 0

    this.addressSpaceItems = config.addressSpaceItems || []

    let self: TodoTypeAny = this

    let intervalId: NodeJS.Timer | null = null
    let onceTimeout: NodeJS.Timeout | null = null
    let cronjob: CronJob | null = null
    const REPEAT_FACTOR = 1000.0
    const ONE_SECOND = 1000
    const INPUT_TIMEOUT_MILLISECONDS = 1000

    const repeaterSetup = () => {
      coreInject.internalDebugLog('Repeat Is ' + self.repeat)
      coreInject.internalDebugLog('Crontab Is ' + self.crontab)
      if (self.repeat !== 0) {
        self.repeat = config.repeat * REPEAT_FACTOR

        if (self.repeat === 0) {
          self.repeat = ONE_SECOND
        }

        coreInject.internalDebugLog('Repeat Interval Start With ' + self.repeat + ' msec.')

        // existing interval timer must be deleted
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }

        if (typeof self.repeat !== "number" || isNaN(self.repeat)) return;

        intervalId = setInterval(() => {
          this.emit('input', newMessage())
        }, self.repeat)

      } else if (self.crontab !== '') {
        cronjob = new CronJob(self.crontab,
          () => {
            this.emit('input', newMessage())
          },
          null,
          true)
      }
    }

    const newMessage = function () {
      return {
        _msgid: RED.util.generateId(),
        payload: {
          injectType: self.injectType
        }
      }
    }

    // existing timers must be deleted
    const resetAllTimer = function () {
      if (onceTimeout) {
        clearTimeout(onceTimeout)
        onceTimeout = null
      }

      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const generateOutputValue = (payloadType: string, inputMessage: NodeMessageInFlow) => {
      switch (payloadType) {
        case 'none':
          return ''
        case 'str':
          return self.payload.toString()
        case 'num':
          return Number(self.payload)
        case 'bool':
          return (self.payload === true || self.payload === 'true')
        case 'json':
          return JSON.parse(self.payload)
        case 'date':
          return Date.now()
        default:
          if (self.payloadType === null) {
            if (self.payload === '') {
              return Date.now()
            } else {
              return self.payload
            }
          } else {
            return RED.util.evaluateNodeProperty(self.payload, self.payloadType, this, inputMessage)
          }
      }
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      if (Object.keys(msg).length === 0) {
        // security: never use a completely empty message with any key, this is not a valid node-red msg than
        return;
      }

      try {
        const topic = self.topic || msg.topic

        const payload: InjectPayload = {
          payload: msg.payload,
          payloadType: self.payloadType,
          value: generateOutputValue(self.payloadType, msg),
          nodetype: 'inject',
          injectType: (msg.payload as TodoTypeAny)?.injectType || self.injectType,
          addressSpaceItems: [...self.addressSpaceItems],
          manualInject: Object.keys(msg).length !== 0
        }

        const outputMessage: NodeMessageInFlow = {
          ...msg,
          topic,
          payload,
        }
        this.send(outputMessage)
      } catch (err) {
        /* istanbul ignore next */
        if (RED.settings.verbose) {
          this.error(err, msg)
        }
      }
    })

    // existing timer must be deleted
    if (onceTimeout) {
      clearTimeout(onceTimeout)
      onceTimeout = null
    }

    let timeout = INPUT_TIMEOUT_MILLISECONDS * self.startDelay

    if (this.once) {
      coreInject.detailDebugLog('injecting once at start delay timeout ' + timeout + ' msec.')
      onceTimeout = setTimeout(  () => {
        coreInject.detailDebugLog('injecting once at start')
        this.emit('input', newMessage())
        repeaterSetup()
      }, timeout)
    } else if (self.repeat || self.crontab) {
      coreInject.detailDebugLog('start with delay timeout ' + timeout + ' msec.')
      onceTimeout = setTimeout(function () {
        coreInject.detailDebugLog('had a start delay of ' + timeout + ' msec. to setup inject interval')
        repeaterSetup()
      }, timeout)
    } else {
      repeaterSetup()
    }

    this.close = async (removed: boolean) => {
      if (cronjob) {
        cronjob.stop()
        delete self['cronjob']
      }

      await resetAllTimer() // all timers have to be reset

      resetIiotNode(self)
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Inject', OPCUAIIoTInject)

  RED.httpAdmin.post('/opcuaIIoT/inject/:id', RED.auth.needsPermission('opcuaIIoT.inject.write'), function (req, res) {
    const node = RED.nodes.getNode(req.params.id)
    if (node) {
      try {
        node.receive()
        res.sendStatus(200)
      } catch (err: any) {
        /* istanbul ignore next */
        res.sendStatus(500)
        node.error(RED._('opcuaiiotinject.failed', {error: err.toString()}))
      }
    } else {
      /* istanbul ignore next */
      res.sendStatus(404)
    }
  })
}
