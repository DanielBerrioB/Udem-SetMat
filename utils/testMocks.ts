const mongoClient = {
  _eventsCount: 1,
  _maxListeners: undefined,
  s: {
    url:
      "mongodb+srv://DanielBB:DanielBB@cluster0-qdjmv.mongodb.net/test?retryWrites=true&w=majority",
    options: {
      servers: [Array],
      authSource: "admin",
      replicaSet: "Cluster0-shard-0",
      retryWrites: true,
      w: "majority",
      ssl: true,
      caseTranslate: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      checkServerIdentity: true,
      sslValidate: true,
      auth: [Object],
      dbName: "test",
      srvHost: "cluster0-qdjmv.mongodb.net",
      socketTimeoutMS: 360000,
      connectTimeoutMS: 10000,
      useRecoveryToken: true,
      readPreference: [Object],
      credentials: [Object],
      promiseLibrary: [Function, Promise]
    },
    promiseLibrary: [Function, Promise],
    dbCache: Map,
    sessions: Set,
    writeConcern: null,
    namespace: { db: "admin", collection: undefined }
  },
  topology: {
    _events: {
      topologyDescriptionChanged: [Array],
      authenticated: [Function],
      error: [Array],
      timeout: [Array],
      close: [Array],
      parseError: [Array],
      fullsetup: [Array],
      all: [Array],
      reconnect: [Array],
      commandStarted: [Function],
      commandSucceeded: [Function],
      commandFailed: [Function],
      serverOpening: [Function],
      serverClosed: [Function],
      serverDescriptionChanged: [Function],
      serverHeartbeatStarted: [Function],
      serverHeartbeatSucceeded: [Function],
      serverHeartbeatFailed: [Function],
      topologyOpening: [Function],
      topologyClosed: [Function],
      joined: [Function],
      left: [Function],
      ping: [Function],
      ha: [Function],
      connectionPoolCreated: [Function],
      connectionPoolClosed: [Function],
      connectionCreated: [Function],
      connectionReady: [Function],
      connectionClosed: [Function],
      connectionCheckOutStarted: [Function],
      connectionCheckOutFailed: [Function],
      connectionCheckedOut: [Function],
      connectionCheckedIn: [Function],
      connectionPoolCleared: [Function],
      open: [Function]
    },
    _eventsCount: 35,
    _maxListeners: Infinity,
    s: {
      id: 0,
      options: [Object],
      seedlist: [Array],
      state: "connected",
      description: [Object],
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      minHeartbeatFrequencyMS: 500,
      Cursor: [Function],
      bson: JSON,
      servers: [Map],
      sessionPool: [Object],
      sessions: Set,
      promiseLibrary: [Function, Promise],
      credentials: [Object],
      clusterTime: [Object],
      connectionTimers: Set,
      srvPoller: [Object],
      detectTopologyDescriptionChange: [Function],
      sCapabilities: [Object]
    },
    [Symbol("waitQueue")]: {
      _head: 3,
      _tail: 3,
      _capacityMask: 3,
      _list: [Array]
    }
  }
};

module.exports = { mongoClient };
