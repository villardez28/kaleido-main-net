#Kaleido Main-net Reporter

This is a sample program that shows how a user can retrieve the state reports saved to the main-net. 

###Dependencies: 
- Node.js
- npm 

###Building: 
```
npm install
```

###Usage: 
```
node getenv.js --envId <envId> --latest <count>
```

``envId`` is the Kaleido Environment ID (for an environment that has the main-net relay option selected when it was created)

``latest`` allows you to control the total number of reports to retrieve (defaults to one)

*short-form usage:* ``node getenv.js <envId>`` 

###Report Format
Each report contains the following data: 
```
nodeIdHash: 0x...
blockNumber: ...
blockHash: 0x...
checksum: 0x...
signature: { v: ..., r: 0x..., s: 0x...}
```

Please report problems to support@kaleido.io. 

###Note
This is pre-release software and should be considered alpha code. 