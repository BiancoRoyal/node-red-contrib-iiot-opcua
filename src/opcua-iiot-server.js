/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let opcua = require('node-opcua')
  let path = require('path')
  let os = require('os')

  let xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml'),
    path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml')]

  function OPCUAIIoTServer (n) {
    RED.nodes.createNode(this, n)

    this.name = n.name
    this.port = n.port
    this.endpoint = n.endpoint

    let node = this

    let equipmentCounter = 0
    let physicalAssetCounter = 0
    let counterValue = 0
    let equipment
    let physicalAssets
    let vendorName
    let equipmentNotFound = true
    let initialized = false
    let server = null

    function verboseWarn (logMessage) {
      if (RED.settings.verbose) {
        node.warn((node.name) ? node.name + ': ' + logMessage : 'OPCUAIIoTServer: ' + logMessage)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        node.log(logMessage)
      }
    }

    node.status({fill: 'red', shape: 'ring', text: 'Not running'})

    verboseWarn('node set:' + xmlFiles.toString())

    function initNewServer () {
      initialized = false
      verboseWarn('create Server from XML ...')

      server = new opcua.OPCUAServer({
        port: node.port,
        nodeset_filename: xmlFiles,
        resourcePath: node.endpoint || 'UA/SimpleNodeRedServer'
      })

      server.buildInfo.productName = node.name.concat('OPC UA server')
      server.buildInfo.buildNumber = '112'
      server.buildInfo.buildDate = new Date(2016, 3, 24)
      verboseWarn('init next...')
      server.initialize(postInitialize)
    }

    function constructAddressSpace (addressSpace) {
      verboseWarn('Server add VendorName ...')

      vendorName = addressSpace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        nodeId: 'ns=4;s=VendorName',
        browseName: 'VendorName'
      })

      equipment = addressSpace.addObject({
        organizedBy: vendorName,
        nodeId: 'ns=4;s=Equipment',
        browseName: 'Equipment'
      })

      physicalAssets = addressSpace.addObject({
        organizedBy: vendorName,
        nodeId: 'ns=4;s=PhysicalAssets',
        browseName: 'Physical Assets'
      })

      verboseWarn('Server add MyVariable2 ...')

      let variable2 = 10.0

      addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=4;s=MyVariable2',
        browseName: 'MyVariable2',
        dataType: opcua.DataType.Double,

        value: {
          get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable2})
          },
          set: function (variant) {
            variable2 = parseFloat(variant.value)
            return opcua.StatusCodes.Good
          }
        }
      })

      verboseWarn('Server add FreeMemory ...')

      addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=4;s=FreeMemory',
        browseName: 'FreeMemory',
        dataType: opcua.DataType.Double,

        value: {
          get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: availableMemory()})
          }
        }
      })

      verboseWarn('Server add Counter ...')

      addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=4;s=Counter',
        browseName: 'Counter',
        dataType: opcua.DataType.UInt16,

        value: {
          get: function () {
            return new opcua.Variant({dataType: opcua.DataType.UInt16, value: counterValue})
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
              dataType: opcua.DataType.UInt32
            }, {
              name: 'volume',
              description: {text: 'specifies the sound volume [0 = quiet ,100 = loud]'},
              dataType: opcua.DataType.UInt32
            }
          ],

          outputArguments: [{
            name: 'Barks',
            description: {text: 'the generated barks'},
            dataType: opcua.DataType.String,
            valueRank: 1
          }]
        })

      method.bindMethod(function (inputArguments, context, callback) {
        let nbBarks = inputArguments[0].value
        let volume = inputArguments[1].value

        verboseLog('Hello World ! I will bark ', nbBarks, ' times')
        verboseLog('the requested volume is ', volume, '')
        let soundVolume = new Array(volume).join('!')

        let barks = []
        for (let i = 0; i < nbBarks; i++) {
          barks.push('Whaff' + soundVolume)
        }

        let callMethodResult = {
          statusCode: opcua.StatusCodes.Good,
          outputArguments: [{
            dataType: opcua.DataType.String,
            arrayType: opcua.VariantArrayType.Array,
            value: barks
          }]
        }
        callback(null, callMethodResult)
      })
    }

    function postInitialize () {
      if (server) {
        let addressSpace = server.engine.addressSpace
        constructAddressSpace(addressSpace)

        verboseWarn('Next server start...')

        server.start(function () {
          verboseWarn('Server is now listening ... ( press CTRL+C to stop)')
          server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
            verboseWarn('Server endpointUrl: ' + endpoint.endpointUrl + ' securityMode: ' + endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString())
          })

          let endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl
          verboseLog(' the primary server endpoint url is ' + endpointUrl)
        })
        node.status({fill: 'green', shape: 'dot', text: 'running'})
        initialized = true
        verboseWarn('server initialized')
      } else {
        node.status({fill: 'gray', shape: 'dot', text: 'not running'})
        node.error('server is not initialized')
      }
    }

    function availableMemory () {
      return os.freemem() / os.totalmem() * 100.0
    }

    initNewServer()

    // ######################################################################################
    node.on('input', function (msg) {
      if (server === undefined || !initialized) {
        return false
      }

      if (equipmentNotFound) {
        let addressSpace = server.engine.addressSpace

        if (addressSpace === undefined) {
          node.error('addressSpace undefinded')
          return false
        }

        let rootFolder = addressSpace.findNode('ns=4;s=VendorName')
        let references = rootFolder.findReferences('Organizes', true)

        if (findReference(references, equipment.nodeId)) {
          verboseWarn('Equipment Reference found in VendorName')
          equipmentNotFound = false
        } else {
          verboseWarn('Equipment Reference not found in VendorName')
        }
      }

      let payload = msg.payload

      if (containsMessageType(payload)) {
        readMessage(payload)
      }

      if (containsOpcuaCommand(payload)) {
        executeOpcuaCommand(payload)
      }

      node.send(msg)
    })

    function findReference (references, nodeId) {
      return references.filter(function (r) {
        return r.nodeId.toString() === nodeId.toString()
      })
    }

    function containsMessageType (payload) {
      return payload.hasOwnProperty('messageType')
    }

    function readMessage (payload) {
      switch (payload.messageType) {
        case 'Variable':
          if (payload.variableName === 'Counter') {
            // Code for the Node-RED function to send the data by an inject
            // msg = { payload : { "messageType" : "Variable", "variableName": "Counter", "variableValue": msg.payload }};
            // return msg;
            counterValue = payload.variableValue
          }
          break
        default:
          break
      }
    }

    function containsOpcuaCommand (payload) {
      return payload.hasOwnProperty('opcuaCommand')
    }

    function executeOpcuaCommand (payload) {
      let addressSpace = server.engine.addressSpace
      let name

      switch (payload.opcuaCommand) {
        case 'restartOPCUAServer':
          restartServer()
          break
        case 'addEquipment':
          verboseWarn('adding Node'.concat(payload.nodeName))
          equipmentCounter++
          name = payload.nodeName.concat(equipmentCounter)

          addressSpace.addObject({
            organizedBy: addressSpace.findNode(equipment.nodeId),
            nodeId: 'ns=4;s='.concat(name),
            browseName: name
          })
          break
        case 'addPhysicalAsset':
          verboseWarn('adding Node'.concat(payload.nodeName))
          physicalAssetCounter++
          name = payload.nodeName.concat(physicalAssetCounter)

          addressSpace.addObject({
            organizedBy: addressSpace.findNode(physicalAssets.nodeId),
            nodeId: 'ns=4;s='.concat(name),
            browseName: name
          })
          break
        case 'deleteNode':
          if (addressSpace === undefined) {
            node.error('addressSpace undefinded')
            return false
          }

          let searchedNode = addressSpace.findNode(payload.nodeId)
          if (searchedNode === undefined) {
            verboseWarn('can not find Node in addressSpace')
          } else {
            addressSpace.deleteNode(searchedNode)
          }
          break
        default:
          node.error('unknown OPC UA Command')
      }
    }

    function restartServer () {
      verboseWarn('Restart OPC UA Server')
      if (server) {
        server.shutdown(0, function () {
          server = null
          vendorName = null
          initNewServer()
        })
      } else {
        server = null
        vendorName = null
        initNewServer()
      }

      if (server) {
        verboseWarn('Restart OPC UA Server done')
      } else {
        node.error('can not restart OPC UA Server')
      }
    }

    node.on('close', function () {
      verboseWarn('closing...')
      closeServer()
    })

    function closeServer () {
      if (server) {
        server.shutdown(0, function () {
          server = null
          vendorName = null
        })
      } else {
        server = null
        vendorName = null
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)

  RED.httpAdmin.get('/opcua/server/specifications', RED.auth.needsPermission('opcua.server.read'), function (req, res) {
    xmlFiles.list(function (err, ports) {
      if (err) console.log(err)
      res.json(ports)
    })
  })
}
