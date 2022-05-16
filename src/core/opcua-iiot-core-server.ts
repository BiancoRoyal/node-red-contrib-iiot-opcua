/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {Todo} from "../types/placeholders";
import {
  CallbackT,
  DataType,
  DataValue,
  EndpointDescription,
  ISessionContext,
  LocalizedText,
  nodesets,
  OPCUAServer,
  OPCUAServerEndPoint,
  RegisterServerMethod,
  standardUnits,
  StatusCodes,
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
let intervalList: Todo[] = [] // eslint-disable-line no-use-before-define

const simulateVariation = function (data: Todo) {
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

const constructAddressSpaceFromScript = function (server: Todo, constructAddressSpaceScript: Todo, eventObjects: Todo) {
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

const constructAddressSpace = function (server: OPCUAServer, asoDemo: Todo) {
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

      const namespace = addressSpace.getOwnNamespace()

      let view = namespace.addView({
        organizedBy: addressSpace?.rootFolder.views,
        browseName: 'IiotServerView',
        displayName: [
          new LocalizedText({text: 'OPCUA-IIoT Server View', locale: 'en-US'}),
          new LocalizedText({text: 'OPCUA-IIoT Server Sicht', locale: 'de-DE'})
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
          browseName: 'IiotServer',
          displayName: [
            new LocalizedText({text: 'OPCUA-IIoT Server', locale: 'en-US'}),
            new LocalizedText({text: 'OPCUA-IIoT Server', locale: 'de-DE'})
          ],
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
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                value: variable2
              })
            },
            set: function (variant: Todo) {
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
          displayName: 'Test Read and Write',
          dataType: 'Double',
          value: {
            get: function () {
              return new Variant({
                dataType: 'Double',
                value: variable3
              })
            },
            set: function (variant: Todo) {
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
            new LocalizedText({text: 'Free Memory', locale: 'en-US'}),
            new LocalizedText({text: 'ungenutzer RAM', locale: 'de-DE'})
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

        let fullcounterValue = 0
        intervalList.push(setInterval(function () {
          if (fullcounterValue < 100000) {
            fullcounterValue += 1
          } else {
            fullcounterValue = -100000
          }
        }, 500))

        let fullcounterVariable = namespace.addVariable({
          componentOf: vendorName,
          nodeId: 's=FullCounter',
          browseName: 'FullCounter',
          dataType: 'Int32',

          value: {
            get: function () {
              return new Variant({
                dataType: 'Int32',
                value: fullcounterValue
              })
            }
          }
        })
        addressSpace.installHistoricalDataNode(fullcounterVariable)

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

        namespace.addVariable({
          organizedBy: vendorName,
          nodeId: 's=PumpSpeed',
          browseName: 'PumpSpeed',
          displayName: [
            new LocalizedText({text: 'Pump Speed', locale: 'en-US'}),
            new LocalizedText({text: 'Geschwindigkeit Pumpe', locale: 'de-DE'})
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
            new LocalizedText({text: 'Some Date', locale: 'en-US'}),
            new LocalizedText({text: 'Einfaches Datum', locale: 'de-DE'})
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
            new LocalizedText({text: 'Multi Language Text', locale: 'en-US'}),
            new LocalizedText({text: 'Mehrsprachiger Text', locale: 'de-DE'})
          ],
          dataType: 'LocalizedText',
          value: {
            get: function () {
              return new Variant({
                dataType: DataType.LocalizedText,
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

        method.bindMethod(function (inputArguments: Variant[], context: ISessionContext, callback: CallbackT<Todo>) {
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

        let analogItemNode = namespace.addAnalogDataItem({
          organizedBy: vendorName,
          nodeId: 's=TemperatureAnalogItem',
          browseName: 'TemperatureAnalogItem',
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
                value: Math.random() + 19.0
              })
            }
          }
        })

        view.addReference({
          referenceType: 'Organizes',
          nodeId: analogItemNode.nodeId
        })

        resolve('')
      }
    })
}

const buildGeneralServerOptions = async (node: Todo, prefix: string) => {
  let serverOptions: Todo = await buildServerOptions(node, prefix)
  serverOptions.userManager = {
    isValidUser: function (userName: string, password: string) {
      return checkUser(node, userName, password)
    }
  }
  return setDiscoveryOptions(node, serverOptions)
}

const destructAddressSpace = function (done: () => void) {
  intervalList.forEach(function (value: Todo, index: number, list: Todo[]) {
    clearInterval(value)
    list[index] = null
  })
  intervalList = []
  done()
}

const start = function (server: OPCUAServer, node: Todo) {
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

        server.on('newChannel', function (channel: Todo) {
          internalDebugLog('Client connected with address = ' +
            channel.remoteAddress + ' port = ' + channel.remotePort
          )
        })

        server.on('closeChannel', function (channel: Todo) {
          internalDebugLog('Client disconnected with address = ' +
            channel.remoteAddress + ' port = ' + channel.remotePort
          )
        })

        server.on('create_session', function (session: Todo) {
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

        server.on('session_closed', function (session: Todo, reason: Todo) {
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

const readConfigOfServerNode = function (node: Todo, config: Todo) {
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

const initServerNode = function (node: Todo) {
  node.iiot = initCoreServerNode()
  if (node.setMaxListeners)
    node.setMaxListeners(UNLIMITED_LISTENERS)
}

const loadNodeSets = function (node: Todo, dirname: string) {
  let standardNodeSetFile = nodesets.standard
  let xmlFiles = [standardNodeSetFile]

  if (node.xmlsets) {
    node.xmlsets.forEach((xmlsetFileName: Todo) => {
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

const loadCertificates = function (node: Todo) {
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

const checkUser = function (node: Todo, userName: string, password: string) {
  let isValidUser = false
  detailDebugLog('Server User Request For ' + userName)

  node.opcuaUsers.forEach(function (user: Todo) {
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

const initRegisterServerMethod = function (node: Todo) {
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

const setDiscoveryOptions = function (node: Todo, serverOptions: Todo) {
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

const getAddressSpace = function (node: Todo, msg: Todo) {
  if (!node.iiot.opcuaServer.engine.addressSpace) {
    node.error(new Error('Server AddressSpace Not Valid'), msg)
    return null
  }

  return node.iiot.opcuaServer.engine.addressSpace
}

const addVariableToAddressSpace = function (node: Todo, msg: Todo, humanReadableType: Todo, isProperty: boolean) {
  let addressSpace = getAddressSpace(node, msg)

  if (!addressSpace) {
    return
  }

  let rootFolder = addressSpace.findNode(msg.payload.referenceNodeId)
  let variableData = getVariantValue(msg.payload.datatype, msg.payload.value)

  let newNodeOPCUAVariable: Todo = {}

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
  newNodeOPCUAVariable.displayName = new LocalizedText({locale: null, text: msg.payload.displayname})
  newNodeOPCUAVariable.dataType = msg.payload.datatype
  newNodeOPCUAVariable.value = {
    get() {
      return new Variant({
        dataType: DataType[msg.payload.datatype],
        value: variableData
      })
    },
    set(variant: Todo) {
      variableData = variant.value
      return StatusCodes.Good
    }
  }

  addressSpace.getOwnNamespace().addVariable(newNodeOPCUAVariable)
  internalDebugLog(msg.payload.nodeId + ' ' + humanReadableType + ' Added To Address Space')
}

const addObjectToAddressSpace = function (node: Todo, msg: Todo, humanReadableType: Todo) {
  let addressSpace = getAddressSpace(node, msg)

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
    node.error(new Error('Root Reference Not Found'), msg)
  }
}

const deleteNOdeFromAddressSpace = function (node: Todo, msg: Todo) {
  let addressSpace = getAddressSpace(node, msg)

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
    node.error(new Error('OPC UA Command NodeId Not Valid'), msg)
  }
}

const restartServer = function (node: Todo, statusHandler: (status: string | NodeStatus) => void) {
  if (node.iiot.opcuaServer) {
    node.iiot.opcuaServer.shutdown(function () {
      node.emit('shutdown')
    })
  } else {
    node.iiot.opcuaServer = null
    node.emit('shutdown')
  }

  node.send({payload: 'server shutdown'})
  node.oldStatusParameter = setNodeStatusTo(node, 'shutdown', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

const handleServerError = function (node: Todo, err: Error, msg: Todo) {
  internalDebugLog(err)
  if (node.showErrors) {
    node.error(err, msg)
  }
}

const createServerNameWithPrefix = function (serverPort: number, prefix: Todo) {
  let serverPrefix = (prefix !== '') ? prefix + '-' : prefix
  return 'NodeRED-IIoT-' + serverPrefix + 'Server-' + serverPort
}

const buildServerOptions = async (node: Todo, prefix: Todo) => {
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
      // applicationType: ApplicationType.CLIENTANDSERVER,
      // applicationUri: makeApplicationUrn(await extractFullyQualifiedDomainName(), createServerNameWithPrefix(node.port, prefix)),
      productUri: createServerNameWithPrefix(node.port, prefix),
      applicationName: {text: 'Node-RED', locale: 'en'},
      gatewayServerUri: null,
      discoveryProfileUri: null,
      discoveryUrls: []
    },
    maxAllowedSessionNumber: node.maxAllowedSessionNumber,
    maxConnectionsPerEndpoint: node.maxConnectionsPerEndpoint,
    allowAnonymous: node.allowAnonymous,
    /* securityPolicies: [ TODO: configure SecurityPolicies
      SecurityPolicy.Basic128Rsa15,
      SecurityPolicy.Basic256,
      SecurityPolicy.Basic256Sha256
    ], */
    certificateFile: node.publicCertificateFile,
    // privateKeyFile: node.privateCertificateFile,
    alternateHostname: node.alternateHostname || '',
    userManager: null,
    isAuditing: node.isAuditing,
    registerServerMethod: node.registerServerMethod,
    disableDiscovery: node.disableDiscovery
  }
}
const createServer = async (node: Todo, serverOptions: Todo, postInitialize: () => void, statusHandler: (status: string | NodeStatus) => void, verbose: boolean = false) => {
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

const createServerObject = async (maxSubscriptions: number, serverOptions: Todo) => {
  OPCUAServer.MAX_SUBSCRIPTION = maxSubscriptions
  return new OPCUAServer(serverOptions)
}

const setOPCUAServerListener = function (node: Todo) {
  node.iiot.opcuaServer.on('newChannel', function (channel: Todo) {
    internalDebugLog('Client connected new channel with address = ', channel.remoteAddress, ' port = ', channel.remotePort)
  })

  node.iiot.opcuaServer.on('closeChannel', function (channel: Todo) {
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
  deleteNOdeFromAddressSpace,
  restartServer,
  handleServerError,
  createServerNameWithPrefix,
  createServerObject,
  setOPCUAServerListener,
  buildGeneralServerOptions,
  createServer,
}

export default coreServer
