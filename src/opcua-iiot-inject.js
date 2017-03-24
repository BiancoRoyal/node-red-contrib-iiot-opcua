/**
 The BSD 3-Clause License

 Copyright 2016, 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-opcua-iiot
 **/
'use strict'

module.exports = function (RED) {
  let cron = require('cron')

  function OPCUAIIoTInject (config) {
    RED.nodes.createNode(this, config)

    this.topic = config.topic
    this.payload = config.payload
    this.payloadType = config.payloadType
    this.repeat = config.repeat
    this.crontab = config.crontab
    this.once = config.once

    let node = this
    node.interval_id = null
    node.cronjob = null

    if (this.repeat && !isNaN(this.repeat) && this.repeat > 0) {
      this.repeat = this.repeat * 1000
      if (RED.settings.verbose) { this.log(RED._('opcuaiiotinject.repeat', this)) }
      this.interval_id = setInterval(function () {
        node.emit('input', {})
      }, this.repeat)
    } else if (this.crontab) {
      if (RED.settings.verbose) { this.log(RED._('opcuaiiotinject.crontab', this)) }
      this.cronjob = new cron.CronJob(this.crontab,
        function () {
          node.emit('input', {})
        },
        null, true)
    }

    if (this.once) {
      setTimeout(function () { node.emit('input', {}) }, 100)
    }

    this.on('input', function (msg) {
      try {
        msg.topic = this.topic
        if ((this.payloadType === null && this.payload === '') || this.payloadType === 'date') {
          msg.payload = Date.now()
        } else if (this.payloadType === null) {
          msg.payload = this.payload
        } else if (this.payloadType === 'none') {
          msg.payload = ''
        } else {
          msg.payload = RED.util.evaluateNodeProperty(this.payload, this.payloadType, this, msg)
        }
        this.send(msg)
        msg = null
      } catch (err) {
        this.error(err, msg)
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Inject', OPCUAIIoTInject)

  OPCUAIIoTInject.prototype.close = function () {
    if (this.interval_id !== null) {
      clearInterval(this.interval_id)
      if (RED.settings.verbose) { this.log(RED._('opcuaiiotinject.stopped')) }
    } else if (this.cronjob !== null) {
      this.cronjob.stop()
      if (RED.settings.verbose) { this.log(RED._('opcuaiiotinject.stopped')) }
      delete this.cronjob
    }
  }

  RED.httpAdmin.post('/opcuaiiotinject/:id', RED.auth.needsPermission('opcuaiiotinject.write'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    if (node !== null) {
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
