## OPC UA IIoT for Node-RED

## Known Issues

* Result Filter does not filter correctly in every case (Will be fixed in v5.x)
* Read after browse in browse example does not work
  * No output and no error
* Browse-Listener and grouped-listener example top browse/listen will throw following error

```
Error: encodeObject Error: [Error] Value: {
  payload: 'Monitored Item Error',
  monitoredItem: ClientMonitoredItemImpl {
    _events: {
      initialized: [Function (anonymous)],
      changed: [Function (anonymous)],
      err: [Function (anonymous)],
      terminated: [Function (anonymous)]
    },
    _eventsCount: 4,
    _maxListeners: undefined,
    statusCode: ConstantStatusCode {
      _value: 2150957056,
      _description: 'The attribute is not supported for the specified Node.',
      _name: 'BadAttributeIdInvalid'
    },
    subscription: ClientSubscriptionImpl {
      _events: [Object],
      _eventsCount: 4,
      _maxListeners: undefined,
      monitoredItemGroups: [],
      timeoutHint: 14000,
      _nextClientHandle: 26,
      publishEngine: [ClientSidePublishEngine],
      lastSequenceNumber: 10,
      publishingInterval: 200,
      lifetimeCount: 18000,
      maxKeepAliveCount: 60,
      maxNotificationsPerPublish: 100,
      publishingEnabled: true,
      priority: 10,
```
Removing the catch node will bring the following error messages 
```
"{"name":"Error","message":"ns=0;i=2253: BadAttributeIdInvalid (0x80350000)"}"
```
Maybe that happens because the browser browses the root object recursively and returns also 
nodes of the server that aren't allowed to be listened
* Event Listener monitoring the basic opc ua events will always return an empty array of values
  * Discovered following error: Expected data is unavailable for the requested time range due to an 
  un-mounted volume, an off-line archive or tape, or similar reason for temporary unavailability. 
  (Will be fixed in v5.x)


### Features

#### ASO and Servers

* adding variables
* adding folders/objects
* adding complex structures
* adding arrays
* adding methods

----

### Worked before

#### Listener

* Events cannot be monitored (error node-opcua maxAge)
