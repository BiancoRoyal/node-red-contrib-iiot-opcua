/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Response analyser Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreResponse = require('./core/opcua-iiot-core-response')

  function OPCUAIIoTResponse (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.compressStructure = config.compressStructure
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.activateUnsetFilter = config.activateUnsetFilter
    this.activateFilters = config.activateFilters
    this.negateFilter = config.negateFilter
    this.filters = config.filters

    let node = this

    node.status({fill: 'green', shape: 'ring', text: 'active'})

    node.on('input', function (msg) {
      try {
        if (msg.nodetype) {
          switch (msg.nodetype) {
            case 'browse':
              coreResponse.analyzeBrowserResults(node, msg)
              if (node.compressStructure) {
                coreResponse.compressBrowseMessageStructure(msg)
              }
              break
            case 'read':
              coreResponse.analyzeReadResults(node, msg)
              if (node.compressStructure) {
                coreResponse.compressReadMessageStructure(msg)
              }
              break

            case 'write':
              coreResponse.analyzeWriteResults(node, msg)
              if (node.compressStructure) {
                coreResponse.compressWriteMessageStructure(msg)
              }
              break

            case 'listen':
              coreResponse.analyzeListenerResults(node, msg)
              if (node.compressStructure) {
                coreResponse.compressListenMessageStructure(msg)
              }
              break

            case 'method':
              coreResponse.analyzeMethodResults(node, msg)
              if (node.compressStructure) {
                coreResponse.compressMethodMessageStructure(msg)
              }
              break

            default:
              if (msg && msg.payload) {
                coreResponse.handlePayloadStatusCode(node, msg)
                if (node.compressStructure) {
                  coreResponse.compressDefaultMessageStructure(msg)
                }
              }
          }
        }

        let filteredEntries = []

        if (node.activateFilters && node.filters && node.filters.length > 0) {
          if (msg.payload.length) {
            msg.payload.forEach(function (item) {
              if (node.itemIsNotToFilter(item)) {
                filteredEntries.push(item)
              }
            })
            msg.payload = filteredEntries
            node.send(msg)
          } else {
            if (node.itemIsNotToFilter(msg.payload)) {
              node.send(msg)
            }
          }
        } else {
          node.send(msg)
        }
      } catch (err) {
        coreResponse.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, msg)
        }
      }
    })

    node.itemIsNotToFilter = function (item) {
      let result = true

      if (node.activateUnsetFilter) {
        result &= item !== null

        if (item.value) {
          if (item.value.hasOwnProperty('value')) {
            result &= item.value.value !== null
          } else {
            result &= item.value !== null
          }
        }
      }

      let filterValue
      node.filters.forEach(function (element, index, array) {
        try {
          switch (element.name) {
            case 'browseName':
            case 'statusCode':
              filterValue = item[element.name].name
              break
            case 'displayName':
              filterValue = item[element.name].text
              break
            case 'value':
            case 'dataType':
              if (item.value && item.value.hasOwnProperty('value')) {
                filterValue = item.value[element.name]
              } else {
                filterValue = item[element.name]
              }
              break
            default:
              filterValue = item[element.name]
          }

          if (filterValue) {
            if (filterValue.key && filterValue.key.match) {
              result &= filterValue.key.match(element.value) !== null
            } else {
              if (filterValue.match) {
                result &= filterValue.match(element.value) !== null
              } else {
                if (filterValue.toString) {
                  filterValue = filterValue.toString()
                  if (filterValue.match) {
                    result &= filterValue.match(element.value) !== null
                  }
                }
              }
            }
          } else {
            result &= false // undefined items
          }
        } catch (e) {
          coreResponse.crawler.internalDebugLog(e)
          if (node.showErrors) {
            node.error(e, {payload: e.message})
          }
        }
      })

      return (node.negateFilter) ? !result : result
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
