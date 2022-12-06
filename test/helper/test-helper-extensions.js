/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

module.exports = {
  cleanFlowPositionData: (jsonFlow) => {
    let cleanFlow = []
    // flow is an array of JSON objects with x,y,z from the Node-RED export
    jsonFlow.forEach( (item, index, array) => {
      let newObject = JSON.parse(JSON.stringify(item))
      if(newObject.type === 'helper') {
        cleanFlow.push({"id": newObject.id, "type": "helper", wires: newObject.wires})
      } else {
        delete newObject["x"]
        delete newObject["y"]
        delete newObject["z"]
        cleanFlow.push(newObject)
      }
    } )

    return cleanFlow
  }
}