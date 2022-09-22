
const helperExtensions = require('../test-helper-extensions')

module.exports = {

  "testFlowPayload": helperExtensions.cleanFlowPositionData([
    {
      "id": "n2rsf",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 490,
      "y": 240,
      "wires": []
    },
    {
      "id": "n4rsf",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 490,
      "y": 120,
      "wires": []
    },
    {
      "id": "n5rsf",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "TestResponse",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 160,
      "y": 180,
      "wires": [
        [
          "n6rsf"
        ]
      ]
    },
    {
      "id": "n6rsf",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 490,
      "y": 180,
      "wires": []
    }
  ]),
  "testResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Flow 1",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "76202549.fd7c1c",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "TestName",
      "compressStructure": false,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": true,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "dataType",
          "value": "DateTime"
        }
      ],
      "x": 520,
      "y": 100,
      "wires": [
        [
          "n1rh"
        ]
      ]
    },
    {
      "id": "n1rh",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 730,
      "y": 100,
      "wires": []
    },
    {
      "id": "9ed1998a.92f74",
      "type": "inject",
      "z": "e41e66b2c57b1657",
      "name": "",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 2.4,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 130,
      "y": 100,
      "wires": [
        [
          "806c7bdc.b926e"
        ]
      ]
    },
    {
      "id": "806c7bdc.b926e",
      "type": "function",
      "z": "e41e66b2c57b1657",
      "name": "",
      "func": "msg = {'_msgid':'98a1d195.a8a9','topic':'','nodetype':'read','injectType':'listen','addressSpaceItems':[],'payload':[{'value':{'dataType':'Double','arrayType':'Scalar','value':0.523478532226411},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Matrix','value':{'0':1,'1':2,'2':3,'3':4,'4':5,'5':6,'6':7,'7':8,'8':9},'dimensions':[[3,3],[3,3]]},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Array','value':{'0':1,'1':2,'2':3,'3':4}},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':263.6659132826572},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'DateTime','arrayType':'Scalar','value':'2016-10-13T08:40:00.000Z'},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'LocalizedText','arrayType':'Array','value':[{'text':'multilingual text','locale':'en'},{'text':'mehrsprachiger Text','locale':'de'},{'text':'texte multilingue','locale':'fr'}]},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':966.3275887250591},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':19.861320655817437},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':31},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':10},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':1000},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':0.9765148162841797},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'UInt16','arrayType':'Scalar','value':3},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Int32','arrayType':'Scalar','value':3},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'statusCode':{'value':2150957056,'description':'The attribute is not supported for the specified Node.','name':'BadAttributeIdInvalid'},'sourcePicoseconds':0,'serverPicoseconds':0}],'nodesToRead':['ns=1;s=Pressure','ns=1;s=Matrix','ns=1;s=Position','ns=1;s=PumpSpeed','ns=1;s=SomeDate','ns=1;s=MultiLanguageText','ns=1;s=FanSpeed','ns=1;s=TemperatureAnalogItem','ns=1;i=16479','ns=1;b=1020ffaa','ns=1;s=TestReadWrite','ns=1;s=free_memory','ns=1;s=Counter','ns=1;s=FullCounter','ns=1;i=12345'],'nodesToReadCount':15,'addressItemsToRead':[{'name':'Pressure','nodeId':'ns=1;s=Pressure','datatypeName':'ns=0;i=63'},{'name':'Matrix','nodeId':'ns=1;s=Matrix','datatypeName':'ns=0;i=63'},{'name':'Position','nodeId':'ns=1;s=Position','datatypeName':'ns=0;i=63'},{'name':'PumpSpeed','nodeId':'ns=1;s=PumpSpeed','datatypeName':'ns=0;i=63'},{'name':'SomeDate','nodeId':'ns=1;s=SomeDate','datatypeName':'ns=0;i=63'},{'name':'MultiLanguageText','nodeId':'ns=1;s=MultiLanguageText','datatypeName':'ns=0;i=63'},{'name':'FanSpeed','nodeId':'ns=1;s=FanSpeed','datatypeName':'ns=0;i=63'},{'name':'TemperatureAnalogItem','nodeId':'ns=1;s=TemperatureAnalogItem','datatypeName':'ns=0;i=2368'},{'name':'MyVariable1','nodeId':'ns=1;i=16479','datatypeName':'ns=0;i=63'},{'name':'MyVariable2','nodeId':'ns=1;b=1020ffaa','datatypeName':'ns=0;i=63'},{'name':'TestReadWrite','nodeId':'ns=1;s=TestReadWrite','datatypeName':'ns=0;i=63'},{'name':'FreeMemory','nodeId':'ns=1;s=free_memory','datatypeName':'ns=0;i=63'},{'name':'Counter','nodeId':'ns=1;s=Counter','datatypeName':'ns=0;i=63'},{'name':'FullCounter','nodeId':'ns=1;s=FullCounter','datatypeName':'ns=0;i=63'},{'name':'Bark','nodeId':'ns=1;i=12345','datatypeName':'ns=0;i=0'}],'addressItemsToReadCount':15,'readtype':'VariableValue','attributeId':13}\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 320,
      "y": 100,
      "wires": [
        [
          "76202549.fd7c1c"
        ]
      ]
    }
  ]),
  "testCompressedResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "e41e66b2c57b1657",
      "type": "tab",
      "label": "Flow 1",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "76202549.fd7c1c",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": true,
      "negateFilter": false,
      "filters": [
        {
          "name": "dataType",
          "value": "DateTime"
        }
      ],
      "x": 540,
      "y": 80,
      "wires": [
        [
          "n1rh"
        ]
      ]
    },
    {
      "id": "n1rh",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 750,
      "y": 80,
      "wires": []
    },
    {
      "id": "9ed1998a.92f74",
      "type": "inject",
      "z": "e41e66b2c57b1657",
      "name": "",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "",
      "crontab": "",
      "once": true,
      "onceDelay": 2.4,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 150,
      "y": 80,
      "wires": [
        [
          "806c7bdc.b926e"
        ]
      ]
    },
    {
      "id": "806c7bdc.b926e",
      "type": "function",
      "z": "e41e66b2c57b1657",
      "name": "",
      "func": "msg = {'_msgid':'98a1d195.a8a9','topic':'','nodetype':'read','injectType':'listen','addressSpaceItems':[],'payload':[{'value':{'dataType':'Double','arrayType':'Scalar','value':0.523478532226411},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Matrix','value':{'0':1,'1':2,'2':3,'3':4,'4':5,'5':6,'6':7,'7':8,'8':9},'dimensions':[[3,3],[3,3]]},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Array','value':{'0':1,'1':2,'2':3,'3':4}},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':263.6659132826572},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'DateTime','arrayType':'Scalar','value':'2016-10-13T08:40:00.000Z'},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'LocalizedText','arrayType':'Array','value':[{'text':'multilingual text','locale':'en'},{'text':'mehrsprachiger Text','locale':'de'},{'text':'texte multilingue','locale':'fr'}]},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':966.3275887250591},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':19.861320655817437},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':31},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':10},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':1000},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Double','arrayType':'Scalar','value':0.9765148162841797},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'UInt16','arrayType':'Scalar','value':3},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'value':{'dataType':'Int32','arrayType':'Scalar','value':3},'statusCode':{'value':0,'description':'No Error','name':'Good'},'sourcePicoseconds':0,'serverPicoseconds':0},{'statusCode':{'value':2150957056,'description':'The attribute is not supported for the specified Node.','name':'BadAttributeIdInvalid'},'sourcePicoseconds':0,'serverPicoseconds':0}],'nodesToRead':['ns=1;s=Pressure','ns=1;s=Matrix','ns=1;s=Position','ns=1;s=PumpSpeed','ns=1;s=SomeDate','ns=1;s=MultiLanguageText','ns=1;s=FanSpeed','ns=1;s=TemperatureAnalogItem','ns=1;i=16479','ns=1;b=1020ffaa','ns=1;s=TestReadWrite','ns=1;s=free_memory','ns=1;s=Counter','ns=1;s=FullCounter','ns=1;i=12345'],'nodesToReadCount':15,'addressItemsToRead':[{'name':'Pressure','nodeId':'ns=1;s=Pressure','datatypeName':'ns=0;i=63'},{'name':'Matrix','nodeId':'ns=1;s=Matrix','datatypeName':'ns=0;i=63'},{'name':'Position','nodeId':'ns=1;s=Position','datatypeName':'ns=0;i=63'},{'name':'PumpSpeed','nodeId':'ns=1;s=PumpSpeed','datatypeName':'ns=0;i=63'},{'name':'SomeDate','nodeId':'ns=1;s=SomeDate','datatypeName':'ns=0;i=63'},{'name':'MultiLanguageText','nodeId':'ns=1;s=MultiLanguageText','datatypeName':'ns=0;i=63'},{'name':'FanSpeed','nodeId':'ns=1;s=FanSpeed','datatypeName':'ns=0;i=63'},{'name':'TemperatureAnalogItem','nodeId':'ns=1;s=TemperatureAnalogItem','datatypeName':'ns=0;i=2368'},{'name':'MyVariable1','nodeId':'ns=1;i=16479','datatypeName':'ns=0;i=63'},{'name':'MyVariable2','nodeId':'ns=1;b=1020ffaa','datatypeName':'ns=0;i=63'},{'name':'TestReadWrite','nodeId':'ns=1;s=TestReadWrite','datatypeName':'ns=0;i=63'},{'name':'FreeMemory','nodeId':'ns=1;s=free_memory','datatypeName':'ns=0;i=63'},{'name':'Counter','nodeId':'ns=1;s=Counter','datatypeName':'ns=0;i=63'},{'name':'FullCounter','nodeId':'ns=1;s=FullCounter','datatypeName':'ns=0;i=63'},{'name':'Bark','nodeId':'ns=1;i=12345','datatypeName':'ns=0;i=0'}],'addressItemsToReadCount':15,'readtype':'VariableValue','attributeId':13}\nreturn msg;",
      "outputs": 1,
      "noerr": 0,
      "initialize": "",
      "finalize": "",
      "libs": [],
      "x": 340,
      "y": 80,
      "wires": [
        [
          "76202549.fd7c1c"
        ]
      ]
    }
  ]),
  "testDefaultResponseFlow" : helperExtensions.cleanFlowPositionData([
    {
      "id": "be0763d2593bd6ef",
      "type": "OPCUA-IIoT-Response",
      "z": "e41e66b2c57b1657",
      "name": "",
      "compressStructure": true,
      "showStatusActivities": false,
      "showErrors": false,
      "activateUnsetFilter": false,
      "activateFilters": false,
      "negateFilter": false,
      "filters": [],
      "x": 310,
      "y": 300,
      "wires": [
        [
          "64b6a8760a5244c2"
        ]
      ]
    },
    {
      "id": "64b6a8760a5244c2",
      "type": "helper",
      "z": "e41e66b2c57b1657",
      "name": "helper 1",
      "active": true,
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "false",
      "statusVal": "",
      "statusType": "auto",
      "x": 500,
      "y": 300,
      "wires": []
    }
  ])
}