/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
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
de.biancoroyal.opcua.iiot.core.server.isa95DebugLog = de.biancoroyal.opcua.iiot.core.server.isa95DebugLog || require('debug')('opcuaIIoT:server:ISA95') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.isa95DetailDebugLog = de.biancoroyal.opcua.iiot.core.server.isa95DetailDebugLog || require('debug')('opcuaIIoT:server:ISA95:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.flex = de.biancoroyal.opcua.iiot.core.server.flex || {} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.flex.internalDebugLog = de.biancoroyal.opcua.iiot.core.server.flex.internalDebugLog || require('debug')('opcuaIIoT:server:flex') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.flex.detailDebugLog = de.biancoroyal.opcua.iiot.core.server.flex.detailDebugLog || require('debug')('opcuaIIoT:server:flex:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.simulatorInterval = de.biancoroyal.opcua.iiot.core.server.simulatorInterval || null // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.maxTimeInterval = de.biancoroyal.opcua.iiot.core.server.maxTimeInterval || 500000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.timeInterval = de.biancoroyal.opcua.iiot.core.server.timeInterval || 1 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.intervalList = de.biancoroyal.opcua.iiot.core.server.intervalList || [] // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.server.simulateVariation = function (data) {
  let server = de.biancoroyal.opcua.iiot.core.server

  let value = (1.0 + Math.sin(server.timeInterval / 360 * 3)) / 2.0

  server.timeInterval++
  if (server.timeInterval > server.maxTimeInterval) {
    server.timeInterval = 1
  }

  if (data.tankLevel) data.tankLevel.setValueFromSource({dataType: 'Double', value})
  if (data.tankLevel2) data.tankLevel2.setValueFromSource({dataType: 'Double', value})
}

de.biancoroyal.opcua.iiot.core.server.constructAddressSpaceFromScript = function (server, constructAddressSpaceScript, eventObjects) {
  de.biancoroyal.opcua.iiot.core.server.flex.internalDebugLog('Construct Address Space From Script')
  return new Promise(
    function (resolve, reject) {
      if (server.engine && constructAddressSpaceScript && constructAddressSpaceScript !== '') {
        try {
          constructAddressSpaceScript(server, server.engine.addressSpace, eventObjects, resolve)
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error('Wrong Parameters Construct AddressSpace From Script'))
      }
    })
}

de.biancoroyal.opcua.iiot.core.server.constructAddressSpace = function (server, asoDemo) {
  return new Promise(
    function (resolve, reject) {
      if (!server) {
        reject(new Error('Server Not Valid To Construct Address Space'))
        return
      }

      let coreServer = de.biancoroyal.opcua.iiot.core.server
      let addressSpace = server.engine.addressSpace
      const namespace = addressSpace.getOwnNamespace()

      if (!addressSpace) {
        reject(new Error('No AddressSpace From OPC UA Server Engine'))
        return
      }

      let view = namespace.addView({
        organizedBy: addressSpace.rootFolder.views,
        browseName: 'BiancoRoyalView',
        displayName: 'Bianco Royal View'
      })

      if (!asoDemo) {
        resolve()
      } else {
        let constructAlarmAddressSpaceDemo = require('../helpers/alarms-and-conditions-demo').constructAlarmAddressSpaceDemo
        let data = {}
        constructAlarmAddressSpaceDemo(data, addressSpace)

        de.biancoroyal.opcua.iiot.core.server.timeInterval = 1
        de.biancoroyal.opcua.iiot.core.server.simulatorInterval = setInterval(function () {
          de.biancoroyal.opcua.iiot.core.server.simulateVariation(data)
        }, 500)

        de.biancoroyal.opcua.iiot.core.server.intervalList.push(de.biancoroyal.opcua.iiot.core.server.simulatorInterval)
        let vendorName = namespace.addObject({
          organizedBy: addressSpace.rootFolder.objects,
          nodeId: 'i=1234',
          browseName: 'BiancoRoyal',
          displayName: 'Bianco Royal',
          description: 'Bianco Royal - Software Innovations®'
        })

        let variable1 = 1
        de.biancoroyal.opcua.iiot.core.server.intervalList.push(setInterval(function () {
          if (variable1 < 1000000) {
            variable1 += 1
          } else {
            variable1 = 0
          }
        }, 100))

        namespace.addVariable({
          componentOf: vendorName,
          nodeId: 'i=16479',
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

        namespace.addVariable({
          componentOf: vendorName,
          nodeId: 'b=1020FFAA',
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

        namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=TestReadWrite',
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

        let memoryVariable = namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=free_memory',
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
        de.biancoroyal.opcua.iiot.core.server.intervalList.push(setInterval(function () {
          if (counterValue < 65000) {
            counterValue += 1
          } else {
            counterValue = 0
          }
        }, 1000))

        let counterVariable = namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=Counter',
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
        de.biancoroyal.opcua.iiot.core.server.intervalList.push(setInterval(function () {
          if (fullcounterValue < 100000) {
            fullcounterValue += 1
          } else {
            fullcounterValue = -100000
          }
        }, 1000))

        let fullcounterVariable = namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=FullCounter',
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

        de.biancoroyal.opcua.iiot.core.server.intervalList.push(setInterval(function () {
          externalValueWithSourceTimestamp.value.value = Math.random()
          externalValueWithSourceTimestamp.sourceTimestamp = new Date()
        }, 1000))

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=Pressure',
          browseName: 'Pressure',
          dataType: 'Double',
          value: {
            timestamped_get: function () {
              return externalValueWithSourceTimestamp
            }
          }
        })

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=Matrix',
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

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=Position',
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

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=PumpSpeed',
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

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=SomeDate',
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

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=MultiLanguageText',
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

        let fanSpeed = namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=FanSpeed',
          browseName: 'FanSpeed',
          dataType: 'Double',
          value: new coreServer.core.nodeOPCUA.Variant({dataType: 'Double', value: 1000.0})
        })

        de.biancoroyal.opcua.iiot.core.server.intervalList.push(setInterval(function () {
          fanSpeed.setValueFromSource(new coreServer.core.nodeOPCUA.Variant({
            dataType: 'Double',
            value: 1000.0 + (Math.random() * 100 - 50)
          }))
        }, 10))

        let method = namespace.addMethod(
          vendorName, {
            nodeId: 'i=12345',
            browseName: 'Bark',

            inputArguments: [
              {
                name: 'barks',
                dataType: 'UInt32',
                arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Scalar,
                description: {text: 'specifies the number of time I should bark'}
              }, {
                name: 'volume',
                dataType: 'UInt32',
                arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Scalar,
                description: {text: 'specifies the sound volume [0 = quiet ,100 = loud]'}
              }
            ],

            outputArguments: [{
              name: 'Barks',
              dataType: 'String',
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

        let analogItemNode = namespace.addAnalogDataItem({
          organizedBy: vendorName,
          nodeId: 's=TemperatureAnalogItem',
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

        view.addReference({
          referenceType: 'Organizes',
          nodeId: analogItemNode.nodeId
        })

        resolve()
      }
    })
}

de.biancoroyal.opcua.iiot.core.server.destructAddressSpace = function () {
  de.biancoroyal.opcua.iiot.core.server.intervalList.forEach(function (value, index, list) {
    clearInterval(value)
    list[index] = null
  })
  de.biancoroyal.opcua.iiot.core.server.intervalList = []
}

de.biancoroyal.opcua.iiot.core.server.start = function (server, node) {
  let coreServer = this
  return new Promise(
    function (resolve, reject) {
      if (!server) {
        reject(new Error('Server Not Valid To Start'))
        return
      }

      if (!node) {
        reject(new Error('Node Not Valid To Start'))
        return
      }

      server.start(function (err) {
        if (err) {
          reject(err)
        } else {
          node.initialized = true

          if (server.endpoints) {
            server.endpoints.forEach(function (endpoint) {
              endpoint.endpointDescriptions().forEach(function (endpointDescription) {
                coreServer.internalDebugLog('Server endpointUrl: ' +
              endpointDescription.endpointUrl + ' securityMode: ' +
              endpointDescription.securityMode.toString() +
              ' securityPolicyUri: ' + endpointDescription.securityPolicyUri ? endpointDescription.securityPolicyUri.toString() : 'None Security Policy Uri')
              })
            })

            let endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl
            coreServer.internalDebugLog('Primary Server Endpoint URL ' + endpointUrl)
          }

          server.on('newChannel', function (channel) {
            coreServer.internalDebugLog('Client connected with address = ' +
            channel.remoteAddress + ' port = ' + channel.remotePort
            )
          })

          server.on('closeChannel', function (channel) {
            coreServer.internalDebugLog('Client disconnected with address = ' +
            channel.remoteAddress + ' port = ' + channel.remotePort
            )
          })

          server.on('create_session', function (session) {
            coreServer.internalDebugLog('############## SESSION CREATED ##############')
            if (session.clientDescription) {
              coreServer.detailDebugLog('Client application URI:' + session.clientDescription.applicationUri)
              coreServer.detailDebugLog('Client product URI:' + session.clientDescription.productUri)
              coreServer.detailDebugLog('Client application name:' + session.clientDescription.applicationName ? session.clientDescription.applicationName.toString() : 'none application name')
              coreServer.detailDebugLog('Client application type:' + session.clientDescription.applicationType ? session.clientDescription.applicationType.toString() : 'none application type')
            }

            coreServer.internalDebugLog('Session name:' + session.sessionName ? session.sessionName.toString() : 'none session name')
            coreServer.internalDebugLog('Session timeout:' + session.sessionTimeout)
            coreServer.internalDebugLog('Session id:' + session.sessionId)
          })

          server.on('session_closed', function (session, reason) {
            coreServer.internalDebugLog('############## SESSION CLOSED ##############')
            coreServer.internalDebugLog('reason:' + reason)
            coreServer.internalDebugLog('Session name:' + session.sessionName ? session.sessionName.toString() : 'none session name')
          })

          coreServer.internalDebugLog('Server Initialized')

          if (server.serverInfo) {
            coreServer.detailDebugLog('Server Info:' + JSON.stringify(server.serverInfo))
          }

          resolve()
        }
      })
    })
}

module.exports = de.biancoroyal.opcua.iiot.core.server
