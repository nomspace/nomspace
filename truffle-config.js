require("ts-node").register({
  files: true,
});
require('dotenv').config()
const utils = require('web3-utils')

const ContractKit = require('@celo/contractkit')
const Web3 = require('web3')

// Connect to the desired network
const web3 = new Web3(process.env.RPC_URL)
const kit = ContractKit.newKitFromWeb3(web3)
kit.addAccount(process.env.PRIVATE_KEY)
// const kit = Kit.newKit('https://forno.celo.org') // mainnet endpoint

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: '*',       // Any network (default: none)
    },
    alfajores: {
      provider: kit.web3.currentProvider,
      network_id: 44787,
      gas: 6000000,
      gasPrice: utils.toWei('0.1', 'gwei'),
    },
    mainnet: {
      provider: kit.web3.currentProvider,
      network_id: 42220,
      gas: 6000000,
      gasPrice: utils.toWei('0.1', 'gwei'),
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.4',    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    },
  }
}
