/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {server: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.server
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {server: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.core = de.biancoroyal.opcua.iiot.core.server.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.internalDebugLog = de.biancoroyal.opcua.iiot.core.server.internalDebugLog || require('debug')('opcuaIIoT:server') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.simulatorInterval = de.biancoroyal.opcua.iiot.core.server.simulatorInterval || null // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.timeInterval = de.biancoroyal.opcua.iiot.core.server.timeInterval || 1 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.name = de.biancoroyal.opcua.iiot.core.server.name || 'server' // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.server.simulateVariation = function (data) {
  let value = (1.0 + Math.sin(de.biancoroyal.opcua.iiot.core.server.timeInterval / 360 * 3)) / 2.0
  de.biancoroyal.opcua.iiot.core.server.timeInterval++
  /*
   de.biancoroyal.opcua.iiot.core.server.internalDebugLog(de.biancoroyal.opcua.iiot.core.server.name +
   ' Simulation Timer Interval ' + de.biancoroyal.opcua.iiot.core.server.timeInterval)
   */

  if (de.biancoroyal.opcua.iiot.core.server.timeInterval > 500000) {
    de.biancoroyal.opcua.iiot.core.server.timeInterval = 1
  }

  data.tankLevel.setValueFromSource({dataType: 'Double', value: value})
  data.tankLevel2.setValueFromSource({dataType: 'Double', value: value})
  // de.biancoroyal.opcua.iiot.core.server.internalDebugLog('Simulation Tank Level ' + value)
}

de.biancoroyal.opcua.iiot.core.server.constructAddressSpace = function (server) {
  let coreServer = de.biancoroyal.opcua.iiot.core.server
  let addressSpace = server.engine.addressSpace

  let constructAlarmAddressSpaceDemo = require('../helpers/alarms-and-conditions-demo').constructAlarmAddressSpaceDemo
  let data = {}
  constructAlarmAddressSpaceDemo(data, addressSpace)

  de.biancoroyal.opcua.iiot.core.server.timeInterval = 1
  de.biancoroyal.opcua.iiot.core.server.simulatorInterval = setInterval(function () {
    de.biancoroyal.opcua.iiot.core.server.simulateVariation(data)
  }, 500)

  let vendorName = addressSpace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    nodeId: 'ns=4;s=VendorName',
    browseName: 'BiancoRoyal',
    displayName: 'Bianco Royal'
  })

  let variable1 = 1
  setInterval(function () {
    if (variable1 < 1000000) {
      variable1 += 1
    } else {
      variable1 = 0
    }
  }, 100)

  addressSpace.addVariable({
    componentOf: vendorName,
    browseName: 'MyVariable1',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.Double,
          value: variable1
        })
      }
    }
  })

  let variable2 = 10.0

  server.engine.addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=1;b=1020FFAA',
    browseName: 'MyVariable2',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.Double,
          value: variable2
        })
      },
      set: function (variant) {
        variable2 = parseFloat(variant.value)
        return coreServer.core.nodeOPCUA.StatusCodes.Good
      }
    }
  })

  let variable3 = 1000.0

  server.engine.addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=1;s=TestReadWrite',
    browseName: 'TestReadWrite',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.Double,
          value: variable3
        })
      },
      set: function (variant) {
        variable3 = parseFloat(variant.value)
        return coreServer.core.nodeOPCUA.StatusCodes.Good
      }
    }
  })

  addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=4;s=free_memory',
    browseName: 'FreeMemory',
    dataType: coreServer.core.nodeOPCUA.DataType.Double,

    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.Double,
          value: coreServer.core.availableMemory()
        })
      }
    }
  })

  let counterValue = 0
  setInterval(function () {
    if (counterValue < 65000) {
      counterValue += 1
    } else {
      counterValue = 0
    }
  }, 1000)

  addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=4;s=Counter',
    browseName: 'Counter',
    dataType: coreServer.core.nodeOPCUA.DataType.UInt16,

    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.UInt16,
          value: counterValue
        })
      }
    }
  })

  let method = addressSpace.addMethod(
    vendorName, {
      browseName: 'Bark',

      inputArguments: [
        {
          name: 'nbBarks',
          description: {text: 'specifies the number of time I should bark'},
          dataType: coreServer.core.nodeOPCUA.DataType.UInt32
        }, {
          name: 'volume',
          description: {text: 'specifies the sound volume [0 = quiet ,100 = loud]'},
          dataType: coreServer.core.nodeOPCUA.DataType.UInt32
        }
      ],

      outputArguments: [{
        name: 'Barks',
        description: {text: 'the generated barks'},
        dataType: coreServer.core.nodeOPCUA.DataType.String,
        valueRank: 1
      }]
    })

  method.bindMethod(function (inputArguments, context, callback) {
    let nbBarks = inputArguments[0].value
    let volume = inputArguments[1].value
    let soundVolume = new Array(volume).join('!')
    let barks = []

    for (let i = 0; i < nbBarks; i++) {
      barks.push('Whaff' + soundVolume)
    }

    let callMethodResult = {
      statusCode: coreServer.core.nodeOPCUA.StatusCodes.Good,
      outputArguments: [{
        dataType: coreServer.core.nodeOPCUA.DataType.String,
        arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Array,
        value: barks
      }]
    }
    callback(null, callMethodResult)
  })
}

module.exports = de.biancoroyal.opcua.iiot.core.server
