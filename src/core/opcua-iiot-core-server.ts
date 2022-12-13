/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {TodoTypeAny} from "../types/placeholders";
import {
  AddressSpace,
  ApplicationType,
  CallbackT,
  DataType,
  DataValue,
  EndpointDescription,
  extractFullyQualifiedDomainName,
  ISessionContext,
  LocalizedText,
  makeApplicationUrn,
  nodesets,
  OPCUAServer,
  OPCUAServerEndPoint,
  OPCUAServerOptions,
  RegisterServerMethod,
  SecurityPolicy,
  standardUnits,
  StatusCodes,
  UAEventType,
  Variant,
  VariantArrayType
} from "node-opcua";

import {
  availableMemory,
  getNodeOPCUAServerPath,
  getVariantValue,
  initCoreServerNode,
  setNodeStatusTo,
} from "./opcua-iiot-core"


import debug from 'debug'
import path from 'path'
import {NodeStatus} from "node-red";
import {constructAlarmAddressSpaceDemo} from "../helpers/alarms-and-conditions-demo";

const internalDebugLog = debug('opcuaIIoT:server') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:server:details') // eslint-disable-line no-use-before-define
const isa95DebugLog = debug('opcuaIIoT:server:ISA95') // eslint-disable-line no-use-before-define
const isa95DetailDebugLog = debug('opcuaIIoT:server:ISA95:details') // eslint-disable-line no-use-before-define
const flex = {} // eslint-disable-line no-use-before-define
const flexInternalDebugLog = debug('opcuaIIoT:server:flex') // eslint-disable-line no-use-before-define
const flexDetailDebugLog = debug('opcuaIIoT:server:flex:details') // eslint-disable-line no-use-before-define
let simulatorInterval = null // eslint-disable-line no-use-before-define
const maxTimeInterval = 500000 // eslint-disable-line no-use-before-define
let timeInterval = 1 // eslint-disable-line no-use-before-define
const UNLIMITED_LISTENERS = 0 // eslint-disable-line no-use-before-define
let intervalList: TodoTypeAny[] = [] // eslint-disable-line no-use-before-define
let conditions = []

const simulateVariation = function (data: TodoTypeAny) {
  let value = (1.0 + Math.sin(timeInterval / 360 * 3)) / 2.0

  timeInterval++
  if (timeInterval > maxTimeInterval) {
    timeInterval = 1
  }

  if (data.tankLevel) {
    data.tankLevel.setValueFromSource({dataType: 'Double', value})
  }

  if (data.tankLevel2) {
    data.tankLevel2.setValueFromSource({dataType: 'Double', value})
  }
}

const constructAddressSpaceFromScript = function (server: TodoTypeAny, constructAddressSpaceScript: TodoTypeAny, eventObjects: TodoTypeAny) {
  return new Promise(
    (resolve, reject) => {
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

const constructAddressSpace = function (server: OPCUAServer, asoDemo: TodoTypeAny) {
  return new Promise(
    (resolve, reject) => {
      if (!server) {
        reject(new Error('Server Not Valid To Construct Address Space'))
        return
      }

      const addressSpace = server.engine?.addressSpace

      if (!addressSpace) {
        reject(new Error('No AddressSpace From OPC UA Server Engine'))
        return
      }

      addressSpace.installAlarmsAndConditionsService();

      const namespace = addressSpace.getOwnNamespace()

      const exclusiveLimitAlarmType = addressSpace.findEventType('ExclusiveLimitAlarmType') as UAEventType
      if (!exclusiveLimitAlarmType) {
        throw new Error("cannot find ExclusiveLimitAlarmType in namespace 0");
      }

      let nonExclusiveLimitAlarmType = addressSpace.findEventType('NonExclusiveLimitAlarmType')
      if (!nonExclusiveLimitAlarmType) {
        throw new Error("cannot find NonExclusiveLimitAlarmType in namespace 0");
      }

      let view = namespace.addView({
        organizedBy: addressSpace?.rootFolder.views,
        browseName: 'PLUS4NODERED_VIEW',
        displayName: [
          new LocalizedText({text: 'OPCUA-IIoT plus4nodered.com Server View', locale: 'en-US'}),
          new LocalizedText({text: 'OPCUA-IIoT plus4nodered.com Server Sicht', locale: 'de-DE'})
        ]
      })

      if (!asoDemo) {
        resolve(null)
      } else {
        let data = {}
        constructAlarmAddressSpaceDemo(data, addressSpace)

        timeInterval = 1
        simulatorInterval = setInterval(function () {
          simulateVariation(data)
        }, 500)

        intervalList.push(simulatorInterval)

        let vendorName = namespace.addObject({
          organizedBy: addressSpace.rootFolder.objects,
          typeDefinition: 'FolderType',
          nodeId: 'i=1234',
          browseName: 'PLUS4NODERED',
          displayName: [
            new LocalizedText({text: 'OPCUA-IIoT plus4nodered.com Server', locale: 'en-US'}),
            new LocalizedText({text: 'OPCUA-IIoT plus4nodered.com Server', locale: 'de-DE'})
          ],
          eventNotifier: 1,
          notifierOf: addressSpace.rootFolder.objects.server
        })

        let variable1 = 1
        intervalList.push(setInterval(function () {
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
          displayName: 'PLUS for Node-RED Double Variable',
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
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
          displayName: 'PLUS for Node-RED Double Binary Variable',
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                value: variable2
              })
            },
            set: function (variant: TodoTypeAny) {
              variable2 = parseFloat(variant.value)
              return StatusCodes.Good
            }
          }
        })

        let variable3 = 1000.0

        namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=TestReadWrite',
          browseName: 'TestReadWrite',
          displayName: 'PLUS for Node-RED Test Read and Write',
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                value: variable3
              })
            },
            set: function (variant: TodoTypeAny) {
              variable3 = parseFloat(variant.value)
              return StatusCodes.Good
            }
          }
        })

        let memoryVariable = namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=free_memory',
          browseName: 'FreeMemory',
          displayName: [
            new LocalizedText({text: 'P4NR Free Memory', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Freier Arbeitsspeicher', locale: 'de-DE'})
          ],
          dataType: 'Double',

          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                value: availableMemory()
              })
            }
          }
        })
        addressSpace.installHistoricalDataNode(memoryVariable)

        let counterValue = 0
        intervalList.push(setInterval(function () {
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
          displayName: [
            new LocalizedText({text: 'P4NR Counter', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Zähler', locale: 'de-DE'})
          ],
          dataType: 'UInt16',

          value: {
            get: function () {
              return new Variant({
                dataType: 'UInt16',
                value: counterValue
              })
            }
          }
        })
        addressSpace.installHistoricalDataNode(counterVariable)

        let fullCounterValue = 8900

        let fullCounterVariable = namespace.addVariable({
          componentOf: vendorName,
          eventSourceOf: vendorName,
          nodeId: 's=FullCounter',
          browseName: 'FullCounter',
          displayName: [
            new LocalizedText({text: 'P4NR Full-Counter', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Voll-Zähler', locale: 'de-DE'})
          ],
          dataType: 'Int32',
          value: {
            get: function () {
              return new Variant({
                dataType: 'Int32',
                value: fullCounterValue
              })
            }
          }
        })
        addressSpace.installHistoricalDataNode(fullCounterVariable)

        namespace.instantiateNonExclusiveLimitAlarm(nonExclusiveLimitAlarmType, {
          componentOf: vendorName,
          conditionSource: fullCounterVariable,
          browseName: 'FullCounterLimitCondition',
          displayName: new LocalizedText({text: 'Full Counter Limit Condition', locale: 'en-US'}),
          description: 'ExclusiveLimitAlarmType Condition',
          conditionName: 'FullCounterLimitCondition',
          inputNode: fullCounterVariable,   // the variable that will be monitored for change
          highHighLimit: 9990,
          highLimit: 9000,
          lowLimit: -9000,
          lowLowLimit: -9990,
          optionals: [
            "ConfirmedState", "Confirm" // confirm state and confirm Method
          ]
        })

        intervalList.push(setInterval(function () {
          if (fullCounterValue < 10000) {
            fullCounterValue += 1
          } else {
            fullCounterValue = -10000
          }
          fullCounterVariable.setValueFromSource({
            dataType: DataType.Int32,
            value: fullCounterValue
          });
        }, 100))

        let externalValueWithSourceTimestamp = new DataValue({
          value: new Variant({dataType: 'Double', value: 10.0}),
          sourceTimestamp: null,
          sourcePicoseconds: 0
        })

        intervalList.push(setInterval(function () {
          externalValueWithSourceTimestamp.value.value = Math.random()
          externalValueWithSourceTimestamp.sourceTimestamp = new Date()
        }, 1000))

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=Pressure',
          browseName: 'Pressure',
          displayName: [
            new LocalizedText({text: 'P4NR Pressure', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Druck', locale: 'de-DE'})
          ],
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
          displayName: [new LocalizedText({text: 'P4NR Matrix', locale: 'en-US'})],
          dataType: 'Double',
          valueRank: 2,
          arrayDimensions: [3, 3],
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                arrayType: VariantArrayType.Matrix,
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
          displayName: [new LocalizedText({text: 'P4NR Position', locale: 'en-US'})],
          dataType: 'Double',
          valueRank: 1,
          arrayDimensions: null,
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                arrayType: VariantArrayType.Array,
                value: [1, 2, 3, 4]
              })
            }
          }
        })

        let pumpSpeed = namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=PumpSpeed',
          browseName: 'PumpSpeed',
          displayName: [
            new LocalizedText({text: 'P4NR Pump Speed', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Geschwindigkeit Pumpe', locale: 'de-DE'})
          ],
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
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
          displayName: [
            new LocalizedText({text: 'P4NR Some Date', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Einfaches Datum', locale: 'de-DE'})
          ],
          dataType: 'DateTime',
          value: {
            get: function () {
              return new Variant({
                dataType: DataType.DateTime,
                value: new Date(Date.UTC(2016, 9, 13, 8, 40, 0))
              })
            }
          }
        })

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=MultiLanguageText',
          browseName: 'MultiLanguageText',
          displayName: [
            new LocalizedText({text: 'P4NR Multi Language Text', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Mehrsprachiger Text', locale: 'de-DE'})
          ],
          dataType: 'LocalizedText',
          value: {
            get: function () {
              return new Variant({
                dataType: DataType.LocalizedText,
                value: [{text: 'multilingual text', locale: 'en'},
                  {text: 'plus4nodered.de mehrsprachiger Text', locale: 'de'},
                  {text: 'plus4nodered.com texte multilingue', locale: 'fr'}]
              })
            }
          }
        })

        let fanSpeed = namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=FanSpeed',
          browseName: 'FanSpeed',
          displayName: [
            new LocalizedText({text: 'P4NR Fan Speed', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Geschwindigkeit Lüfter', locale: 'de-DE'})
          ],
          dataType: 'Double',
          value: new Variant({dataType: 'Double', value: 1000.0})
        })

        intervalList.push(setInterval(function () {
          fanSpeed.setValueFromSource(new Variant({
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
                description: {text: 'specifies the number of time I should bark'}
              }, {
                name: 'volume',
                dataType: 'UInt32',
                description: {text: 'specifies the sound volume [0 = quiet ,100 = loud]'}
              }
            ],

            outputArguments: [{
              name: 'Barks',
              dataType: 'String',
              description: {text: 'the generated barks'},
              valueRank: 1
            }]
          })

        method.bindMethod(function (inputArguments: Variant[], context: ISessionContext, callback: CallbackT<TodoTypeAny>) {
          let nbBarks = inputArguments[0].value
          let volume = inputArguments[1].value
          let soundVolume = new Array(volume).join('!')
          let barks = []

          for (let i = 0; i < nbBarks; i++) {
            barks.push('Whaff' + soundVolume)
          }

          let callMethodResult = {
            statusCode: StatusCodes.Good,
            outputArguments: [{
              dataType: DataType.String,
              arrayType: VariantArrayType.Array,
              value: barks
            }]
          }
          callback(null, callMethodResult)
        })

        let temperatureValue = 170

        let analogItemNode = namespace.addAnalogDataItem({
          componentOf: vendorName,
          eventSourceOf: vendorName,
          nodeId: 's=TemperatureAnalogItem',
          browseName: 'TemperatureAnalogItem',
          displayName: [
            new LocalizedText({text: 'P4NR Temperature', locale: 'en-US'}),
            new LocalizedText({text: 'P4NR Temperatur', locale: 'de-DE'})
          ],
          definition: '(tempA -25) + tempB',
          valuePrecision: 0.5,
          engineeringUnitsRange: {low: 100, high: 200},
          instrumentRange: {low: -100, high: +200},
          engineeringUnits: standardUnits.degree_celsius,
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                value: temperatureValue
              })
            }
          }
        })

        namespace.instantiateExclusiveLimitAlarm(exclusiveLimitAlarmType, {
          componentOf: vendorName,
          conditionSource: analogItemNode,
          browseName: 'TemperatureLimitCondition',
          displayName: new LocalizedText({text: 'Temperature Limit Condition', locale: 'en-US'}),
          description: 'ExclusiveLimitAlarmType Condition',
          conditionName: 'TemperatureLimitCondition',
          inputNode: analogItemNode,   // the variable that will be monitored for change
          highHighLimit: 240,
          highLimit: 200,
          lowLimit: 100,
          lowLowLimit: 10,
          optionals: [
            "ConfirmedState", "Confirm" // confirm state and confirm Method
          ]
        })

        intervalList.push(setInterval(function () {
          if (temperatureValue < 250) {
            temperatureValue += 0.5
          } else {
            temperatureValue = -40
          }
          analogItemNode.setValueFromSource({
            dataType: DataType.Double,
            value: temperatureValue
          });
        }, 500))

        view.addReference({
          referenceType: 'Organizes',
          nodeId: pumpSpeed.nodeId
        })

        resolve('')
      }
    })
}

const buildGeneralServerOptions = async (node: TodoTypeAny, prefix: string) => {
  let serverOptions: TodoTypeAny = await buildServerOptions(node, prefix)
  serverOptions.userManager = {
    isValidUser: function (userName: string, password: string) {
      return checkUser(node, userName, password)
    }
  }
  return setDiscoveryOptions(node, serverOptions)
}

const destructAddressSpace = function (done: () => void) {
  intervalList.forEach(function (value: TodoTypeAny, index: number, list: TodoTypeAny[]) {
    clearInterval(value)
    list[index] = null
  })
  intervalList = []
  done()
}

const start = function (server: OPCUAServer, node: TodoTypeAny) {
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
      server.start(() => {
        node.iiot.initialized = true

        if (server.endpoints?.length) {
          server.endpoints.forEach((endpoint: OPCUAServerEndPoint) => {
            endpoint.endpointDescriptions().forEach((endpointDescription: EndpointDescription) => {
              internalDebugLog('Server endpointUrl:', endpointDescription.endpointUrl,
                'securityMode:', endpointDescription.securityMode.toString(),
                'securityPolicyUri:', endpointDescription.securityPolicyUri ? endpointDescription.securityPolicyUri?.toString() : 'None Security Policy Uri'
              );
            })
          })
          let endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl
          internalDebugLog('Primary Server Endpoint URL ' + endpointUrl)
        }

        server.on('newChannel', function (channel: TodoTypeAny) {
          internalDebugLog('Client connected with address = ' +
            channel.remoteAddress + ' port = ' + channel.remotePort
          )
        })

        server.on('closeChannel', function (channel: TodoTypeAny) {
          internalDebugLog('Client disconnected with address = ' +
            channel.remoteAddress + ' port = ' + channel.remotePort
          )
        })

        server.on('create_session', function (session: TodoTypeAny) {
          internalDebugLog('############## SESSION CREATED ##############')
          if (session.clientDescription) {
            detailDebugLog('Client application URI:' + session.clientDescription.applicationUri)
            detailDebugLog('Client product URI:' + session.clientDescription.productUri)
            detailDebugLog('Client application name:' + session.clientDescription.applicationName ? session.clientDescription.applicationName.toString() : 'none application name')
            detailDebugLog('Client application type:' + session.clientDescription.applicationType ? session.clientDescription.applicationType.toString() : 'none application type')
          }

          internalDebugLog('Session name:' + session.sessionName ? session.sessionName.toString() : 'none session name')
          internalDebugLog('Session timeout:' + session.sessionTimeout)
          internalDebugLog('Session id:' + session.sessionId)
        })

        server.on('session_closed', function (session: TodoTypeAny, reason: TodoTypeAny) {
          internalDebugLog('############## SESSION CLOSED ##############')
          internalDebugLog('reason:' + reason)
          internalDebugLog('Session name:' + session.sessionName ? session.sessionName.toString() : 'none session name')
        })

        internalDebugLog('Server Initialized')

        if (server.serverInfo) {
          detailDebugLog('Server Info:' + JSON.stringify(server.serverInfo))
        }

        resolve('')
      })
    })
}

const readConfigOfServerNode = function (node: TodoTypeAny, config: TodoTypeAny) {
  node.name = config.name

  // network
  node.port = config.port
  node.endpoint = config.endpoint
  node.alternateHostname = config.alternateHostname

  // limits
  node.maxAllowedSessionNumber = parseInt(config.maxAllowedSessionNumber) || 10
  node.maxConnectionsPerEndpoint = parseInt(config.maxConnectionsPerEndpoint) || 10
  node.maxAllowedSubscriptionNumber = parseInt(config.maxAllowedSubscriptionNumber) || 50
  node.maxNodesPerRead = config.maxNodesPerRead || 1000
  node.maxNodesPerBrowse = config.maxNodesPerBrowse || 2000

  node.delayToClose = config.delayToClose || 1000
  node.showStatusActivities = config.showStatusActivities
  node.showErrors = config.showErrors

  // certificates
  node.individualCerts = config.individualCerts
  node.publicCertificateFile = config.publicCertificateFile
  node.privateCertificateFile = config.privateCertificateFile

  // Security
  node.allowAnonymous = config.allowAnonymous
  // User Management
  node.opcuaUsers = config.users
  // XML-Set Management
  node.xmlsets = config.xmlsets
  // Audit
  node.isAuditing = config.isAuditing

  // discovery
  node.disableDiscovery = !config.serverDiscovery
  node.registerServerMethod = config.registerServerMethod || 1
  node.discoveryServerEndpointUrl = config.discoveryServerEndpointUrl
  node.capabilitiesForMDNS = (config.capabilitiesForMDNS) ? config.capabilitiesForMDNS.split(',') : [config.capabilitiesForMDNS]
}

const initServerNode = function (node: TodoTypeAny) {
  node.iiot = initCoreServerNode()
  if (node.setMaxListeners)
    node.setMaxListeners(UNLIMITED_LISTENERS)
}

const loadNodeSets = function (node: TodoTypeAny, dirname: string) {
  let standardNodeSetFile = nodesets.standard
  let xmlFiles = [standardNodeSetFile]

  if (node.xmlsets) {
    node.xmlsets.forEach((xmlsetFileName: TodoTypeAny) => {
      detailDebugLog('Load XML Set for ' + xmlsetFileName.name)
      if (xmlsetFileName.path) {
        if (xmlsetFileName.path.startsWith('public/vendor/')) {
          xmlFiles.push(path.join(dirname, xmlsetFileName.path))
        } else {
          xmlFiles.push(xmlsetFileName.path)
        }
      }
    })
    detailDebugLog('appending xmlFiles: ' + xmlFiles.toString())
  }

  detailDebugLog('node set:' + xmlFiles.toString())
  node.iiot.xmlFiles = xmlFiles
}

const loadCertificates = function (node: TodoTypeAny) {
  const nodeOPCUAServerPath = getNodeOPCUAServerPath()

  detailDebugLog('config: ' + node.publicCertificateFile)
  if (!node.individualCerts || node.publicCertificateFile === null || node.publicCertificateFile === '') {
    node.publicCertificateFile = path.join(nodeOPCUAServerPath, '/certificates/server_selfsigned_cert_2048.pem')
    detailDebugLog('default key: ' + node.publicCertificateFile)
  }

  detailDebugLog('config: ' + node.privateCertificateFile)
  if (!node.individualCerts || node.privateCertificateFile === null || node.privateCertificateFile === '') {
    node.privateCertificateFile = path.join(nodeOPCUAServerPath, '/certificates/PKI/own/private/private_key.pem')
    detailDebugLog('default key: ' + node.privateCertificateFile)
  }

  return node
}

const checkUser = function (node: TodoTypeAny, userName: string, password: string) {
  // valid if there is no user in the server
  if(node.opcuaUsers && node.opcuaUsers.length < 1) return true

  let isValidUser = false
  detailDebugLog('Server User Request For ' + userName)

  node.opcuaUsers.forEach(function (user: TodoTypeAny) {
    if (userName === user.name && password === user.password) {
      isValidUser = true
    }
  })

  if (isValidUser) {
    detailDebugLog('Valid Server User Found')
  } else {
    detailDebugLog('Server User ' + userName + ' Not Found')
  }

  return isValidUser
}

const initRegisterServerMethod = function (node: TodoTypeAny) {
  node.iiot.initialized = false
  node.iiot.opcuaServer = null

  if (!node.registerServerMethod) {
    node.registerServerMethod = RegisterServerMethod.HIDDEN
  } else {
    switch (parseInt(node.registerServerMethod)) {
      case 2:
        node.registerServerMethod = RegisterServerMethod.MDNS
        break
      case 3:
        node.registerServerMethod = RegisterServerMethod.LDS
        break
      default:
        node.registerServerMethod = RegisterServerMethod.HIDDEN
    }
  }
  return node
}

const setDiscoveryOptions = function (node: TodoTypeAny, serverOptions: TodoTypeAny) {
  if (!node.disableDiscovery) {
    serverOptions.registerServerMethod = node.registerServerMethod

    if (node.discoveryServerEndpointUrl && node.discoveryServerEndpointUrl !== '') {
      serverOptions.discoveryServerEndpointUrl = node.discoveryServerEndpointUrl
    }

    if (node.capabilitiesForMDNS && node.capabilitiesForMDNS.length) {
      serverOptions.capabilitiesForMDNS = node.capabilitiesForMDNS
    }
  } else {
    node.registerServerMethod = RegisterServerMethod.HIDDEN
  }
  return serverOptions
}

const getAddressSpace = function (node: TodoTypeAny, msg: TodoTypeAny, errorHandler: (err: Error, msg: TodoTypeAny) => void): AddressSpace | null {
  if (!node.iiot.opcuaServer?.engine?.addressSpace) {
    errorHandler(new Error('Server AddressSpace Not Valid'), msg)
    return null
  }

  return node.iiot.opcuaServer.engine.addressSpace
}

const addVariableToAddressSpace = function (node: TodoTypeAny, msg: TodoTypeAny, humanReadableType: TodoTypeAny, isProperty: boolean, errorHandler: (err: Error, msg: TodoTypeAny) => void) {
  let addressSpace = getAddressSpace(node, msg, errorHandler)

  if (!addressSpace) {
    return
  }

  let rootFolder = addressSpace.findNode(msg.payload.referenceNodeId)
  let variableData = getVariantValue(msg.payload.datatype, msg.payload.value)

  let newNodeOPCUAVariable: TodoTypeAny = {}

  if (isProperty) {
    newNodeOPCUAVariable = {
      propertyOf: rootFolder
      // modellingRule: 'Mandatory'
    }
  } else {
    newNodeOPCUAVariable = {
      componentOf: rootFolder
    }
  }

  newNodeOPCUAVariable.nodeId = msg.payload.nodeId
  newNodeOPCUAVariable.browseName = msg.payload.browsename
  newNodeOPCUAVariable.displayName = new LocalizedText({locale: "en-US", text: msg.payload.displayname})
  newNodeOPCUAVariable.dataType = msg.payload.datatype
  newNodeOPCUAVariable.value = {
    get() {
      return new Variant({
        dataType: DataType[msg.payload.datatype],
        value: variableData
      })
    },
    set(variant: TodoTypeAny) {
      variableData = variant.value
      return StatusCodes.Good
    }
  }

  addressSpace.getOwnNamespace().addVariable(newNodeOPCUAVariable)
  internalDebugLog(msg.payload.nodeId + ' ' + humanReadableType + ' Added To Address Space')
}

const addObjectToAddressSpace = function (node: TodoTypeAny, msg: TodoTypeAny, humanReadableType: TodoTypeAny, errorHandler: (err: Error, msg: TodoTypeAny) => void) {
  let addressSpace = getAddressSpace(node, msg, errorHandler)

  if (!addressSpace) {
    return
  }

  let rootFolder = addressSpace.findNode(msg.payload.referenceNodeId)

  if (rootFolder) {
    let newNodeOPCUObject = {
      organizedBy: rootFolder,
      typeDefinition: msg.payload.objecttype,
      nodeId: msg.payload.nodeId,
      browseName: msg.payload.browsename,
      displayName: new LocalizedText({locale: null, text: msg.payload.displayname})
    }

    addressSpace.getOwnNamespace().addObject(newNodeOPCUObject)
    internalDebugLog(msg.payload.nodeId + ' ' + humanReadableType + ' Added To Address Space')
  } else {
    errorHandler(new Error('Root Reference Not Found'), msg)
  }
}

const deleteNodeFromAddressSpace = function (node: TodoTypeAny, msg: TodoTypeAny, errorHandler: (err: Error, msg: TodoTypeAny) => void) {
  let addressSpace = getAddressSpace(node, msg, errorHandler)
  if (!addressSpace) {
    return
  }
  if (msg.payload.nodeId) {
    let searchedNode = addressSpace.findNode(msg.payload.nodeId)
    if (searchedNode) {
      internalDebugLog('Delete NodeId ' + msg.payload.nodeId)
      addressSpace.deleteNode(searchedNode)
    } else {
      internalDebugLog('Delete NodeId Not Found ' + msg.payload.nodeId)
    }
  } else {
    errorHandler(new Error('OPC UA Command NodeId Not Valid'), msg)
  }
}

const restartServer = function (node: TodoTypeAny, statusHandler: (status: string | NodeStatus) => void, emitHandler: (eventName: string | symbol, ...args: any[]) => void, sendHandler: (msg: TodoTypeAny) => void) {
  if (node.iiot.opcuaServer) {
    node.iiot.opcuaServer.shutdown(function () {
      emitHandler('shutdown')
    })
  } else {
    node.iiot.opcuaServer = null
    emitHandler('shutdown')
  }

  sendHandler({payload: 'server shutdown'})
  node.oldStatusParameter = setNodeStatusTo(node, 'shutdown', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

const createServerNameWithPrefix = function (serverPort: number, prefix: TodoTypeAny) {
  let serverPrefix = (prefix !== '') ? prefix + '-' : prefix
  return 'NodeRED-IIoT-' + serverPrefix + 'Server-' + serverPort
}

const buildServerOptions = async (node: TodoTypeAny, prefix: TodoTypeAny) => {
  let today = new Date()

  // const SecurityPolicy = require("node-opcua").SecurityPolicy;
  return {
    defaultSecureTokenLifetime: 60000000,
    port: typeof node.port === 'string' ? parseInt(node.port) : node.port,
    nodeset_filename: node.iiot.xmlFiles,
    resourcePath: '/' + node.endpoint || 'UA/NodeRED' + prefix + 'IIoTServer',
    buildInfo: {
      productName: node.name || 'NodeOPCUA IIoT Server',
      buildNumber: today.getTime().toString(),
      buildDate: today
    },
    serverCapabilities: {
      operationLimits: {
        maxNodesPerRead: node.maxNodesPerRead,
        maxNodesPerBrowse: node.maxNodesPerBrowse
      }
    },
    serverInfo: {
      applicationType: ApplicationType.Server,
      applicationUri: makeApplicationUrn(await extractFullyQualifiedDomainName(), createServerNameWithPrefix(node.port, prefix)),
      productUri: createServerNameWithPrefix(node.port, prefix),
      applicationName: {text: 'Node-RED', locale: 'en'},
      gatewayServerUri: null,
      discoveryProfileUri: null,
      discoveryUrls: []
    },
    maxAllowedSessionNumber: node.maxAllowedSessionNumber,
    maxConnectionsPerEndpoint: node.maxConnectionsPerEndpoint,
    allowAnonymous: node.allowAnonymous,
    securityPolicies: [
      SecurityPolicy.None,
      SecurityPolicy.Basic128,
      SecurityPolicy.Basic192,
      SecurityPolicy.Basic192Rsa15,
      SecurityPolicy.Basic256Rsa15,
      SecurityPolicy.Basic256Sha256,
      SecurityPolicy.Aes128_Sha256_RsaOaep,
      SecurityPolicy.Aes256_Sha256_RsaPss,
      SecurityPolicy.PubSub_Aes128_CTR,
      SecurityPolicy.PubSub_Aes256_CTR
    ],
    certificateFile: node.publicCertificateFile,
    privateKeyFile: node.privateCertificateFile,
    alternateHostname: node.alternateHostname || '',
    userManager: checkUser,
    isAuditing: node.isAuditing,
    registerServerMethod: node.registerServerMethod,
    disableDiscovery: node.disableDiscovery
  }
}
const createServer = async (node: TodoTypeAny, serverOptions: TodoTypeAny, postInitialize: () => void, statusHandler: (status: string | NodeStatus) => void, verbose: boolean = false) => {
  /* istanbul ignore next */
  if (verbose) {
    coreServer.flexDetailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
  }
  const options = await serverOptions

  node.iiot.opcuaServer = await coreServer.createServerObject(node.maxAllowedSubscriptionNumber, options)
  node.oldStatusParameter = setNodeStatusTo(node, 'waiting', node.oldStatusParameter, node.showStatusActivities, statusHandler)
  await node.iiot.opcuaServer.initialize()
  postInitialize()
  coreServer.setOPCUAServerListener(node)
}

const createServerObject = async (maxSubscriptions: number, serverOptions: OPCUAServerOptions) => {
  // TODO: now via serverOptions.serverCapabilities.maxSessions

  serverOptions.maxAllowedSessionNumber = maxSubscriptions || 10
  let server =  new OPCUAServer(serverOptions)
  // TODO: later at server.engine.serverCapabilities.maxSessions = maxSubscriptions || 10
  return server
}

const setOPCUAServerListener = function (node: TodoTypeAny) {
  node.iiot.opcuaServer.on('newChannel', function (channel: TodoTypeAny) {
    internalDebugLog('Client connected new channel with address = ', channel.remoteAddress, ' port = ', channel.remotePort)
  })

  node.iiot.opcuaServer.on('closeChannel', function (channel: TodoTypeAny) {
    internalDebugLog('Client disconnected close channel with address = ', channel.remoteAddress, ' port = ', channel.remotePort)
  })

  node.iiot.opcuaServer.on('post_initialize', function () {
    internalDebugLog('initialized')
  })
}

const coreServer = {
  internalDebugLog,
  detailDebugLog,
  isa95DebugLog,
  isa95DetailDebugLog,
  flexInternalDebugLog,
  flexDetailDebugLog,

  maxTimeInterval,
  timeInterval,
  simulatorInterval,

  simulateVariation,
  constructAddressSpaceFromScript,
  constructAddressSpace,
  destructAddressSpace,
  start,
  readConfigOfServerNode,
  initServerNode,
  loadNodeSets,
  loadCertificates,
  checkUser,
  initRegisterServerMethod,
  setDiscoveryOptions,
  getAddressSpace,
  addVariableToAddressSpace,
  addObjectToAddressSpace,
  deleteNodeFromAddressSpace,
  restartServer,
  createServerNameWithPrefix,
  createServerObject,
  setOPCUAServerListener,
  buildGeneralServerOptions,
  createServer,
}

export default coreServer
