import {Todo} from "./placeholders";
import * as nodeOPCUA from "node-opcua";
import {DataType, DataValue, LocalizedText, NodeIdType} from "node-opcua";
import {NodeIdLike} from "node-opcua-nodeid";

export type TimeUnits =
  'ms' |
  's' |
  'm' |
  'h';

export type TimeUnitNames =
  'msec.' |
  'sec.' |
  'min.' |
  'h.' |
  '';

export type FillValues =
  'yellow' |
  'green' |
  'red' |
  'blue';

export type WriteMessage = {
  addressSpaceItems: AddressSpaceItem[]
  payload: {
    nodesToWrite: NodeToWrite[],
  }
  valuesToWrite?: Todo[]
}

export type AddressSpaceItem = {
  nodeId: string
  browseName: string
  displayName: string
  nodeClass: string
  datatypeName: string
}

// export type AddressSpaceItem = {
//   datatypeName: DataType
// } & NodeToWrite

export type BrowseMessage = {
  'topic': string
  'nodeId': string
  'browseName': string
  'nodeClassType': string
  'typeDefinition': string
  'payload': ''
}

export type NodeToWrite = {
  nodeId: nodeOPCUA.NodeId
  attributeId: nodeOPCUA.AttributeIds.Value
  indexRange: null
  value: DataValue
}

export type DataTypeInput = nodeOPCUA.DataType | string;

export type WriteListItem = {
  nodeId: nodeOPCUA.NodeId
  attributeId: nodeOPCUA.AttributeIds.Value
  indexRange: null
  value: DataValue
}

export type ReadListItem = {

}

export type ItemNodeId = {
  nodeId: string
} & Todo;

export type NodeIdentifier = NodeIdentifierNumeric | NodeIdentifierString;

type NodeIdentifierNumeric = {
  identifier: number
  type: NodeIdType.NUMERIC
}

type NodeIdentifierString = {
  identifier: string
  type: Exclude<NodeIdType, NodeIdType.NUMERIC>
}

export type VariantType = NumericVariant |
  BooleanVariant |
  LocalizedTextVariant |
  DateTimeVariant |
  StringVariant |
  GenericVariant;

type NumericVariant = {
  'dataType': nodeOPCUA.DataType.Float |
    nodeOPCUA.DataType.Double |
    nodeOPCUA.DataType.UInt32 |
    nodeOPCUA.DataType.Int32 |
    nodeOPCUA.DataType.Int16 |
    nodeOPCUA.DataType.Int64
  'value': number
}

type BooleanVariant = {
  dataType: nodeOPCUA.DataType.Boolean
  value: boolean
}

type LocalizedTextVariant = {
  dataType: nodeOPCUA.DataType.LocalizedText
  value: LocalizedText
}

type DateTimeVariant = {
  dataType: nodeOPCUA.DataType.DateTime
  value: Date
}

type StringVariant = {
  dataType: nodeOPCUA.DataType.String
  value: string
 }

type GenericVariant = {
  dataType: nodeOPCUA.DataType
  value: any
 }
