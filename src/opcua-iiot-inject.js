/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-iiot-opcua
 **/
'use strict'

/**
 * Inject Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */

module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreInject = require('./core/opcua-iiot-core-inject')
  let cron = require('cron')

  function OPCUAIIoTInject (config) {
    RED.nodes.createNode(this, config)

    this.topic = config.topic
    this.payload = config.payload
    this.payloadType = config.payloadType
    this.repeat = config.repeat
    this.crontab = config.crontab
    this.once = config.once
    this.startDelay = parseFloat(config.startDelay) || 10
    this.name = config.name
    this.injectType = config.injectType || 'inject'

    this.addressSpaceItems = config.addressSpaceItems || []

    let node = this
    node.interval_id = null
    node.cronjob = null
    node.REPEAT_FACTOR = 1000.0
    node.ONE_SECOND = 1000
    node.INPUT_TIMEOUT_MILLISECONDS = 1000

    node.verboseLog = function (logMessage) {
      if (RED.settings.verbose) {
        coreInject.internalDebugLog(logMessage)
      }
    }

    node.repeaterSetup = function () {
      coreInject.internalDebugLog('Repeat Is ' + node.repeat)
      coreInject.internalDebugLog('Crontab Is ' + node.crontab)

      if (node.repeat !== '') {
        node.repeat = parseFloat(config.repeat) * node.REPEAT_FACTOR

        if (node.repeat === 0) {
          node.repeat = node.ONE_SECOND
        }
        node.verboseLog(RED._('opcuaiiotinject.repeat', node))
        coreInject.internalDebugLog('Repeat Interval Start With ' + node.repeat + ' msec.')

        if (node.interval_id) {
          clearInterval(node.interval_id)
        }

        node.interval_id = setInterval(function () {
          node.emit('input', {})
        }, node.repeat)
      } else if (node.crontab !== '') {
        node.verboseLog(RED._('opcuaiiotinject.crontab', node))

        node.cronjob = new cron.CronJob(node.crontab,
          function () {
            node.emit('input', {})
          },
          null,
          true)
      }
    }

    node.on('input', function (msg) {
      try {
        msg.topic = node.topic
        msg.nodetype = 'inject'
        msg.injectType = node.injectType
        msg.addressSpaceItems = []
        Object.assign(msg.addressSpaceItems, node.addressSpaceItems)

        switch (node.payloadType) {
          case 'none':
            msg.payload = ''
            break
          case 'str':
            msg.payload = node.payload.toString()
            break
          case 'num':
            msg.payload = Number(node.payload)
            break
          case 'bool':
            msg.payload = (node.payload === true || node.payload === 'true')
            break
          case 'json':
            msg.payload = JSON.parse(node.payload)
            break
          case 'date':
            msg.payload = Date.now()
            break
          default:
            if (node.payloadType === null) {
              if (node.payload === '') {
                msg.payload = Date.now()
              } else {
                msg.payload = node.payload
              }
            } else {
              msg.payload = RED.util.evaluateNodeProperty(node.payload, node.payloadType, this, msg)
            }
        }

        node.send(msg)
      } catch (err) {
        node.verboseLog(err)
        if (RED.settings.verbose) {
          node.error(err, msg)
        }
      }
    })

    if (node.once) {
      let timeout = parseInt(node.INPUT_TIMEOUT_MILLISECONDS * node.startDelay)
      coreInject.internalDebugLog('injecting once at start delay timeout ' + timeout + ' msec.')
      node.onceTimeout = setTimeout(function () {
        coreInject.internalDebugLog('injecting once at start')
        node.emit('input', {})
        node.repeaterSetup()
      }, timeout)
    } else {
      node.repeaterSetup()
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Inject', OPCUAIIoTInject)

  OPCUAIIoTInject.prototype.close = function () {
    let node = this

    if (node.onceTimeout) {
      clearTimeout(node.onceTimeout)
    }

    if (node.interval_id) {
      clearInterval(node.interval_id)
      node.verboseLog(RED._('opcuaiiotinject.stopped'))
    }

    if (node.cronjob) {
      node.cronjob.stop()
      node.verboseLog(RED._('opcuaiiotinject.stopped'))
      delete node.cronjob
    }
  }

  RED.httpAdmin.post('/opcuaIIoT/inject/:id', RED.auth.needsPermission('opcuaIIoT.inject.write'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)

    if (node) {
      try {
        node.receive()
        res.sendStatus(200)
      } catch (err) {
        res.sendStatus(500)
        node.error(RED._('opcuaiiotinject.failed', {error: err.toString()}))
      }
    } else {
      res.sendStatus(404)
    }
  })
}
