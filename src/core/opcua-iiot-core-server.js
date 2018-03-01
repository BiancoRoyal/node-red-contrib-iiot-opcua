/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

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
de.biancoroyal.opcua.iiot.core.server.detailDebugLog = de.biancoroyal.opcua.iiot.core.server.detailDebugLog || require('debug')('opcuaIIoT:server:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.flex = de.biancoroyal.opcua.iiot.core.server.flex || {} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.flex.internalDebugLog = de.biancoroyal.opcua.iiot.core.server.flex.internalDebugLog || require('debug')('opcuaIIoT:server:flex') // eslint-disable-line no-use-before-define
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

de.biancoroyal.opcua.iiot.core.server.constructAddressSpaceFromScript = function (server, constructAddressSpaceScript, eventObjects) {
  de.biancoroyal.opcua.iiot.core.server.flex.internalDebugLog('Construct Address Space From Script')

  if (server.engine && constructAddressSpaceScript && constructAddressSpaceScript !== '') {
    constructAddressSpaceScript(de.biancoroyal.opcua.iiot.core.server.flex, server.engine.addressSpace, eventObjects)
  }
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
    nodeId: 'ns=4;i=1234',
    browseName: 'BiancoRoyal',
    displayName: 'Bianco Royal',
    description: 'Bianco Royal - Software Innovations®'
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
    nodeId: 'ns=4;i=16479',
    browseName: 'MyVariable1',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          value: variable1
        })
      }
    }
  })

  let variable2 = 10.0

  server.engine.addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=4;b=1020FFAA',
    browseName: 'MyVariable2',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
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
    nodeId: 'ns=4;s=TestReadWrite',
    browseName: 'TestReadWrite',
    displayName: 'Test Read and Write',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          value: variable3
        })
      },
      set: function (variant) {
        variable3 = parseFloat(variant.value)
        return coreServer.core.nodeOPCUA.StatusCodes.Good
      }
    }
  })

  let memoryVariable = addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=4;s=free_memory',
    browseName: 'FreeMemory',
    displayName: 'Free Memory',
    dataType: 'Double',

    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          value: coreServer.core.availableMemory()
        })
      }
    }
  })
  addressSpace.installHistoricalDataNode(memoryVariable)

  let counterValue = 0
  setInterval(function () {
    if (counterValue < 65000) {
      counterValue += 1
    } else {
      counterValue = 0
    }
  }, 1000)

  let counterVariable = addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=4;s=Counter',
    browseName: 'Counter',
    dataType: 'UInt16',

    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'UInt16',
          value: counterValue
        })
      }
    }
  })
  addressSpace.installHistoricalDataNode(counterVariable)

  let fullcounterValue = 0
  setInterval(function () {
    if (fullcounterValue < 100000) {
      fullcounterValue += 1
    } else {
      fullcounterValue = -100000
    }
  }, 1000)

  let fullcounterVariable = addressSpace.addVariable({
    componentOf: vendorName,
    nodeId: 'ns=4;s=FullCounter',
    browseName: 'FullCounter',
    dataType: 'Int32',

    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Int32',
          value: fullcounterValue
        })
      }
    }
  })
  addressSpace.installHistoricalDataNode(fullcounterVariable)

  let externalValueWithSourceTimestamp = new coreServer.core.nodeOPCUA.DataValue({
    value: new coreServer.core.nodeOPCUA.Variant({dataType: 'Double', value: 10.0}),
    sourceTimestamp: null,
    sourcePicoseconds: 0
  })

  setInterval(function () {
    externalValueWithSourceTimestamp.value.value = Math.random()
    externalValueWithSourceTimestamp.sourceTimestamp = new Date()
  }, 1000)

  addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=Pressure',
    browseName: 'Pressure',
    dataType: 'Double',
    value: {
      timestamped_get: function () {
        return externalValueWithSourceTimestamp
      }
    }
  })

  addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=Matrix',
    browseName: 'Matrix',
    dataType: 'Double',
    valueRank: 2,
    arrayDimensions: [3, 3],
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Matrix,
          dimensions: [3, 3],
          value: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        })
      }
    }
  })

  addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=Position',
    browseName: 'Position',
    dataType: 'Double',
    valueRank: 1,
    arrayDimensions: null,
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Array,
          value: [1, 2, 3, 4]
        })
      }
    }
  })

  addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=PumpSpeed',
    browseName: 'PumpSpeed',
    displayName: 'Pump Speed',
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          value: 200 + 100 * Math.sin(Date.now() / 10000)
        })
      }
    }
  })

  addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=SomeDate',
    browseName: 'SomeDate',
    displayName: 'Some Date',
    dataType: 'DateTime',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.DateTime,
          value: new Date(Date.UTC(2016, 9, 13, 8, 40, 0))
        })
      }
    }
  })

  addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=MultiLanguageText',
    browseName: 'MultiLanguageText',
    displayName: 'Multi Language Text',
    dataType: 'LocalizedText',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: coreServer.core.nodeOPCUA.DataType.LocalizedText,
          value: [{text: 'multilingual text', locale: 'en'},
            {text: 'mehrsprachiger Text', locale: 'de'},
            {text: 'texte multilingue', locale: 'fr'}]
        })
      }
    }
  })

  let fanSpeed = addressSpace.addVariable({
    organizedBy: vendorName,
    nodeId: 'ns=4;s=FanSpeed',
    browseName: 'FanSpeed',
    dataType: 'Double',
    value: new coreServer.core.nodeOPCUA.Variant({dataType: 'Double', value: 1000.0})
  })

  setInterval(function () {
    fanSpeed.setValueFromSource(new coreServer.core.nodeOPCUA.Variant({
      dataType: 'Double',
      value: 1000.0 + (Math.random() * 100 - 50)
    }))
  }, 10)

  let method = addressSpace.addMethod(
    vendorName, {
      nodeId: 'ns=4;i=12345',
      browseName: 'Bark',

      inputArguments: [
        {
          name: 'barks',
          dataType: coreServer.core.convertToDataType('UInt32'),
          arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Scalar,
          description: {text: 'specifies the number of time I should bark'}
        }, {
          name: 'volume',
          dataType: coreServer.core.convertToDataType('UInt32'),
          arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Scalar,
          description: {text: 'specifies the sound volume [0 = quiet ,100 = loud]'}
        }
      ],

      outputArguments: [{
        name: 'Barks',
        dataType: coreServer.core.convertToDataType('String'),
        arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Array,
        description: {text: 'the generated barks'},
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

  let analogItemNode = addressSpace.addAnalogDataItem({
    organizedBy: vendorName,
    nodeId: 'ns=1;s=TemperatureAnalogItem',
    browseName: 'TemperatureAnalogItem',
    definition: '(tempA -25) + tempB',
    valuePrecision: 0.5,
    engineeringUnitsRange: {low: 100, high: 200},
    instrumentRange: {low: -100, high: +200},
    engineeringUnits: coreServer.core.nodeOPCUA.standardUnits.degree_celsius,
    dataType: 'Double',
    value: {
      get: function () {
        return new coreServer.core.nodeOPCUA.Variant({
          dataType: 'Double',
          value: Math.random() + 19.0
        })
      }
    }
  })

  let view = addressSpace.addView({
    organizedBy: addressSpace.rootFolder.views,
    browseName: 'RoyalView'
  })

  view.addReference({
    referenceType: 'Organizes',
    nodeId: analogItemNode.nodeId
  })
}

module.exports = de.biancoroyal.opcua.iiot.core.server
