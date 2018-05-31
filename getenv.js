'use strict'; 

const commandLineArgs = require('command-line-args');
const optionsDefinition = [
  { name: 'envId', alias: 'e', type: String, defaultOption: true },
  { name: 'latest', alias: 'l', type: Number, defaultValue: 1 }
];

const Web3 = require('web3'); 
const crypto = require('crypto');
const contract = require('truffle-contract');
const abi = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "environmentId",
          "type": "bytes32"
        }
      ],
      "name": "getReportCount",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "environmentId",
          "type": "bytes32"
        },
        {
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getReportAt",
      "outputs": [
        {
          "name": "nodeId",
          "type": "bytes32"
        },
        {
          "name": "blockNumber",
          "type": "uint64"
        },
        {
          "name": "blockHash",
          "type": "bytes32"
        },
        {
          "name": "checksum",
          "type": "bytes32"
        },
        {
          "name": "v",
          "type": "uint8"
        },
        {
          "name": "r",
          "type": "bytes32"
        },
        {
          "name": "s",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }];
const Arbitrator = contract({abi: abi});

let RINKEBY_ENDPOINT = 'https://rinkeby.infura.io/beY8jKnOlUyfITZP3iO0';
let web3 = new Web3(RINKEBY_ENDPOINT);
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

let readyPromise = new Promise(resolve => {
  const resolveIfConnected = (resolve) => {
    web3.eth.net.isListening()
      .then(() => { console.log(`Connected to ${RINKEBY_ENDPOINT}`); resolve(); })
      .catch(() => {
        console.log(`Not connected. Retrying in 5 seconds ...`);
        setTimeout(() => { resolveIfConnected(resolve); }, 5000);
      });
  };
  resolveIfConnected(resolve);
});

async function getReports(totalToRetrieveMax) {
  Arbitrator.setProvider(web3.currentProvider);
  Arbitrator.defaults( { from: '0x081980234ca114ffc7b929f024ef8f4c927b30ae' } );

  let arbitrator = await Arbitrator.at('0x35afbaaa24ffb0b360a8c14734bd9a583b092154');
  let envIdHash = '0x' + crypto.createHash('sha256').update(args.envId).digest().toString('hex');
  let reportCount = await arbitrator.getReportCount.call(envIdHash);
  let count = reportCount.toNumber();
  console.log(`Total number of reports: ${count}`);
  console.log(`Total reports to retrieve: ${totalToRetrieveMax}`);
  for (let idx = count - 1; idx >= 0 && idx >= count - totalToRetrieveMax - 1; --idx) {
    // retrieve latest report
    let reportIndex = idx;
    let report = await arbitrator.getReportAt.call(envIdHash, reportIndex);
    console.log(`Relayed report #${reportIndex + 1}:`);
    console.log(`   nodeIdHash: ${report[0]}`);
    console.log(`   blockNumber: ${report[1]}`);
    console.log(`   blockHash: ${report[2]}`);
    console.log(`   checksum: ${report[3]}`);
    console.log(`   signature: { v: ${report[4].toNumber()}, r: ${report[5]}, s: ${report[6]}`);
  }
}

const args = commandLineArgs(optionsDefinition);

readyPromise.then(() => {
  let envId = args.hasOwnProperty('envId') && args.envId;
  let count = args.hasOwnProperty('latest') && args.latest; 

  if (envId && envId !== '') {
    getReports(count).then(() => {});
  }
  else {
    console.log('Please specify --envId <envId>');
  }
});
