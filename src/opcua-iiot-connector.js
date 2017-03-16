/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  function OPCUAIIoTConnectorConfiguration (config) {
    RED.nodes.createNode(this, config)

    this.endpoint = config.endpoint
    this.loginEnabled = config.loginEnabled

    let node = this

    if (this.credentials && node.loginEnabled) {
      this.user = this.credentials.user
      this.password = this.credentials.password
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Connector', OPCUAIIoTConnectorConfiguration, {
    credentials: {
      user: {type: 'text'},
      password: {type: 'password'}
    }
  })
}
